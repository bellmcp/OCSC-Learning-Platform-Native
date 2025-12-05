import * as uiActions from '@/modules/ui/actions'
import axios from '@/utils/axiosConfig'

export const LOAD_COURSES_REQUEST =
  'learning-platform/courses/LOAD_COURSES_REQUEST'
export const LOAD_COURSES_SUCCESS =
  'learning-platform/courses/LOAD_COURSES_SUCCESS'
export const LOAD_COURSES_FAILURE =
  'learning-platform/courses/LOAD_COURSES_FAILURE'
export const LOAD_RECOMMENDED_COURSES_REQUEST =
  'learning-platform/courses/LOAD_RECOMMENDED_COURSES_REQUEST'
export const LOAD_RECOMMENDED_COURSES_SUCCESS =
  'learning-platform/courses/LOAD_RECOMMENDED_COURSES_SUCCESS'
export const LOAD_RECOMMENDED_COURSES_FAILURE =
  'learning-platform/courses/LOAD_RECOMMENDED_COURSES_FAILURE'
export const LOAD_COURSE_REQUEST =
  'learning-platform/courses/LOAD_COURSE_REQUEST'
export const LOAD_COURSE_SUCCESS =
  'learning-platform/courses/LOAD_COURSE_SUCCESS'
export const LOAD_COURSE_FAILURE =
  'learning-platform/courses/LOAD_COURSE_FAILURE'
export const LOAD_COURSE_ROUND_REQUEST =
  'learning-platform/courses/LOAD_COURSE_ROUND_REQUEST'
export const LOAD_COURSE_ROUND_SUCCESS =
  'learning-platform/courses/LOAD_COURSE_ROUND_SUCCESS'
export const LOAD_COURSE_ROUND_FAILURE =
  'learning-platform/courses/LOAD_COURSE_ROUND_FAILURE'
export const LOAD_COURSE_CONTENT_REQUEST =
  'learning-platform/courses/LOAD_COURSE_CONTENT_REQUEST'
export const LOAD_COURSE_CONTENT_SUCCESS =
  'learning-platform/courses/LOAD_COURSE_CONTENT_SUCCESS'
export const LOAD_COURSE_CONTENT_FAILURE =
  'learning-platform/courses/LOAD_COURSE_CONTENT_FAILURE'
export const CLEAR_COURSES = 'learning-platform/courses/CLEAR_COURSES'
export const LOAD_COURSE_HOUR_REQUEST =
  'learning-platform/courses/LOAD_COURSE_HOUR_REQUEST'
export const LOAD_COURSE_HOUR_SUCCESS =
  'learning-platform/courses/LOAD_COURSE_HOUR_SUCCESS'
export const LOAD_COURSE_HOUR_FAILURE =
  'learning-platform/courses/LOAD_COURSE_HOUR_FAILURE'

export function loadCourses(courseCategoryId?: string) {
  return async (dispatch: any) => {
    console.log('[Courses Actions] Loading courses...')
    dispatch({ type: LOAD_COURSES_REQUEST })
    try {
      const { data } = await axios.get(
        courseCategoryId === undefined
          ? `/Courses`
          : `/CourseCategories/${courseCategoryId}/Courses`
      )
      console.log(
        '[Courses Actions] Courses loaded successfully:',
        data?.length || 0,
        'items'
      )
      dispatch({
        type: LOAD_COURSES_SUCCESS,
        payload: {
          courses: data || [],
        },
      })
    } catch (err: any) {
      console.error('[Courses Actions] Failed to load courses:', err.message)
      dispatch({ type: LOAD_COURSES_FAILURE })
      dispatch(
        uiActions.setFlashMessage(
          `โหลดรายวิชาทั้งหมดไม่สำเร็จ เกิดข้อผิดพลาด ${err?.response?.status}`,
          'error'
        )
      )
    }
  }
}

export function loadRecommendedCourses() {
  return async (dispatch: any) => {
    console.log('[Courses Actions] Loading recommended courses...')
    dispatch({ type: LOAD_RECOMMENDED_COURSES_REQUEST })
    try {
      const { data } = await axios.get('/Courses/Recommended', {
        params: {
          max: 5,
        },
      })
      console.log(
        '[Courses Actions] Recommended courses loaded successfully:',
        data?.length || 0,
        'items'
      )
      dispatch({
        type: LOAD_RECOMMENDED_COURSES_SUCCESS,
        payload: {
          recommendedCourses: data || [],
        },
      })
    } catch (err: any) {
      console.error(
        '[Courses Actions] Failed to load recommended courses:',
        err.message
      )
      dispatch({ type: LOAD_RECOMMENDED_COURSES_FAILURE })
      dispatch(
        uiActions.setFlashMessage(
          `โหลดรายวิชาแนะนำไม่สำเร็จ เกิดข้อผิดพลาด ${err?.response?.status}`,
          'error'
        )
      )
    }
  }
}

export function loadCourse(id: string) {
  return async (dispatch: any) => {
    dispatch({ type: LOAD_COURSE_REQUEST })
    try {
      const { data } = await axios.get(`/Courses/${id}`)
      dispatch({
        type: LOAD_COURSE_SUCCESS,
        payload: {
          course: data || [],
        },
      })
    } catch (err: any) {
      dispatch({ type: LOAD_COURSE_FAILURE })
      dispatch(
        uiActions.setFlashMessage(
          `โหลดข้อมูลรายวิชา ${id} ไม่สำเร็จ เกิดข้อผิดพลาด ${err?.response?.status}`,
          'error'
        )
      )
    }
  }
}

export function loadCourseRounds(id: string) {
  return async (dispatch: any) => {
    dispatch({ type: LOAD_COURSE_ROUND_REQUEST })
    try {
      const { data } = await axios.get(`/Courses/${id}/CourseRounds`)
      dispatch({
        type: LOAD_COURSE_ROUND_SUCCESS,
        payload: {
          courseRounds: data || [],
        },
      })
    } catch (err: any) {
      dispatch({ type: LOAD_COURSE_ROUND_FAILURE })
      dispatch(
        uiActions.setFlashMessage(
          `โหลดข้อมูลรอบของรายวิชา ${id} ไม่สำเร็จ เกิดข้อผิดพลาด ${err?.response?.status}`,
          'error'
        )
      )
    }
  }
}

export function loadCourseContents(id: string) {
  return async (dispatch: any) => {
    dispatch({ type: LOAD_COURSE_CONTENT_REQUEST })
    try {
      const { data } = await axios.get(`/Courses/${id}/CourseContents`)
      dispatch({
        type: LOAD_COURSE_CONTENT_SUCCESS,
        payload: {
          courseContents: data || [],
        },
      })
    } catch (err: any) {
      dispatch({ type: LOAD_COURSE_CONTENT_FAILURE })
      dispatch(
        uiActions.setFlashMessage(
          `โหลดข้อมูลเนื้อหาของรายวิชา ${id} ไม่สำเร็จ เกิดข้อผิดพลาด ${err?.response?.status}`,
          'error'
        )
      )
    }
  }
}

export function loadCourseHour(id: string) {
  return async (dispatch: any) => {
    dispatch({ type: LOAD_COURSE_HOUR_REQUEST })
    try {
      const { data } = await axios.get(`/Courses/${id}/Hours`)
      dispatch({
        type: LOAD_COURSE_HOUR_SUCCESS,
        payload: {
          courseHour: data.hours ?? 0,
        },
      })
    } catch (err: any) {
      dispatch({ type: LOAD_COURSE_HOUR_FAILURE })
      dispatch(
        uiActions.setFlashMessage(
          `โหลดข้อมูลจำนวนชั่วโมงการเรียนรู้ของรายวิชา ${id} ไม่สำเร็จ เกิดข้อผิดพลาด ${err?.response?.status}`,
          'error'
        )
      )
    }
  }
}

export function clearCourses() {
  return {
    type: CLEAR_COURSES,
  }
}
