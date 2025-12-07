// Redux Store Types
export interface RootState {
  user: UserState
  categories: CategoriesState
  courses: CoursesState
  curriculums: CurriculumsState
  learn: LearnState
  me: MeState
  otp: OTPState
  press: PressState
  registrations: RegistrationsState
  resetPassword: ResetPasswordState
  signup: SignupState
  ui: UIState
}

export interface OTPState {
  isLoading: boolean
  data: {
    info?: string
    qr?: string
  } | null
}

export interface ResetPasswordState {
  isLoading: boolean
  success: boolean
}

export interface UserState {
  isLoading: boolean
  items: any
}

export interface CategoriesState {
  isLoading: boolean
  items: any[]
}

export interface CoursesState {
  currentCourse: any | null
  isRecommendedCoursesLoading: boolean
  isLoading: boolean
  items: any[]
  recommended: any[]
  rounds: any[]
  contents: any[]
  hour: number
}

export interface CurriculumsState {
  currentCurriculum: any | null
  isLoading: boolean
  items: any[]
  child: any[]
}

export interface LearnState {
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

export interface MeState {
  isCourseCertificatesLoading: boolean
  isCurriculumCertificatesLoading: boolean
  isCourseCertificateInfoLoading: boolean
  isCurriculumCertificateInfoLoading: boolean
  isOrientationScoreLoading: boolean
  courseCertificates: any[]
  curriculumCertificates: any[]
  courseCertificateInfo: any | null
  curriculumCertificateInfo: any | null
  orientationScore: any | null
}

export interface PressState {
  isLoading: boolean
  items: any[]
  isAnnoucementLoading: boolean
  announcement: any[]
}

export interface RegistrationsState {
  isLoading: boolean
  isCourseRegistrationsLoading: boolean
  isCurriculumRegistrationsLoading: boolean
  myCourses: any[]
  myCurriculums: any[]
  localDateTime: string[]
}

export interface UIState {
  isSnackbarOpen: boolean
  flashMessage: string | null
  alertType: string | null
  isDialogOpen: boolean
  isGlobalModalOpen: boolean
  globalModalTitle: string
  globalModalMessage: string
  globalModalCTAAction?: any
  isLoading: boolean
  footerInfo: any
  supportInfo: any
  chatbotInfo: {
    isShown: boolean
    image: string
    message: string
    url: string
  }
  isChatbotLoading: boolean
}

export interface SignupState {
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
  isUpdating: boolean
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
  presenceCheck: {
    checked: boolean
    presence: boolean
    message: string
    isValid: boolean
  } | null
  submitResult: {
    success: boolean
    message: string
    data?: any
  } | null
  updateResult: {
    success: boolean
    message: string
    data?: any
  } | null
}

// AppDispatch type for Redux Thunk support
import { UnknownAction } from 'redux'
import { ThunkDispatch } from 'redux-thunk'

export type AppDispatch = ThunkDispatch<RootState, unknown, UnknownAction>
