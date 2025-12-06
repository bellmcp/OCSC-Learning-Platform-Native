import * as uiActions from '@/modules/ui/actions'
import axios from '@/utils/axiosConfig'
import { PORTAL_API_URL } from '@env'
import AsyncStorage from '@react-native-async-storage/async-storage'

// Action Types
export const LOAD_COURSE_CERTIFICATES_REQUEST =
  'learning-platform/me/LOAD_COURSE_CERTIFICATES_REQUEST'
export const LOAD_COURSE_CERTIFICATES_SUCCESS =
  'learning-platform/me/LOAD_COURSE_CERTIFICATES_SUCCESS'
export const LOAD_COURSE_CERTIFICATES_FAILURE =
  'learning-platform/me/LOAD_COURSE_CERTIFICATES_FAILURE'
export const LOAD_CURRICULUM_CERTIFICATES_REQUEST =
  'learning-platform/me/LOAD_CURRICULUM_CERTIFICATES_REQUEST'
export const LOAD_CURRICULUM_CERTIFICATES_SUCCESS =
  'learning-platform/me/LOAD_CURRICULUM_CERTIFICATES_SUCCESS'
export const LOAD_CURRICULUM_CERTIFICATES_FAILURE =
  'learning-platform/me/LOAD_CURRICULUM_CERTIFICATES_FAILURE'
export const LOAD_COURSE_CERTIFICATE_INFO_REQUEST =
  'learning-platform/me/LOAD_COURSE_CERTIFICATE_INFO_REQUEST'
export const LOAD_COURSE_CERTIFICATE_INFO_SUCCESS =
  'learning-platform/me/LOAD_COURSE_CERTIFICATE_INFO_SUCCESS'
export const LOAD_COURSE_CERTIFICATE_INFO_FAILURE =
  'learning-platform/me/LOAD_COURSE_CERTIFICATE_INFO_FAILURE'
export const LOAD_CURRICULUM_CERTIFICATE_INFO_REQUEST =
  'learning-platform/me/LOAD_CURRICULUM_CERTIFICATE_INFO_REQUEST'
export const LOAD_CURRICULUM_CERTIFICATE_INFO_SUCCESS =
  'learning-platform/me/LOAD_CURRICULUM_CERTIFICATE_INFO_SUCCESS'
export const LOAD_CURRICULUM_CERTIFICATE_INFO_FAILURE =
  'learning-platform/me/LOAD_CURRICULUM_CERTIFICATE_INFO_FAILURE'
export const CLEAR_CERTIFICATE_INFO =
  'learning-platform/me/CLEAR_CERTIFICATE_INFO'
export const CLEAR_ALL_CERTIFICATES =
  'learning-platform/me/CLEAR_ALL_CERTIFICATES'

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

const portalApiBaseUrl =
  PORTAL_API_URL || 'https://learningportal.ocsc.go.th/learningportalapi/'

export function loadCourseCertificates() {
  return async (dispatch: any) => {
    const token = await AsyncStorage.getItem('token')
    if (!token) {
      console.log('[Me] No token found, skipping load')
      return
    }

    const parsed = parseJwt(token)
    const userId = parsed?.unique_name

    if (!userId) {
      console.log('[Me] No userId found in token')
      return
    }

    dispatch({ type: LOAD_COURSE_CERTIFICATES_REQUEST })
    try {
      const { data } = await axios.get(`/Users/${userId}/CourseCertificates`, {
        baseURL: portalApiBaseUrl,
      })
      dispatch({
        type: LOAD_COURSE_CERTIFICATES_SUCCESS,
        payload: {
          courseCertificates: data || [],
        },
      })
    } catch (err: any) {
      dispatch({ type: LOAD_COURSE_CERTIFICATES_FAILURE })
      if (err?.response?.status !== 404) {
        dispatch(
          uiActions.setFlashMessage(
            `โหลดประกาศนียบัตรรายวิชาทั้งหมดไม่สำเร็จ เกิดข้อผิดพลาด ${err?.response?.status}`,
            'error'
          )
        )
      }
    }
  }
}

export function loadCurriculumCertificates() {
  return async (dispatch: any) => {
    const token = await AsyncStorage.getItem('token')
    if (!token) {
      console.log('[Me] No token found, skipping load')
      return
    }

    const parsed = parseJwt(token)
    const userId = parsed?.unique_name

    if (!userId) {
      console.log('[Me] No userId found in token')
      return
    }

    dispatch({ type: LOAD_CURRICULUM_CERTIFICATES_REQUEST })
    try {
      const { data } = await axios.get(
        `/Users/${userId}/CurriculumCertificates`,
        {
          baseURL: portalApiBaseUrl,
        }
      )
      dispatch({
        type: LOAD_CURRICULUM_CERTIFICATES_SUCCESS,
        payload: {
          curriculumCertificates: data || [],
        },
      })
    } catch (err: any) {
      dispatch({ type: LOAD_CURRICULUM_CERTIFICATES_FAILURE })
      if (err?.response?.status !== 404) {
        dispatch(
          uiActions.setFlashMessage(
            `โหลดประกาศนียบัตรหลักสูตรทั้งหมดไม่สำเร็จ เกิดข้อผิดพลาด ${err?.response?.status}`,
            'error'
          )
        )
      }
    }
  }
}

export function loadCourseCertificateInfo(certificateId: string) {
  return async (dispatch: any) => {
    const token = await AsyncStorage.getItem('token')
    if (!token) {
      console.log('[Me] No token found, skipping load')
      return
    }

    const parsed = parseJwt(token)
    const userId = parsed?.unique_name

    if (!userId) {
      console.log('[Me] No userId found in token')
      return
    }

    dispatch({ type: LOAD_COURSE_CERTIFICATE_INFO_REQUEST })
    try {
      const { data } = await axios.get(
        `/Users/${userId}/CourseCertificates/${certificateId}?print=y`,
        {
          baseURL: portalApiBaseUrl,
        }
      )
      dispatch({
        type: LOAD_COURSE_CERTIFICATE_INFO_SUCCESS,
        payload: {
          courseCertificateInfo: data || null,
        },
      })
    } catch (err: any) {
      dispatch({ type: LOAD_COURSE_CERTIFICATE_INFO_FAILURE })
      if (err?.response?.status !== 404) {
        dispatch(
          uiActions.setFlashMessage(
            `โหลดข้อมูลประกาศนียบัตรไม่สำเร็จ เกิดข้อผิดพลาด ${err?.response?.status}`,
            'error'
          )
        )
      }
    }
  }
}

export function loadCurriculumCertificateInfo(certificateId: string) {
  return async (dispatch: any) => {
    const token = await AsyncStorage.getItem('token')
    if (!token) {
      console.log('[Me] No token found, skipping load')
      return
    }

    const parsed = parseJwt(token)
    const userId = parsed?.unique_name

    if (!userId) {
      console.log('[Me] No userId found in token')
      return
    }

    dispatch({ type: LOAD_CURRICULUM_CERTIFICATE_INFO_REQUEST })
    try {
      const { data } = await axios.get(
        `/Users/${userId}/CurriculumCertificates/${certificateId}?print=y`,
        {
          baseURL: portalApiBaseUrl,
        }
      )
      dispatch({
        type: LOAD_CURRICULUM_CERTIFICATE_INFO_SUCCESS,
        payload: {
          curriculumCertificateInfo: data || null,
        },
      })
    } catch (err: any) {
      dispatch({ type: LOAD_CURRICULUM_CERTIFICATE_INFO_FAILURE })
      if (err?.response?.status !== 404) {
        dispatch(
          uiActions.setFlashMessage(
            `โหลดข้อมูลประกาศนียบัตรไม่สำเร็จ เกิดข้อผิดพลาด ${err?.response?.status}`,
            'error'
          )
        )
      }
    }
  }
}

export function clearCertificateInfo() {
  return {
    type: CLEAR_CERTIFICATE_INFO,
  }
}

export function clearAllCertificates() {
  return {
    type: CLEAR_ALL_CERTIFICATES,
  }
}
