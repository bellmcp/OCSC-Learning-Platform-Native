import * as uiActions from '@/modules/ui/actions'
import axios from '@/utils/axiosConfig'

export const LOAD_CATEGORIES_REQUEST =
  'learning-platform/categories/LOAD_CATEGORIES_REQUEST'
export const LOAD_CATEGORIES_SUCCESS =
  'learning-platform/categories/LOAD_CATEGORIES_SUCCESS'
export const LOAD_CATEGORIES_FAILURE =
  'learning-platform/categories/LOAD_CATEGORIES_FAILURE'

export function loadCategories() {
  return async (dispatch: any) => {
    console.log('[Categories Actions] Loading categories...')
    dispatch({ type: LOAD_CATEGORIES_REQUEST })
    try {
      const { data } = await axios.get('/CourseCategories')
      console.log(
        '[Categories Actions] Categories loaded successfully:',
        data?.length || 0,
        'items'
      )
      dispatch({
        type: LOAD_CATEGORIES_SUCCESS,
        payload: {
          categories: data || [],
        },
      })
    } catch (err: any) {
      console.error(
        '[Categories Actions] Failed to load categories:',
        err.message
      )
      dispatch({ type: LOAD_CATEGORIES_FAILURE })
      dispatch(
        uiActions.setFlashMessage(
          `โหลดข้อมูลหมวดหมู่ไม่สำเร็จ เกิดข้อผิดพลาด ${err?.response?.status}`,
          'error'
        )
      )
    }
  }
}
