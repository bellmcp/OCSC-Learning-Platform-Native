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
  currentCurriculum: any | null // Separate field for curriculum detail page
  child: any[]
}

const initialState: CurriculumsState = {
  isLoading: false,
  items: [],
  currentCurriculum: null, // Single curriculum for detail page
  child: [],
}

export default function curriculumsReducer(
  state = initialState,
  action: any
): CurriculumsState {
  switch (action.type) {
    case LOAD_CURRICULUMS_REQUEST:
      return { ...state, isLoading: true }
    case LOAD_CURRICULUM_REQUEST:
      return { ...state, isLoading: true }
    case LOAD_CURRICULUM_CHILD_REQUEST:
      return { ...state, isLoading: true, child: [] }
    case LOAD_CURRICULUMS_SUCCESS:
      return { ...state, isLoading: false, items: action.payload.curriculums }
    case LOAD_CURRICULUM_SUCCESS:
      // Store single curriculum in currentCurriculum instead of overwriting items
      return { ...state, isLoading: false, currentCurriculum: action.payload.curriculum }
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
