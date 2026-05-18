'use server';

import {
  createBreakingNews,
  updateBreakingNews,
  deleteBreakingNews,
  fetchAllBreakingNews,
} from '@/integrations/sqlite';

export async function createBreakingNewsAction(data: any) {
  try {
    return createBreakingNews(data);
  } catch (error) {
    throw new Error(`Failed to create breaking news: ${error}`);
  }
}

export async function updateBreakingNewsAction(id: string, data: any) {
  try {
    return updateBreakingNews(id, data);
  } catch (error) {
    throw new Error(`Failed to update breaking news: ${error}`);
  }
}

export async function deleteBreakingNewsAction(id: string) {
  try {
    return deleteBreakingNews(id);
  } catch (error) {
    throw new Error(`Failed to delete breaking news: ${error}`);
  }
}

export async function fetchAllBreakingNewsAction() {
  try {
    return fetchAllBreakingNews();
  } catch (error) {
    throw new Error(`Failed to fetch breaking news: ${error}`);
  }
}
