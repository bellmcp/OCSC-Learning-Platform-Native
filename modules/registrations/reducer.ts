import {
  CLEAR_REGISTRATIONS,
  COURSE_COMPLETE_FAILURE,
  COURSE_COMPLETE_REQUEST,
  COURSE_COMPLETE_SUCCESS,
  COURSE_REGISTRATION_FAILURE,
  COURSE_REGISTRATION_REQUEST,
  COURSE_REGISTRATION_SUCCESS,
  COURSE_UNENROLL_FAILURE,
  COURSE_UNENROLL_REQUEST,
  COURSE_UNENROLL_SUCCESS,
  CURRICULUM_REGISTRATION_FAILURE,
  CURRICULUM_REGISTRATION_REQUEST,
  CURRICULUM_REGISTRATION_SUCCESS,
  CURRICULUM_UNENROLL_FAILURE,
  CURRICULUM_UNENROLL_REQUEST,
  CURRICULUM_UNENROLL_SUCCESS,
  LOAD_COURSE_REGISTRATIONS_FAILURE,
  LOAD_COURSE_REGISTRATIONS_REQUEST,
  LOAD_COURSE_REGISTRATIONS_SUCCESS,
  LOAD_CURRICULUM_REGISTRATIONS_FAILURE,
  LOAD_CURRICULUM_REGISTRATIONS_REQUEST,
  LOAD_CURRICULUM_REGISTRATIONS_SUCCESS,
  LOAD_LOCAL_DATE_TIME_FAILURE,
  LOAD_LOCAL_DATE_TIME_REQUEST,
  LOAD_LOCAL_DATE_TIME_SUCCESS,
  UPDATE_CURRICULUM_SATISFACTION_SCORE_FAILURE,
  UPDATE_CURRICULUM_SATISFACTION_SCORE_REQUEST,
  UPDATE_CURRICULUM_SATISFACTION_SCORE_SUCCESS,
} from './actions'

interface RegistrationsState {
  isLoading: boolean
  isCourseRegistrationsLoading: boolean
  isCurriculumRegistrationsLoading: boolean
  myCourses: any[]
  myCurriculums: any[]
  localDateTime: string[]
}

const initialState: RegistrationsState = {
  isLoading: false,
  isCourseRegistrationsLoading: false,
  isCurriculumRegistrationsLoading: false,
  myCourses: [],
  myCurriculums: [],
  localDateTime: [],
}

export default function registrationsReducer(
  state = initialState,
  action: any
): RegistrationsState {
  switch (action.type) {
    case LOAD_COURSE_REGISTRATIONS_REQUEST:
      return {
        ...state,
        isLoading: true,
        isCourseRegistrationsLoading: true,
      }
    case LOAD_COURSE_REGISTRATIONS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isCourseRegistrationsLoading: false,
        myCourses: action.payload.myCourses,
      }
    case LOAD_COURSE_REGISTRATIONS_FAILURE:
      return {
        ...state,
        isLoading: false,
        isCourseRegistrationsLoading: false,
      }
    case LOAD_CURRICULUM_REGISTRATIONS_REQUEST:
      return {
        ...state,
        isLoading: true,
        isCurriculumRegistrationsLoading: true,
      }
    case LOAD_CURRICULUM_REGISTRATIONS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isCurriculumRegistrationsLoading: false,
        myCurriculums: action.payload.myCurriculums,
      }
    case LOAD_CURRICULUM_REGISTRATIONS_FAILURE:
      return {
        ...state,
        isLoading: false,
        isCurriculumRegistrationsLoading: false,
      }
    case LOAD_LOCAL_DATE_TIME_REQUEST:
      return { ...state }
    case LOAD_LOCAL_DATE_TIME_SUCCESS:
      return {
        ...state,
        localDateTime: action.payload.localDateTime,
      }
    case LOAD_LOCAL_DATE_TIME_FAILURE:
      return { ...state }
    case COURSE_UNENROLL_REQUEST:
    case CURRICULUM_UNENROLL_REQUEST:
    case UPDATE_CURRICULUM_SATISFACTION_SCORE_REQUEST:
    case COURSE_COMPLETE_REQUEST:
    case COURSE_REGISTRATION_REQUEST:
    case CURRICULUM_REGISTRATION_REQUEST:
      return { ...state, isLoading: true }
    case COURSE_UNENROLL_SUCCESS:
    case COURSE_UNENROLL_FAILURE:
    case CURRICULUM_UNENROLL_SUCCESS:
    case CURRICULUM_UNENROLL_FAILURE:
    case UPDATE_CURRICULUM_SATISFACTION_SCORE_SUCCESS:
    case UPDATE_CURRICULUM_SATISFACTION_SCORE_FAILURE:
    case COURSE_COMPLETE_SUCCESS:
    case COURSE_COMPLETE_FAILURE:
    case COURSE_REGISTRATION_SUCCESS:
    case COURSE_REGISTRATION_FAILURE:
    case CURRICULUM_REGISTRATION_SUCCESS:
    case CURRICULUM_REGISTRATION_FAILURE:
      return { ...state, isLoading: false }
    case CLEAR_REGISTRATIONS:
      return initialState
    default:
      return state
  }
}
