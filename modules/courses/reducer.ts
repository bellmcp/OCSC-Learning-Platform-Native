import {
  LOAD_COURSE_CONTENT_SUCCESS,
  LOAD_COURSE_FAILURE,
  LOAD_COURSE_HOUR_SUCCESS,
  LOAD_COURSE_REQUEST,
  LOAD_COURSE_ROUND_SUCCESS,
  LOAD_COURSE_SUCCESS,
  LOAD_COURSES_FAILURE,
  LOAD_COURSES_REQUEST,
  LOAD_COURSES_SUCCESS,
  LOAD_RECOMMENDED_COURSES_FAILURE,
  LOAD_RECOMMENDED_COURSES_REQUEST,
  LOAD_RECOMMENDED_COURSES_SUCCESS,
} from './actions'

interface CoursesState {
  isRecommendedCoursesLoading: boolean
  isLoading: boolean
  items: any[]
  recommended: any[]
  currentCourse: any | null // Separate field for course detail page
  rounds: any[]
  contents: any[]
  hour: number
}

const initialState: CoursesState = {
  isRecommendedCoursesLoading: false,
  isLoading: false,
  items: [],
  recommended: [],
  currentCourse: null, // Single course for detail page
  rounds: [],
  contents: [],
  hour: 0,
}

export default function coursesReducer(
  state = initialState,
  action: any
): CoursesState {
  switch (action.type) {
    case LOAD_COURSES_REQUEST:
      return { ...state, isLoading: true }
    case LOAD_COURSES_SUCCESS:
      return { ...state, isLoading: false, items: action.payload.courses }
    case LOAD_COURSES_FAILURE:
      return { ...state, isLoading: false }
    case LOAD_RECOMMENDED_COURSES_REQUEST:
      return { ...state, isRecommendedCoursesLoading: true }
    case LOAD_RECOMMENDED_COURSES_SUCCESS:
      return {
        ...state,
        isRecommendedCoursesLoading: false,
        recommended: action.payload.recommendedCourses, // Fixed: use recommendedCourses
      }
    case LOAD_RECOMMENDED_COURSES_FAILURE:
      return { ...state, isRecommendedCoursesLoading: false }
    case LOAD_COURSE_REQUEST:
      return { ...state, isLoading: true }
    case LOAD_COURSE_SUCCESS:
      // Store single course in currentCourse instead of overwriting items
      return { ...state, isLoading: false, currentCourse: action.payload.course }
    case LOAD_COURSE_ROUND_SUCCESS:
      return { ...state, rounds: action.payload.courseRounds } // Fixed: use courseRounds
    case LOAD_COURSE_CONTENT_SUCCESS:
      return { ...state, contents: action.payload.courseContents } // Fixed: use courseContents
    case LOAD_COURSE_HOUR_SUCCESS:
      return { ...state, hour: action.payload.courseHour } // Fixed: use courseHour
    case LOAD_COURSE_FAILURE:
      return { ...state, isLoading: false }
    default:
      return state
  }
}
