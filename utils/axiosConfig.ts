import axios from 'axios'

// Set the base URL for all axios requests
// Matches the desktop version's REACT_APP_API_URL
axios.defaults.baseURL = 'https://learningportal.ocsc.go.th/learningspaceapi/'

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
