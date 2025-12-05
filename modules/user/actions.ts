import * as uiActions from '@/modules/ui/actions'
import axios from '@/utils/axiosConfig'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const LOAD_USER_REQUEST = 'learning-platform/user/LOAD_USER_REQUEST'
export const LOAD_USER_SUCCESS = 'learning-platform/user/LOAD_USER_SUCCESS'
export const LOAD_USER_FAILURE = 'learning-platform/user/LOAD_USER_FAILURE'

// Parse JWT token to get user ID
const parseJwt = (token: string) => {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Error parsing JWT:', error)
    return null
  }
}

export function loadUser() {
  return async (dispatch: any) => {
    dispatch({ type: LOAD_USER_REQUEST })
    try {
      // Get token from AsyncStorage
      const token = await AsyncStorage.getItem('token')
      if (!token) {
        console.log('[User Actions] No token found')
        dispatch({ type: LOAD_USER_FAILURE })
        return
      }

      // Parse JWT to get userId
      const tokenData = parseJwt(token)
      const userId = tokenData?.unique_name
      
      if (!userId) {
        console.log('[User Actions] No userId in token')
        dispatch({ type: LOAD_USER_FAILURE })
        return
      }

      console.log('[User Actions] Loading user data for:', userId)
      
      // axios.get will automatically include the token via interceptor
      const { data } = await axios.get(`/Users/${userId}`)
      
      if (data.length === 0) {
        dispatch({
          type: LOAD_USER_SUCCESS,
          payload: {
            users: [],
          },
        })
        return
      }
      
      dispatch({
        type: LOAD_USER_SUCCESS,
        payload: {
          users: data,
        },
      })
    } catch (err: any) {
      console.error('[User Actions] Load user error:', err)
      dispatch({ type: LOAD_USER_FAILURE })
      dispatch(
        uiActions.setFlashMessage(
          `โหลดข้อมูลผู้ใช้ไม่สำเร็จ เกิดข้อผิดพลาด ${err?.response?.status}`,
          'error'
        )
      )
    }
  }
}
