/**
 * API Client for Backend Communication
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface ApiError {
  error: string;
  details?: any;
}

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;
  private refreshToken: string | null = null;
  private isRefreshing: boolean = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor(baseURL: string) {
    this.baseURL = baseURL;

    // Load tokens from localStorage on initialization (client-side only)
    if (typeof window !== "undefined") {
      // Try both 'auth_token' and 'accessToken' for backward compatibility
      this.token =
        localStorage.getItem("auth_token") ||
        localStorage.getItem("accessToken");
      this.refreshToken = localStorage.getItem("refresh_token");
    }
  }

  // Re-check localStorage for token (useful after navigation)
  private syncToken() {
    if (typeof window !== "undefined") {
      const storedToken =
        localStorage.getItem("auth_token") ||
        localStorage.getItem("accessToken");
      if (storedToken !== this.token) {
        this.token = storedToken;
      }
      const storedRefreshToken = localStorage.getItem("refresh_token");
      if (storedRefreshToken !== this.refreshToken) {
        this.refreshToken = storedRefreshToken;
      }
    }
  }

  setToken(token: string, refreshToken?: string) {
    this.token = token;
    if (typeof window !== "undefined") {
      // Save to both keys for compatibility
      localStorage.setItem("auth_token", token);
      localStorage.setItem("accessToken", token);

      if (refreshToken) {
        this.refreshToken = refreshToken;
        localStorage.setItem("refresh_token", refreshToken);
      }
    }
  }

  clearToken() {
    this.token = null;
    this.refreshToken = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refresh_token");
    }
  }

  getToken(): string | null {
    return this.token;
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  // Add subscriber for token refresh
  private onTokenRefreshed(callback: (token: string) => void) {
    this.refreshSubscribers.push(callback);
  }

  // Notify all subscribers with new token
  private notifySubscribers(token: string) {
    this.refreshSubscribers.forEach((callback) => callback(token));
    this.refreshSubscribers = [];
  }

  // Refresh access token using refresh token
  private async refreshAccessToken(): Promise<string | null> {
    if (!this.refreshToken) {
      return null;
    }

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Refresh token is invalid or expired
        this.clearToken();
        return null;
      }

      if (data.accessToken) {
        this.setToken(data.accessToken, data.refreshToken);
        return data.accessToken;
      }

      return null;
    } catch (error) {
      console.error("Failed to refresh token:", error);
      return null;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retry: boolean = true
  ): Promise<ApiResponse<T>> {
    // Sync token from localStorage before each request
    this.syncToken();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      // Handle 401 Unauthorized - try to refresh token
      if (
        response.status === 401 &&
        retry &&
        !endpoint.includes("/auth/refresh")
      ) {
        // Token expired, attempting to refresh (removed console.log for security)

        if (this.isRefreshing) {
          // Wait for ongoing refresh to complete
          return new Promise((resolve) => {
            this.onTokenRefreshed((newToken) => {
              // Retry the original request with new token
              headers["Authorization"] = `Bearer ${newToken}`;
              this.request<T>(endpoint, options, false).then(resolve);
            });
          });
        }

        this.isRefreshing = true;
        const newToken = await this.refreshAccessToken();
        this.isRefreshing = false;

        if (newToken) {
          // Token refreshed successfully (removed console.log for security)
          this.notifySubscribers(newToken);
          // Retry the original request with new token
          return this.request<T>(endpoint, options, false);
        } else {
          // Token refresh failed, clearing session (removed console.log for security)
          // Refresh failed, clear tokens and return error
          this.clearToken();
          return {
            error: data.error || "Session expired. Please login again.",
            data: undefined,
          };
        }
      }

      if (!response.ok) {
        return {
          error: data.error || "Something went wrong",
          data: undefined,
        };
      }

      return {
        data,
        error: undefined,
      };
    } catch (error: any) {
      console.error("API Request Error:", error);

      // Check if it's a blocked request (ad blocker, etc.)
      if (
        error.message?.includes("Failed to fetch") ||
        error.name === "TypeError"
      ) {
        return {
          error:
            "Unable to connect to server. Please check if the backend is running and CORS is configured correctly.",
          data: undefined,
        };
      }

      return {
        error: error.message || "Network error. Please check your connection.",
        data: undefined,
      };
    }
  }

  // Generic HTTP methods
  async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "GET",
    });
  }

  async post<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "DELETE",
    });
  }

  // Auth endpoints
  async checkAvailability(email?: string, phoneNumber?: string) {
    const params = new URLSearchParams();
    if (email) params.append("email", email);
    if (phoneNumber) params.append("phoneNumber", phoneNumber);

    return this.request(`/auth/check-availability?${params.toString()}`, {
      method: "GET",
    });
  }

  async signup(
    email: string,
    password: string,
    name: string,
    phoneNumber: string
  ) {
    return this.request("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, name, phoneNumber }),
    });
  }

  async login(email: string, password: string) {
    const result = await this.request<{
      accessToken: string;
      refreshToken: string;
      user: any;
      message: string;
    }>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      },
      false
    ); // Don't retry on login

    // Save both accessToken and refreshToken to localStorage
    if (result.data?.accessToken && result.data?.refreshToken) {
      this.setToken(result.data.accessToken, result.data.refreshToken);
      // Tokens saved successfully (removed console.log for security)
    } else {
      console.error("❌ Authentication error: No tokens received");
    }

    return result;
  }

  async verifyEmail(token: string) {
    return this.request("/auth/verify-email", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async resendVerification(email: string) {
    return this.request("/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async forgotPassword(email: string) {
    return this.request("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, password: string) {
    return this.request("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    });
  }

  async getCurrentUser() {
    return this.request("/auth/me", {
      method: "GET",
    });
  }

  async logout() {
    // Send logout request to revoke tokens
    try {
      await this.post("/auth/logout", {
        refreshToken: this.refreshToken,
      });
    } catch (error) {
      // Continue with logout even if request fails
      console.error("Logout request failed:", error);
    }
    this.clearToken();
  }

  // Menu endpoints
  async checkSlugAvailability(slug: string) {
    return this.request(`/menus/check-slug?slug=${encodeURIComponent(slug)}`, {
      method: "GET",
    });
  }

  async getMenus(locale: string = "ar") {
    return this.request(`/menus?locale=${locale}`, {
      method: "GET",
    });
  }

  async createMenu(data: {
    nameAr: string;
    nameEn: string;
    descriptionAr?: string;
    descriptionEn?: string;
    logo?: string;
    theme?: string;
  }) {
    return this.request("/menus", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getMenu(id: number) {
    return this.request(`/menus/${id}`, {
      method: "GET",
    });
  }

  async updateMenu(id: number, data: any) {
    return this.request(`/menus/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async toggleMenuStatus(id: number) {
    return this.request(`/menus/${id}/status`, {
      method: "PATCH",
    });
  }

  async deleteMenu(id: number) {
    return this.request(`/menus/${id}`, {
      method: "DELETE",
    });
  }

  // Menu Items endpoints
  async getMenuItems(menuId: number, locale: string = "ar", category?: string) {
    const params = new URLSearchParams({ locale });
    if (category) params.append("category", category);

    return this.request(`/menus/${menuId}/items?${params}`, {
      method: "GET",
    });
  }

  async createMenuItem(menuId: number, data: any) {
    return this.request(`/menus/${menuId}/items`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateMenuItem(menuId: number, itemId: number, data: any) {
    return this.request(`/menus/${menuId}/items/${itemId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteMenuItem(menuId: number, itemId: number) {
    return this.request(`/menus/${menuId}/items/${itemId}`, {
      method: "DELETE",
    });
  }

  async reorderMenuItems(
    menuId: number,
    items: Array<{ id: number; sortOrder: number }>
  ) {
    return this.request(`/menus/${menuId}/items/reorder`, {
      method: "POST",
      body: JSON.stringify({ items }),
    });
  }

  // Branches endpoints
  async getBranches(menuId: number, locale: string = "ar") {
    return this.request(`/menus/${menuId}/branches?locale=${locale}`, {
      method: "GET",
    });
  }

  async createBranch(menuId: number, data: any) {
    return this.request(`/menus/${menuId}/branches`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateBranch(menuId: number, branchId: number, data: any) {
    return this.request(`/menus/${menuId}/branches/${branchId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteBranch(menuId: number, branchId: number) {
    return this.request(`/menus/${menuId}/branches/${branchId}`, {
      method: "DELETE",
    });
  }

  // Public endpoints
  async getPublicMenu(slug: string, locale: string = "ar") {
    return this.request(`/public/menu/${slug}?locale=${locale}`, {
      method: "GET",
    });
  }

  async rateMenu(
    slug: string,
    rating: number,
    comment?: string,
    customerName?: string
  ) {
    return this.request(`/public/menu/${slug}/rate`, {
      method: "POST",
      body: JSON.stringify({ rating, comment, customerName }),
    });
  }

  async getPlans() {
    return this.request("/public/plans", {
      method: "GET",
    });
  }

  // User endpoints
  async getProfile() {
    return this.request("/user/profile", {
      method: "GET",
    });
  }

  async updateProfile(data: { name?: string; phoneNumber?: string }) {
    return this.request("/user/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.request("/user/change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  async getStatistics() {
    return this.request("/user/statistics", {
      method: "GET",
    });
  }

  async upgradePlan(planType: "free" | "monthly" | "yearly") {
    return this.request("/user/upgrade-plan", {
      method: "POST",
      body: JSON.stringify({ planType }),
    });
  }

  async deleteAccount(password: string) {
    return this.request("/user/account", {
      method: "DELETE",
      body: JSON.stringify({ password }),
    });
  }

  // Upload endpoint
  async uploadImage(
    file: File,
    type: "logos" | "menu-items" | "ads" | "categories" = "menu-items"
  ) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    const headers: HeadersInit = {};
    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${this.baseURL}/upload`, {
        method: "POST",
        headers,
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.error || "Upload failed",
          data: undefined,
        };
      }

      return {
        data,
        error: undefined,
      };
    } catch (error) {
      console.error("Upload Error:", error);
      return {
        error: "Network error during upload",
        data: undefined,
      };
    }
  }

  async deleteImage(
    filename: string,
    type: "logos" | "menu-items" | "ads" = "menu-items"
  ) {
    return this.request(`/upload/${filename}?type=${type}`, {
      method: "DELETE",
    });
  }

  // Admin endpoints
  async getAllUsers(page: number = 1, limit: number = 20, filters?: any) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (filters) {
      Object.keys(filters).forEach((key) => {
        if (filters[key]) params.append(key, filters[key]);
      });
    }

    return this.request(`/admin/users?${params}`, {
      method: "GET",
    });
  }

  async getUserDetails(userId: number) {
    return this.request(`/admin/users/${userId}`, {
      method: "GET",
    });
  }

  async updateUserPlan(userId: number, planType: string, menusLimit: number) {
    return this.request(`/admin/users/${userId}/plan`, {
      method: "PUT",
      body: JSON.stringify({ planType, menusLimit }),
    });
  }

  async getAllMenus(page: number = 1, limit: number = 20, isActive?: boolean) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (isActive !== undefined) params.append("isActive", isActive.toString());

    return this.request(`/admin/menus?${params}`, {
      method: "GET",
    });
  }

  async getSystemStatistics() {
    return this.request("/admin/statistics", {
      method: "GET",
    });
  }
}

// Export singleton instance
export const api = new ApiClient(API_BASE_URL);

// Export class for testing or multiple instances
export { ApiClient };
export default api;
