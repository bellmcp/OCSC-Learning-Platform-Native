import axios from '@/utils/axiosConfig'
import { PORTAL_API_URL, PLATFORM_URL } from '@env'

export const SET_FLASH_MESSAGE = 'learning-platform/ui/SET_FLASH_MESSAGE'
export const CLEAR_FLASH_MESSAGE = 'learning-platform/ui/CLEAR_FLASH_MESSAGE'
export const SET_LEARN_EXIT_DIALOG =
  'learning-platform/ui/SET_LEARN_EXIT_DIALOG'
export const OPEN_GLOBAL_MODAL = 'learning-platform/ui/OPEN_GLOBAL_MODAL'
export const CLEAR_GLOBAL_MODAL = 'learning-platform/ui/CLEAR_GLOBAL_MODAL'
export const LOAD_FOOTER_INFO_REQUEST =
  'learning-platform/ui/LOAD_FOOTER_INFO_REQUEST'
export const LOAD_FOOTER_INFO_SUCCESS =
  'learning-platform/ui/LOAD_FOOTER_INFO_SUCCESS'
export const LOAD_FOOTER_INFO_FAILURE =
  'learning-platform/ui/LOAD_FOOTER_INFO_FAILURE'
export const LOAD_SUPPORT_INFO_REQUEST =
  'learning-platform/ui/LOAD_SUPPORT_INFO_REQUEST'
export const LOAD_SUPPORT_INFO_SUCCESS =
  'learning-platform/ui/LOAD_SUPPORT_INFO_SUCCESS'
export const LOAD_SUPPORT_INFO_FAILURE =
  'learning-platform/ui/LOAD_SUPPORT_INFO_FAILURE'
export const LOAD_CHATBOT_INFO_REQUEST =
  'learning-platform/ui/LOAD_CHATBOT_INFO_REQUEST'
export const LOAD_CHATBOT_INFO_SUCCESS =
  'learning-platform/ui/LOAD_CHATBOT_INFO_SUCCESS'
export const LOAD_CHATBOT_INFO_FAILURE =
  'learning-platform/ui/LOAD_CHATBOT_INFO_FAILURE'

export function setFlashMessage(message: string, severity: string) {
  return {
    type: SET_FLASH_MESSAGE,
    payload: {
      message,
      severity,
    },
  }
}

export function clearFlashMessage() {
  return {
    type: CLEAR_FLASH_MESSAGE,
  }
}

export function setLearnExitDialog(isOpen: boolean) {
  return {
    type: SET_LEARN_EXIT_DIALOG,
    payload: {
      isOpen,
    },
  }
}

export function openGlobalModal(title: string, message: string, action?: any) {
  return {
    type: OPEN_GLOBAL_MODAL,
    payload: {
      globalModalTitle: title,
      globalModalMessage: message,
      globalModalCTAAction: action,
    },
  }
}

export function clearGlobalModal() {
  return {
    type: CLEAR_GLOBAL_MODAL,
  }
}

export function loadFooterInfo() {
  return async (dispatch: any) => {
    dispatch({ type: LOAD_FOOTER_INFO_REQUEST })
    try {
      const { data } = await axios.get('constants/footnote', {
        baseURL: PORTAL_API_URL || 'https://learningportal.ocsc.go.th/learningportalapi/',
      })
      dispatch({
        type: LOAD_FOOTER_INFO_SUCCESS,
        payload: {
          footerInfo: data || {},
        },
      })
    } catch (err: any) {
      dispatch({ type: LOAD_FOOTER_INFO_FAILURE })
      dispatch(
        setFlashMessage(
          `โหลดช่องทางการติดต่อสำนักงาน ก.พ. ไม่สำเร็จ เกิดข้อผิดพลาด ${err?.response?.status}`,
          'error'
        )
      )
    }
  }
}

export function loadSupportInfo() {
  return async (dispatch: any) => {
    dispatch({ type: LOAD_SUPPORT_INFO_REQUEST })
    try {
      const { data } = await axios.get('constants/help', {
        baseURL: PORTAL_API_URL || 'https://learningportal.ocsc.go.th/learningportalapi/',
      })
      dispatch({
        type: LOAD_SUPPORT_INFO_SUCCESS,
        payload: {
          supportInfo: data || {},
        },
      })
    } catch (err: any) {
      dispatch({ type: LOAD_SUPPORT_INFO_FAILURE })
      dispatch(
        setFlashMessage(
          `โหลดข้อมูลช่วยเหลือไม่สำเร็จ เกิดข้อผิดพลาด ${err?.response?.status}`,
          'error'
        )
      )
    }
  }
}

export function loadChatbotInfo() {
  return async (dispatch: any) => {
    dispatch({ type: LOAD_CHATBOT_INFO_REQUEST })
    try {
      const { data } = await axios.get('chatbotapi/parameters', {
        baseURL: PLATFORM_URL || 'https://learningportal.ocsc.go.th',
      })
      dispatch({
        type: LOAD_CHATBOT_INFO_SUCCESS,
        payload: {
          chatbotInfo: data || {},
        },
      })
    } catch (err: any) {
      dispatch({ type: LOAD_CHATBOT_INFO_FAILURE })
      // Silently fail for chatbot - don't show error message
    }
  }
}
