import {
  LOAD_ANNOUNCEMENT_FAILURE,
  LOAD_ANNOUNCEMENT_REQUEST,
  LOAD_ANNOUNCEMENT_SUCCESS,
  LOAD_PRESS_FAILURE,
  LOAD_PRESS_REQUEST,
  LOAD_PRESS_SUCCESS,
} from './actions'

interface PressState {
  isLoading: boolean
  items: any[]
  isAnnoucementLoading: boolean
  announcement: any[]
}

const initialState: PressState = {
  isLoading: false,
  items: [],
  isAnnoucementLoading: false,
  announcement: [],
}

export default function pressReducer(
  state = initialState,
  action: any
): PressState {
  switch (action.type) {
    case LOAD_PRESS_REQUEST:
      return { ...state, isLoading: true, items: [] }
    case LOAD_PRESS_SUCCESS:
      return { ...state, isLoading: false, items: action.payload.presses }
    case LOAD_PRESS_FAILURE:
      return { ...state, isLoading: false }
    case LOAD_ANNOUNCEMENT_REQUEST:
      return { ...state, isAnnoucementLoading: true, announcement: [] }
    case LOAD_ANNOUNCEMENT_SUCCESS:
      return {
        ...state,
        isAnnoucementLoading: false,
        announcement: action.payload.announcement,
      }
    case LOAD_ANNOUNCEMENT_FAILURE:
      return { ...state, isAnnoucementLoading: false }
    default:
      return state
  }
}
