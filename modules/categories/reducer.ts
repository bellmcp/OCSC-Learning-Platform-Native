import {
  LOAD_CATEGORIES_FAILURE,
  LOAD_CATEGORIES_REQUEST,
  LOAD_CATEGORIES_SUCCESS,
} from './actions'

interface CategoriesState {
  isLoading: boolean
  items: any[]
}

const initialState: CategoriesState = {
  isLoading: false,
  items: [],
}

export default function categoriesReducer(
  state = initialState,
  action: any
): CategoriesState {
  switch (action.type) {
    case LOAD_CATEGORIES_REQUEST:
      return { ...state, isLoading: true, items: [] }
    case LOAD_CATEGORIES_SUCCESS:
      return { ...state, isLoading: false, items: action.payload.categories }
    case LOAD_CATEGORIES_FAILURE:
      return { ...state, isLoading: false }
    default:
      return state
  }
}
