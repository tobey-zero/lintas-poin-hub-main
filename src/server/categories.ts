'use server';

import {
  createCategory,
  updateCategory,
  deleteCategory,
  fetchAllCategories,
  fetchCategoryById,
} from '@/integrations/sqlite';

export async function createCategoryAction(data: any) {
  try {
    return createCategory(data);
  } catch (error) {
    throw new Error(`Failed to create category: ${error}`);
  }
}

export async function updateCategoryAction(id: string, data: any) {
  try {
    return updateCategory(id, data);
  } catch (error) {
    throw new Error(`Failed to update category: ${error}`);
  }
}

export async function deleteCategoryAction(id: string) {
  try {
    return deleteCategory(id);
  } catch (error) {
    throw new Error(`Failed to delete category: ${error}`);
  }
}

export async function fetchAllCategoriesAction() {
  try {
    return fetchAllCategories();
  } catch (error) {
    throw new Error(`Failed to fetch categories: ${error}`);
  }
}

export async function fetchCategoryByIdAction(id: string) {
  try {
    return fetchCategoryById(id);
  } catch (error) {
    throw new Error(`Failed to fetch category: ${error}`);
  }
}
