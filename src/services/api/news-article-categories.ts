// News Article Categories API functions
import { apiRequest, QueryParams } from './base';
import { NewsArticleCategory, CreateNewsArticleCategoryData, UpdateNewsArticleCategoryData } from '../../types/newsArticleCategory';

export const newsArticleCategoriesAPI = {
  // Get list of news article categories
  list: (params?: QueryParams) => {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return apiRequest<NewsArticleCategory[]>(`/news-article-categories${queryString}`);
  },

  // Get single news article category by ID
  get: (id: number) =>
    apiRequest<NewsArticleCategory>(`/news-article-categories/${id}`),

  // Get single news article category by slug
  getBySlug: (slug: string) =>
    apiRequest<NewsArticleCategory>(`/news-article-categories/${slug}`),

  // Create new news article category
  create: (data: CreateNewsArticleCategoryData) =>
    apiRequest<NewsArticleCategory>('/news-article-categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Update news article category
  update: (slug: string, data: UpdateNewsArticleCategoryData) =>
    apiRequest<NewsArticleCategory>(`/news-article-categories/${slug}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Delete news article category
  delete: (slug: string) =>
    apiRequest(`/news-article-categories/${slug}`, { method: 'DELETE' }),

  // Restore news article category
  restore: (slug: string) =>
    apiRequest<NewsArticleCategory>(`/news-article-categories/${slug}/restore`, { method: 'POST' }),
};
