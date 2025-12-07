import { API_URL } from '@env'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'

import { handleUnauthorized, isHandlingUnauthorized } from './authManager'

// Set the base URL for all axios requests
// Loaded from environment variables (.env file)
axios.defaults.baseURL =
  API_URL || 'https://learningportal.ocsc.go.th/learningspaceapi/'

console.log('[Axios Config] Base URL:', axios.defaults.baseURL)

// List of endpoints that don't require authentication (should not trigger 401 handling)
const publicEndpoints = ['/Tokens', '/LocalDateTime']

// Request interceptor for adding auth token
axios.interceptors.request.use(
  async (config) => {
    try {
      // Skip adding token if we're handling a 401 error
      if (isHandlingUnauthorized()) {
        console.log('[Axios] Skipping request during 401 handling')
        return config
      }

      // Get token from AsyncStorage
      const token = await AsyncStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
        console.log('[Axios] Request URL:', config.url)
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
  async (error) => {
    const status = error.response?.status
    const url = error.config?.url || ''

    // Check if this is a public endpoint (don't trigger 401 handling for these)
    const isPublicEndpoint = publicEndpoints.some((endpoint) =>
      url.includes(endpoint)
    )

    // Handle 401 Unauthorized errors globally
    if (status === 401 && !isPublicEndpoint) {
      console.log('[Axios] Unauthorized (401):', url)

      // Trigger the global unauthorized handler
      await handleUnauthorized()

      // Return a more descriptive error
      error.message = 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่'
    } else if (status === 404) {
      // 404 errors are expected for some endpoints
      console.log('[Axios] Resource not found (404):', url)
    } else {
      console.error('[Axios] API Error:', error.message)
      console.error('[Axios] Error config:', url)
      console.error('[Axios] Error response:', status, error.response?.data)
    }

    return Promise.reject(error)
  }
)

export default axios
