import {
  CLEAR_RESET_PASSWORD_STATE,
  RESET_PASSWORD_FAILURE,
  RESET_PASSWORD_REQUEST,
  RESET_PASSWORD_SUCCESS,
} from './actions'

export interface ResetPasswordState {
  isLoading: boolean
  success: boolean
}

const initialState: ResetPasswordState = {
  isLoading: false,
  success: false,
}

export default function resetPasswordReducer(
  state = initialState,
  action: any
): ResetPasswordState {
  switch (action.type) {
    case RESET_PASSWORD_REQUEST:
      return {
        ...state,
        isLoading: true,
        success: false,
      }
    case RESET_PASSWORD_SUCCESS:
      return {
        ...state,
        isLoading: false,
        success: true,
      }
    case RESET_PASSWORD_FAILURE:
      return {
        ...state,
        isLoading: false,
        success: false,
      }
    case CLEAR_RESET_PASSWORD_STATE:
      return initialState
    default:
      return state
  }
}
