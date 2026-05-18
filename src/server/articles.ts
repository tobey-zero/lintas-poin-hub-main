'use server';

import {
  createArticle,
  updateArticle,
  deleteArticle,
  fetchAllArticles,
  fetchArticleById,
} from '@/integrations/sqlite';

export async function createArticleAction(data: any) {
  try {
    return createArticle(data);
  } catch (error) {
    throw new Error(`Failed to create article: ${error}`);
  }
}

export async function updateArticleAction(id: string, data: any) {
  try {
    return updateArticle(id, data);
  } catch (error) {
    throw new Error(`Failed to update article: ${error}`);
  }
}

export async function deleteArticleAction(id: string) {
  try {
    return deleteArticle(id);
  } catch (error) {
    throw new Error(`Failed to delete article: ${error}`);
  }
}

export async function fetchAllArticlesAction() {
  try {
    return fetchAllArticles();
  } catch (error) {
    throw new Error(`Failed to fetch articles: ${error}`);
  }
}

export async function fetchArticleByIdAction(id: string) {
  try {
    return fetchArticleById(id);
  } catch (error) {
    throw new Error(`Failed to fetch article: ${error}`);
  }
}
