import { PORTAL_API_URL } from '@env'
import axios from 'axios'

// Portal API base URL (learningportalapi) for signup-related endpoints
const portalApiBaseUrl =
  PORTAL_API_URL || 'https://learningportal.ocsc.go.th/learningportalapi/'

// Action Types
const LOAD_EDUCATIONS_REQUEST =
  'learning-portal-native/signup/LOAD_EDUCATIONS_REQUEST'
const LOAD_EDUCATIONS_SUCCESS =
  'learning-portal-native/signup/LOAD_EDUCATIONS_SUCCESS'
const LOAD_EDUCATIONS_FAILURE =
  'learning-portal-native/signup/LOAD_EDUCATIONS_FAILURE'

const LOAD_JOBTYPES1_REQUEST =
  'learning-portal-native/signup/LOAD_JOBTYPES1_REQUEST'
const LOAD_JOBTYPES1_SUCCESS =
  'learning-portal-native/signup/LOAD_JOBTYPES1_SUCCESS'
const LOAD_JOBTYPES1_FAILURE =
  'learning-portal-native/signup/LOAD_JOBTYPES1_FAILURE'

const LOAD_JOBTYPES2_REQUEST =
  'learning-portal-native/signup/LOAD_JOBTYPES2_REQUEST'
const LOAD_JOBTYPES2_SUCCESS =
  'learning-portal-native/signup/LOAD_JOBTYPES2_SUCCESS'
const LOAD_JOBTYPES2_FAILURE =
  'learning-portal-native/signup/LOAD_JOBTYPES2_FAILURE'

const LOAD_JOBTYPES3_REQUEST =
  'learning-portal-native/signup/LOAD_JOBTYPES3_REQUEST'
const LOAD_JOBTYPES3_SUCCESS =
  'learning-portal-native/signup/LOAD_JOBTYPES3_SUCCESS'
const LOAD_JOBTYPES3_FAILURE =
  'learning-portal-native/signup/LOAD_JOBTYPES3_FAILURE'

const LOAD_JOBLEVELS_REQUEST =
  'learning-portal-native/signup/LOAD_JOBLEVELS_REQUEST'
const LOAD_JOBLEVELS_SUCCESS =
  'learning-portal-native/signup/LOAD_JOBLEVELS_SUCCESS'
const LOAD_JOBLEVELS_FAILURE =
  'learning-portal-native/signup/LOAD_JOBLEVELS_FAILURE'

const LOAD_MINISTRIES_REQUEST =
  'learning-portal-native/signup/LOAD_MINISTRIES_REQUEST'
const LOAD_MINISTRIES_SUCCESS =
  'learning-portal-native/signup/LOAD_MINISTRIES_SUCCESS'
const LOAD_MINISTRIES_FAILURE =
  'learning-portal-native/signup/LOAD_MINISTRIES_FAILURE'

const LOAD_DEPARTMENTS_REQUEST =
  'learning-portal-native/signup/LOAD_DEPARTMENTS_REQUEST'
const LOAD_DEPARTMENTS_SUCCESS =
  'learning-portal-native/signup/LOAD_DEPARTMENTS_SUCCESS'
const LOAD_DEPARTMENTS_FAILURE =
  'learning-portal-native/signup/LOAD_DEPARTMENTS_FAILURE'

const LOAD_STATE_ENTERPRISES_REQUEST =
  'learning-portal-native/signup/LOAD_STATE_ENTERPRISES_REQUEST'
const LOAD_STATE_ENTERPRISES_SUCCESS =
  'learning-portal-native/signup/LOAD_STATE_ENTERPRISES_SUCCESS'
const LOAD_STATE_ENTERPRISES_FAILURE =
  'learning-portal-native/signup/LOAD_STATE_ENTERPRISES_FAILURE'

const LOAD_OCCUPATIONS_REQUEST =
  'learning-portal-native/signup/LOAD_OCCUPATIONS_REQUEST'
const LOAD_OCCUPATIONS_SUCCESS =
  'learning-portal-native/signup/LOAD_OCCUPATIONS_SUCCESS'
const LOAD_OCCUPATIONS_FAILURE =
  'learning-portal-native/signup/LOAD_OCCUPATIONS_FAILURE'

const LOAD_POSITIONS_REQUEST =
  'learning-portal-native/signup/LOAD_POSITIONS_REQUEST'
const LOAD_POSITIONS_SUCCESS =
  'learning-portal-native/signup/LOAD_POSITIONS_SUCCESS'
const LOAD_POSITIONS_FAILURE =
  'learning-portal-native/signup/LOAD_POSITIONS_FAILURE'

const CHECK_PRESENCE_REQUEST =
  'learning-portal-native/signup/CHECK_PRESENCE_REQUEST'
const CHECK_PRESENCE_SUCCESS =
  'learning-portal-native/signup/CHECK_PRESENCE_SUCCESS'
const CHECK_PRESENCE_FAILURE =
  'learning-portal-native/signup/CHECK_PRESENCE_FAILURE'

const SUBMIT_SIGNUP_REQUEST =
  'learning-portal-native/signup/SUBMIT_SIGNUP_REQUEST'
const SUBMIT_SIGNUP_SUCCESS =
  'learning-portal-native/signup/SUBMIT_SIGNUP_SUCCESS'
const SUBMIT_SIGNUP_FAILURE =
  'learning-portal-native/signup/SUBMIT_SIGNUP_FAILURE'

const UPDATE_MEMBER_REQUEST =
  'learning-portal-native/signup/UPDATE_MEMBER_REQUEST'
const UPDATE_MEMBER_SUCCESS =
  'learning-portal-native/signup/UPDATE_MEMBER_SUCCESS'
const UPDATE_MEMBER_FAILURE =
  'learning-portal-native/signup/UPDATE_MEMBER_FAILURE'

const CLEAR_SIGNUP_STATE = 'learning-portal-native/signup/CLEAR_SIGNUP_STATE'
const CLEAR_PRESENCE_CHECK =
  'learning-portal-native/signup/CLEAR_PRESENCE_CHECK'
const CLEAR_DEPARTMENTS = 'learning-portal-native/signup/CLEAR_DEPARTMENTS'

// Action Creators

function loadEducations() {
  return async (dispatch: any) => {
    dispatch({ type: LOAD_EDUCATIONS_REQUEST })
    try {
      const { data } = await axios.get('/Educations', {
        baseURL: portalApiBaseUrl,
      })
      dispatch({
        type: LOAD_EDUCATIONS_SUCCESS,
        payload: { educations: data },
      })
    } catch (err) {
      dispatch({ type: LOAD_EDUCATIONS_FAILURE })
    }
  }
}

function loadJobTypes1() {
  return async (dispatch: any) => {
    dispatch({ type: LOAD_JOBTYPES1_REQUEST })
    try {
      const { data } = await axios.get('/JobTypes1', {
        baseURL: portalApiBaseUrl,
      })
      dispatch({
        type: LOAD_JOBTYPES1_SUCCESS,
        payload: { jobTypes1: data },
      })
    } catch (err) {
      dispatch({ type: LOAD_JOBTYPES1_FAILURE })
    }
  }
}

function loadJobTypes2() {
  return async (dispatch: any) => {
    dispatch({ type: LOAD_JOBTYPES2_REQUEST })
    try {
      const { data } = await axios.get('/JobTypes2/Genuine', {
        baseURL: portalApiBaseUrl,
      })
      dispatch({
        type: LOAD_JOBTYPES2_SUCCESS,
        payload: { jobTypes2: data },
      })
    } catch (err) {
      dispatch({ type: LOAD_JOBTYPES2_FAILURE })
    }
  }
}

function loadJobTypes3() {
  return async (dispatch: any) => {
    dispatch({ type: LOAD_JOBTYPES3_REQUEST })
    try {
      const { data } = await axios.get('/JobTypes3/Genuine')
      dispatch({
        type: LOAD_JOBTYPES3_SUCCESS,
        payload: { jobTypes3: data },
      })
    } catch (err) {
      dispatch({ type: LOAD_JOBTYPES3_FAILURE })
    }
  }
}

function loadJobLevels() {
  return async (dispatch: any) => {
    dispatch({ type: LOAD_JOBLEVELS_REQUEST })
    try {
      const { data } = await axios.get('/JobLevels', {
        baseURL: portalApiBaseUrl,
      })
      dispatch({
        type: LOAD_JOBLEVELS_SUCCESS,
        payload: { jobLevels: data },
      })
    } catch (err) {
      dispatch({ type: LOAD_JOBLEVELS_FAILURE })
    }
  }
}

function loadMinistries() {
  return async (dispatch: any) => {
    dispatch({ type: LOAD_MINISTRIES_REQUEST })
    try {
      const { data } = await axios.get('/Ministries/Genuine', {
        baseURL: portalApiBaseUrl,
      })
      dispatch({
        type: LOAD_MINISTRIES_SUCCESS,
        payload: { ministries: data },
      })
    } catch (err) {
      dispatch({ type: LOAD_MINISTRIES_FAILURE })
    }
  }
}

function loadDepartments(ministryId: number) {
  return async (dispatch: any) => {
    dispatch({ type: LOAD_DEPARTMENTS_REQUEST })
    try {
      const { data } = await axios.get(
        `/Ministries/${ministryId}/Departments`,
        {
          baseURL: portalApiBaseUrl,
        }
      )
      dispatch({
        type: LOAD_DEPARTMENTS_SUCCESS,
        payload: { departments: data },
      })
    } catch (err) {
      dispatch({ type: LOAD_DEPARTMENTS_FAILURE })
    }
  }
}

function loadStateEnterprises() {
  return async (dispatch: any) => {
    dispatch({ type: LOAD_STATE_ENTERPRISES_REQUEST })
    try {
      const { data } = await axios.get('/StateEnterprises/Genuine', {
        baseURL: portalApiBaseUrl,
      })
      dispatch({
        type: LOAD_STATE_ENTERPRISES_SUCCESS,
        payload: { stateEnterprises: data },
      })
    } catch (err) {
      dispatch({ type: LOAD_STATE_ENTERPRISES_FAILURE })
    }
  }
}

function loadOccupations() {
  return async (dispatch: any) => {
    dispatch({ type: LOAD_OCCUPATIONS_REQUEST })
    try {
      const { data } = await axios.get('/Occupations', {
        baseURL: portalApiBaseUrl,
      })
      dispatch({
        type: LOAD_OCCUPATIONS_SUCCESS,
        payload: { occupations: data },
      })
    } catch (err) {
      dispatch({ type: LOAD_OCCUPATIONS_FAILURE })
    }
  }
}

function loadPositions() {
  return async (dispatch: any) => {
    dispatch({ type: LOAD_POSITIONS_REQUEST })
    try {
      const { data } = await axios.get('/constants/position', {
        baseURL: portalApiBaseUrl,
      })
      dispatch({
        type: LOAD_POSITIONS_SUCCESS,
        payload: { positions: data },
      })
    } catch (err) {
      dispatch({ type: LOAD_POSITIONS_FAILURE })
    }
  }
}

function checkPresence(nationalId: string) {
  return async (dispatch: any) => {
    dispatch({ type: CHECK_PRESENCE_REQUEST })
    try {
      const { data } = await axios.get(`/Users/${nationalId}/Presence`, {
        baseURL: portalApiBaseUrl,
      })
      dispatch({
        type: CHECK_PRESENCE_SUCCESS,
        payload: {
          presence: data.presence,
          message: data.presence
            ? 'เลขประจำตัวประชาชนนี้ได้ทำการสมัครแล้ว'
            : 'สามารถใช้เลขประจำตัวประชาชนนี้ได้',
          isValid: !data.presence,
        },
      })
    } catch (err) {
      dispatch({
        type: CHECK_PRESENCE_FAILURE,
        payload: { message: 'เกิดข้อผิดพลาดในการตรวจสอบ' },
      })
    }
  }
}

interface MemberData {
  id: string
  userTypeId: number
  title: string
  firstName: string
  lastName: string
  gender: string
  educationId: number
  birthYear: string
  email: string
  // Type 1 fields
  m1_JobTitle?: string
  m1_JobTypeId?: number
  m1_JobLevelId?: number
  m1_MinistryId?: number
  m1_DepartmentId?: number
  m1_Division?: string
  m1_JobStartDate?: string
  // Type 2 fields
  m2_JobTitle?: string
  m2_JobTypeId?: number
  m2_JobLevel?: string
  m2_MinistryId?: number
  m2_DepartmentId?: number
  m2_Division?: string
  m2_JobStartDate?: string
  // Type 3 fields
  m3_JobTitle?: string
  m3_JobTypeId?: number
  m3_JobLevel?: string
  m3_MinistryId?: number
  m3_DepartmentId?: number
  m3_Division?: string
  m3_JobStartDate?: string
  // Type 4 fields
  m4_JobTitle?: string
  m4_StateEnterpriseId?: number
  m4_JobStartDate?: string
  // Type 5 fields
  m5_JobTitle?: string
  m5_OccupationId?: number
  m5_Workplace?: string
}

function submitSignup(memberData: MemberData) {
  return async (dispatch: any) => {
    dispatch({ type: SUBMIT_SIGNUP_REQUEST })
    try {
      const { data } = await axios.post('/Members', memberData, {
        baseURL: portalApiBaseUrl,
        headers: {
          'Content-Type': 'application/json',
        },
      })
      dispatch({
        type: SUBMIT_SIGNUP_SUCCESS,
        payload: {
          message: 'ท่านสมัครสมาชิกเรียบร้อยแล้ว',
          data: data,
        },
      })
      return { success: true, data }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        `เกิดข้อผิดพลาดในการสมัครสมาชิก (${err.response?.status || 'Unknown'})`
      dispatch({
        type: SUBMIT_SIGNUP_FAILURE,
        payload: { message: errorMessage },
      })
      return { success: false, error: errorMessage }
    }
  }
}

// MemberUpdateData interface for PUT /Members/{id}
interface MemberUpdateData {
  userTypeId: number
  title: string
  firstName: string
  lastName: string
  gender: string
  educationId: number
  birthYear: string
  email: string
  // Type 1 fields
  m1_JobTitle?: string
  m1_JobTypeId?: number
  m1_JobLevelId?: number
  m1_MinistryId?: number
  m1_DepartmentId?: number
  m1_Division?: string
  m1_JobStartDate?: string
  // Type 2 fields
  m2_JobTitle?: string
  m2_JobTypeId?: number
  m2_JobLevel?: string
  m2_MinistryId?: number
  m2_DepartmentId?: number
  m2_Division?: string
  m2_JobStartDate?: string
  // Type 3 fields
  m3_JobTitle?: string
  m3_JobTypeId?: number
  m3_JobLevel?: string
  m3_MinistryId?: number
  m3_DepartmentId?: number
  m3_Division?: string
  m3_JobStartDate?: string
  // Type 4 fields
  m4_JobTitle?: string
  m4_StateEnterpriseId?: number
  m4_JobStartDate?: string
  // Type 5 fields
  m5_JobTitle?: string
  m5_OccupationId?: number
  m5_Workplace?: string
}

function updateMember(memberId: string, memberData: MemberUpdateData) {
  return async (dispatch: any) => {
    dispatch({ type: UPDATE_MEMBER_REQUEST })
    try {
      const { data } = await axios.put(`/Members/${memberId}`, memberData, {
        baseURL: portalApiBaseUrl,
        headers: {
          'Content-Type': 'application/json',
        },
      })
      dispatch({
        type: UPDATE_MEMBER_SUCCESS,
        payload: {
          message: 'บันทึกข้อมูลส่วนบุคคลเรียบร้อยแล้ว',
          data: data,
        },
      })
      return { success: true, data }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        `เกิดข้อผิดพลาดในการบันทึกข้อมูล (${err.response?.status || 'Unknown'})`
      dispatch({
        type: UPDATE_MEMBER_FAILURE,
        payload: { message: errorMessage },
      })
      return { success: false, error: errorMessage }
    }
  }
}

function clearSignupState() {
  return { type: CLEAR_SIGNUP_STATE }
}

function clearPresenceCheck() {
  return { type: CLEAR_PRESENCE_CHECK }
}

function clearDepartments() {
  return { type: CLEAR_DEPARTMENTS }
}

export {
  CHECK_PRESENCE_FAILURE,
  CHECK_PRESENCE_REQUEST,
  CHECK_PRESENCE_SUCCESS,
  checkPresence,
  CLEAR_DEPARTMENTS,
  CLEAR_PRESENCE_CHECK,
  CLEAR_SIGNUP_STATE,
  clearDepartments,
  clearPresenceCheck,
  clearSignupState,
  LOAD_DEPARTMENTS_FAILURE,
  LOAD_DEPARTMENTS_REQUEST,
  LOAD_DEPARTMENTS_SUCCESS,
  LOAD_EDUCATIONS_FAILURE,
  // Action Types
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
  loadDepartments,
  // Action Creators
  loadEducations,
  loadJobLevels,
  loadJobTypes1,
  loadJobTypes2,
  loadJobTypes3,
  loadMinistries,
  loadOccupations,
  loadPositions,
  loadStateEnterprises,
  SUBMIT_SIGNUP_FAILURE,
  SUBMIT_SIGNUP_REQUEST,
  SUBMIT_SIGNUP_SUCCESS,
  submitSignup,
  UPDATE_MEMBER_FAILURE,
  UPDATE_MEMBER_REQUEST,
  UPDATE_MEMBER_SUCCESS,
  updateMember,
}
