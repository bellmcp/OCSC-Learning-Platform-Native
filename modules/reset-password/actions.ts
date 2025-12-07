import { PORTAL_API_URL } from '@env'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'

import * as uiActions from '@/modules/ui/actions'

// Action Types
export const RESET_PASSWORD_REQUEST =
  'learning-platform/reset-password/RESET_PASSWORD_REQUEST'
export const RESET_PASSWORD_SUCCESS =
  'learning-platform/reset-password/RESET_PASSWORD_SUCCESS'
export const RESET_PASSWORD_FAILURE =
  'learning-platform/reset-password/RESET_PASSWORD_FAILURE'
export const CLEAR_RESET_PASSWORD_STATE =
  'learning-platform/reset-password/CLEAR_RESET_PASSWORD_STATE'

const portalApiBaseUrl =
  PORTAL_API_URL || 'https://learningportal.ocsc.go.th/learningportalapi/'

interface ResetPasswordData {
  password1: string
  password2: string
}

export function resetPassword(data: ResetPasswordData) {
  return async (dispatch: any): Promise<boolean> => {
    const token = await AsyncStorage.getItem('token')
    if (!token) {
      console.log('[ResetPassword] No token found, skipping')
      dispatch(uiActions.setFlashMessage('กรุณาเข้าสู่ระบบก่อนใช้งาน', 'error'))
      return false
    }

    dispatch({ type: RESET_PASSWORD_REQUEST })

    try {
      const response = await axios.post('/Users/resetpassword', data, {
        baseURL: portalApiBaseUrl,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      dispatch({
        type: RESET_PASSWORD_SUCCESS,
        payload: {
          data: response.data,
        },
      })

      dispatch(
        uiActions.setFlashMessage('ตั้งรหัสผ่านใหม่เรียบร้อยแล้ว', 'success')
      )

      return true
    } catch (err: any) {
      console.error('[ResetPassword] Error:', err)
      dispatch({ type: RESET_PASSWORD_FAILURE })
      dispatch(
        uiActions.setFlashMessage(
          err?.response?.data?.mesg ||
            `ตั้งรหัสผ่านใหม่ไม่สำเร็จ เกิดข้อผิดพลาด ${err?.response?.status}`,
          'error'
        )
      )
      return false
    }
  }
}

export function clearResetPasswordState() {
  return {
    type: CLEAR_RESET_PASSWORD_STATE,
  }
}
