const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const endpoints = {
  auth: {
    login: `${BASE_URL}/api/token/`,
    register: `${BASE_URL}/api/register/`,
    refresh: `${BASE_URL}/api/token/refresh/`,
  },
  listings: `${BASE_URL}/api/listings/`,
  listing: (id) => `${BASE_URL}/api/listings/${id}`,
  myListings: `${BASE_URL}/api/listings/my-listings/`,
  userProfile: `${BASE_URL}/api/user/profile/`,
};

export default BASE_URL; 