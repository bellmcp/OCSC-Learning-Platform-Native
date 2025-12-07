import DateTimePicker from '@react-native-community/datetimepicker'
import { Picker } from '@react-native-picker/picker'
import { router } from 'expo-router'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  BackHandler,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { useThemeColor } from '@/hooks/useThemeColor'
import * as signupActions from '@/modules/signup/actions'
import * as uiActions from '@/modules/ui/actions'
import { RootState } from '@/store/types'

// User type data with corresponding API userTypeId
const userTypes = [
  {
    id: 'civil_servant',
    userTypeId: 1,
    title: 'ข้าราชการ\nพลเรือนสามัญ',
    icon: 'briefcase',
  },
  {
    id: 'other_official',
    userTypeId: 2,
    title: 'ข้าราชการ\nประเภทอื่น',
    icon: 'graduationcap',
  },
  {
    id: 'government_staff',
    userTypeId: 3,
    title: 'เจ้าหน้าที่\nของรัฐ',
    icon: 'building.2',
  },
  {
    id: 'state_enterprise',
    userTypeId: 4,
    title: 'พนักงาน\nรัฐวิสาหกิจ',
    icon: 'building.columns',
  },
  {
    id: 'general_public',
    userTypeId: 5,
    title: 'บุคคลทั่วไป',
    icon: 'person.crop.circle',
  },
]

// Gender options
const genderOptions = [
  { value: 'm', label: 'ชาย' },
  { value: 'f', label: 'หญิง' },
]

// Generate Thai Buddhist year options (current year - 80 to current year)
const generateYearOptions = () => {
  const currentBuddhistYear = new Date().getFullYear() + 543
  const years = []
  for (
    let year = currentBuddhistYear;
    year >= currentBuddhistYear - 80;
    year--
  ) {
    years.push({ value: String(year), label: String(year) })
  }
  return years
}

export default function RegisterScreen() {
  const dispatch = useDispatch()
  const backgroundColor = useThemeColor({}, 'background')
  const tintColor = useThemeColor({}, 'tint')
  const iconColor = useThemeColor({}, 'icon')

  // Redux state
  const {
    educations,
    jobTypes1,
    jobTypes2,
    jobTypes3,
    jobLevels,
    ministries,
    departments,
    stateEnterprises,
    occupations,
    positions,
    isEducationsLoading,
    isMinistriesLoading,
    isDepartmentsLoading,
    isCheckingPresence,
    isSubmitting,
    presenceCheck,
    submitResult,
  } = useSelector((state: RootState) => state.signup)

  // Local state
  const [selectedUserType, setSelectedUserType] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(1)

  // Account form state
  const [nationalId, setNationalId] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Personal info form state
  const [title, setTitle] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [birthYear, setBirthYear] = useState('')
  const [gender, setGender] = useState('')
  const [educationId, setEducationId] = useState<number | null>(null)
  const [email, setEmail] = useState('')

  // Type-specific form state (Types 1, 2, 3)
  const [jobTypeId, setJobTypeId] = useState<number | null>(null)
  const [jobLevelId, setJobLevelId] = useState<number | null>(null)
  const [jobLevel, setJobLevel] = useState('') // For types 2, 3 (text input)
  const [ministryId, setMinistryId] = useState<number | null>(null)
  const [departmentId, setDepartmentId] = useState<number | null>(null)
  const [division, setDivision] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [jobStartDate, setJobStartDate] = useState<Date | null>(null)
  const [showDatePicker, setShowDatePicker] = useState(false)

  // Type 4 specific
  const [stateEnterpriseId, setStateEnterpriseId] = useState<number | null>(
    null
  )

  // Type 5 specific
  const [occupationId, setOccupationId] = useState<number | null>(null)
  const [workplace, setWorkplace] = useState('')

  // Picker modal state
  const [showPickerModal, setShowPickerModal] = useState<string | null>(null)
  const [tempPickerValue, setTempPickerValue] = useState<any>(null)

  // Form validation errors
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Exit confirmation modal state
  const [exitModalVisible, setExitModalVisible] = useState(false)

  // Year options memoized
  const yearOptions = useMemo(() => generateYearOptions(), [])

  // Get selected user type object
  const selectedUserTypeObj = useMemo(
    () => userTypes.find((ut) => ut.id === selectedUserType),
    [selectedUserType]
  )

  // Load initial data when step 2 is entered
  useEffect(() => {
    if (currentStep === 2 && selectedUserType) {
      // Load common data
      dispatch(signupActions.loadEducations() as any)

      // Load type-specific data
      const userTypeId = selectedUserTypeObj?.userTypeId
      if (userTypeId === 1) {
        dispatch(signupActions.loadJobTypes1() as any)
        dispatch(signupActions.loadJobLevels() as any)
        dispatch(signupActions.loadMinistries() as any)
        dispatch(signupActions.loadPositions() as any)
      } else if (userTypeId === 2) {
        dispatch(signupActions.loadJobTypes2() as any)
        dispatch(signupActions.loadMinistries() as any)
      } else if (userTypeId === 3) {
        dispatch(signupActions.loadJobTypes3() as any)
        dispatch(signupActions.loadMinistries() as any)
      } else if (userTypeId === 4) {
        dispatch(signupActions.loadStateEnterprises() as any)
      } else if (userTypeId === 5) {
        dispatch(signupActions.loadOccupations() as any)
      }
    }
  }, [currentStep, selectedUserType, dispatch, selectedUserTypeObj])

  // Load departments when ministry changes
  useEffect(() => {
    if (ministryId) {
      dispatch(signupActions.clearDepartments() as any)
      setDepartmentId(null)
      setJobTitle('')
      dispatch(signupActions.loadDepartments(ministryId) as any)
    }
  }, [ministryId, dispatch])

  // Clear job title when department changes (for Type 1)
  useEffect(() => {
    if (selectedUserTypeObj?.userTypeId === 1) {
      setJobTitle('')
    }
  }, [departmentId, selectedUserTypeObj])

  // Handle submit result
  useEffect(() => {
    if (submitResult) {
      if (submitResult.success) {
        dispatch(
          uiActions.setFlashMessage(submitResult.message, 'success') as any
        )
        dispatch(signupActions.clearSignupState() as any)
        router.replace('/(tabs)/account')
      } else {
        dispatch(
          uiActions.setFlashMessage(submitResult.message, 'error') as any
        )
      }
    }
  }, [submitResult, dispatch])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      dispatch(signupActions.clearSignupState() as any)
    }
  }, [dispatch])

  const handleUserTypeSelect = (userTypeId: string) => {
    setSelectedUserType(userTypeId)
  }

  const handleNextStep = () => {
    if (selectedUserType) {
      setCurrentStep(2)
    }
  }

  const handleBackToStep1 = () => {
    setCurrentStep(1)
    // Reset form state
    resetFormState()
  }

  const resetFormState = () => {
    setNationalId('')
    setPassword('')
    setConfirmPassword('')
    setTitle('')
    setFirstName('')
    setLastName('')
    setBirthYear('')
    setGender('')
    setEducationId(null)
    setEmail('')
    setJobTypeId(null)
    setJobLevelId(null)
    setJobLevel('')
    setMinistryId(null)
    setDepartmentId(null)
    setDivision('')
    setJobTitle('')
    setJobStartDate(null)
    setStateEnterpriseId(null)
    setOccupationId(null)
    setWorkplace('')
    setErrors({})
    dispatch(signupActions.clearPresenceCheck() as any)
    dispatch(signupActions.clearDepartments() as any)
  }

  // Check if user has entered any form data
  const hasFormData = useCallback(() => {
    // Check if in step 1 with no selection
    if (currentStep === 1 && !selectedUserType) {
      return false
    }
    // Check if in step 2 with any data
    if (currentStep === 2) {
      return !!(
        nationalId ||
        password ||
        confirmPassword ||
        title ||
        firstName ||
        lastName ||
        birthYear ||
        gender ||
        educationId ||
        email ||
        jobTypeId ||
        jobLevelId ||
        jobLevel ||
        ministryId ||
        departmentId ||
        division ||
        jobTitle ||
        jobStartDate ||
        stateEnterpriseId ||
        occupationId ||
        workplace
      )
    }
    return !!selectedUserType
  }, [
    currentStep,
    selectedUserType,
    nationalId,
    password,
    confirmPassword,
    title,
    firstName,
    lastName,
    birthYear,
    gender,
    educationId,
    email,
    jobTypeId,
    jobLevelId,
    jobLevel,
    ministryId,
    departmentId,
    division,
    jobTitle,
    jobStartDate,
    stateEnterpriseId,
    occupationId,
    workplace,
  ])

  // Handle back button press
  const handleBackPress = useCallback(() => {
    if (hasFormData()) {
      setExitModalVisible(true)
    } else {
      router.back()
    }
  }, [hasFormData])

  // Handle exit modal cancel
  const handleExitCancel = () => {
    setExitModalVisible(false)
  }

  // Handle exit modal confirm
  const handleExitConfirm = () => {
    setExitModalVisible(false)
    dispatch(signupActions.clearSignupState() as any)
    router.back()
  }

  // Handle Android hardware back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (hasFormData()) {
          setExitModalVisible(true)
          return true
        }
        return false
      }
    )
    return () => backHandler.remove()
  }, [hasFormData])

  const handleCheckNationalId = () => {
    if (!nationalId || nationalId.length !== 13) {
      setErrors((prev) => ({
        ...prev,
        nationalId: 'กรุณากรอกเลขประจำตัวประชาชน 13 หลัก',
      }))
      return
    }
    setErrors((prev) => ({ ...prev, nationalId: '' }))
    dispatch(signupActions.checkPresence(nationalId) as any)
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    const userTypeId = selectedUserTypeObj?.userTypeId

    // Account validation
    if (!nationalId || nationalId.length !== 13) {
      newErrors.nationalId = 'กรุณากรอกเลขประจำตัวประชาชน 13 หลัก'
    }
    if (!password || password.length < 6) {
      newErrors.password = 'กรุณากรอกรหัสผ่านอย่างน้อย 6 ตัวอักษร'
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'รหัสผ่านไม่ตรงกัน'
    }

    // Personal info validation
    if (!title) newErrors.title = 'กรุณากรอกคำนำหน้าชื่อ'
    if (!firstName) newErrors.firstName = 'กรุณากรอกชื่อ'
    if (!lastName) newErrors.lastName = 'กรุณากรอกนามสกุล'
    if (!birthYear) newErrors.birthYear = 'กรุณาเลือกปีเกิด'
    if (!gender) newErrors.gender = 'กรุณาเลือกเพศ'
    if (!educationId) newErrors.educationId = 'กรุณาเลือกระดับการศึกษา'
    if (!email) newErrors.email = 'กรุณากรอกอีเมล'
    else if (!/\S+@\S+\.\S+/.test(email))
      newErrors.email = 'รูปแบบอีเมลไม่ถูกต้อง'

    // Type-specific validation
    if (userTypeId === 1) {
      if (!jobStartDate) newErrors.jobStartDate = 'กรุณาเลือกวันที่รับราชการ'
      if (!ministryId) newErrors.ministryId = 'กรุณาเลือกกระทรวง'
      if (!departmentId)
        newErrors.departmentId = 'กรุณาเลือกส่วนราชการต้นสังกัด'
      if (!jobTypeId) newErrors.jobTypeId = 'กรุณาเลือกประเภทตำแหน่ง'
      if (!jobTitle) newErrors.jobTitle = 'กรุณาเลือกตำแหน่ง'
      if (!jobLevelId) newErrors.jobLevelId = 'กรุณาเลือกระดับตำแหน่ง'
    } else if (userTypeId === 2) {
      if (!jobStartDate) newErrors.jobStartDate = 'กรุณาเลือกวันที่รับราชการ'
      if (!ministryId) newErrors.ministryId = 'กรุณาเลือกกระทรวง'
      if (!departmentId)
        newErrors.departmentId = 'กรุณาเลือกส่วนราชการต้นสังกัด'
      if (!jobTypeId) newErrors.jobTypeId = 'กรุณาเลือกประเภทข้าราชการ'
      if (!jobTitle) newErrors.jobTitle = 'กรุณากรอกตำแหน่ง'
    } else if (userTypeId === 3) {
      if (!jobStartDate) newErrors.jobStartDate = 'กรุณาเลือกวันที่รับราชการ'
      if (!ministryId) newErrors.ministryId = 'กรุณาเลือกกระทรวง'
      if (!departmentId)
        newErrors.departmentId = 'กรุณาเลือกส่วนราชการต้นสังกัด'
      if (!jobTypeId) newErrors.jobTypeId = 'กรุณาเลือกประเภทเจ้าหน้าที่ของรัฐ'
      if (!jobTitle) newErrors.jobTitle = 'กรุณากรอกตำแหน่ง'
    } else if (userTypeId === 4) {
      if (!stateEnterpriseId)
        newErrors.stateEnterpriseId = 'กรุณาเลือกรัฐวิสาหกิจ'
      if (!jobStartDate) newErrors.jobStartDate = 'กรุณาเลือกวันที่เริ่มทำงาน'
    } else if (userTypeId === 5) {
      if (!occupationId) newErrors.occupationId = 'กรุณาเลือกอาชีพ'
    }

    // Check presence
    if (!presenceCheck?.isValid) {
      newErrors.nationalId = 'กรุณาตรวจสอบเลขประจำตัวประชาชนก่อน'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const formatDateForAPI = (date: Date | null): string => {
    if (!date) return ''
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      dispatch(
        uiActions.setFlashMessage('กรุณากรอกข้อมูลให้ครบถ้วน', 'error') as any
      )
      return
    }

    const userTypeId = selectedUserTypeObj?.userTypeId || 0
    const memberData: any = {
      id: nationalId,
      userTypeId: userTypeId,
      title: title,
      firstName: firstName,
      lastName: lastName,
      gender: gender,
      educationId: educationId,
      birthYear: birthYear,
      email: email,
    }

    // Add type-specific fields
    if (userTypeId === 1) {
      memberData.m1_JobTitle = jobTitle
      memberData.m1_JobTypeId = jobTypeId
      memberData.m1_JobLevelId = jobLevelId
      memberData.m1_MinistryId = ministryId
      memberData.m1_DepartmentId = departmentId
      memberData.m1_Division = division
      memberData.m1_JobStartDate = formatDateForAPI(jobStartDate)
    } else if (userTypeId === 2) {
      memberData.m2_JobTitle = jobTitle
      memberData.m2_JobTypeId = jobTypeId
      memberData.m2_JobLevel = jobLevel
      memberData.m2_MinistryId = ministryId
      memberData.m2_DepartmentId = departmentId
      memberData.m2_Division = division
      memberData.m2_JobStartDate = formatDateForAPI(jobStartDate)
    } else if (userTypeId === 3) {
      memberData.m3_JobTitle = jobTitle
      memberData.m3_JobTypeId = jobTypeId
      memberData.m3_JobLevel = jobLevel
      memberData.m3_MinistryId = ministryId
      memberData.m3_DepartmentId = departmentId
      memberData.m3_Division = division
      memberData.m3_JobStartDate = formatDateForAPI(jobStartDate)
    } else if (userTypeId === 4) {
      memberData.m4_JobTitle = jobTitle
      memberData.m4_StateEnterpriseId = stateEnterpriseId
      memberData.m4_JobStartDate = formatDateForAPI(jobStartDate)
    } else if (userTypeId === 5) {
      memberData.m5_JobTitle = jobTitle
      memberData.m5_OccupationId = occupationId
      memberData.m5_Workplace = workplace
    }

    dispatch(signupActions.submitSignup(memberData) as any)
  }

  // Filter job levels based on selected job type (for Type 1)
  const filteredJobLevels = useMemo(() => {
    if (!jobTypeId || selectedUserTypeObj?.userTypeId !== 1) return []

    return jobLevels.filter((level) => {
      if (jobTypeId === 1 && level.id > 0 && level.id < 5) return true
      if (jobTypeId === 2 && level.id > 4 && level.id < 10) return true
      if (jobTypeId >= 3 && level.id > 9) return true
      return false
    })
  }, [jobTypeId, jobLevels, selectedUserTypeObj])

  // Filter positions based on selected ministry and department (for Type 1)
  const filteredPositions = useMemo(() => {
    if (!ministryId || !departmentId || selectedUserTypeObj?.userTypeId !== 1)
      return []
    return positions.filter(
      (pos) =>
        pos.ministryId === ministryId && pos.departmentId === departmentId
    )
  }, [ministryId, departmentId, positions, selectedUserTypeObj])

  // Render picker modal
  const renderPickerModal = useCallback(() => {
    if (!showPickerModal) return null

    let options: { value: any; label: string }[] = []
    let title = ''
    let currentValue: any = null

    switch (showPickerModal) {
      case 'gender':
        options = genderOptions
        title = 'เลือกเพศ'
        currentValue = gender
        break
      case 'birthYear':
        options = yearOptions
        title = 'เลือกปีเกิด'
        currentValue = birthYear
        break
      case 'educationId':
        options = educations.map((e) => ({ value: e.id, label: e.name }))
        title = 'เลือกระดับการศึกษา'
        currentValue = educationId
        break
      case 'ministryId':
        options = ministries.map((m) => ({ value: m.id, label: m.name }))
        title = 'เลือกกระทรวง'
        currentValue = ministryId
        break
      case 'departmentId':
        options = departments.map((d) => ({ value: d.id, label: d.name }))
        title = 'เลือกส่วนราชการต้นสังกัด'
        currentValue = departmentId
        break
      case 'jobTypeId':
        if (selectedUserTypeObj?.userTypeId === 1) {
          options = jobTypes1.map((j) => ({ value: j.id, label: j.name }))
          title = 'เลือกประเภทตำแหน่ง'
        } else if (selectedUserTypeObj?.userTypeId === 2) {
          options = jobTypes2.map((j) => ({ value: j.id, label: j.name }))
          title = 'เลือกประเภทข้าราชการ'
        } else if (selectedUserTypeObj?.userTypeId === 3) {
          options = jobTypes3.map((j) => ({ value: j.id, label: j.name }))
          title = 'เลือกประเภทเจ้าหน้าที่ของรัฐ'
        }
        currentValue = jobTypeId
        break
      case 'jobLevelId':
        options = filteredJobLevels.map((j) => ({ value: j.id, label: j.name }))
        title = 'เลือกระดับตำแหน่ง'
        currentValue = jobLevelId
        break
      case 'jobTitle':
        options = filteredPositions.map((p) => ({
          value: p.name,
          label: p.name,
        }))
        title = 'เลือกตำแหน่ง'
        currentValue = jobTitle
        break
      case 'stateEnterpriseId':
        options = stateEnterprises.map((s) => ({ value: s.id, label: s.name }))
        title = 'เลือกรัฐวิสาหกิจ'
        currentValue = stateEnterpriseId
        break
      case 'occupationId':
        options = occupations.map((o) => ({ value: o.id, label: o.name }))
        title = 'เลือกอาชีพ'
        currentValue = occupationId
        break
    }

    return (
      <Modal
        visible={!!showPickerModal}
        transparent
        animationType='slide'
        onRequestClose={() => setShowPickerModal(null)}
      >
        <View style={styles.pickerModalOverlay}>
          <View style={styles.pickerModalContent}>
            <View style={styles.pickerModalHeader}>
              <TouchableOpacity onPress={() => setShowPickerModal(null)}>
                <ThemedText style={styles.pickerModalCancel}>ยกเลิก</ThemedText>
              </TouchableOpacity>
              <ThemedText style={styles.pickerModalTitle}>{title}</ThemedText>
              <TouchableOpacity
                onPress={() => {
                  const valueToSet = tempPickerValue ?? currentValue
                  switch (showPickerModal) {
                    case 'gender':
                      setGender(valueToSet)
                      break
                    case 'birthYear':
                      setBirthYear(valueToSet)
                      break
                    case 'educationId':
                      setEducationId(valueToSet)
                      break
                    case 'ministryId':
                      setMinistryId(valueToSet)
                      break
                    case 'departmentId':
                      setDepartmentId(valueToSet)
                      break
                    case 'jobTypeId':
                      setJobTypeId(valueToSet)
                      setJobLevelId(null) // Reset job level when job type changes
                      break
                    case 'jobLevelId':
                      setJobLevelId(valueToSet)
                      break
                    case 'jobTitle':
                      setJobTitle(valueToSet)
                      break
                    case 'stateEnterpriseId':
                      setStateEnterpriseId(valueToSet)
                      break
                    case 'occupationId':
                      setOccupationId(valueToSet)
                      break
                  }
                  setTempPickerValue(null)
                  setShowPickerModal(null)
                }}
              >
                <ThemedText
                  style={[styles.pickerModalDone, { color: tintColor }]}
                >
                  เลือก
                </ThemedText>
              </TouchableOpacity>
            </View>
            <Picker
              selectedValue={tempPickerValue ?? currentValue}
              onValueChange={(value: any) => setTempPickerValue(value)}
              style={styles.picker}
            >
              <Picker.Item label='-- เลือก --' value={null} />
              {options.map((opt) => (
                <Picker.Item
                  key={opt.value}
                  label={opt.label}
                  value={opt.value}
                />
              ))}
            </Picker>
          </View>
        </View>
      </Modal>
    )
  }, [
    showPickerModal,
    tempPickerValue,
    tintColor,
    gender,
    birthYear,
    educationId,
    ministryId,
    departmentId,
    jobTypeId,
    jobLevelId,
    jobTitle,
    stateEnterpriseId,
    occupationId,
    educations,
    ministries,
    departments,
    jobTypes1,
    jobTypes2,
    jobTypes3,
    filteredJobLevels,
    filteredPositions,
    stateEnterprises,
    occupations,
    selectedUserTypeObj,
    yearOptions,
  ])

  // Get display text for a picker
  const getPickerDisplayText = (
    fieldName: string,
    value: any,
    options: Array<{ id: number; name: string }>,
    placeholder: string
  ) => {
    if (!value) return placeholder
    const found = options.find((o) => o.id === value)
    return found?.name || placeholder
  }

  // Render picker field
  const renderPickerField = (
    label: string,
    fieldName: string,
    displayText: string,
    error?: string,
    disabled?: boolean
  ) => (
    <ThemedView style={styles.inputContainer}>
      <ThemedText style={styles.inputLabel}>
        {label} <ThemedText style={styles.required}>*</ThemedText>
      </ThemedText>
      <TouchableOpacity
        style={[
          styles.inputWrapper,
          styles.pickerWrapper,
          error && styles.inputError,
          disabled && styles.disabledInput,
        ]}
        onPress={() => !disabled && setShowPickerModal(fieldName)}
        disabled={disabled}
      >
        <ThemedText
          style={[
            styles.pickerText,
            !displayText.includes('เลือก') && styles.pickerTextSelected,
            disabled && styles.disabledText,
          ]}
        >
          {displayText}
        </ThemedText>
        <IconSymbol name='chevron.down' size={16} color={iconColor} />
      </TouchableOpacity>
      {error && <ThemedText style={styles.errorText}>{error}</ThemedText>}
    </ThemedView>
  )

  // Render date picker field
  const renderDateField = (
    label: string,
    value: Date | null,
    onChange: (date: Date | null) => void,
    error?: string
  ) => (
    <ThemedView style={styles.inputContainer}>
      <ThemedText style={styles.inputLabel}>
        {label} <ThemedText style={styles.required}>*</ThemedText>
      </ThemedText>
      <TouchableOpacity
        style={[
          styles.inputWrapper,
          styles.pickerWrapper,
          error && styles.inputError,
        ]}
        onPress={() => setShowDatePicker(true)}
      >
        <IconSymbol
          name='calendar'
          size={20}
          color={iconColor}
          style={styles.inputIcon}
        />
        <ThemedText
          style={[styles.pickerText, value && styles.pickerTextSelected]}
        >
          {value
            ? `${value.getDate()}/${value.getMonth() + 1}/${
                value.getFullYear() + 543
              }`
            : 'เลือกวันที่'}
        </ThemedText>
      </TouchableOpacity>
      {error && <ThemedText style={styles.errorText}>{error}</ThemedText>}
      {showDatePicker && (
        <DateTimePicker
          value={value || new Date()}
          mode='date'
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event: any, selectedDate: Date | undefined) => {
            setShowDatePicker(Platform.OS === 'ios')
            if (selectedDate) {
              onChange(selectedDate)
            }
          }}
          maximumDate={new Date()}
        />
      )}
    </ThemedView>
  )

  // Render Type 1 specific fields (ข้าราชการพลเรือนสามัญ)
  const renderType1Fields = () => (
    <>
      <ThemedText type='subtitle' style={styles.sectionTitle}>
        ข้อมูลตำแหน่งงาน
      </ThemedText>

      {renderDateField(
        'วันที่รับราชการ',
        jobStartDate,
        setJobStartDate,
        errors.jobStartDate
      )}

      {renderPickerField(
        'กระทรวง',
        'ministryId',
        getPickerDisplayText(
          'ministryId',
          ministryId,
          ministries,
          '-- เลือกกระทรวง --'
        ),
        errors.ministryId
      )}

      {renderPickerField(
        'ส่วนราชการต้นสังกัด',
        'departmentId',
        getPickerDisplayText(
          'departmentId',
          departmentId,
          departments,
          '-- เลือกส่วนราชการ --'
        ),
        errors.departmentId,
        !ministryId
      )}

      <ThemedView style={styles.inputContainer}>
        <ThemedText style={styles.inputLabel}>หน่วยงานที่สังกัด</ThemedText>
        <ThemedView style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            value={division}
            onChangeText={setDivision}
            placeholder='หน่วยงานที่สังกัด'
            placeholderTextColor='#999'
          />
        </ThemedView>
      </ThemedView>

      {renderPickerField(
        'ประเภทตำแหน่ง',
        'jobTypeId',
        getPickerDisplayText(
          'jobTypeId',
          jobTypeId,
          jobTypes1,
          '-- เลือกประเภทตำแหน่ง --'
        ),
        errors.jobTypeId
      )}

      {renderPickerField(
        'ตำแหน่ง',
        'jobTitle',
        jobTitle || '-- เลือกตำแหน่ง --',
        errors.jobTitle,
        !departmentId
      )}

      {renderPickerField(
        'ระดับตำแหน่ง',
        'jobLevelId',
        getPickerDisplayText(
          'jobLevelId',
          jobLevelId,
          filteredJobLevels,
          '-- เลือกระดับตำแหน่ง --'
        ),
        errors.jobLevelId,
        !jobTypeId
      )}
    </>
  )

  // Render Type 2 specific fields (ข้าราชการประเภทอื่น)
  const renderType2Fields = () => (
    <>
      <ThemedText type='subtitle' style={styles.sectionTitle}>
        ข้อมูลตำแหน่งงาน
      </ThemedText>

      {renderDateField(
        'วันที่รับราชการ',
        jobStartDate,
        setJobStartDate,
        errors.jobStartDate
      )}

      {renderPickerField(
        'กระทรวง หรือ หน่วยงานเทียบเท่า',
        'ministryId',
        getPickerDisplayText(
          'ministryId',
          ministryId,
          ministries,
          '-- เลือกกระทรวง --'
        ),
        errors.ministryId
      )}

      {renderPickerField(
        'ส่วนราชการต้นสังกัด',
        'departmentId',
        getPickerDisplayText(
          'departmentId',
          departmentId,
          departments,
          '-- เลือกส่วนราชการ --'
        ),
        errors.departmentId,
        !ministryId
      )}

      <ThemedView style={styles.inputContainer}>
        <ThemedText style={styles.inputLabel}>หน่วยงานที่สังกัด</ThemedText>
        <ThemedView style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            value={division}
            onChangeText={setDivision}
            placeholder='หน่วยงานที่สังกัด'
            placeholderTextColor='#999'
          />
        </ThemedView>
      </ThemedView>

      {renderPickerField(
        'ประเภทข้าราชการ',
        'jobTypeId',
        getPickerDisplayText(
          'jobTypeId',
          jobTypeId,
          jobTypes2,
          '-- เลือกประเภทข้าราชการ --'
        ),
        errors.jobTypeId
      )}

      <ThemedView style={styles.inputContainer}>
        <ThemedText style={styles.inputLabel}>
          ตำแหน่ง <ThemedText style={styles.required}>*</ThemedText>
        </ThemedText>
        <ThemedView
          style={[styles.inputWrapper, errors.jobTitle && styles.inputError]}
        >
          <TextInput
            style={styles.textInput}
            value={jobTitle}
            onChangeText={setJobTitle}
            placeholder='กรอกตำแหน่ง'
            placeholderTextColor='#999'
          />
        </ThemedView>
        {errors.jobTitle && (
          <ThemedText style={styles.errorText}>{errors.jobTitle}</ThemedText>
        )}
      </ThemedView>

      <ThemedView style={styles.inputContainer}>
        <ThemedText style={styles.inputLabel}>ระดับ</ThemedText>
        <ThemedView style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            value={jobLevel}
            onChangeText={setJobLevel}
            placeholder='กรอกระดับ'
            placeholderTextColor='#999'
          />
        </ThemedView>
      </ThemedView>
    </>
  )

  // Render Type 3 specific fields (เจ้าหน้าที่ของรัฐ)
  const renderType3Fields = () => (
    <>
      <ThemedText type='subtitle' style={styles.sectionTitle}>
        ข้อมูลตำแหน่งงาน
      </ThemedText>

      {renderDateField(
        'วันที่รับราชการ',
        jobStartDate,
        setJobStartDate,
        errors.jobStartDate
      )}

      {renderPickerField(
        'กระทรวง หรือ หน่วยงานเทียบเท่า',
        'ministryId',
        getPickerDisplayText(
          'ministryId',
          ministryId,
          ministries,
          '-- เลือกกระทรวง --'
        ),
        errors.ministryId
      )}

      {renderPickerField(
        'ส่วนราชการต้นสังกัด',
        'departmentId',
        getPickerDisplayText(
          'departmentId',
          departmentId,
          departments,
          '-- เลือกส่วนราชการ --'
        ),
        errors.departmentId,
        !ministryId
      )}

      <ThemedView style={styles.inputContainer}>
        <ThemedText style={styles.inputLabel}>หน่วยงานที่สังกัด</ThemedText>
        <ThemedView style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            value={division}
            onChangeText={setDivision}
            placeholder='หน่วยงานที่สังกัด'
            placeholderTextColor='#999'
          />
        </ThemedView>
      </ThemedView>

      {renderPickerField(
        'ประเภทเจ้าหน้าที่ของรัฐ',
        'jobTypeId',
        getPickerDisplayText(
          'jobTypeId',
          jobTypeId,
          jobTypes3,
          '-- เลือกประเภทเจ้าหน้าที่ของรัฐ --'
        ),
        errors.jobTypeId
      )}

      <ThemedView style={styles.inputContainer}>
        <ThemedText style={styles.inputLabel}>
          ตำแหน่ง <ThemedText style={styles.required}>*</ThemedText>
        </ThemedText>
        <ThemedView
          style={[styles.inputWrapper, errors.jobTitle && styles.inputError]}
        >
          <TextInput
            style={styles.textInput}
            value={jobTitle}
            onChangeText={setJobTitle}
            placeholder='กรอกตำแหน่ง'
            placeholderTextColor='#999'
          />
        </ThemedView>
        {errors.jobTitle && (
          <ThemedText style={styles.errorText}>{errors.jobTitle}</ThemedText>
        )}
      </ThemedView>

      <ThemedView style={styles.inputContainer}>
        <ThemedText style={styles.inputLabel}>ระดับ</ThemedText>
        <ThemedView style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            value={jobLevel}
            onChangeText={setJobLevel}
            placeholder='กรอกระดับ'
            placeholderTextColor='#999'
          />
        </ThemedView>
      </ThemedView>
    </>
  )

  // Render Type 4 specific fields (พนักงานรัฐวิสาหกิจ)
  const renderType4Fields = () => (
    <>
      <ThemedText type='subtitle' style={styles.sectionTitle}>
        ข้อมูลตำแหน่งงาน
      </ThemedText>

      {renderPickerField(
        'รัฐวิสาหกิจ',
        'stateEnterpriseId',
        getPickerDisplayText(
          'stateEnterpriseId',
          stateEnterpriseId,
          stateEnterprises,
          '-- เลือกรัฐวิสาหกิจ --'
        ),
        errors.stateEnterpriseId
      )}

      {renderDateField(
        'วันที่เริ่มทำงาน',
        jobStartDate,
        setJobStartDate,
        errors.jobStartDate
      )}

      <ThemedView style={styles.inputContainer}>
        <ThemedText style={styles.inputLabel}>ตำแหน่ง</ThemedText>
        <ThemedView style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            value={jobTitle}
            onChangeText={setJobTitle}
            placeholder='กรอกตำแหน่ง'
            placeholderTextColor='#999'
          />
        </ThemedView>
      </ThemedView>
    </>
  )

  // Render Type 5 specific fields (บุคคลทั่วไป)
  const renderType5Fields = () => (
    <>
      <ThemedText type='subtitle' style={styles.sectionTitle}>
        ข้อมูลอาชีพ
      </ThemedText>

      {renderPickerField(
        'อาชีพ',
        'occupationId',
        getPickerDisplayText(
          'occupationId',
          occupationId,
          occupations,
          '-- เลือกอาชีพ --'
        ),
        errors.occupationId
      )}

      <ThemedView style={styles.inputContainer}>
        <ThemedText style={styles.inputLabel}>ตำแหน่ง</ThemedText>
        <ThemedView style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            value={jobTitle}
            onChangeText={setJobTitle}
            placeholder='กรอกตำแหน่ง'
            placeholderTextColor='#999'
          />
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.inputContainer}>
        <ThemedText style={styles.inputLabel}>ชื่อหน่วยงาน</ThemedText>
        <ThemedView style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            value={workplace}
            onChangeText={setWorkplace}
            placeholder='กรอกชื่อหน่วยงาน'
            placeholderTextColor='#999'
          />
        </ThemedView>
      </ThemedView>
    </>
  )

  // Render type-specific fields based on user type
  const renderTypeSpecificFields = () => {
    const userTypeId = selectedUserTypeObj?.userTypeId
    switch (userTypeId) {
      case 1:
        return renderType1Fields()
      case 2:
        return renderType2Fields()
      case 3:
        return renderType3Fields()
      case 4:
        return renderType4Fields()
      case 5:
        return renderType5Fields()
      default:
        return null
    }
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      {/* Fixed Header */}
      <ThemedView style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <IconSymbol name='chevron.left' size={24} color={iconColor} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(tabs)/account')}>
            <ThemedText type='title' style={styles.headerTitle}>
              สมัครสมาชิก
            </ThemedText>
          </TouchableOpacity>
          <View style={styles.headerRight} />
        </View>

        {/* Step Indicator */}
        <View style={styles.stepIndicator}>
          <View style={styles.stepContainer}>
            <View
              style={[styles.stepDot, currentStep >= 1 && styles.activeStepDot]}
            >
              <ThemedText
                style={[
                  styles.stepNumber,
                  currentStep >= 1 && styles.activeStepNumber,
                ]}
              >
                1
              </ThemedText>
            </View>
            <ThemedText
              style={[
                styles.stepText,
                currentStep >= 1 && styles.activeStepText,
              ]}
            >
              เลือกประเภทผู้ใช้
            </ThemedText>
          </View>
          <View
            style={[styles.stepLine, currentStep >= 2 && styles.activeStepLine]}
          />
          <View style={styles.stepContainer}>
            <View
              style={[styles.stepDot, currentStep >= 2 && styles.activeStepDot]}
            >
              <ThemedText
                style={[
                  styles.stepNumber,
                  currentStep >= 2 && styles.activeStepNumber,
                ]}
              >
                2
              </ThemedText>
            </View>
            <ThemedText
              style={[
                styles.stepText,
                currentStep >= 2 && styles.activeStepText,
              ]}
            >
              กรอกข้อมูล
            </ThemedText>
          </View>
        </View>
      </ThemedView>

      {/* Body Content */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps='handled'
      >
        {currentStep === 1 && (
          <ThemedView style={styles.step1Container}>
            <ThemedText type='subtitle' style={styles.stepTitle}>
              เลือกประเภทผู้ใช้
            </ThemedText>
            <ThemedText type='default' style={styles.stepDescription}>
              กรุณาเลือกประเภทผู้ใช้ที่ตรงกับคุณมากที่สุด
            </ThemedText>

            {/* User Type Grid */}
            <View style={styles.userTypeGrid}>
              {userTypes.map((userType, index) => (
                <TouchableOpacity
                  key={userType.id}
                  style={[
                    styles.userTypeItem,
                    selectedUserType === userType.id &&
                      styles.selectedUserTypeItem,
                    index === 4 && styles.lastItem,
                  ]}
                  onPress={() => handleUserTypeSelect(userType.id)}
                >
                  <View
                    style={[
                      styles.iconContainer,
                      selectedUserType === userType.id &&
                        styles.selectedIconContainer,
                    ]}
                  >
                    <IconSymbol
                      name={userType.icon as any}
                      size={32}
                      color={
                        selectedUserType === userType.id ? '#183A7C' : iconColor
                      }
                    />
                  </View>
                  <ThemedText
                    style={[
                      styles.userTypeTitle,
                      selectedUserType === userType.id &&
                        styles.selectedUserTypeTitle,
                    ]}
                    numberOfLines={2}
                  >
                    {userType.title}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </ThemedView>
        )}

        {currentStep === 2 && (
          <ThemedView style={styles.step2Container}>
            <ThemedText type='subtitle' style={styles.stepTitle}>
              กรอกข้อมูล
            </ThemedText>
            <ThemedText type='default' style={styles.stepDescription}>
              สมัครสมาชิกประเภท:{' '}
              <ThemedText style={styles.userTypeLabel}>
                {selectedUserTypeObj?.title.replace('\n', '')}
              </ThemedText>
            </ThemedText>

            {isEducationsLoading || isMinistriesLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size='large' color={tintColor} />
                <ThemedText style={styles.loadingText}>
                  กำลังโหลดข้อมูล...
                </ThemedText>
              </View>
            ) : (
              <ThemedView style={styles.formContainer}>
                {/* Account Creation Section */}
                <ThemedText type='subtitle' style={styles.sectionTitle}>
                  สร้างบัญชี
                </ThemedText>

                {/* National ID Input */}
                <ThemedView style={styles.inputContainer}>
                  <ThemedText style={styles.inputLabel}>
                    เลขประจำตัวประชาชน{' '}
                    <ThemedText style={styles.required}>*</ThemedText>
                  </ThemedText>
                  <ThemedView
                    style={[
                      styles.inputWrapper,
                      errors.nationalId && styles.inputError,
                    ]}
                  >
                    <IconSymbol
                      name='person'
                      size={20}
                      color={iconColor}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.textInput}
                      value={nationalId}
                      onChangeText={(text) => {
                        setNationalId(text.replace(/[^0-9]/g, ''))
                        dispatch(signupActions.clearPresenceCheck() as any)
                      }}
                      placeholder='เลขประจำตัวประชาชน 13 หลัก'
                      placeholderTextColor='#999'
                      keyboardType='numeric'
                      maxLength={13}
                    />
                  </ThemedView>
                  {errors.nationalId && (
                    <ThemedText style={styles.errorText}>
                      {errors.nationalId}
                    </ThemedText>
                  )}
                  {presenceCheck && (
                    <ThemedText
                      style={[
                        styles.presenceText,
                        presenceCheck.isValid
                          ? styles.presenceSuccess
                          : styles.presenceError,
                      ]}
                    >
                      {presenceCheck.message}
                    </ThemedText>
                  )}
                </ThemedView>

                {/* Password Input */}
                <ThemedView style={styles.inputContainer}>
                  <ThemedText style={styles.inputLabel}>
                    รหัสผ่าน <ThemedText style={styles.required}>*</ThemedText>
                  </ThemedText>
                  <ThemedView
                    style={[
                      styles.inputWrapper,
                      errors.password && styles.inputError,
                    ]}
                  >
                    <IconSymbol
                      name='lock'
                      size={20}
                      color={iconColor}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.textInput}
                      value={password}
                      onChangeText={setPassword}
                      placeholder='กรอกรหัสผ่าน (อย่างน้อย 6 ตัวอักษร)'
                      placeholderTextColor='#999'
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.passwordToggle}
                    >
                      <IconSymbol
                        name={showPassword ? 'eye.slash' : 'eye'}
                        size={20}
                        color={iconColor}
                      />
                    </TouchableOpacity>
                  </ThemedView>
                  {errors.password && (
                    <ThemedText style={styles.errorText}>
                      {errors.password}
                    </ThemedText>
                  )}
                </ThemedView>

                {/* Confirm Password Input */}
                <ThemedView style={styles.inputContainer}>
                  <ThemedText style={styles.inputLabel}>
                    ยืนยันรหัสผ่าน{' '}
                    <ThemedText style={styles.required}>*</ThemedText>
                  </ThemedText>
                  <ThemedView
                    style={[
                      styles.inputWrapper,
                      errors.confirmPassword && styles.inputError,
                    ]}
                  >
                    <IconSymbol
                      name='lock'
                      size={20}
                      color={iconColor}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.textInput}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder='ยืนยันรหัสผ่าน'
                      placeholderTextColor='#999'
                      secureTextEntry={!showConfirmPassword}
                    />
                    <TouchableOpacity
                      onPress={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      style={styles.passwordToggle}
                    >
                      <IconSymbol
                        name={showConfirmPassword ? 'eye.slash' : 'eye'}
                        size={20}
                        color={iconColor}
                      />
                    </TouchableOpacity>
                  </ThemedView>
                  {errors.confirmPassword && (
                    <ThemedText style={styles.errorText}>
                      {errors.confirmPassword}
                    </ThemedText>
                  )}
                </ThemedView>

                {/* Check National ID Button */}
                <TouchableOpacity
                  style={[styles.checkButton, { backgroundColor: tintColor }]}
                  onPress={handleCheckNationalId}
                  disabled={isCheckingPresence}
                >
                  {isCheckingPresence ? (
                    <ActivityIndicator size='small' color='white' />
                  ) : (
                    <ThemedText style={styles.checkButtonText}>
                      ตรวจสอบว่ามีเลขประจำตัวประชาชนหรือไม่
                    </ThemedText>
                  )}
                </TouchableOpacity>

                {/* Personal Information Section */}
                <ThemedText type='subtitle' style={styles.sectionTitle}>
                  ข้อมูลส่วนบุคคล
                </ThemedText>

                {/* Title/Prefix Input */}
                <ThemedView style={styles.inputContainer}>
                  <ThemedText style={styles.inputLabel}>
                    คำนำหน้าชื่อ{' '}
                    <ThemedText style={styles.required}>*</ThemedText>
                  </ThemedText>
                  <ThemedView
                    style={[
                      styles.inputWrapper,
                      errors.title && styles.inputError,
                    ]}
                  >
                    <IconSymbol
                      name='person.crop.circle'
                      size={20}
                      color={iconColor}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.textInput}
                      value={title}
                      onChangeText={setTitle}
                      placeholder='เช่น นาย, นาง, นางสาว'
                      placeholderTextColor='#999'
                    />
                  </ThemedView>
                  {errors.title && (
                    <ThemedText style={styles.errorText}>
                      {errors.title}
                    </ThemedText>
                  )}
                </ThemedView>

                {/* First Name Input */}
                <ThemedView style={styles.inputContainer}>
                  <ThemedText style={styles.inputLabel}>
                    ชื่อ <ThemedText style={styles.required}>*</ThemedText>
                  </ThemedText>
                  <ThemedView
                    style={[
                      styles.inputWrapper,
                      errors.firstName && styles.inputError,
                    ]}
                  >
                    <IconSymbol
                      name='person'
                      size={20}
                      color={iconColor}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.textInput}
                      value={firstName}
                      onChangeText={setFirstName}
                      placeholder='ชื่อจริง'
                      placeholderTextColor='#999'
                    />
                  </ThemedView>
                  {errors.firstName && (
                    <ThemedText style={styles.errorText}>
                      {errors.firstName}
                    </ThemedText>
                  )}
                </ThemedView>

                {/* Last Name Input */}
                <ThemedView style={styles.inputContainer}>
                  <ThemedText style={styles.inputLabel}>
                    นามสกุล <ThemedText style={styles.required}>*</ThemedText>
                  </ThemedText>
                  <ThemedView
                    style={[
                      styles.inputWrapper,
                      errors.lastName && styles.inputError,
                    ]}
                  >
                    <IconSymbol
                      name='person'
                      size={20}
                      color={iconColor}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.textInput}
                      value={lastName}
                      onChangeText={setLastName}
                      placeholder='นามสกุล'
                      placeholderTextColor='#999'
                    />
                  </ThemedView>
                  {errors.lastName && (
                    <ThemedText style={styles.errorText}>
                      {errors.lastName}
                    </ThemedText>
                  )}
                </ThemedView>

                {/* Year of Birth Picker */}
                {renderPickerField(
                  'ปีเกิด (พ.ศ.)',
                  'birthYear',
                  birthYear ? `พ.ศ. ${birthYear}` : '-- เลือกปีเกิด --',
                  errors.birthYear
                )}

                {/* Gender Picker */}
                {renderPickerField(
                  'เพศ',
                  'gender',
                  gender
                    ? genderOptions.find((g) => g.value === gender)?.label ||
                        '-- เลือกเพศ --'
                    : '-- เลือกเพศ --',
                  errors.gender
                )}

                {/* Education Level Picker */}
                {renderPickerField(
                  'ระดับการศึกษา',
                  'educationId',
                  getPickerDisplayText(
                    'educationId',
                    educationId,
                    educations,
                    '-- เลือกระดับการศึกษา --'
                  ),
                  errors.educationId
                )}

                {/* Email Input */}
                <ThemedView style={styles.inputContainer}>
                  <ThemedText style={styles.inputLabel}>
                    อีเมล <ThemedText style={styles.required}>*</ThemedText>
                  </ThemedText>
                  <ThemedView
                    style={[
                      styles.inputWrapper,
                      errors.email && styles.inputError,
                    ]}
                  >
                    <IconSymbol
                      name='envelope'
                      size={20}
                      color={iconColor}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.textInput}
                      value={email}
                      onChangeText={setEmail}
                      placeholder='example@email.com'
                      placeholderTextColor='#999'
                      keyboardType='email-address'
                      autoCapitalize='none'
                    />
                  </ThemedView>
                  {errors.email && (
                    <ThemedText style={styles.errorText}>
                      {errors.email}
                    </ThemedText>
                  )}
                </ThemedView>

                {/* Type-specific fields */}
                {renderTypeSpecificFields()}
              </ThemedView>
            )}
          </ThemedView>
        )}
      </ScrollView>

      {/* Fixed Bottom Bar */}
      <View style={[styles.fixedButtonContainer, { backgroundColor }]}>
        {currentStep === 1 ? (
          <TouchableOpacity
            style={[
              styles.primaryButton,
              { backgroundColor: selectedUserType ? tintColor : '#ccc' },
            ]}
            onPress={handleNextStep}
            disabled={!selectedUserType}
          >
            <IconSymbol name='arrow.right' size={20} color='white' />
            <ThemedText style={styles.primaryButtonText}>
              ขั้นตอนถัดไป
            </ThemedText>
          </TouchableOpacity>
        ) : (
          <View style={styles.step2Buttons}>
            <TouchableOpacity
              style={[styles.secondaryButton, { borderColor: tintColor }]}
              onPress={handleBackToStep1}
            >
              <IconSymbol name='arrow.left' size={20} color={tintColor} />
              <ThemedText
                style={[styles.secondaryButtonText, { color: tintColor }]}
              >
                ย้อนกลับ
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: tintColor }]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size='small' color='white' />
              ) : (
                <>
                  <IconSymbol name='checkmark.circle' size={20} color='white' />
                  <ThemedText style={styles.primaryButtonText}>
                    สมัครสมาชิก
                  </ThemedText>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Picker Modal */}
      {renderPickerModal()}

      {/* Exit Confirmation Modal */}
      <Modal
        visible={exitModalVisible}
        transparent
        animationType='fade'
        onRequestClose={handleExitCancel}
      >
        <TouchableWithoutFeedback onPress={handleExitCancel}>
          <View style={styles.exitModalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.exitModalContainer}>
                <ThemedText style={styles.exitModalTitle}>
                  ออกจากหน้าสมัครสมาชิก?
                </ThemedText>
                <ThemedText style={styles.exitModalMessage}>
                  คุณแน่ใจหรือไม่ว่าต้องการออกจากหน้านี้?{'\n'}
                  ข้อมูลที่กรอกไว้จะสูญหาย
                </ThemedText>
                <View style={styles.exitModalButtonRow}>
                  <TouchableOpacity
                    style={styles.exitModalButtonCancel}
                    onPress={handleExitCancel}
                  >
                    <ThemedText style={styles.exitModalButtonCancelText}>
                      ยกเลิก
                    </ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.exitModalButtonConfirm}
                    onPress={handleExitConfirm}
                  >
                    <ThemedText style={styles.exitModalButtonConfirmText}>
                      ออก
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    textAlign: 'center',
    fontSize: 20,
    fontFamily: 'Prompt-SemiBold',
  },
  headerRight: {
    width: 40,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 140,
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 40,
    borderTopWidth: 0.5,
    borderTopColor: '#F0F0F0',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 42,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    minHeight: 52,
  },
  primaryButtonText: {
    fontSize: 18,
    fontFamily: 'Prompt-SemiBold',
    marginLeft: 8,
    color: 'white',
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 0,
    paddingHorizontal: 10,
  },
  stepContainer: {
    alignItems: 'center',
    flex: 1,
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E0E0E0',
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeStepDot: {
    backgroundColor: '#183A7C',
  },
  stepNumber: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Prompt-SemiBold',
  },
  activeStepNumber: {
    color: 'white',
  },
  stepText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontFamily: 'Prompt-Regular',
  },
  activeStepText: {
    color: '#183A7C',
    fontFamily: 'Prompt-SemiBold',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 10,
  },
  activeStepLine: {
    backgroundColor: '#183A7C',
  },
  step1Container: {
    marginTop: 20,
  },
  stepTitle: {
    marginBottom: 6,
    marginLeft: 12,
  },
  stepDescription: {
    marginBottom: 24,
    color: '#666',
    marginLeft: 12,
  },
  userTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  userTypeItem: {
    width: '48%',
    alignItems: 'center',
    marginVertical: 10,
    padding: 10,
    borderRadius: 10,
    minHeight: 100,
  },
  lastItem: {
    width: '100%',
  },
  selectedUserTypeItem: {
    backgroundColor: '#183A7C',
  },
  formContainer: {
    marginTop: 0,
    marginHorizontal: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Prompt-SemiBold',
    marginBottom: 16,
    marginTop: 24,
    color: '#333',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: 'Prompt-SemiBold',
    marginBottom: 8,
    color: '#333',
  },
  required: {
    color: '#ff4444',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 12 : 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 0,
  },
  inputError: {
    borderColor: '#ff4444',
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontFamily: 'Prompt-Regular',
  },
  passwordToggle: {
    padding: 4,
  },
  checkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    minHeight: 52,
  },
  checkButtonText: {
    fontSize: 16,
    fontFamily: 'Prompt-SemiBold',
    color: 'white',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectedIconContainer: {
    backgroundColor: 'white',
  },
  userTypeTitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  selectedUserTypeTitle: {
    color: 'white',
  },
  step2Container: {
    marginTop: 20,
  },
  step2Buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 0,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontFamily: 'Prompt-Medium',
    marginLeft: 8,
  },
  userTypeLabel: {
    fontFamily: 'Prompt-SemiBold',
    color: '#183A7C',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 14,
    fontFamily: 'Prompt-Regular',
    marginTop: 4,
  },
  presenceText: {
    fontSize: 14,
    fontFamily: 'Prompt-Regular',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  presenceSuccess: {
    color: '#4CAF50',
  },
  presenceError: {
    color: '#ff4444',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: 'Prompt-Regular',
    color: '#666',
  },
  pickerWrapper: {
    justifyContent: 'space-between',
  },
  pickerText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Prompt-Regular',
    color: '#999',
  },
  pickerTextSelected: {
    color: '#333',
  },
  disabledInput: {
    backgroundColor: '#F5F5F5',
  },
  disabledText: {
    color: '#999',
  },
  pickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  pickerModalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  pickerModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  pickerModalTitle: {
    fontSize: 18,
    fontFamily: 'Prompt-SemiBold',
    color: '#333',
  },
  pickerModalCancel: {
    fontSize: 16,
    fontFamily: 'Prompt-Regular',
    color: '#999',
  },
  pickerModalDone: {
    fontSize: 16,
    fontFamily: 'Prompt-SemiBold',
  },
  picker: {
    height: 200,
  },
  // Exit modal styles
  exitModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  exitModalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  exitModalTitle: {
    fontSize: 20,
    fontFamily: 'Prompt-SemiBold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
    marginTop: 10,
  },
  exitModalMessage: {
    fontSize: 16,
    fontFamily: 'Prompt-Regular',
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  exitModalButtonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  exitModalButtonCancel: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  exitModalButtonCancelText: {
    fontSize: 16,
    fontFamily: 'Prompt-SemiBold',
    color: '#1F2937',
  },
  exitModalButtonConfirm: {
    flex: 1,
    backgroundColor: '#f44336',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  exitModalButtonConfirmText: {
    fontSize: 16,
    fontFamily: 'Prompt-SemiBold',
    color: 'white',
  },
})
