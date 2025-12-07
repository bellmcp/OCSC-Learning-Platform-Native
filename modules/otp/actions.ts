import { PORTAL_API_URL } from '@env'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'

import * as uiActions from '@/modules/ui/actions'

// Action Types
export const LOAD_OTP_REQUEST = 'learning-platform/otp/LOAD_OTP_REQUEST'
export const LOAD_OTP_SUCCESS = 'learning-platform/otp/LOAD_OTP_SUCCESS'
export const LOAD_OTP_FAILURE = 'learning-platform/otp/LOAD_OTP_FAILURE'
export const CLEAR_OTP_DATA = 'learning-platform/otp/CLEAR_OTP_DATA'

const portalApiBaseUrl =
  PORTAL_API_URL || 'https://learningportal.ocsc.go.th/learningportalapi/'

export function loadOTPData() {
  return async (dispatch: any) => {
    const token = await AsyncStorage.getItem('token')
    if (!token) {
      console.log('[OTP] No token found, skipping load')
      dispatch(uiActions.setFlashMessage('กรุณาเข้าสู่ระบบก่อนใช้งาน', 'error'))
      return
    }

    dispatch({ type: LOAD_OTP_REQUEST })

    try {
      const { data } = await axios.get('/otp/qrcode', {
        baseURL: portalApiBaseUrl,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      dispatch({
        type: LOAD_OTP_SUCCESS,
        payload: {
          data: data || {},
        },
      })
    } catch (err: any) {
      console.error('[OTP] Error loading OTP data:', err)
      dispatch({ type: LOAD_OTP_FAILURE })
      dispatch(
        uiActions.setFlashMessage(
          err?.response?.data?.mesg ||
            `โหลดข้อมูล OTP ไม่สำเร็จ เกิดข้อผิดพลาด ${err?.response?.status}`,
          'error'
        )
      )
    }
  }
}

export function clearOTPData() {
  return {
    type: CLEAR_OTP_DATA,
  }
}
