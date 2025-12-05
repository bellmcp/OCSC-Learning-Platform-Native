import * as uiActions from '@/modules/ui/actions'
import axios from '@/utils/axiosConfig'

export const LOAD_PRESS_REQUEST = 'learning-platform/press/LOAD_PRESS_REQUEST'
export const LOAD_PRESS_SUCCESS = 'learning-platform/press/LOAD_PRESS_SUCCESS'
export const LOAD_PRESS_FAILURE = 'learning-platform/press/LOAD_PRESS_FAILURE'
export const LOAD_ANNOUNCEMENT_REQUEST =
  'learning-platform/press/LOAD_ANNOUNCEMENT_REQUEST'
export const LOAD_ANNOUNCEMENT_SUCCESS =
  'learning-platform/press/LOAD_ANNOUNCEMENT_SUCCESS'
export const LOAD_ANNOUNCEMENT_FAILURE =
  'learning-platform/press/LOAD_ANNOUNCEMENT_FAILURE'

export function loadPresses() {
  return async (dispatch: any) => {
    console.log('[Press Actions] Loading presses...')
    dispatch({ type: LOAD_PRESS_REQUEST })
    try {
      const { data } = await axios.get('/PressReleases', {
        params: {
          max: 5,
        },
      })
      console.log(
        '[Press Actions] Presses loaded successfully:',
        data?.length || 0,
        'items'
      )
      dispatch({
        type: LOAD_PRESS_SUCCESS,
        payload: {
          presses: data || [],
        },
      })
    } catch (err: any) {
      console.error('[Press Actions] Failed to load presses:', err.message)
      dispatch({ type: LOAD_PRESS_FAILURE })
      dispatch(
        uiActions.setFlashMessage(
          `โหลดข้อมูลประชาสัมพันธ์ไม่สำเร็จ เกิดข้อผิดพลาด ${err?.response?.status}`,
          'error'
        )
      )
    }
  }
}

export function loadAnnouncement() {
  return async (dispatch: any) => {
    dispatch({ type: LOAD_ANNOUNCEMENT_REQUEST })
    try {
      const { data } = await axios.get('/PressReleases/0')
      dispatch({
        type: LOAD_ANNOUNCEMENT_SUCCESS,
        payload: {
          announcement: data || [],
        },
      })
    } catch (err: any) {
      dispatch({ type: LOAD_ANNOUNCEMENT_FAILURE })
      dispatch(
        uiActions.setFlashMessage(
          `โหลดข้อมูลประกาศไม่สำเร็จ เกิดข้อผิดพลาด ${err?.response?.status}`,
          'error'
        )
      )
    }
  }
}
