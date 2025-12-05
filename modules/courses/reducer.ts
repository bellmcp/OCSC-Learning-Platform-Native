import {
  CLEAR_COURSES,
  LOAD_COURSE_CONTENT_FAILURE,
  LOAD_COURSE_CONTENT_REQUEST,
  LOAD_COURSE_CONTENT_SUCCESS,
  LOAD_COURSE_FAILURE,
  LOAD_COURSE_HOUR_FAILURE,
  LOAD_COURSE_HOUR_REQUEST,
  LOAD_COURSE_HOUR_SUCCESS,
  LOAD_COURSE_REQUEST,
  LOAD_COURSE_ROUND_FAILURE,
  LOAD_COURSE_ROUND_REQUEST,
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
  rounds: any[]
  contents: any[]
  hour: number
}

const initialState: CoursesState = {
  isRecommendedCoursesLoading: false,
  isLoading: false,
  items: [],
  recommended: [],
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
    case LOAD_COURSE_REQUEST:
    case LOAD_COURSE_ROUND_REQUEST:
    case LOAD_COURSE_CONTENT_REQUEST:
      return {
        ...state,
        isLoading: true,
        items: [],
        rounds: [],
        contents: [],
      }
    case LOAD_RECOMMENDED_COURSES_REQUEST:
      return {
        ...state,
        isRecommendedCoursesLoading: true,
        recommended: [],
      }
    case LOAD_COURSE_HOUR_REQUEST:
      return {
        ...state,
        hour: 0,
      }
    case LOAD_COURSES_SUCCESS:
      return {
        ...state,
        isLoading: false,
        items: action.payload.courses,
      }
    case LOAD_RECOMMENDED_COURSES_SUCCESS:
      return {
        ...state,
        isRecommendedCoursesLoading: false,
        recommended: action.payload.recommendedCourses,
      }
    case LOAD_COURSE_SUCCESS:
      return { ...state, isLoading: false, items: [action.payload.course] }
    case LOAD_COURSE_ROUND_SUCCESS:
      return {
        ...state,
        isLoading: false,
        rounds: action.payload.courseRounds,
      }
    case LOAD_COURSE_CONTENT_SUCCESS:
      return {
        ...state,
        isLoading: false,
        contents: action.payload.courseContents,
      }
    case LOAD_COURSE_HOUR_SUCCESS:
      return {
        ...state,
        isLoading: false,
        hour: action.payload.courseHour,
      }
    case LOAD_COURSES_FAILURE:
    case LOAD_RECOMMENDED_COURSES_FAILURE:
    case LOAD_COURSE_FAILURE:
    case LOAD_COURSE_ROUND_FAILURE:
    case LOAD_COURSE_CONTENT_FAILURE:
      return { ...state, isLoading: false, isRecommendedCoursesLoading: false }
    case LOAD_COURSE_HOUR_FAILURE:
      return { ...state, hour: 0 }
    case CLEAR_COURSES:
      return {
        ...state,
        isLoading: false,
        isRecommendedCoursesLoading: false,
        items: [],
      }
    default:
      return state
  }
}
