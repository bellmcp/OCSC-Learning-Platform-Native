import AsyncStorage from '@react-native-async-storage/async-storage'

// Type for the logout callback
type LogoutCallback = () => void

// Store the logout callback
let onUnauthorizedCallback: LogoutCallback | null = null

// Flag to prevent multiple 401 handlers from firing simultaneously
let isHandling401 = false

/**
 * Register a callback to be called when a 401 Unauthorized error occurs.
 * This should be called from the app's root component.
 */
export function registerUnauthorizedHandler(callback: LogoutCallback) {
  onUnauthorizedCallback = callback
  console.log('[AuthManager] Unauthorized handler registered')
}

/**
 * Unregister the unauthorized handler.
 * Call this when the component unmounts.
 */
export function unregisterUnauthorizedHandler() {
  onUnauthorizedCallback = null
  console.log('[AuthManager] Unauthorized handler unregistered')
}

/**
 * Handle a 401 Unauthorized error.
 * Clears the token and calls the registered callback.
 */
export async function handleUnauthorized(): Promise<boolean> {
  // Prevent multiple simultaneous 401 handlers
  if (isHandling401) {
    console.log('[AuthManager] Already handling 401, skipping...')
    return false
  }

  isHandling401 = true

  try {
    // Check if there's actually a token to clear
    const token = await AsyncStorage.getItem('token')
    if (!token) {
      console.log('[AuthManager] No token found, already logged out')
      isHandling401 = false
      return false
    }

    // Clear the token
    await AsyncStorage.removeItem('token')
    console.log('[AuthManager] Token cleared due to 401 error')

    // Call the registered callback
    if (onUnauthorizedCallback) {
      onUnauthorizedCallback()
      return true
    } else {
      console.warn('[AuthManager] No unauthorized handler registered')
      return false
    }
  } catch (error) {
    console.error('[AuthManager] Error handling 401:', error)
    return false
  } finally {
    // Reset the flag after a short delay to allow for navigation
    setTimeout(() => {
      isHandling401 = false
    }, 1000)
  }
}

/**
 * Check if currently handling a 401 error
 */
export function isHandlingUnauthorized(): boolean {
  return isHandling401
}
