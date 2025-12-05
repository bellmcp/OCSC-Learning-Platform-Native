import {
  LOAD_CURRICULUMS_FAILURE,
  LOAD_CURRICULUMS_REQUEST,
  LOAD_CURRICULUMS_SUCCESS,
  LOAD_CURRICULUM_CHILD_FAILURE,
  LOAD_CURRICULUM_CHILD_REQUEST,
  LOAD_CURRICULUM_CHILD_SUCCESS,
  LOAD_CURRICULUM_FAILURE,
  LOAD_CURRICULUM_REQUEST,
  LOAD_CURRICULUM_SUCCESS,
} from './actions'

interface CurriculumsState {
  isLoading: boolean
  items: any[]
  child: any[]
}

const initialState: CurriculumsState = {
  isLoading: false,
  items: [],
  child: [],
}

export default function curriculumsReducer(
  state = initialState,
  action: any
): CurriculumsState {
  switch (action.type) {
    case LOAD_CURRICULUMS_REQUEST:
    case LOAD_CURRICULUM_REQUEST:
      return { ...state, isLoading: true, items: [] }
    case LOAD_CURRICULUM_CHILD_REQUEST:
      return { ...state, isLoading: true, child: [] }
    case LOAD_CURRICULUMS_SUCCESS:
      return { ...state, isLoading: false, items: action.payload.curriculums }
    case LOAD_CURRICULUM_SUCCESS:
      return { ...state, isLoading: false, items: [action.payload.curriculum] }
    case LOAD_CURRICULUM_CHILD_SUCCESS:
      return { ...state, isLoading: false, child: action.payload.childCourses }
    case LOAD_CURRICULUMS_FAILURE:
    case LOAD_CURRICULUM_FAILURE:
    case LOAD_CURRICULUM_CHILD_FAILURE:
      return { ...state, isLoading: false }
    default:
      return state
  }
}
