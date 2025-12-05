import * as uiActions from '@/modules/ui/actions'
import axios from '@/utils/axiosConfig'

export const LOAD_CURRICULUMS_REQUEST =
  'learning-platform/curriculums/LOAD_CURRICULUMS_REQUEST'
export const LOAD_CURRICULUMS_SUCCESS =
  'learning-platform/curriculums/LOAD_CURRICULUMS_SUCCESS'
export const LOAD_CURRICULUMS_FAILURE =
  'learning-platform/curriculums/LOAD_CURRICULUMS_FAILURE'
export const LOAD_CURRICULUM_REQUEST =
  'learning-platform/curriculums/LOAD_CURRICULUM_REQUEST'
export const LOAD_CURRICULUM_SUCCESS =
  'learning-platform/curriculums/LOAD_CURRICULUM_SUCCESS'
export const LOAD_CURRICULUM_FAILURE =
  'learning-platform/curriculums/LOAD_CURRICULUM_FAILURE'
export const LOAD_CURRICULUM_CHILD_REQUEST =
  'learning-platform/curriculums/LOAD_CURRICULUM_CHILD_REQUEST'
export const LOAD_CURRICULUM_CHILD_SUCCESS =
  'learning-platform/curriculums/LOAD_CURRICULUM_CHILD_SUCCESS'
export const LOAD_CURRICULUM_CHILD_FAILURE =
  'learning-platform/curriculums/LOAD_CURRICULUM_CHILD_FAILURE'

export function loadCurriculums(query: string = '') {
  return async (dispatch: any) => {
    console.log('[Curriculums Actions] Loading curriculums...')
    dispatch({ type: LOAD_CURRICULUMS_REQUEST })
    try {
      const { data } = await axios.get(`/Curriculums${query}`)
      console.log(
        '[Curriculums Actions] Curriculums loaded successfully:',
        data?.length || 0,
        'items'
      )
      dispatch({
        type: LOAD_CURRICULUMS_SUCCESS,
        payload: {
          curriculums: data || [],
        },
      })
    } catch (err: any) {
      console.error(
        '[Curriculums Actions] Failed to load curriculums:',
        err.message
      )
      dispatch({ type: LOAD_CURRICULUMS_FAILURE })
      dispatch(
        uiActions.setFlashMessage(
          `โหลดหลักสูตรทั้งหมดไม่สำเร็จ เกิดข้อผิดพลาด ${err?.response?.status}`,
          'error'
        )
      )
    }
  }
}

export function loadCurriculum(id: string) {
  return async (dispatch: any) => {
    dispatch({ type: LOAD_CURRICULUM_REQUEST })
    try {
      const { data } = await axios.get(`/Curriculums/${id}`)
      dispatch({
        type: LOAD_CURRICULUM_SUCCESS,
        payload: {
          curriculum: data || [],
        },
      })
    } catch (err: any) {
      dispatch({ type: LOAD_CURRICULUM_FAILURE })
      dispatch(
        uiActions.setFlashMessage(
          `โหลดข้อมูลหลักสูตร ${id} ไม่สำเร็จ เกิดข้อผิดพลาด ${err?.response?.status}`,
          'error'
        )
      )
    }
  }
}

export function loadCurriculumChild(id: string) {
  return async (dispatch: any) => {
    dispatch({ type: LOAD_CURRICULUM_CHILD_REQUEST })
    try {
      const { data } = await axios.get(`/Curriculums/${id}/Courses`)
      dispatch({
        type: LOAD_CURRICULUM_CHILD_SUCCESS,
        payload: {
          childCourses: data || [],
        },
      })
    } catch (err: any) {
      dispatch({ type: LOAD_CURRICULUM_CHILD_FAILURE })
      dispatch(
        uiActions.setFlashMessage(
          `โหลดข้อมูลรายวิชาของหลักสูตร ${id} ไม่สำเร็จ เกิดข้อผิดพลาด ${err?.response?.status}`,
          'error'
        )
      )
    }
  }
}
