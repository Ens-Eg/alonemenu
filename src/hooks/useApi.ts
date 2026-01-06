import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';

// =====================
// Auth Hooks
// =====================

export function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const token = api.getToken();
      if (!token) {
        return null;
      }
      const result = await api.getCurrentUser();
      if (result.error) {
        // If unauthorized, clear token and return null
        if (result.error.includes('401') || result.error.includes('Unauthorized') || result.error.includes('Invalid')) {
          api.clearToken();
          return null;
        }
        throw new Error(result.error);
      }
      
      const user = (result.data as any)?.user || null;
      
      // Merge with localStorage for profile image only (temporary solution until backend integration)
      if (user && typeof window !== 'undefined') {
        const savedImage = localStorage.getItem(`profileImage_${user.id}`);
        
        if (savedImage) {
          user.profileImage = savedImage;
        }
      }
      
      return user;
    },
    staleTime: 1 * 60 * 1000, // 1 minute - reduced to ensure fresh data
    gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
    retry: false,
    refetchOnMount: 'always', // Always refetch on mount to ensure fresh data
    refetchOnWindowFocus: false, // Don't refetch on window focus to prevent loops
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const result = await api.login(email, password);
      if (result.error) throw new Error(result.error);
      return result.data;
    },
    onSuccess: async (data) => {
      // Set initial user data from login response
      queryClient.setQueryData(['currentUser'], data?.user);
      
      // Immediately fetch complete user data from /auth/me to get all fields
      try {
        const meResult = await api.getCurrentUser();
        if ((meResult.data as any)?.user) {
          // Merge with localStorage for profile image
          const user = (meResult.data as any).user;
          if (typeof window !== 'undefined') {
            const savedImage = localStorage.getItem(`profileImage_${user.id}`);
            if (savedImage) {
              user.profileImage = savedImage;
            }
          }
          queryClient.setQueryData(['currentUser'], user);
        }
      } catch (error) {
        console.error('Failed to fetch complete user data:', error);
      }
      
      // Toast will be shown by the component
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Login failed');
    },
  });
}

export function useSignup() {
  return useMutation({
    mutationFn: async ({ email, password, name, phoneNumber }: { email: string; password: string; name: string; phoneNumber: string }) => {
      const result = await api.signup(email, password, name, phoneNumber);
      if (result.error) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      toast.success('Account created successfully! Please login.');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Signup failed');
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      api.logout();
    },
    onSuccess: () => {
      // Clear all React Query cache
      queryClient.clear();
      // Also specifically clear currentUser
      queryClient.setQueryData(['currentUser'], null);
      toast.success('Logged out successfully');
    },
  });
}

// =====================
// Menus Hooks
// =====================

export function useMenus() {
  return useQuery({
    queryKey: ['menus'],
    queryFn: async () => {
      const result = await api.get('/menus');
      if (result.error) throw new Error(result.error);
      return result.data?.menus || [];
    },
  });
}

export function useMenu(id: number) {
  return useQuery({
    queryKey: ['menu', id],
    queryFn: async () => {
      const result = await api.get(`/menus/${id}`);
      if (result.error) throw new Error(result.error);
      return result.data?.menu;
    },
    enabled: !!id,
  });
}

export function useCreateMenu() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      const result = await api.post('/menus', data);
      if (result.error) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] });
      toast.success('Menu created successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create menu');
    },
  });
}

export function useUpdateMenu(id: number) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      const result = await api.put(`/menus/${id}`, data);
      if (result.error) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] });
      queryClient.invalidateQueries({ queryKey: ['menu', id] });
      toast.success('Menu updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update menu');
    },
  });
}

export function useDeleteMenu() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const result = await api.delete(`/menus/${id}`);
      if (result.error) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] });
      toast.success('Menu deleted successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete menu');
    },
  });
}

export function useToggleMenuStatus(id: number) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (isActive: boolean) => {
      const result = await api.patch(`/menus/${id}/status`, { isActive });
      if (result.error) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] });
      queryClient.invalidateQueries({ queryKey: ['menu', id] });
      toast.success('Menu status updated!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update status');
    },
  });
}

// =====================
// Profile Hooks
// =====================

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      const result = await api.put('/user/profile', data);
      if (result.error) throw new Error(result.error);
      return result.data;
    },
    onSuccess: (data) => {
      // Update user data in cache with response from backend
      if (data?.user) {
        queryClient.setQueryData(['currentUser'], data.user);
      }
      toast.success('Profile updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update profile');
    },
  });
}

export function useChangePassword(onValidationError?: (field: string, message: string) => void) {
  return useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const result = await api.post('/user/change-password', data);
      if (result.error) {
        // Translate common error messages to Arabic
        let errorMessage = result.error;
        let errorField = 'general';
        
        if (result.error.includes('Current password is incorrect') || 
            result.error.toLowerCase().includes('current password') ||
            result.error.includes('incorrect')) {
          errorMessage = 'كلمة المرور الحالية غير صحيحة';
          errorField = 'currentPassword';
        } else if (result.error.includes('Password must contain')) {
          errorMessage = 'كلمة المرور يجب أن تحتوي على أحرف كبيرة وصغيرة وأرقام';
          errorField = 'newPassword';
        } else if (result.error.toLowerCase().includes('password')) {
          errorMessage = 'خطأ في كلمة المرور';
        }
        
        const error = new Error(errorMessage) as any;
        error.field = errorField;
        throw error;
      }
      return result.data;
    },
    onSuccess: () => {
      toast.success('تم تغيير كلمة المرور بنجاح!');
    },
    onError: (error: any) => {
      console.log('Change password error:', error);
      if (error.field && error.field !== 'general' && onValidationError) {
        // Show error under the field
        onValidationError(error.field, error.message);
      }
      // Always show toast as well for visibility
      toast.error(error.message || 'فشل تغيير كلمة المرور');
    },
  });
}

export function useSubscription() {
  return useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const result = await api.get('/user/subscription');
      if (result.error) throw new Error(result.error);
      return result.data?.subscription;
    },
  });
}

// =====================
// Menu Items Hooks
// =====================

export function useMenuItems(menuId: number) {
  return useQuery({
    queryKey: ['menuItems', menuId],
    queryFn: async () => {
      const result = await api.get(`/menus/${menuId}/items`);
      if (result.error) throw new Error(result.error);
      return result.data?.items || [];
    },
    enabled: !!menuId,
  });
}

export function useCreateMenuItem(menuId: number) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      const result = await api.post(`/menus/${menuId}/items`, data);
      if (result.error) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems', menuId] });
      toast.success('Item added successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add item');
    },
  });
}

export function useUpdateMenuItem(menuId: number, itemId: number) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      const result = await api.put(`/menus/${menuId}/items/${itemId}`, data);
      if (result.error) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems', menuId] });
      toast.success('Item updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update item');
    },
  });
}

export function useDeleteMenuItem(menuId: number) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (itemId: number) => {
      const result = await api.delete(`/menus/${menuId}/items/${itemId}`);
      if (result.error) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems', menuId] });
      toast.success('Item deleted successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete item');
    },
  });
}

// =====================
// Categories Hooks
// =====================

export function useCategories(menuId: number) {
  return useQuery({
    queryKey: ['categories', menuId],
    queryFn: async () => {
      const result = await api.get(`/menus/${menuId}/categories`);
      if (result.error) throw new Error(result.error);
      return result.data?.categories || [];
    },
    enabled: !!menuId,
  });
}

export function useCategory(menuId: number, categoryId: number) {
  return useQuery({
    queryKey: ['category', menuId, categoryId],
    queryFn: async () => {
      const result = await api.get(`/menus/${menuId}/categories/${categoryId}`);
      if (result.error) throw new Error(result.error);
      return result.data?.category;
    },
    enabled: !!menuId && !!categoryId,
  });
}

export function useCreateCategory(menuId: number) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { nameAr: string; nameEn: string; image?: string; sortOrder?: number }) => {
      const result = await api.post(`/menus/${menuId}/categories`, data);
      if (result.error) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', menuId] });
      toast.success('Category created successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create category');
    },
  });
}

export function useUpdateCategory(menuId: number, categoryId: number) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { nameAr?: string; nameEn?: string; image?: string; sortOrder?: number; isActive?: boolean }) => {
      const result = await api.put(`/menus/${menuId}/categories/${categoryId}`, data);
      if (result.error) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', menuId] });
      queryClient.invalidateQueries({ queryKey: ['category', menuId, categoryId] });
      toast.success('Category updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update category');
    },
  });
}

export function useDeleteCategory(menuId: number) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (categoryId: number) => {
      const result = await api.delete(`/menus/${menuId}/categories/${categoryId}`);
      if (result.error) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', menuId] });
      toast.success('Category deleted successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete category');
    },
  });
}

