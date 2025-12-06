import { API_URL } from '@env'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'

// Set the base URL for all axios requests
// Loaded from environment variables (.env file)
axios.defaults.baseURL =
  API_URL || 'https://learningportal.ocsc.go.th/learningspaceapi/'

console.log('[Axios Config] Base URL:', axios.defaults.baseURL)

// Request interceptor for adding auth token
axios.interceptors.request.use(
  async (config) => {
    try {
      // Get token from AsyncStorage
      const token = await AsyncStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
        console.log(
          '[Axios] Added token to request:',
          token.substring(0, 50) + '...'
        )
        console.log('[Axios] Request URL:', config.url)
        console.log(
          '[Axios] Request headers:',
          JSON.stringify(config.headers, null, 2)
        )
      } else {
        console.log('[Axios] No token found in AsyncStorage')
      }
    } catch (error) {
      console.error('[Axios] Error getting token:', error)
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for handling errors globally
axios.interceptors.response.use(
  (response) => {
    console.log(
      '[Axios] Response success:',
      response.config.url,
      response.status
    )
    return response
  },
  (error) => {
    // Handle errors globally here
    // 404 errors are expected for some endpoints (e.g., OrientationScore when user hasn't completed course)
    const status = error.response?.status
    if (status === 404) {
      console.log('[Axios] Resource not found (404):', error.config?.url)
    } else {
      console.error('[Axios] API Error:', error.message)
      console.error('[Axios] Error config:', error.config?.url)
      console.error('[Axios] Error response:', status, error.response?.data)
    }
    return Promise.reject(error)
  }
)

export default axios
