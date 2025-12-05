import {
  CLEAR_FLASH_MESSAGE,
  CLEAR_GLOBAL_MODAL,
  LOAD_CHATBOT_INFO_FAILURE,
  LOAD_CHATBOT_INFO_REQUEST,
  LOAD_CHATBOT_INFO_SUCCESS,
  LOAD_FOOTER_INFO_FAILURE,
  LOAD_FOOTER_INFO_REQUEST,
  LOAD_FOOTER_INFO_SUCCESS,
  LOAD_SUPPORT_INFO_SUCCESS,
  OPEN_GLOBAL_MODAL,
  SET_FLASH_MESSAGE,
  SET_LEARN_EXIT_DIALOG,
} from './actions'

interface UIState {
  isSnackbarOpen: boolean
  flashMessage: string | null
  alertType: string | null
  isDialogOpen: boolean
  isGlobalModalOpen: boolean
  globalModalTitle: string
  globalModalMessage: string
  globalModalCTAAction?: any
  isLoading: boolean
  footerInfo: any
  supportInfo: any
  chatbotInfo: {
    isShown: boolean
    image: string
    message: string
    url: string
  }
  isChatbotLoading: boolean
}

const initialState: UIState = {
  isSnackbarOpen: false,
  flashMessage: null,
  alertType: null,
  isDialogOpen: false,
  isGlobalModalOpen: false,
  globalModalTitle: '',
  globalModalMessage: '',
  isLoading: false,
  footerInfo: {},
  supportInfo: {},
  chatbotInfo: {
    isShown: false,
    image: '',
    message: '',
    url: '',
  },
  isChatbotLoading: false,
}

export default function uiReducer(state = initialState, action: any): UIState {
  switch (action.type) {
    case SET_FLASH_MESSAGE:
      return {
        ...state,
        isSnackbarOpen: true,
        flashMessage: action.payload.message,
        alertType: action.payload.severity,
      }
    case SET_LEARN_EXIT_DIALOG:
      return {
        ...state,
        isDialogOpen: action.payload.isOpen,
      }
    case CLEAR_FLASH_MESSAGE:
      return { ...state, isSnackbarOpen: false }
    case OPEN_GLOBAL_MODAL:
      return {
        ...state,
        isGlobalModalOpen: true,
        globalModalTitle: action.payload.globalModalTitle,
        globalModalMessage: action.payload.globalModalMessage,
        globalModalCTAAction: action.payload.globalModalCTAAction,
      }
    case CLEAR_GLOBAL_MODAL:
      return {
        ...state,
        isGlobalModalOpen: false,
      }
    case LOAD_FOOTER_INFO_REQUEST:
      return { ...state, isLoading: true, footerInfo: {} }
    case LOAD_FOOTER_INFO_SUCCESS:
      return {
        ...state,
        isLoading: false,
        footerInfo: action.payload.footerInfo,
      }
    case LOAD_FOOTER_INFO_FAILURE:
      return { ...state, isLoading: false }
    case LOAD_SUPPORT_INFO_SUCCESS:
      return {
        ...state,
        isLoading: false,
        supportInfo: action.payload.supportInfo,
      }
    case LOAD_CHATBOT_INFO_REQUEST:
      return { ...state, isChatbotLoading: true }
    case LOAD_CHATBOT_INFO_SUCCESS:
      return {
        ...state,
        isChatbotLoading: false,
        chatbotInfo: action.payload.chatbotInfo,
      }
    case LOAD_CHATBOT_INFO_FAILURE:
      return { ...state, isChatbotLoading: false }
    default:
      return state
  }
}
