import axios from 'axios'
import { API_URL } from '@env'

// Set the base URL for all axios requests
// Loaded from environment variables (.env file)
axios.defaults.baseURL = API_URL || 'https://learningportal.ocsc.go.th/learningspaceapi/'

console.log('[Axios Config] Base URL:', axios.defaults.baseURL)

// Request interceptor for adding auth token if needed
axios.interceptors.request.use(
  (config) => {
    // You can add authentication token here in the future
    // const token = await AsyncStorage.getItem('token')
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`
    // }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for handling errors globally
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle errors globally here
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

export default axios
