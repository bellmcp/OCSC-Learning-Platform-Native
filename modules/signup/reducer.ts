import {
  CHECK_PRESENCE_FAILURE,
  CHECK_PRESENCE_REQUEST,
  CHECK_PRESENCE_SUCCESS,
  CLEAR_DEPARTMENTS,
  CLEAR_PRESENCE_CHECK,
  CLEAR_SIGNUP_STATE,
  LOAD_DEPARTMENTS_FAILURE,
  LOAD_DEPARTMENTS_REQUEST,
  LOAD_DEPARTMENTS_SUCCESS,
  LOAD_EDUCATIONS_FAILURE,
  LOAD_EDUCATIONS_REQUEST,
  LOAD_EDUCATIONS_SUCCESS,
  LOAD_JOBLEVELS_FAILURE,
  LOAD_JOBLEVELS_REQUEST,
  LOAD_JOBLEVELS_SUCCESS,
  LOAD_JOBTYPES1_FAILURE,
  LOAD_JOBTYPES1_REQUEST,
  LOAD_JOBTYPES1_SUCCESS,
  LOAD_JOBTYPES2_FAILURE,
  LOAD_JOBTYPES2_REQUEST,
  LOAD_JOBTYPES2_SUCCESS,
  LOAD_JOBTYPES3_FAILURE,
  LOAD_JOBTYPES3_REQUEST,
  LOAD_JOBTYPES3_SUCCESS,
  LOAD_MINISTRIES_FAILURE,
  LOAD_MINISTRIES_REQUEST,
  LOAD_MINISTRIES_SUCCESS,
  LOAD_OCCUPATIONS_FAILURE,
  LOAD_OCCUPATIONS_REQUEST,
  LOAD_OCCUPATIONS_SUCCESS,
  LOAD_POSITIONS_FAILURE,
  LOAD_POSITIONS_REQUEST,
  LOAD_POSITIONS_SUCCESS,
  LOAD_STATE_ENTERPRISES_FAILURE,
  LOAD_STATE_ENTERPRISES_REQUEST,
  LOAD_STATE_ENTERPRISES_SUCCESS,
  SUBMIT_SIGNUP_FAILURE,
  SUBMIT_SIGNUP_REQUEST,
  SUBMIT_SIGNUP_SUCCESS,
} from './actions'

interface SignupState {
  // Loading states
  isEducationsLoading: boolean
  isJobTypes1Loading: boolean
  isJobTypes2Loading: boolean
  isJobTypes3Loading: boolean
  isJobLevelsLoading: boolean
  isMinistriesLoading: boolean
  isDepartmentsLoading: boolean
  isStateEnterprisesLoading: boolean
  isOccupationsLoading: boolean
  isPositionsLoading: boolean
  isCheckingPresence: boolean
  isSubmitting: boolean

  // Data
  educations: Array<{ id: number; name: string }>
  jobTypes1: Array<{ id: number; name: string }>
  jobTypes2: Array<{ id: number; name: string }>
  jobTypes3: Array<{ id: number; name: string }>
  jobLevels: Array<{ id: number; name: string }>
  ministries: Array<{ id: number; name: string }>
  departments: Array<{ id: number; name: string }>
  stateEnterprises: Array<{ id: number; name: string }>
  occupations: Array<{ id: number; name: string }>
  positions: Array<{
    id: number
    name: string
    ministryId: number
    departmentId: number
  }>

  // Presence check result
  presenceCheck: {
    checked: boolean
    presence: boolean
    message: string
    isValid: boolean
  } | null

  // Submit result
  submitResult: {
    success: boolean
    message: string
    data?: any
  } | null
}

const initialState: SignupState = {
  isEducationsLoading: false,
  isJobTypes1Loading: false,
  isJobTypes2Loading: false,
  isJobTypes3Loading: false,
  isJobLevelsLoading: false,
  isMinistriesLoading: false,
  isDepartmentsLoading: false,
  isStateEnterprisesLoading: false,
  isOccupationsLoading: false,
  isPositionsLoading: false,
  isCheckingPresence: false,
  isSubmitting: false,

  educations: [],
  jobTypes1: [],
  jobTypes2: [],
  jobTypes3: [],
  jobLevels: [],
  ministries: [],
  departments: [],
  stateEnterprises: [],
  occupations: [],
  positions: [],

  presenceCheck: null,
  submitResult: null,
}

export default function signupReducer(
  state = initialState,
  action: any
): SignupState {
  switch (action.type) {
    // Educations
    case LOAD_EDUCATIONS_REQUEST:
      return { ...state, isEducationsLoading: true }
    case LOAD_EDUCATIONS_SUCCESS:
      return {
        ...state,
        isEducationsLoading: false,
        educations: action.payload.educations,
      }
    case LOAD_EDUCATIONS_FAILURE:
      return { ...state, isEducationsLoading: false }

    // Job Types 1
    case LOAD_JOBTYPES1_REQUEST:
      return { ...state, isJobTypes1Loading: true }
    case LOAD_JOBTYPES1_SUCCESS:
      return {
        ...state,
        isJobTypes1Loading: false,
        jobTypes1: action.payload.jobTypes1,
      }
    case LOAD_JOBTYPES1_FAILURE:
      return { ...state, isJobTypes1Loading: false }

    // Job Types 2
    case LOAD_JOBTYPES2_REQUEST:
      return { ...state, isJobTypes2Loading: true }
    case LOAD_JOBTYPES2_SUCCESS:
      return {
        ...state,
        isJobTypes2Loading: false,
        jobTypes2: action.payload.jobTypes2,
      }
    case LOAD_JOBTYPES2_FAILURE:
      return { ...state, isJobTypes2Loading: false }

    // Job Types 3
    case LOAD_JOBTYPES3_REQUEST:
      return { ...state, isJobTypes3Loading: true }
    case LOAD_JOBTYPES3_SUCCESS:
      return {
        ...state,
        isJobTypes3Loading: false,
        jobTypes3: action.payload.jobTypes3,
      }
    case LOAD_JOBTYPES3_FAILURE:
      return { ...state, isJobTypes3Loading: false }

    // Job Levels
    case LOAD_JOBLEVELS_REQUEST:
      return { ...state, isJobLevelsLoading: true }
    case LOAD_JOBLEVELS_SUCCESS:
      return {
        ...state,
        isJobLevelsLoading: false,
        jobLevels: action.payload.jobLevels,
      }
    case LOAD_JOBLEVELS_FAILURE:
      return { ...state, isJobLevelsLoading: false }

    // Ministries
    case LOAD_MINISTRIES_REQUEST:
      return { ...state, isMinistriesLoading: true }
    case LOAD_MINISTRIES_SUCCESS:
      return {
        ...state,
        isMinistriesLoading: false,
        ministries: action.payload.ministries,
      }
    case LOAD_MINISTRIES_FAILURE:
      return { ...state, isMinistriesLoading: false }

    // Departments
    case LOAD_DEPARTMENTS_REQUEST:
      return { ...state, isDepartmentsLoading: true }
    case LOAD_DEPARTMENTS_SUCCESS:
      return {
        ...state,
        isDepartmentsLoading: false,
        departments: action.payload.departments,
      }
    case LOAD_DEPARTMENTS_FAILURE:
      return { ...state, isDepartmentsLoading: false }

    // State Enterprises
    case LOAD_STATE_ENTERPRISES_REQUEST:
      return { ...state, isStateEnterprisesLoading: true }
    case LOAD_STATE_ENTERPRISES_SUCCESS:
      return {
        ...state,
        isStateEnterprisesLoading: false,
        stateEnterprises: action.payload.stateEnterprises,
      }
    case LOAD_STATE_ENTERPRISES_FAILURE:
      return { ...state, isStateEnterprisesLoading: false }

    // Occupations
    case LOAD_OCCUPATIONS_REQUEST:
      return { ...state, isOccupationsLoading: true }
    case LOAD_OCCUPATIONS_SUCCESS:
      return {
        ...state,
        isOccupationsLoading: false,
        occupations: action.payload.occupations,
      }
    case LOAD_OCCUPATIONS_FAILURE:
      return { ...state, isOccupationsLoading: false }

    // Positions
    case LOAD_POSITIONS_REQUEST:
      return { ...state, isPositionsLoading: true }
    case LOAD_POSITIONS_SUCCESS:
      return {
        ...state,
        isPositionsLoading: false,
        positions: action.payload.positions,
      }
    case LOAD_POSITIONS_FAILURE:
      return { ...state, isPositionsLoading: false }

    // Check Presence
    case CHECK_PRESENCE_REQUEST:
      return { ...state, isCheckingPresence: true, presenceCheck: null }
    case CHECK_PRESENCE_SUCCESS:
      return {
        ...state,
        isCheckingPresence: false,
        presenceCheck: {
          checked: true,
          presence: action.payload.presence,
          message: action.payload.message,
          isValid: action.payload.isValid,
        },
      }
    case CHECK_PRESENCE_FAILURE:
      return {
        ...state,
        isCheckingPresence: false,
        presenceCheck: {
          checked: true,
          presence: false,
          message: action.payload.message,
          isValid: false,
        },
      }

    // Submit Signup
    case SUBMIT_SIGNUP_REQUEST:
      return { ...state, isSubmitting: true, submitResult: null }
    case SUBMIT_SIGNUP_SUCCESS:
      return {
        ...state,
        isSubmitting: false,
        submitResult: {
          success: true,
          message: action.payload.message,
          data: action.payload.data,
        },
      }
    case SUBMIT_SIGNUP_FAILURE:
      return {
        ...state,
        isSubmitting: false,
        submitResult: {
          success: false,
          message: action.payload.message,
        },
      }

    // Clear states
    case CLEAR_SIGNUP_STATE:
      return initialState
    case CLEAR_PRESENCE_CHECK:
      return { ...state, presenceCheck: null }
    case CLEAR_DEPARTMENTS:
      return { ...state, departments: [] }

    default:
      return state
  }
}

export type { SignupState }
