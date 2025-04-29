import axios from 'axios';

// Test the Django authentication endpoints
const testAuth = async () => {
  try {
    // Test the token endpoint
    console.log('Testing token endpoint...');
    const tokenResponse = await axios.post('http://localhost:8000/api/token/', {
      username: 'testuser', // Replace with a valid username
      password: 'testpassword' // Replace with a valid password
    });
    console.log('Token response:', tokenResponse.data);
    
    // Test the token refresh endpoint
    if (tokenResponse.data && tokenResponse.data.refresh) {
      console.log('Testing token refresh endpoint...');
      const refreshResponse = await axios.post('http://localhost:8000/api/token/refresh/', {
        refresh: tokenResponse.data.refresh
      });
      console.log('Refresh response:', refreshResponse.data);
    }
    
    // Test the register endpoint
    console.log('Testing register endpoint...');
    const registerResponse = await axios.post('http://localhost:8000/api/register/', {
      username: 'newuser' + Math.floor(Math.random() * 1000),
      email: 'newuser' + Math.floor(Math.random() * 1000) + '@example.com',
      password: 'newpassword123'
    });
    console.log('Register response:', registerResponse.data);
    
    return {
      success: true,
      message: 'All authentication endpoints tested successfully'
    };
  } catch (error) {
    console.error('Authentication test failed:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
    }
    return {
      success: false,
      message: 'Authentication test failed',
      error: error.response?.data || error.message
    };
  }
};

export default testAuth; 