// src/api.js
import axios from 'axios';
import { BACKEND_URL } from './config';
export const fetchOpenAIResponse = async (prompt: string) => {
  console.log('fetchOpenAIResponse:', prompt);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/openai`, { prompt });
      return response.data.response;
    } catch (error) {
      console.error('Error fetching response from OpenAI:', error);
      throw error;
    }
  };
  