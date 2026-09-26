import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';
import { Article } from './claudeService';

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const NEWS_API_URL = 'https://newsapi.org/v2/everything';

export async function searchNews(topic: string, limit: number = 10): Promise<Article[]> {
  try {
    const response = await axios.get(NEWS_API_URL, {
      params: {
        q: topic,
        sortBy: 'publishedAt',
        language: 'en',
        pageSize: limit,
        apiKey: NEWS_API_KEY,
      },
    });

    return response.data.articles || [];
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
}
