import {
  CLEAR_USER,
  LOAD_USER_FAILURE,
  LOAD_USER_REQUEST,
  LOAD_USER_SUCCESS,
} from './actions'

interface UserState {
  isLoading: boolean
  items: any
}

const initialState: UserState = {
  isLoading: false,
  items: {},
}

export default function userReducer(
  state = initialState,
  action: any
): UserState {
  switch (action.type) {
    case LOAD_USER_REQUEST:
      return {
        ...state,
        isLoading: true,
        items: {},
      }
    case LOAD_USER_SUCCESS:
      return {
        ...state,
        isLoading: false,
        items: action.payload.users,
      }
    case LOAD_USER_FAILURE:
      return {
        ...state,
        isLoading: false,
      }
    case CLEAR_USER:
      return initialState
    default:
      return state
  }
}
