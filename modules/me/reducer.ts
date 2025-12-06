import {
  CLEAR_ALL_CERTIFICATES,
  CLEAR_CERTIFICATE_INFO,
  LOAD_COURSE_CERTIFICATES_FAILURE,
  LOAD_COURSE_CERTIFICATES_REQUEST,
  LOAD_COURSE_CERTIFICATES_SUCCESS,
  LOAD_COURSE_CERTIFICATE_INFO_FAILURE,
  LOAD_COURSE_CERTIFICATE_INFO_REQUEST,
  LOAD_COURSE_CERTIFICATE_INFO_SUCCESS,
  LOAD_CURRICULUM_CERTIFICATES_FAILURE,
  LOAD_CURRICULUM_CERTIFICATES_REQUEST,
  LOAD_CURRICULUM_CERTIFICATES_SUCCESS,
  LOAD_CURRICULUM_CERTIFICATE_INFO_FAILURE,
  LOAD_CURRICULUM_CERTIFICATE_INFO_REQUEST,
  LOAD_CURRICULUM_CERTIFICATE_INFO_SUCCESS,
} from './actions'

interface MeState {
  isCourseCertificatesLoading: boolean
  isCurriculumCertificatesLoading: boolean
  isCourseCertificateInfoLoading: boolean
  isCurriculumCertificateInfoLoading: boolean
  courseCertificates: any[]
  curriculumCertificates: any[]
  courseCertificateInfo: any | null
  curriculumCertificateInfo: any | null
}

const initialState: MeState = {
  isCourseCertificatesLoading: false,
  isCurriculumCertificatesLoading: false,
  isCourseCertificateInfoLoading: false,
  isCurriculumCertificateInfoLoading: false,
  courseCertificates: [],
  curriculumCertificates: [],
  courseCertificateInfo: null,
  curriculumCertificateInfo: null,
}

export default function meReducer(state = initialState, action: any): MeState {
  switch (action.type) {
    case LOAD_COURSE_CERTIFICATES_REQUEST:
      return {
        ...state,
        isCourseCertificatesLoading: true,
      }
    case LOAD_COURSE_CERTIFICATES_SUCCESS:
      return {
        ...state,
        isCourseCertificatesLoading: false,
        courseCertificates: action.payload.courseCertificates,
      }
    case LOAD_COURSE_CERTIFICATES_FAILURE:
      return {
        ...state,
        isCourseCertificatesLoading: false,
      }
    case LOAD_CURRICULUM_CERTIFICATES_REQUEST:
      return {
        ...state,
        isCurriculumCertificatesLoading: true,
      }
    case LOAD_CURRICULUM_CERTIFICATES_SUCCESS:
      return {
        ...state,
        isCurriculumCertificatesLoading: false,
        curriculumCertificates: action.payload.curriculumCertificates,
      }
    case LOAD_CURRICULUM_CERTIFICATES_FAILURE:
      return {
        ...state,
        isCurriculumCertificatesLoading: false,
      }
    case LOAD_COURSE_CERTIFICATE_INFO_REQUEST:
      return {
        ...state,
        isCourseCertificateInfoLoading: true,
        courseCertificateInfo: null,
      }
    case LOAD_COURSE_CERTIFICATE_INFO_SUCCESS:
      return {
        ...state,
        isCourseCertificateInfoLoading: false,
        courseCertificateInfo: action.payload.courseCertificateInfo,
      }
    case LOAD_COURSE_CERTIFICATE_INFO_FAILURE:
      return {
        ...state,
        isCourseCertificateInfoLoading: false,
      }
    case LOAD_CURRICULUM_CERTIFICATE_INFO_REQUEST:
      return {
        ...state,
        isCurriculumCertificateInfoLoading: true,
        curriculumCertificateInfo: null,
      }
    case LOAD_CURRICULUM_CERTIFICATE_INFO_SUCCESS:
      return {
        ...state,
        isCurriculumCertificateInfoLoading: false,
        curriculumCertificateInfo: action.payload.curriculumCertificateInfo,
      }
    case LOAD_CURRICULUM_CERTIFICATE_INFO_FAILURE:
      return {
        ...state,
        isCurriculumCertificateInfoLoading: false,
      }
    case CLEAR_CERTIFICATE_INFO:
      return {
        ...state,
        courseCertificateInfo: null,
        curriculumCertificateInfo: null,
      }
    case CLEAR_ALL_CERTIFICATES:
      return initialState
    default:
      return state
  }
}
