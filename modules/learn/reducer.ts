import {
  CLEAR_LEARN_STATE,
  CREATE_SESSION_FAILURE,
  CREATE_SESSION_REQUEST,
  CREATE_SESSION_SUCCESS,
  LOAD_CONFIG_FAILURE,
  LOAD_CONFIG_REQUEST,
  LOAD_CONFIG_SUCCESS,
  LOAD_CONTENT_VIEWS_FAILURE,
  LOAD_CONTENT_VIEWS_REQUEST,
  LOAD_CONTENT_VIEWS_SUCCESS,
  LOAD_EVALUATION_FAILURE,
  LOAD_EVALUATION_ITEMS_FAILURE,
  LOAD_EVALUATION_ITEMS_REQUEST,
  LOAD_EVALUATION_ITEMS_SUCCESS,
  LOAD_EVALUATION_REQUEST,
  LOAD_EVALUATION_SUCCESS,
  LOAD_TEST_FAILURE,
  LOAD_TEST_ITEMS_FAILURE,
  LOAD_TEST_ITEMS_REQUEST,
  LOAD_TEST_ITEMS_SUCCESS,
  LOAD_TEST_REQUEST,
  LOAD_TEST_SUCCESS,
  UPDATE_CONTENT_VIEW_FAILURE,
  UPDATE_CONTENT_VIEW_REQUEST,
  UPDATE_CONTENT_VIEW_SUCCESS,
  UPDATE_EVALUATION_FAILURE,
  UPDATE_EVALUATION_REQUEST,
  UPDATE_EVALUATION_SUCCESS,
  UPDATE_TEST_FAILURE,
  UPDATE_TEST_REQUEST,
  UPDATE_TEST_SUCCESS,
  UPDATE_TEST_TRIES_FAILURE,
  UPDATE_TEST_TRIES_REQUEST,
  UPDATE_TEST_TRIES_SUCCESS,
} from './actions'

interface LearnState {
  isLoading: boolean
  isContentViewsLoading: boolean
  isSessionLoading: boolean
  session: {
    id?: string
    key?: string
  } | null
  contentViews: any[]
  contentSeconds: any
  evaluation: any
  evaluationItems: any[]
  test: any
  testItems: any[]
  config: any
}

const initialState: LearnState = {
  isLoading: false,
  isContentViewsLoading: false,
  isSessionLoading: false,
  session: null,
  contentViews: [],
  contentSeconds: null,
  evaluation: null,
  evaluationItems: [],
  test: null,
  testItems: [],
  config: null,
}

export default function learnReducer(
  state = initialState,
  action: any
): LearnState {
  switch (action.type) {
    case CREATE_SESSION_REQUEST:
      return { ...state, isSessionLoading: true, session: null }
    case CREATE_SESSION_SUCCESS:
      return {
        ...state,
        isSessionLoading: false,
        session: action.payload.session,
      }
    case CREATE_SESSION_FAILURE:
      return { ...state, isSessionLoading: false }

    case LOAD_CONTENT_VIEWS_REQUEST:
      return { ...state, isContentViewsLoading: true, contentViews: [] }
    case LOAD_CONTENT_VIEWS_SUCCESS:
      return {
        ...state,
        isContentViewsLoading: false,
        contentViews: action.payload.contentViews,
      }
    case LOAD_CONTENT_VIEWS_FAILURE:
      return { ...state, isContentViewsLoading: false }

    case UPDATE_CONTENT_VIEW_REQUEST:
      return { ...state, isLoading: true }
    case UPDATE_CONTENT_VIEW_SUCCESS:
      return {
        ...state,
        isLoading: false,
        contentSeconds: action.payload.contentSeconds,
      }
    case UPDATE_CONTENT_VIEW_FAILURE:
      return { ...state, isLoading: false }

    case LOAD_EVALUATION_REQUEST:
      return { ...state, isLoading: true, evaluation: null }
    case LOAD_EVALUATION_SUCCESS:
      return {
        ...state,
        isLoading: false,
        evaluation: action.payload.evaluation,
      }
    case LOAD_EVALUATION_FAILURE:
      return { ...state, isLoading: false }

    case LOAD_EVALUATION_ITEMS_REQUEST:
      return { ...state, isLoading: true, evaluationItems: [] }
    case LOAD_EVALUATION_ITEMS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        evaluationItems: action.payload.evaluationItems,
      }
    case LOAD_EVALUATION_ITEMS_FAILURE:
      return { ...state, isLoading: false }

    case UPDATE_EVALUATION_REQUEST:
      return { ...state, isLoading: true }
    case UPDATE_EVALUATION_SUCCESS:
      return { ...state, isLoading: false }
    case UPDATE_EVALUATION_FAILURE:
      return { ...state, isLoading: false }

    case LOAD_TEST_REQUEST:
      return { ...state, isLoading: true, test: null }
    case LOAD_TEST_SUCCESS:
      return {
        ...state,
        isLoading: false,
        test: action.payload.test,
      }
    case LOAD_TEST_FAILURE:
      return { ...state, isLoading: false }

    case LOAD_TEST_ITEMS_REQUEST:
      return { ...state, isLoading: true, testItems: [] }
    case LOAD_TEST_ITEMS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        testItems: action.payload.testItems,
      }
    case LOAD_TEST_ITEMS_FAILURE:
      return { ...state, isLoading: false }

    case UPDATE_TEST_REQUEST:
      return { ...state, isLoading: true }
    case UPDATE_TEST_SUCCESS:
      return { ...state, isLoading: false }
    case UPDATE_TEST_FAILURE:
      return { ...state, isLoading: false }

    case UPDATE_TEST_TRIES_REQUEST:
      return { ...state, isLoading: true }
    case UPDATE_TEST_TRIES_SUCCESS:
      return { ...state, isLoading: false }
    case UPDATE_TEST_TRIES_FAILURE:
      return { ...state, isLoading: false }

    case LOAD_CONFIG_REQUEST:
      return { ...state, isLoading: true, config: null }
    case LOAD_CONFIG_SUCCESS:
      return {
        ...state,
        isLoading: false,
        config: action.payload.config,
      }
    case LOAD_CONFIG_FAILURE:
      return { ...state, isLoading: false }

    case CLEAR_LEARN_STATE:
      return initialState

    default:
      return state
  }
}
