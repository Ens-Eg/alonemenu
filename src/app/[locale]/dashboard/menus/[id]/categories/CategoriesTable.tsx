"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, notFound } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import toast from "react-hot-toast";
import api from "@/lib/api";

// Define the data structure
interface Category {
  id: number;
  image?: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

interface CategoryFormData {
  nameAr: string;
  nameEn: string;
  image?: File | null;
  isActive: boolean;
}

const ITEMS_PER_PAGE = 5;

const CategoriesTable: React.FC = () => {
  const params = useParams();
  const menuId = params.id as string;
  const queryClient = useQueryClient();
  const t = useTranslations();
  const locale = useLocale();
  // Modal
  const [open, setOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form state
  const [formData, setFormData] = useState<CategoryFormData>({
    nameAr: "",
    nameEn: "",
    isActive: true,
    image: null,
  });

  // Table
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]); // Store selected category IDs

  // Fetch categories from API
  const {
    data: categoriesData = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["categories", menuId],
    queryFn: async () => {
      const response = await api.get(`/menus/${menuId}/categories`);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data?.categories || [];
    },
    enabled: !!menuId,
    retry: false, // Don't retry on 404
  });

  // Check for 404 error and redirect
  useEffect(() => {
    if (error) {
      const errorMessage = (error as Error).message || "";
      if (
        errorMessage.includes("not found") ||
        errorMessage.includes("404") ||
        errorMessage.includes("access denied") ||
        errorMessage.includes("do not have access")
      ) {
        notFound();
      }
    }
  }, [error]);

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      let imageUrl = "";

      // Upload image if selected
      if (data.image) {
        const uploadResponse = await api.uploadImage(data.image, "categories");

        if (uploadResponse.error) {
          throw new Error(uploadResponse.error);
        }
        imageUrl = uploadResponse.data?.url || "";
      }

      const response = await api.post(`/menus/${menuId}/categories`, {
        nameAr: data.nameAr,
        nameEn: data.nameEn,
        image: imageUrl || null,
        sortOrder: 0,
      });

      if (response.error) {
        throw new Error(response.error);
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories", menuId] });
      setOpen(false);
      resetForm();
      toast.success(
        t("Categories.createSuccess") || "Category created successfully!"
      );
    },
    onError: (error: Error) => {
      toast.error(
        error.message ||
          t("Categories.saveError") ||
          "Failed to create category"
      );
    },
  });

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: async (data: { id: number; formData: CategoryFormData }) => {
      let imageUrl: string | undefined = undefined;

      // Upload image if selected
      if (data.formData.image) {
        const uploadResponse = await api.uploadImage(
          data.formData.image,
          "categories"
        );

        if (uploadResponse.error) {
          throw new Error(uploadResponse.error);
        }
        imageUrl = uploadResponse.data?.url || "";
      }

      const requestBody: any = {
        nameAr: data.formData.nameAr,
        nameEn: data.formData.nameEn,
        isActive: data.formData.isActive,
      };

      // Only include image if a new one was uploaded
      if (imageUrl !== undefined) {
        requestBody.image = imageUrl;
      }

      const response = await api.put(
        `/menus/${menuId}/categories/${data.id}`,
        requestBody
      );

      if (response.error) {
        throw new Error(response.error);
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories", menuId] });
      setOpen(false);
      resetForm();
      setEditingCategory(null);
      toast.success(
        t("Categories.updateSuccess") || "Category updated successfully!"
      );
    },
    onError: (error: Error) => {
      toast.error(
        error.message ||
          t("Categories.saveError") ||
          "Failed to update category"
      );
    },
  });

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: async (categoryId: number) => {
      const response = await api.delete(
        `/menus/${menuId}/categories/${categoryId}`
      );
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories", menuId] });
      toast.success(
        t("Categories.deleteSuccess") || "Category deleted successfully!"
      );
    },
    onError: (error: Error) => {
      toast.error(
        error.message ||
          t("Categories.deleteError") ||
          "Failed to delete category"
      );
    },
  });

  const resetForm = () => {
    setFormData({
      nameAr: "",
      nameEn: "",
      isActive: true,
      image: null,
    });
    setSelectedImages([]);
    setEditingCategory(null);
  };

  // Filter categories based on search query
  const filteredCategories = categoriesData.filter((category: Category) => {
    return category.name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Calculate the indices of the categories to show based on the current page
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentCategories = filteredCategories.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // Calculate the total number of pages
  const totalPages = Math.ceil(filteredCategories.length / ITEMS_PER_PAGE);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // Handle individual category checkbox toggle
  const handleCheckboxChange = (id: number) => {
    setSelectedCategories((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((categoryId) => categoryId !== id)
        : [...prevSelected, id]
    );
  };

  // Handle "select all" checkbox toggle
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedCategories(
        currentCategories.map((category: Category) => category.id)
      );
    } else {
      setSelectedCategories([]);
    }
  };

  // Function to delete a category
  const handleDelete = (id: number) => {
    if (
      confirm(
        t("Categories.deleteConfirm") ||
          "Are you sure you want to delete this category?"
      )
    ) {
      deleteCategoryMutation.mutate(id);
    }
  };

  // upload image
  const [selectedImages, setSelectedImages] = useState<File[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];

      // Check file size (1MB = 1 * 1024 * 1024 bytes)
      const maxSize = 1 * 1024 * 1024; // 1MB
      if (file.size > maxSize) {
        toast.error(
          locale === "ar"
            ? "حجم الصورة يجب أن لا يتجاوز 1 ميجابايت"
            : "Image size must not exceed 1MB"
        );
        // Reset the input
        event.target.value = "";
        return;
      }

      setFormData((prev) => ({ ...prev, image: file }));
      setSelectedImages([file]);
    } else {
      console.log("❌ No file selected");
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    setSelectedImages([]);
  };

  // Handle edit category
  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      nameAr: category.name || "", // Will be fetched with both translations
      nameEn: category.name || "", // Will be fetched with both translations
      isActive: category.isActive,
      image: null,
    });
    setOpen(true);
  };

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nameAr.trim() || !formData.nameEn.trim()) {
      toast.error(
        t("Categories.requiredFields") ||
          "Please enter category names in both Arabic and English"
      );
      return;
    }

    if (editingCategory) {
      updateCategoryMutation.mutate({ id: editingCategory.id, formData });
    } else {
      createCategoryMutation.mutate(formData);
    }
  };

  // Handle form input change
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "isActive" ? value === "1" : value,
    }));
  };

  return (
    <>
      <div className="trezo-card bg-white dark:bg-[#0c1427] mb-[25px] p-[20px] md:p-[25px] rounded-md">
        <div className="trezo-card-header mb-[20px] md:mb-[25px] sm:flex items-center justify-between">
          <div className="trezo-card-title">
            <form className="relative sm:w-[265px]">
              <label className="leading-none absolute ltr:left-[13px] rtl:right-[13px] text-black dark:text-white mt-px top-1/2 -translate-y-1/2">
                <i className="material-symbols-outlined !text-[20px]">search</i>
              </label>
              <input
                type="text"
                placeholder={
                  t("Categories.searchPlaceholder") || "Search category here..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-50 border border-gray-50 h-[36px] text-xs rounded-md w-full block text-black pt-[11px] pb-[12px] ltr:pl-[38px] rtl:pr-[38px] ltr:pr-[13px] ltr:md:pr-[16px] rtl:pl-[13px] rtl:md:pl-[16px] placeholder:text-gray-500 outline-0 dark:bg-[#15203c] dark:text-white dark:border-[#15203c] dark:placeholder:text-gray-400"
              />
            </form>
          </div>

          <div className="trezo-card-subtitle mt-[15px] sm:mt-0">
            <button
              type="button"
              className="inline-block transition-all rounded-md font-medium px-[13px] py-[6px] text-primary-500 border border-primary-500 hover:bg-primary-500 hover:text-white"
              onClick={() => setOpen(true)}
            >
              <span className="inline-block relative ltr:pl-[22px] rtl:pr-[22px]">
                <i className="material-symbols-outlined !text-[22px] absolute ltr:-left-[4px] rtl:-right-[4px] top-1/2 -translate-y-1/2">
                  add
                </i>
                {t("Categories.addCategory") || "Add New Category"}
              </span>
            </button>
          </div>
        </div>

        <div className="trezo-card-content">
          {isLoading ? (
            <div className="text-center py-10">
              <p className="text-gray-500 dark:text-gray-400">
                {t("Categories.loading") || "Loading categories..."}
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <p className="text-red-500">
                {t("Categories.fetchError") ||
                  "Error loading categories. Please try again."}
              </p>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500 dark:text-gray-400">
                {t("Categories.noCategories") || "No categories found."}
              </p>
            </div>
          ) : (
            <>
              <div className="table-responsive overflow-x-auto">
                <table className="w-full">
                  <thead className="text-black dark:text-white">
                    <tr>
                      <th className="font-medium ltr:text-left rtl:text-right px-[20px] py-[11px] bg-gray-50 dark:bg-[#15203c] whitespace-nowrap ltr:first:rounded-tl-md ltr:last:rounded-tr-md rtl:first:rounded-tr-md rtl:last:rounded-tl-md">
                        {t("Categories.image") || "Image"}
                      </th>
                      <th className="font-medium ltr:text-left rtl:text-right px-[20px] py-[11px] bg-gray-50 dark:bg-[#15203c] whitespace-nowrap ltr:first:rounded-tl-md ltr:last:rounded-tr-md rtl:first:rounded-tr-md rtl:last:rounded-tl-md">
                        {t("Categories.name") || "Name"}
                      </th>
                      <th className="font-medium ltr:text-left rtl:text-right px-[20px] py-[11px] bg-gray-50 dark:bg-[#15203c] whitespace-nowrap ltr:first:rounded-tl-md ltr:last:rounded-tr-md rtl:first:rounded-tr-md rtl:last:rounded-tl-md">
                        {t("Categories.status") || "Status"}
                      </th>
                      <th className="font-medium ltr:text-left rtl:text-right px-[20px] py-[11px] bg-gray-50 dark:bg-[#15203c] whitespace-nowrap ltr:first:rounded-tl-md ltr:last:rounded-tr-md rtl:first:rounded-tr-md rtl:last:rounded-tl-md">
                        {t("Categories.actions") || "Actions"}
                      </th>
                    </tr>
                  </thead>

                  <tbody className="text-black dark:text-white">
                    {currentCategories.map((category: Category) => (
                      <tr key={category.id}>
                        <td className="ltr:text-left rtl:text-right whitespace-nowrap px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036] ltr:first:border-l ltr:last:border-r rtl:first:border-r rtl:last:border-l">
                          {category.image ? (
                            <Image
                              alt={category.name || "Category"}
                              src={category.image}
                              className="rounded-full object-cover"
                              width={50}
                              height={50}
                            />
                          ) : (
                            <div className="w-[50px] h-[50px] rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                              <i className="material-symbols-outlined text-gray-400">
                                image
                              </i>
                            </div>
                          )}
                        </td>

                        <td className="ltr:text-left rtl:text-right whitespace-nowrap px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036] ltr:first:border-l ltr:last:border-r rtl:first:border-r rtl:last:border-l">
                          {category.name || "-"}
                        </td>

                        <td className="ltr:text-left rtl:text-right whitespace-nowrap px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036] ltr:first:border-l ltr:last:border-r rtl:first:border-r rtl:last:border-l">
                          <span
                            className={`px-[8px] py-[3px] inline-block ${
                              category.isActive
                                ? "bg-primary-50 dark:bg-[#15203c] text-primary-500"
                                : "bg-danger-50 dark:bg-[#15203c] text-danger-500"
                            } rounded-sm font-medium text-xs`}
                          >
                            {category.isActive
                              ? t("Categories.active") || "Active"
                              : t("Categories.inactive") || "Inactive"}
                          </span>
                        </td>

                        <td className="ltr:text-left rtl:text-right whitespace-nowrap px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036] ltr:first:border-l ltr:last:border-r rtl:first:border-r rtl:last:border-l">
                          <div className="flex items-center gap-[9px]">
                            <div className="relative group">
                              <button
                                type="button"
                                className="text-primary-500 leading-none"
                                onClick={() => handleEdit(category)}
                              >
                                <i className="material-symbols-outlined !text-md">
                                  edit
                                </i>
                              </button>

                              {/* Tooltip */}
                              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                {t("Categories.edit") || "Edit"}
                                {/* Arrow */}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-white dark:border-[#172036] border-t-gray-800 dark:border-t-gray-800"></div>
                              </div>
                            </div>

                            <div className="relative group">
                              <button
                                type="button"
                                className="text-danger-500 leading-none"
                                onClick={() => handleDelete(category.id)}
                                disabled={deleteCategoryMutation.isPending}
                              >
                                <i className="material-symbols-outlined !text-md">
                                  delete
                                </i>
                              </button>

                              {/* Tooltip */}
                              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                {t("Categories.delete") || "Delete"}
                                {/* Arrow */}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-white dark:border-[#172036] border-t-gray-800 dark:border-t-gray-800"></div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="px-[20px] py-[12px] md:py-[14px] rounded-b-md border-l border-r border-b border-gray-100 dark:border-[#172036] sm:flex sm:items-center justify-between">
                <p className="!mb-0 !text-sm">
                  {locale === "ar" ? "معروض" : "Showing"}{" "}
                  {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
                  {Math.min(
                    currentPage * ITEMS_PER_PAGE,
                    filteredCategories.length
                  )}{" "}
                  {locale === "ar" ? "من" : "of"} {filteredCategories.length}{" "}
                  {locale === "ar" ? "نتائج" : "results"}
                </p>

                <ol className="mt-[10px] sm:mt-0">
                  <li className="inline-block mx-[2px] ltr:first:ml-0 ltr:last:mr-0 rtl:first:mr-0 rtl:last:ml-0">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className="w-[31px] h-[31px] block leading-[29px] relative text-center rounded-md border border-gray-100 dark:border-[#172036] transition-all hover:bg-primary-500 hover:text-white hover:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="opacity-0">0</span>
                      <i className="material-symbols-outlined left-0 right-0 absolute top-1/2 -translate-y-1/2">
                        chevron_left
                      </i>
                    </button>
                  </li>

                  {[...Array(totalPages)].map((_, index) => (
                    <li
                      key={index}
                      className="inline-block mx-[2px] ltr:first:ml-0 ltr:last:mr-0 rtl:first:mr-0 rtl:last:ml-0"
                    >
                      <button
                        onClick={() => handlePageChange(index + 1)}
                        className={`w-[31px] h-[31px] block leading-[29px] relative text-center rounded-md border ${
                          currentPage === index + 1
                            ? "bg-primary-500 text-white"
                            : "border-gray-100 dark:border-[#172036] transition-all hover:bg-primary-500 hover:text-white hover:border-primary-500"
                        }`}
                      >
                        {index + 1}
                      </button>
                    </li>
                  ))}

                  <li className="inline-block mx-[2px] ltr:first:ml-0 ltr:last:mr-0 rtl:first:mr-0 rtl:last:ml-0">
                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className="w-[31px] h-[31px] block leading-[29px] relative text-center rounded-md border border-gray-100 dark:border-[#172036] transition-all hover:bg-primary-500 hover:text-white hover:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="opacity-0">0</span>
                      <i className="material-symbols-outlined left-0 right-0 absolute top-1/2 -translate-y-1/2">
                        chevron_right
                      </i>
                    </button>
                  </li>
                </ol>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal */}
      <Dialog open={open} onClose={setOpen} className="relative z-10">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel
              transition
              className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-[550px] data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
            >
              <div className="trezo-card w-full bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
                <div className="trezo-card-header bg-gray-50 dark:bg-[#15203c] mb-[20px] md:mb-[25px] flex items-center justify-between -mx-[20px] md:-mx-[25px] -mt-[20px] md:-mt-[25px] p-[20px] md:p-[25px] rounded-t-md">
                  <div className="trezo-card-title">
                    <h5 className="!mb-0">
                      {editingCategory
                        ? t("Categories.editCategory") || "Edit Category"
                        : t("Categories.addCategory") || "Add New Category"}
                    </h5>
                  </div>

                  <div className="trezo-card-subtitle">
                    <button
                      type="button"
                      className="text-[23px] transition-all leading-none text-black dark:text-white hover:text-primary-500"
                      onClick={() => {
                        setOpen(false);
                        resetForm();
                      }}
                    >
                      <i className="ri-close-fill"></i>
                    </button>
                  </div>
                </div>

                <div className="trezo-card-content">
                  <form onSubmit={handleSubmit}>
                    <div className="sm:grid sm:grid-cols-2 sm:gap-[25px]">
                      <div className="mb-[20px] sm:mb-0">
                        <label className="mb-[10px] text-black dark:text-white font-medium block">
                          {t("Categories.nameAr") || "Name (Arabic)"}{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="nameAr"
                          value={formData.nameAr}
                          onChange={handleInputChange}
                          className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
                          placeholder="مثال: المقبلات"
                          required
                          dir="rtl"
                        />
                      </div>

                      <div className="mb-[20px] sm:mb-0">
                        <label className="mb-[10px] text-black dark:text-white font-medium block">
                          {t("Categories.nameEn") || "Name (English)"}{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="nameEn"
                          value={formData.nameEn}
                          onChange={handleInputChange}
                          className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
                          placeholder="E.g. Appetizers"
                          required
                        />
                      </div>

                      <div className="mb-[20px] sm:mb-0 sm:col-span-2">
                        <label className="mb-[10px] text-black dark:text-white font-medium block">
                          {t("Categories.status") || "Status"}
                        </label>
                        <select
                          name="isActive"
                          value={formData.isActive ? "1" : "0"}
                          onChange={handleInputChange}
                          className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[14px] block w-full outline-0 cursor-pointer transition-all focus:border-primary-500"
                        >
                          <option value="1">
                            {t("Categories.active") || "Active"}
                          </option>
                          <option value="0">
                            {t("Categories.inactive") || "Inactive"}
                          </option>
                        </select>
                      </div>

                      <div className="sm:col-span-2 mb-[20px] sm:mb-0">
                        <label className="mb-[10px] text-black dark:text-white font-medium block">
                          {t("Categories.image") || "Image"}
                        </label>
                        <div id="fileUploader">
                          <div className="relative flex items-center justify-center overflow-hidden rounded-md py-[48px] px-[20px] border border-gray-200 dark:border-[#172036]">
                            <div className="flex items-center justify-center">
                              <div className="w-[35px] h-[35px] border border-gray-100 dark:border-[#15203c] flex items-center justify-center rounded-md text-primary-500 text-lg ltr:mr-[12px] rtl:ml-[12px]">
                                <i className="ri-upload-2-line"></i>
                              </div>
                              <p className="leading-[1.5]">
                                <strong className="text-black dark:text-white">
                                  {t("Categories.clickToUpload") ||
                                    "Click to upload"}
                                </strong>
                                <br />{" "}
                                {t("Categories.yourFileHere") ||
                                  "your file here"}
                              </p>
                            </div>
                            <input
                              type="file"
                              id="fileInput"
                              key={
                                open ? "file-input-open" : "file-input-closed"
                              }
                              accept="image/*"
                              onChange={handleFileChange}
                              className="absolute top-0 left-0 right-0 bottom-0 rounded-md z-[1] opacity-0 cursor-pointer"
                            />
                          </div>

                          {/* Image Previews */}
                          <div className="mt-[10px] flex flex-wrap gap-2">
                            {selectedImages.map((image, index) => (
                              <div
                                key={index}
                                className="relative w-[80px] h-[80px]"
                              >
                                <Image
                                  src={URL.createObjectURL(image)}
                                  alt="product-preview"
                                  width={80}
                                  height={80}
                                  className="rounded-md"
                                />
                                <button
                                  type="button"
                                  className="absolute top-[-5px] right-[-5px] bg-orange-500 text-white w-[20px] h-[20px] flex items-center justify-center rounded-full text-xs rtl:right-auto rtl:left-[-5px]"
                                  onClick={handleRemoveImage}
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-[20px] md:mt-[25px] ltr:text-right rtl:text-left">
                      <button
                        type="button"
                        className="rounded-md inline-block transition-all font-medium ltr:mr-[15px] rtl:ml-[15px] px-[26.5px] py-[12px] bg-danger-500 text-white hover:bg-danger-400 disabled:opacity-50"
                        onClick={() => {
                          setOpen(false);
                          resetForm();
                        }}
                        disabled={createCategoryMutation.isPending}
                      >
                        {locale === "ar" ? "ألغاء" : "Cancel"}
                      </button>

                      <button
                        type="submit"
                        className="inline-block bg-primary-500 text-white py-[12px] px-[26.5px] transition-all rounded-md hover:bg-primary-400 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={
                          createCategoryMutation.isPending ||
                          updateCategoryMutation.isPending
                        }
                      >
                        <span className="inline-block relative ltr:pl-[25px] rtl:pr-[25px]">
                          <i className="material-symbols-outlined !text-[20px] absolute ltr:left-0 rtl:right-0 top-1/2 -translate-y-1/2">
                            {createCategoryMutation.isPending ||
                            updateCategoryMutation.isPending
                              ? "hourglass_empty"
                              : editingCategory
                              ? "check"
                              : "add"}
                          </i>
                          {createCategoryMutation.isPending ||
                          updateCategoryMutation.isPending
                            ? editingCategory
                              ? t("Categories.updating") || "Updating..."
                              : t("Categories.creating") || "Creating..."
                            : editingCategory
                            ? t("Categories.update") || "Update"
                            : t("Categories.create") || "Create"}
                        </span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default CategoriesTable;
