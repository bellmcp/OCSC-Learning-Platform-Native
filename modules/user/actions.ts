import * as uiActions from '@/modules/ui/actions'
import axios from '@/utils/axiosConfig'

export const LOAD_USER_REQUEST = 'learning-platform/user/LOAD_USER_REQUEST'
export const LOAD_USER_SUCCESS = 'learning-platform/user/LOAD_USER_SUCCESS'
export const LOAD_USER_FAILURE = 'learning-platform/user/LOAD_USER_FAILURE'

export function loadUser(userId?: string) {
  return async (dispatch: any) => {
    dispatch({ type: LOAD_USER_REQUEST })
    try {
      // TODO: Get userId from AsyncStorage or authentication context
      // const token = await AsyncStorage.getItem('token')
      // const userId = parseJwt(token).unique_name

      if (!userId) {
        dispatch({ type: LOAD_USER_FAILURE })
        return
      }

      const { data } = await axios.get(`/Users/${userId}`)
      dispatch({
        type: LOAD_USER_SUCCESS,
        payload: {
          users: data || {},
        },
      })
    } catch (err: any) {
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
