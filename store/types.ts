// Redux Store Types
export interface RootState {
  user: UserState
  categories: CategoriesState
  courses: CoursesState
  curriculums: CurriculumsState
  press: PressState
  ui: UIState
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
  isRecommendedCoursesLoading: boolean
  isLoading: boolean
  items: any[]
  recommended: any[]
  rounds: any[]
  contents: any[]
  hour: number
}

export interface CurriculumsState {
  isLoading: boolean
  items: any[]
  child: any[]
}

export interface PressState {
  isLoading: boolean
  items: any[]
  isAnnoucementLoading: boolean
  announcement: any[]
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
