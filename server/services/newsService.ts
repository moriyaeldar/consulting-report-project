const NEWS_API_URL = 'https://news-api.jona-581.workers.dev/';

export interface NewsArticle {
  heading: string;
  content: string;
}

// Returns null when the API fails, so the report can still be generated from DB data
export const fetchCompanyNews = async (
  companyId: string
): Promise<NewsArticle | null> => {
  try {
    const response = await fetch(
      `${NEWS_API_URL}?id=${encodeURIComponent(companyId)}`
    );
    if (!response.ok) return null;

    const data = await response.json();
    if (!data.heading || !data.content) return null;

    return { heading: data.heading, content: data.content };
  } catch {
    return null;
  }
};
