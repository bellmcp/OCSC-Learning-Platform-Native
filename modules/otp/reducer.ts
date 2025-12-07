import {
  CLEAR_OTP_DATA,
  LOAD_OTP_FAILURE,
  LOAD_OTP_REQUEST,
  LOAD_OTP_SUCCESS,
} from './actions'

export interface OTPState {
  isLoading: boolean
  data: {
    info?: string
    qr?: string
  } | null
}

const initialState: OTPState = {
  isLoading: false,
  data: null,
}

export default function otpReducer(
  state = initialState,
  action: any
): OTPState {
  switch (action.type) {
    case LOAD_OTP_REQUEST:
      return {
        ...state,
        isLoading: true,
        data: null,
      }
    case LOAD_OTP_SUCCESS:
      return {
        ...state,
        isLoading: false,
        data: action.payload.data,
      }
    case LOAD_OTP_FAILURE:
      return {
        ...state,
        isLoading: false,
        data: null,
      }
    case CLEAR_OTP_DATA:
      return initialState
    default:
      return state
  }
}
