import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const API_VERSION = 'api';

export const endpoints = {
  auth: {
    login: `${BASE_URL}/${API_VERSION}/token/`,
    register: `${BASE_URL}/${API_VERSION}/register/`,
    refresh: `${BASE_URL}/${API_VERSION}/token/refresh/`,
  },
  listings: `${BASE_URL}/${API_VERSION}/listings/`,
  listing: (id) => `${BASE_URL}/${API_VERSION}/listings/${id}/`,
  myListings: `${BASE_URL}/${API_VERSION}/listings/my-listings/`,
  userProfile: `${BASE_URL}/${API_VERSION}/user/profile/`,
  conversations: `${BASE_URL}/${API_VERSION}/conversations/`,
  messages: (conversationId) => `${BASE_URL}/${API_VERSION}/conversations/${conversationId}/messages/`,
};

// Add axios default headers
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['Accept'] = 'application/json';

// Configure axios for development
if (process.env.NODE_ENV === 'development') {
  axios.defaults.withCredentials = true;
  // Disable HTTPS requirement in development
  axios.defaults.httpsAgent = null;
  // Force HTTP in development
  axios.defaults.baseURL = 'http://localhost:8000';
}

export default BASE_URL; 