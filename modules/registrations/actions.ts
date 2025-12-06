import * as uiActions from '@/modules/ui/actions'
import axios from '@/utils/axiosConfig'
import AsyncStorage from '@react-native-async-storage/async-storage'

// Action Types
export const LOAD_COURSE_REGISTRATIONS_REQUEST =
  'learning-platform/registrations/LOAD_COURSE_REGISTRATIONS_REQUEST'
export const LOAD_COURSE_REGISTRATIONS_SUCCESS =
  'learning-platform/registrations/LOAD_COURSE_REGISTRATIONS_SUCCESS'
export const LOAD_COURSE_REGISTRATIONS_FAILURE =
  'learning-platform/registrations/LOAD_COURSE_REGISTRATIONS_FAILURE'
export const LOAD_CURRICULUM_REGISTRATIONS_REQUEST =
  'learning-platform/registrations/LOAD_CURRICULUM_REGISTRATIONS_REQUEST'
export const LOAD_CURRICULUM_REGISTRATIONS_SUCCESS =
  'learning-platform/registrations/LOAD_CURRICULUM_REGISTRATIONS_SUCCESS'
export const LOAD_CURRICULUM_REGISTRATIONS_FAILURE =
  'learning-platform/registrations/LOAD_CURRICULUM_REGISTRATIONS_FAILURE'
export const LOAD_LOCAL_DATE_TIME_REQUEST =
  'learning-platform/registrations/LOAD_LOCAL_DATE_TIME_REQUEST'
export const LOAD_LOCAL_DATE_TIME_SUCCESS =
  'learning-platform/registrations/LOAD_LOCAL_DATE_TIME_SUCCESS'
export const LOAD_LOCAL_DATE_TIME_FAILURE =
  'learning-platform/registrations/LOAD_LOCAL_DATE_TIME_FAILURE'
export const COURSE_UNENROLL_REQUEST =
  'learning-platform/registrations/COURSE_UNENROLL_REQUEST'
export const COURSE_UNENROLL_SUCCESS =
  'learning-platform/registrations/COURSE_UNENROLL_SUCCESS'
export const COURSE_UNENROLL_FAILURE =
  'learning-platform/registrations/COURSE_UNENROLL_FAILURE'
export const CURRICULUM_UNENROLL_REQUEST =
  'learning-platform/registrations/CURRICULUM_UNENROLL_REQUEST'
export const CURRICULUM_UNENROLL_SUCCESS =
  'learning-platform/registrations/CURRICULUM_UNENROLL_SUCCESS'
export const CURRICULUM_UNENROLL_FAILURE =
  'learning-platform/registrations/CURRICULUM_UNENROLL_FAILURE'
export const UPDATE_CURRICULUM_SATISFACTION_SCORE_REQUEST =
  'learning-platform/registrations/UPDATE_CURRICULUM_SATISFACTION_SCORE_REQUEST'
export const UPDATE_CURRICULUM_SATISFACTION_SCORE_SUCCESS =
  'learning-platform/registrations/UPDATE_CURRICULUM_SATISFACTION_SCORE_SUCCESS'
export const UPDATE_CURRICULUM_SATISFACTION_SCORE_FAILURE =
  'learning-platform/registrations/UPDATE_CURRICULUM_SATISFACTION_SCORE_FAILURE'
export const COURSE_COMPLETE_REQUEST =
  'learning-platform/registrations/COURSE_COMPLETE_REQUEST'
export const COURSE_COMPLETE_SUCCESS =
  'learning-platform/registrations/COURSE_COMPLETE_SUCCESS'
export const COURSE_COMPLETE_FAILURE =
  'learning-platform/registrations/COURSE_COMPLETE_FAILURE'
export const CLEAR_REGISTRATIONS =
  'learning-platform/registrations/CLEAR_REGISTRATIONS'

// Helper function to parse JWT token
function parseJwt(token: string) {
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
  } catch (e) {
    return null
  }
}

export function loadCourseRegistrations() {
  return async (dispatch: any) => {
    const token = await AsyncStorage.getItem('token')
    if (!token) {
      console.log('[Registrations] No token found, skipping load')
      return
    }

    const parsed = parseJwt(token)
    const userId = parsed?.unique_name

    if (!userId) {
      console.log('[Registrations] No userId found in token')
      return
    }

    console.log(
      '[Registrations] Loading course registrations for user:',
      userId
    )
    dispatch({ type: LOAD_COURSE_REGISTRATIONS_REQUEST })

    try {
      const { data } = await axios.get(`/Users/${userId}/CourseRegistrations`)
      console.log(
        '[Registrations] Course registrations loaded:',
        data?.length || 0,
        'items'
      )
      dispatch({
        type: LOAD_COURSE_REGISTRATIONS_SUCCESS,
        payload: {
          myCourses: data || [],
        },
      })
    } catch (err: any) {
      console.error(
        '[Registrations] Failed to load course registrations:',
        err.message
      )
      dispatch({ type: LOAD_COURSE_REGISTRATIONS_FAILURE })
      dispatch(
        uiActions.setFlashMessage(
          `โหลดข้อมูลการลงทะเบียนรายวิชาไม่สำเร็จ เกิดข้อผิดพลาด ${err?.response?.status}`,
          'error'
        )
      )
    }
  }
}

export function loadCurriculumRegistrations() {
  return async (dispatch: any) => {
    const token = await AsyncStorage.getItem('token')
    if (!token) {
      console.log('[Registrations] No token found, skipping load')
      return
    }

    const parsed = parseJwt(token)
    const userId = parsed?.unique_name

    if (!userId) {
      console.log('[Registrations] No userId found in token')
      return
    }

    console.log(
      '[Registrations] Loading curriculum registrations for user:',
      userId
    )
    dispatch({ type: LOAD_CURRICULUM_REGISTRATIONS_REQUEST })

    try {
      const { data } = await axios.get(
        `/Users/${userId}/CurriculumRegistrations`
      )
      console.log(
        '[Registrations] Curriculum registrations loaded:',
        data?.length || 0,
        'items'
      )
      dispatch({
        type: LOAD_CURRICULUM_REGISTRATIONS_SUCCESS,
        payload: {
          myCurriculums: data || [],
        },
      })
    } catch (err: any) {
      console.error(
        '[Registrations] Failed to load curriculum registrations:',
        err.message
      )
      dispatch({ type: LOAD_CURRICULUM_REGISTRATIONS_FAILURE })
      dispatch(
        uiActions.setFlashMessage(
          `โหลดข้อมูลการลงทะเบียนหลักสูตรไม่สำเร็จ เกิดข้อผิดพลาด ${err?.response?.status}`,
          'error'
        )
      )
    }
  }
}

export function loadLocalDateTime() {
  return async (dispatch: any) => {
    dispatch({ type: LOAD_LOCAL_DATE_TIME_REQUEST })
    try {
      const { data } = await axios.get('/LocalDateTime')
      const { datetime } = data || {}
      dispatch({
        type: LOAD_LOCAL_DATE_TIME_SUCCESS,
        payload: {
          localDateTime: datetime?.slice(0, 10)?.split('-') || [],
        },
      })
    } catch (err: any) {
      dispatch({ type: LOAD_LOCAL_DATE_TIME_FAILURE })
    }
  }
}

export function unEnrollCourse(courseRoundId: number) {
  return async (dispatch: any, getState: any) => {
    const token = await AsyncStorage.getItem('token')
    if (!token) return

    const parsed = parseJwt(token)
    const userId = parsed?.unique_name

    dispatch({ type: COURSE_UNENROLL_REQUEST })
    try {
      const { data } = await axios.delete(
        `/Users/${userId}/CourseRegistrations/${courseRoundId}`
      )
      dispatch({
        type: COURSE_UNENROLL_SUCCESS,
        payload: { courseUnenroll: data },
      })
      const { mesg } = data || {}
      dispatch(
        uiActions.setFlashMessage(mesg || 'ยกเลิกการลงทะเบียนสำเร็จ', 'success')
      )
      // Reload registrations
      dispatch(loadCourseRegistrations())
    } catch (err: any) {
      const mesg = err?.response?.data?.mesg || 'ยกเลิกการลงทะเบียนไม่สำเร็จ'
      dispatch({ type: COURSE_UNENROLL_FAILURE })
      dispatch(uiActions.setFlashMessage(mesg, 'error'))
    }
  }
}

export function unEnrollCurriculum(curriculumId: number) {
  return async (dispatch: any, getState: any) => {
    const token = await AsyncStorage.getItem('token')
    if (!token) return

    const parsed = parseJwt(token)
    const userId = parsed?.unique_name

    dispatch({ type: CURRICULUM_UNENROLL_REQUEST })
    try {
      const { data } = await axios.delete(
        `/Users/${userId}/CurriculumRegistrations/${curriculumId}`
      )
      dispatch({
        type: CURRICULUM_UNENROLL_SUCCESS,
        payload: { curriculumUnenroll: data },
      })
      const { mesg } = data || {}
      dispatch(
        uiActions.setFlashMessage(mesg || 'ยกเลิกการลงทะเบียนสำเร็จ', 'success')
      )
      // Reload registrations
      dispatch(loadCurriculumRegistrations())
      dispatch(loadCourseRegistrations())
    } catch (err: any) {
      const mesg = err?.response?.data?.mesg || 'ยกเลิกการลงทะเบียนไม่สำเร็จ'
      dispatch({ type: CURRICULUM_UNENROLL_FAILURE })
      dispatch(uiActions.setFlashMessage(mesg, 'error'))
    }
  }
}

export function updateCurriculumSatisfactionScore(
  registrationId: number,
  satisfactionScore: number
) {
  return async (dispatch: any) => {
    const token = await AsyncStorage.getItem('token')
    if (!token) return

    const parsed = parseJwt(token)
    const userId = parsed?.unique_name

    dispatch({ type: UPDATE_CURRICULUM_SATISFACTION_SCORE_REQUEST })
    try {
      const { data } = await axios.put(
        `/Users/${userId}/CurriculumRegistrations/${registrationId}/SatisfactionScore`,
        { satisfactionScore }
      )
      dispatch({
        type: UPDATE_CURRICULUM_SATISFACTION_SCORE_SUCCESS,
        payload: { satisfactionScoreUpdate: data },
      })
      dispatch(
        uiActions.setFlashMessage(
          'บันทึกข้อมูลเรียบร้อย ขอบคุณที่ให้คะแนน',
          'success'
        )
      )
    } catch (err: any) {
      dispatch({ type: UPDATE_CURRICULUM_SATISFACTION_SCORE_FAILURE })
      dispatch(
        uiActions.setFlashMessage(
          `บันทึกข้อมูลไม่สำเร็จ เกิดข้อผิดพลาด ${err?.response?.status}`,
          'error'
        )
      )
    }
  }
}

export function completeCourse(registrationId: number) {
  return async (dispatch: any) => {
    const token = await AsyncStorage.getItem('token')
    if (!token) return

    const parsed = parseJwt(token)
    const userId = parsed?.unique_name

    dispatch({ type: COURSE_COMPLETE_REQUEST })
    try {
      const { data } = await axios.patch(
        `/Users/${userId}/CourseRegistrations/${registrationId}/completed`,
        {}
      )
      dispatch({
        type: COURSE_COMPLETE_SUCCESS,
        payload: { courseComplete: data },
      })
      const { mesg } = data || {}
      dispatch(
        uiActions.setFlashMessage(
          mesg || 'ส่งคำขอสำเร็จการศึกษาเรียบร้อยแล้ว',
          'success'
        )
      )
      // Reload registrations to update the UI
      dispatch(loadCourseRegistrations())
    } catch (err: any) {
      const mesg =
        err?.response?.data?.mesg || 'ขอสำเร็จการศึกษาไม่สำเร็จ กรุณาลองใหม่'
      dispatch({ type: COURSE_COMPLETE_FAILURE })
      dispatch(uiActions.setFlashMessage(mesg, 'error'))
    }
  }
}

export function clearRegistrations() {
  return {
    type: CLEAR_REGISTRATIONS,
  }
}
