const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const endpoints = {
  listings: `${API_URL}/api/listings/`,
  listing: (id) => `${API_URL}/api/listings/${id}/`,
  myListings: `${API_URL}/api/listings/my-listings/`,
  register: `${API_URL}/api/register/`,
  login: `${API_URL}/api/token/`,
  userProfile: `${API_URL}/api/user/profile/`,
  userByEmail: (email) => `${API_URL}/api/user-by-email/${email}/`,
};

export default API_URL; 