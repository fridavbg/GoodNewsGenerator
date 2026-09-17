export interface SearchRequest {
  topic: string;
  limit?: number;
}

export interface NewsResult {
  article: {
    title: string;
    description: string;
    url: string;
    source: { name: string };
    urlToImage?: string;
    publishedAt: string;
  };
  analysis: string;
}
