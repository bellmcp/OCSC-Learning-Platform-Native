import { router } from 'expo-router'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

import * as learnActions from '@/modules/learn/actions'
import * as meActions from '@/modules/me/actions'
import * as registrationsActions from '@/modules/registrations/actions'
import * as uiActions from '@/modules/ui/actions'
import * as userActions from '@/modules/user/actions'
import type { AppDispatch } from '@/store/types'
import {
  registerUnauthorizedHandler,
  unregisterUnauthorizedHandler,
} from '@/utils/authManager'

/**
 * AuthHandler component that handles global 401 errors.
 * This component registers a callback with the authManager that will be called
 * when a 401 Unauthorized error occurs from any API call.
 *
 * Place this component inside the Redux Provider and navigation context.
 */
export default function AuthHandler() {
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    // Register the unauthorized handler
    const handleUnauthorized = () => {
      console.log('[AuthHandler] Handling 401 Unauthorized error')

      // Clear all Redux state
      dispatch(userActions.clearUser())
      dispatch(registrationsActions.clearRegistrations())
      dispatch(meActions.clearAllCertificates())
      dispatch(learnActions.clearLearnState())
      console.log('[AuthHandler] Redux state cleared')

      // Show error message
      dispatch(
        uiActions.setFlashMessage('เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่', 'error')
      )

      // Navigate to account page (login)
      // Use setTimeout to ensure the toast is shown before navigation
      setTimeout(() => {
        router.replace('/(tabs)/account')
      }, 100)
    }

    registerUnauthorizedHandler(handleUnauthorized)

    // Cleanup on unmount
    return () => {
      unregisterUnauthorizedHandler()
    }
  }, [dispatch])

  // This component doesn't render anything
  return null
}
