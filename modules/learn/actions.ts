import * as uiActions from '@/modules/ui/actions'
import axios from '@/utils/axiosConfig'
import AsyncStorage from '@react-native-async-storage/async-storage'

// Action Types
export const CREATE_SESSION_REQUEST =
  'learning-platform/learn/CREATE_SESSION_REQUEST'
export const CREATE_SESSION_SUCCESS =
  'learning-platform/learn/CREATE_SESSION_SUCCESS'
export const CREATE_SESSION_FAILURE =
  'learning-platform/learn/CREATE_SESSION_FAILURE'
export const LOAD_CONTENT_VIEWS_REQUEST =
  'learning-platform/learn/LOAD_CONTENT_VIEWS_REQUEST'
export const LOAD_CONTENT_VIEWS_SUCCESS =
  'learning-platform/learn/LOAD_CONTENT_VIEWS_SUCCESS'
export const LOAD_CONTENT_VIEWS_FAILURE =
  'learning-platform/learn/LOAD_CONTENT_VIEWS_FAILURE'
export const UPDATE_CONTENT_VIEW_REQUEST =
  'learning-platform/learn/UPDATE_CONTENT_VIEW_REQUEST'
export const UPDATE_CONTENT_VIEW_SUCCESS =
  'learning-platform/learn/UPDATE_CONTENT_VIEW_SUCCESS'
export const UPDATE_CONTENT_VIEW_FAILURE =
  'learning-platform/learn/UPDATE_CONTENT_VIEW_FAILURE'
export const LOAD_EVALUATION_REQUEST =
  'learning-platform/learn/LOAD_EVALUATION_REQUEST'
export const LOAD_EVALUATION_SUCCESS =
  'learning-platform/learn/LOAD_EVALUATION_SUCCESS'
export const LOAD_EVALUATION_FAILURE =
  'learning-platform/learn/LOAD_EVALUATION_FAILURE'
export const LOAD_EVALUATION_ITEMS_REQUEST =
  'learning-platform/learn/LOAD_EVALUATION_ITEMS_REQUEST'
export const LOAD_EVALUATION_ITEMS_SUCCESS =
  'learning-platform/learn/LOAD_EVALUATION_ITEMS_SUCCESS'
export const LOAD_EVALUATION_ITEMS_FAILURE =
  'learning-platform/learn/LOAD_EVALUATION_ITEMS_FAILURE'
export const UPDATE_EVALUATION_REQUEST =
  'learning-platform/learn/UPDATE_EVALUATION_REQUEST'
export const UPDATE_EVALUATION_SUCCESS =
  'learning-platform/learn/UPDATE_EVALUATION_SUCCESS'
export const UPDATE_EVALUATION_FAILURE =
  'learning-platform/learn/UPDATE_EVALUATION_FAILURE'
export const LOAD_TEST_REQUEST = 'learning-platform/learn/LOAD_TEST_REQUEST'
export const LOAD_TEST_SUCCESS = 'learning-platform/learn/LOAD_TEST_SUCCESS'
export const LOAD_TEST_FAILURE = 'learning-platform/learn/LOAD_TEST_FAILURE'
export const LOAD_TEST_ITEMS_REQUEST =
  'learning-platform/learn/LOAD_TEST_ITEMS_REQUEST'
export const LOAD_TEST_ITEMS_SUCCESS =
  'learning-platform/learn/LOAD_TEST_ITEMS_SUCCESS'
export const LOAD_TEST_ITEMS_FAILURE =
  'learning-platform/learn/LOAD_TEST_ITEMS_FAILURE'
export const UPDATE_TEST_REQUEST = 'learning-platform/learn/UPDATE_TEST_REQUEST'
export const UPDATE_TEST_SUCCESS = 'learning-platform/learn/UPDATE_TEST_SUCCESS'
export const UPDATE_TEST_FAILURE = 'learning-platform/learn/UPDATE_TEST_FAILURE'
export const UPDATE_TEST_TRIES_REQUEST =
  'learning-platform/learn/UPDATE_TEST_TRIES_REQUEST'
export const UPDATE_TEST_TRIES_SUCCESS =
  'learning-platform/learn/UPDATE_TEST_TRIES_SUCCESS'
export const UPDATE_TEST_TRIES_FAILURE =
  'learning-platform/learn/UPDATE_TEST_TRIES_FAILURE'
export const LOAD_CONFIG_REQUEST = 'learning-platform/learn/LOAD_CONFIG_REQUEST'
export const LOAD_CONFIG_SUCCESS = 'learning-platform/learn/LOAD_CONFIG_SUCCESS'
export const LOAD_CONFIG_FAILURE = 'learning-platform/learn/LOAD_CONFIG_FAILURE'
export const CLEAR_LEARN_STATE = 'learning-platform/learn/CLEAR_LEARN_STATE'

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

export function createSession() {
  return async (dispatch: any) => {
    const token = await AsyncStorage.getItem('token')
    if (!token) {
      console.log('[Learn] No token found, skipping session creation')
      return
    }

    const parsed = parseJwt(token)
    const userId = parsed?.unique_name

    if (!userId) {
      console.log('[Learn] No userId found in token')
      return
    }

    dispatch({ type: CREATE_SESSION_REQUEST })
    try {
      const { data } = await axios.post(`/Users/${userId}/Sessions`, {})
      console.log('[Learn] Session created:', data?.id)
      dispatch({
        type: CREATE_SESSION_SUCCESS,
        payload: { session: data || {} },
      })
    } catch (err: any) {
      console.error('[Learn] Failed to create session:', err.message)
      dispatch({ type: CREATE_SESSION_FAILURE })
      dispatch(
        uiActions.setFlashMessage(
          `สร้างเซสชันไม่สำเร็จ เกิดข้อผิดพลาด ${err?.response?.status}`,
          'error'
        )
      )
    }
  }
}

export function loadContentViews(registrationId: number) {
  return async (dispatch: any) => {
    const token = await AsyncStorage.getItem('token')
    if (!token) {
      console.log('[Learn] No token found, skipping content views load')
      return
    }

    const parsed = parseJwt(token)
    const userId = parsed?.unique_name

    if (!userId) {
      console.log('[Learn] No userId found in token')
      return
    }

    dispatch({ type: LOAD_CONTENT_VIEWS_REQUEST })
    try {
      const { data } = await axios.get(
        `/Users/${userId}/CourseRegistrations/${registrationId}/ContentViews`
      )
      console.log('[Learn] Content views loaded:', data?.length || 0, 'items')
      dispatch({
        type: LOAD_CONTENT_VIEWS_SUCCESS,
        payload: {
          contentViews: data || [],
        },
      })
    } catch (err: any) {
      console.error('[Learn] Failed to load content views:', err.message)
      dispatch({ type: LOAD_CONTENT_VIEWS_FAILURE })
      dispatch(
        uiActions.setFlashMessage(
          `โหลดข้อมูลการเข้าเรียนไม่สำเร็จ เกิดข้อผิดพลาด ${err?.response?.status}`,
          'error'
        )
      )
    }
  }
}

export function updateContentView(
  registrationId: number,
  contentViewId: number,
  contentSeconds: number,
  showFlashMessage: boolean = false
) {
  return async (dispatch: any, getState: any) => {
    const token = await AsyncStorage.getItem('token')
    if (!token) return

    const parsed = parseJwt(token)
    const userId = parsed?.unique_name
    if (!userId) return

    const { learn } = getState()
    const session = learn.session

    dispatch({ type: UPDATE_CONTENT_VIEW_REQUEST })
    try {
      const { data } = await axios.put(
        `/Users/${userId}/CourseRegistrations/${registrationId}/ContentViews/${contentViewId}`,
        {
          contentSeconds: contentSeconds,
        },
        {
          params: {
            sessionId: session?.id,
            key: session?.key,
          },
        }
      )
      console.log('[Learn] Content view updated, seconds:', contentSeconds)
      dispatch({
        type: UPDATE_CONTENT_VIEW_SUCCESS,
        payload: { contentSeconds: data },
      })
      if (showFlashMessage) {
        dispatch(uiActions.setFlashMessage('เวลาเรียนสะสม +1 นาที', 'info'))
      }
    } catch (err: any) {
      dispatch({ type: UPDATE_CONTENT_VIEW_FAILURE })
      if (err?.response?.status === 401) {
        dispatch(
          uiActions.setFlashMessage(
            `ตรวจพบการเข้าเรียนจากหลายอุปกรณ์ โปรดตรวจสอบและลองใหม่อีกครั้ง`,
            'error'
          )
        )
      } else {
        dispatch(
          uiActions.setFlashMessage(
            `บันทึกเวลาเรียนสะสมไม่สำเร็จ เกิดข้อผิดพลาด ${err?.response?.status}`,
            'error'
          )
        )
      }
    }
  }
}

export function loadEvaluation(evaluationId: number) {
  return async (dispatch: any) => {
    dispatch({ type: LOAD_EVALUATION_REQUEST })
    try {
      const { data } = await axios.get(`/Evaluations/${evaluationId}`)
      dispatch({
        type: LOAD_EVALUATION_SUCCESS,
        payload: {
          evaluation: data || {},
        },
      })
    } catch (err: any) {
      dispatch({ type: LOAD_EVALUATION_FAILURE })
      dispatch(
        uiActions.setFlashMessage(
          `โหลดข้อมูลแบบประเมิน ${evaluationId} ไม่สำเร็จ เกิดข้อผิดพลาด ${err?.response?.status}`,
          'error'
        )
      )
    }
  }
}

export function loadEvaluationItems(evaluationId: number) {
  return async (dispatch: any) => {
    dispatch({ type: LOAD_EVALUATION_ITEMS_REQUEST })
    try {
      const { data } = await axios.get(
        `/Evaluations/${evaluationId}/EvaluationItems`
      )
      dispatch({
        type: LOAD_EVALUATION_ITEMS_SUCCESS,
        payload: {
          evaluationItems: data || [],
        },
      })
    } catch (err: any) {
      dispatch({ type: LOAD_EVALUATION_ITEMS_FAILURE })
      dispatch(
        uiActions.setFlashMessage(
          `โหลดแบบประเมิน ${evaluationId} ไม่สำเร็จ เกิดข้อผิดพลาด ${err?.response?.status}`,
          'error'
        )
      )
    }
  }
}

export function updateEvaluation(
  registrationId: number,
  contentViewId: number,
  evaluationAnswer: string,
  evaluationOpinion: string
) {
  return async (dispatch: any, getState: any) => {
    const token = await AsyncStorage.getItem('token')
    if (!token) return

    const parsed = parseJwt(token)
    const userId = parsed?.unique_name
    if (!userId) return

    const { learn } = getState()
    const session = learn.session

    if (evaluationAnswer.includes('0')) {
      dispatch(
        uiActions.setFlashMessage(
          `คุณทำแบบประเมินไม่ครบทุกข้อ โปรดตรวจสอบอีกครั้ง`,
          'error'
        )
      )
      return
    }

    dispatch({ type: UPDATE_EVALUATION_REQUEST })
    try {
      const { data } = await axios.put(
        `/Users/${userId}/CourseRegistrations/${registrationId}/ContentViews/${contentViewId}`,
        {
          evaluationAnswer: evaluationAnswer,
          evaluationOpinion: evaluationOpinion,
        },
        {
          params: {
            sessionId: session?.id,
            key: session?.key,
          },
        }
      )
      dispatch({
        type: UPDATE_EVALUATION_SUCCESS,
        payload: { evaluationAnswer: data },
      })
      dispatch(
        uiActions.setFlashMessage('บันทึกแบบประเมินเรียบร้อยแล้ว', 'success')
      )
      // Reload content views to update the UI
      dispatch(loadContentViews(registrationId))
    } catch (err: any) {
      dispatch({ type: UPDATE_EVALUATION_FAILURE })
      if (err?.response?.status === 401) {
        dispatch(
          uiActions.setFlashMessage(
            `ตรวจพบการเข้าเรียนจากหลายอุปกรณ์ โปรดตรวจสอบและลองใหม่อีกครั้ง`,
            'error'
          )
        )
      } else if (err?.response?.status === 403) {
        dispatch(
          uiActions.setFlashMessage(
            `คุณทำแบบประเมินไม่ครบทุกข้อ โปรดตรวจสอบอีกครั้ง`,
            'error'
          )
        )
      } else {
        dispatch(
          uiActions.setFlashMessage(
            `บันทึกแบบประเมินไม่สำเร็จ เกิดข้อผิดพลาด ${err?.response?.status}`,
            'error'
          )
        )
      }
    }
  }
}

export function loadTest(testId: number) {
  return async (dispatch: any) => {
    dispatch({ type: LOAD_TEST_REQUEST })
    try {
      const { data } = await axios.get(`/Tests/${testId}`)
      dispatch({
        type: LOAD_TEST_SUCCESS,
        payload: {
          test: data || {},
        },
      })
    } catch (err: any) {
      dispatch({ type: LOAD_TEST_FAILURE })
      dispatch(
        uiActions.setFlashMessage(
          `โหลดข้อมูลแบบทดสอบ ${testId} ไม่สำเร็จ เกิดข้อผิดพลาด ${err?.response?.status}`,
          'error'
        )
      )
    }
  }
}

export function loadTestItems(testId: number) {
  return async (dispatch: any) => {
    dispatch({ type: LOAD_TEST_ITEMS_REQUEST })
    try {
      const { data } = await axios.get(`/Tests/${testId}/TestItems`)
      dispatch({
        type: LOAD_TEST_ITEMS_SUCCESS,
        payload: {
          testItems: data || [],
        },
      })
    } catch (err: any) {
      dispatch({ type: LOAD_TEST_ITEMS_FAILURE })
      dispatch(
        uiActions.setFlashMessage(
          `โหลดแบบทดสอบ ${testId} ไม่สำเร็จ เกิดข้อผิดพลาด ${err?.response?.status}`,
          'error'
        )
      )
    }
  }
}

export function updateTest(
  registrationId: number,
  contentViewId: number,
  testAnswer: string,
  maxScore: number
) {
  return async (dispatch: any, getState: any) => {
    const token = await AsyncStorage.getItem('token')
    if (!token) return

    const parsed = parseJwt(token)
    const userId = parsed?.unique_name
    if (!userId) return

    const { learn } = getState()
    const session = learn.session

    dispatch({ type: UPDATE_TEST_REQUEST })
    try {
      const { data } = await axios.put(
        `/Users/${userId}/CourseRegistrations/${registrationId}/ContentViews/${contentViewId}`,
        {
          testAnswer: testAnswer,
        },
        {
          params: {
            sessionId: session?.id,
            key: session?.key,
          },
        }
      )
      const score = data.score ? data.score : '-'
      dispatch({
        type: UPDATE_TEST_SUCCESS,
        payload: { testAnswer: data },
      })
      dispatch(
        uiActions.openGlobalModal(
          'ส่งแบบทดสอบเรียบร้อยแล้ว',
          `คุณได้คะแนน ${score} เต็ม ${maxScore} คะแนน`
        )
      )
      // Reload content views to update the UI
      dispatch(loadContentViews(registrationId))
    } catch (err: any) {
      dispatch({ type: UPDATE_TEST_FAILURE })
      if (err?.response?.status === 401) {
        dispatch(
          uiActions.setFlashMessage(
            `ตรวจพบการเข้าเรียนจากหลายอุปกรณ์ โปรดตรวจสอบและลองใหม่อีกครั้ง`,
            'error'
          )
        )
      } else if (err?.response?.status === 403) {
        dispatch(
          uiActions.setFlashMessage(
            'คุณทำแบบทดสอบไม่ครบทุกข้อ โปรดตรวจสอบอีกครั้ง',
            'error'
          )
        )
      } else {
        dispatch(
          uiActions.setFlashMessage(
            `บันทึกแบบทดสอบไม่สำเร็จ เกิดข้อผิดพลาด ${err?.response?.status}`,
            'error'
          )
        )
      }
    }
  }
}

export function updateTestTries(registrationId: number, contentViewId: number) {
  return async (dispatch: any, getState: any) => {
    const token = await AsyncStorage.getItem('token')
    if (!token) return

    const parsed = parseJwt(token)
    const userId = parsed?.unique_name
    if (!userId) return

    const { learn } = getState()
    const session = learn.session

    dispatch({ type: UPDATE_TEST_TRIES_REQUEST })
    try {
      await axios.post(
        `/Users/${userId}/CourseRegistrations/${registrationId}/ContentViews/${contentViewId}/TestTries`,
        {
          testTries: 1,
        },
        {
          params: {
            sessionId: session?.id,
            key: session?.key,
          },
        }
      )
      dispatch({
        type: UPDATE_TEST_TRIES_SUCCESS,
      })
      dispatch(uiActions.setFlashMessage('เริ่มจับเวลาทำแบบทดสอบแล้ว', 'info'))
    } catch (err: any) {
      dispatch({ type: UPDATE_TEST_TRIES_FAILURE })
      if (err?.response?.status === 401) {
        dispatch(
          uiActions.setFlashMessage(
            `ตรวจพบการเข้าเรียนจากหลายอุปกรณ์ โปรดตรวจสอบและลองใหม่อีกครั้ง`,
            'error'
          )
        )
      } else if (err?.response?.status === 403) {
        dispatch(
          uiActions.setFlashMessage(
            'คุณทำแบบทดสอบครบจำนวนครั้งที่กำหนดแล้ว โปรดตรวจสอบอีกครั้ง',
            'error'
          )
        )
      } else {
        dispatch(
          uiActions.setFlashMessage(
            `บันทึกจำนวนครั้งการทำแบบทดสอบไม่สำเร็จ เกิดข้อผิดพลาด ${err?.response?.status}`,
            'error'
          )
        )
      }
    }
  }
}

export function loadConfig() {
  return async (dispatch: any) => {
    dispatch({ type: LOAD_CONFIG_REQUEST })
    try {
      const { data } = await axios.get('/Configurations')
      dispatch({
        type: LOAD_CONFIG_SUCCESS,
        payload: { config: data || {} },
      })
    } catch (err: any) {
      dispatch({ type: LOAD_CONFIG_FAILURE })
      dispatch(
        uiActions.setFlashMessage(
          `โหลดข้อมูลการตั้งค่า (Configurations) ไม่สำเร็จ เกิดข้อผิดพลาด ${err?.response?.status}`,
          'error'
        )
      )
    }
  }
}

export function clearLearnState() {
  return {
    type: CLEAR_LEARN_STATE,
  }
}
