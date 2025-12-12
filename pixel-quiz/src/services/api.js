import axios from 'axios';

const GOOGLE_APP_SCRIPT_URL = import.meta.env.VITE_GOOGLE_APP_SCRIPT_URL;

const api = axios.create({
  baseURL: GOOGLE_APP_SCRIPT_URL,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
});

export const fetchQuestions = async (count) => {
  // Mock data for development if URL is not set or for testing
  if (!GOOGLE_APP_SCRIPT_URL || GOOGLE_APP_SCRIPT_URL.includes('your-script-url')) {
    console.warn('Using mock data for questions');
    return Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      question: `Question ${i + 1}: What is 1 + ${i}?`,
      options: ['1', `${1 + i}`, '99', '0'],
      answer: `${1 + i}`, // Simple logic for mock
    }));
  }

  try {
    const response = await api.get('', { params: { action: 'getQuestions', count } });
    return response.data;
  } catch (error) {
    console.warn('API connection failed, falling back to mock data:', error);
    // Fallback Mock Data
    return Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      question: `[MOCK] Question ${i + 1}: What is 1 + ${i}?`,
      options: ['1', `${1 + i}`, '99', '0'],
      answer: `${1 + i}`,
    }));
  }
};

export const submitScore = async (data) => {
  // Mock submission
  if (!GOOGLE_APP_SCRIPT_URL || GOOGLE_APP_SCRIPT_URL.includes('your-script-url')) {
    console.warn('Mocking score submission', data);
    return { success: true };
  }

  try {
    const formData = new URLSearchParams();
    formData.append('action', 'submitScore');
    Object.keys(data).forEach(key => formData.append(key, data[key]));

    // axios post to GAS usually requires handling CORS or using no-cors mode, 
    // but standard CORS with GET/POST often works if GAS is deployed as Web App with "Anyone" access.
    // For POST, GAS often requires specific setup (e.g. returning JSONP or handling OPTIONS).
    // Using 'application/x-www-form-urlencoded' often helps avoid preflight issues if sending simple data.
    const response = await api.post('', formData);
    return response.data;
  } catch (error) {
    console.warn('API submission failed, logging to console instead:', error);
    console.log('Mock Submit Data:', data);
    return { success: true, mock: true };
  }
};
