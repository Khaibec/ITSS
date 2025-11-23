// API Service for Backend Integration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

/**
 * Get stored JWT token from localStorage
 */
export const getToken = () => {
  return localStorage.getItem('jwt_token');
};

/**
 * Store JWT token in localStorage
 */
export const setToken = (token) => {
  localStorage.setItem('jwt_token', token);
};

/**
 * Remove JWT token from localStorage
 */
export const removeToken = () => {
  localStorage.removeItem('jwt_token');
};

/**
 * Make API request with authentication
 */
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  const url = `${API_BASE_URL}${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

/**
 * Auth API
 */
export const authAPI = {
  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<{access_token: string}>}
   */
  login: async (email, password) => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (data.access_token) {
      setToken(data.access_token);
    }

    return data;
  },

  /**
   * Logout user
   */
  logout: () => {
    removeToken();
  },
};

/**
 * Chat Boxes API
 */
export const chatBoxesAPI = {
  /**
   * Get all chat boxes for the authenticated user
   * @returns {Promise<{success: boolean, data: Array}>}
   */
  getChatBoxes: async () => {
    return await apiRequest('/api/chat-boxes', {
      method: 'GET',
    });
  },

  /**
   * Get messages for a specific chat box
   * @param {number} groupId - Group ID
   * @returns {Promise<{success: boolean, data: Array}>}
   */
  getMessages: async (groupId) => {
    return await apiRequest(`/api/chat-boxes/${groupId}/messages`, {
      method: 'GET',
    });
  },
};

