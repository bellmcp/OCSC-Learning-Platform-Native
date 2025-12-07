import DateTimePicker from '@react-native-community/datetimepicker'
import { Picker } from '@react-native-picker/picker'
import { router } from 'expo-router'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Animated,
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
import * as userActions from '@/modules/user/actions'
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

export default function EditProfileScreen() {
  const dispatch = useDispatch()
  const backgroundColor = useThemeColor({}, 'background')
  const tintColor = useThemeColor({}, 'tint')
  const iconColor = useThemeColor({}, 'icon')

  // Get user data from Redux
  const { items: user } = useSelector((state: RootState) => state.user)

  // Redux state for form options
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
    isUpdating,
    updateResult,
  } = useSelector((state: RootState) => state.signup)

  // Local state - pre-select user type based on existing data
  const [selectedUserType, setSelectedUserType] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(1)

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

  // Picker modal animations
  const [pickerOverlayOpacity] = useState(new Animated.Value(0))
  const [pickerSlideAnim] = useState(new Animated.Value(300))

  // Form validation errors
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Helper function to clear a specific error
  const clearError = useCallback((fieldName: string) => {
    setErrors((prev) => {
      if (prev[fieldName]) {
        const newErrors = { ...prev }
        delete newErrors[fieldName]
        return newErrors
      }
      return prev
    })
  }, [])

  // Exit confirmation modal state
  const [exitModalVisible, setExitModalVisible] = useState(false)

  // Year options memoized
  const yearOptions = useMemo(() => generateYearOptions(), [])

  // Get selected user type object
  const selectedUserTypeObj = useMemo(
    () => userTypes.find((ut) => ut.id === selectedUserType),
    [selectedUserType]
  )

  // Pre-select user type based on existing user data
  useEffect(() => {
    if (user?.userTypeId) {
      const userType = userTypes.find((ut) => ut.userTypeId === user.userTypeId)
      if (userType) {
        setSelectedUserType(userType.id)
      }
    }
  }, [user])

  // Pre-populate form with user data when entering step 2
  useEffect(() => {
    if (currentStep === 2 && user) {
      // Pre-populate personal info
      setTitle(user.title || '')
      setFirstName(user.firstName || '')
      setLastName(user.lastName || '')
      setBirthYear(user.birthYear ? String(user.birthYear) : '')
      setGender(user.gender || '')
      setEducationId(user.educationId || null)
      setEmail(user.email || '')
      setDivision(user.division || '')

      // Parse job start date
      if (user.jobStartDate) {
        const date = new Date(user.jobStartDate)
        if (!isNaN(date.getTime())) {
          setJobStartDate(date)
        }
      }

      // Pre-populate type-specific data based on selected user type
      const userTypeId = selectedUserTypeObj?.userTypeId
      if (userTypeId === 1 && user.userTypeId === 1) {
        setJobTypeId(user.jobTypeId || null)
        setJobLevelId(user.jobLevelId || null)
        setMinistryId(user.ministryId || null)
        setDepartmentId(user.departmentId || null)
        setJobTitle(user.jobTitle || '')
      } else if (userTypeId === 2 && user.userTypeId === 2) {
        setJobTypeId(user.jobTypeId || null)
        setJobLevel(user.jobLevel || '')
        setMinistryId(user.ministryId || null)
        setDepartmentId(user.departmentId || null)
        setJobTitle(user.jobTitle || '')
      } else if (userTypeId === 3 && user.userTypeId === 3) {
        setJobTypeId(user.jobTypeId || null)
        setJobLevel(user.jobLevel || '')
        setMinistryId(user.ministryId || null)
        setDepartmentId(user.departmentId || null)
        setJobTitle(user.jobTitle || '')
      } else if (userTypeId === 4 && user.userTypeId === 4) {
        setStateEnterpriseId(user.stateEnterpriseId || null)
        setJobTitle(user.jobTitle || '')
      } else if (userTypeId === 5 && user.userTypeId === 5) {
        setOccupationId(user.occupationId || null)
        setJobTitle(user.jobTitle || '')
        setWorkplace(user.workplace || '')
      }
    }
  }, [currentStep, user, selectedUserTypeObj])

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

  // Handle update result
  useEffect(() => {
    if (updateResult) {
      if (updateResult.success) {
        dispatch(
          uiActions.setFlashMessage(updateResult.message, 'success') as any
        )
        dispatch(signupActions.clearSignupState() as any)
        // Reload user data
        dispatch(userActions.loadUser() as any)
        router.back()
      } else {
        dispatch(
          uiActions.setFlashMessage(updateResult.message, 'error') as any
        )
      }
    }
  }, [updateResult, dispatch])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      dispatch(signupActions.clearSignupState() as any)
    }
  }, [dispatch])

  // Animate picker modal when shown
  useEffect(() => {
    if (showPickerModal) {
      Animated.parallel([
        Animated.timing(pickerOverlayOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(pickerSlideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [showPickerModal, pickerOverlayOpacity, pickerSlideAnim])

  // Close picker modal with animation
  const closePickerModal = useCallback(() => {
    Animated.parallel([
      Animated.timing(pickerOverlayOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(pickerSlideAnim, {
        toValue: 300,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowPickerModal(null)
      setTempPickerValue(null)
    })
  }, [pickerOverlayOpacity, pickerSlideAnim])

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
    // Reset type-specific form state
    resetTypeSpecificState()
  }

  const resetTypeSpecificState = () => {
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
  }

  // Filter job levels based on selected job type (for Type 1)
  const filteredJobLevels = useMemo(() => {
    if (selectedUserTypeObj?.userTypeId !== 1 || !jobTypeId) return []
    return jobLevels.filter((level: any) => level.jobTypeId === jobTypeId)
  }, [selectedUserTypeObj, jobTypeId, jobLevels])

  // Filter positions based on ministry and department
  const filteredPositions = useMemo(() => {
    if (selectedUserTypeObj?.userTypeId !== 1 || !ministryId || !departmentId)
      return []
    return positions.filter(
      (pos: any) =>
        pos.ministryId === ministryId && pos.departmentId === departmentId
    )
  }, [selectedUserTypeObj, ministryId, departmentId, positions])

  // Check if form has data
  const hasFormData = useCallback(() => {
    if (currentStep === 1) return false
    return (
      title !== '' ||
      firstName !== '' ||
      lastName !== '' ||
      birthYear !== '' ||
      gender !== '' ||
      educationId !== null ||
      email !== ''
    )
  }, [
    currentStep,
    title,
    firstName,
    lastName,
    birthYear,
    gender,
    educationId,
    email,
  ])

  // Handle back press
  const handleBackPress = useCallback(() => {
    if (currentStep === 2) {
      if (hasFormData()) {
        setExitModalVisible(true)
      } else {
        handleBackToStep1()
      }
    } else {
      router.back()
    }
  }, [currentStep, hasFormData])

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
        if (currentStep === 2 && hasFormData()) {
          setExitModalVisible(true)
          return true
        }
        return false
      }
    )
    return () => backHandler.remove()
  }, [currentStep, hasFormData])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    const userTypeId = selectedUserTypeObj?.userTypeId

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

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      dispatch(
        uiActions.setFlashMessage('กรุณากรอกข้อมูลให้ครบถ้วน', 'error') as any
      )
      return
    }

    const userTypeId = selectedUserTypeObj?.userTypeId

    // Format job start date
    const formatDate = (date: Date | null) => {
      if (!date) return undefined
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    // Build member data based on user type
    const memberData: any = {
      userTypeId,
      title,
      firstName,
      lastName,
      gender,
      educationId,
      birthYear,
      email,
    }

    // Add type-specific fields
    if (userTypeId === 1) {
      memberData.m1_JobTitle = jobTitle
      memberData.m1_JobTypeId = jobTypeId
      memberData.m1_JobLevelId = jobLevelId
      memberData.m1_MinistryId = ministryId
      memberData.m1_DepartmentId = departmentId
      memberData.m1_Division = division || undefined
      memberData.m1_JobStartDate = formatDate(jobStartDate)
    } else if (userTypeId === 2) {
      memberData.m2_JobTitle = jobTitle
      memberData.m2_JobTypeId = jobTypeId
      memberData.m2_JobLevel = jobLevel || undefined
      memberData.m2_MinistryId = ministryId
      memberData.m2_DepartmentId = departmentId
      memberData.m2_Division = division || undefined
      memberData.m2_JobStartDate = formatDate(jobStartDate)
    } else if (userTypeId === 3) {
      memberData.m3_JobTitle = jobTitle
      memberData.m3_JobTypeId = jobTypeId
      memberData.m3_JobLevel = jobLevel || undefined
      memberData.m3_MinistryId = ministryId
      memberData.m3_DepartmentId = departmentId
      memberData.m3_Division = division || undefined
      memberData.m3_JobStartDate = formatDate(jobStartDate)
    } else if (userTypeId === 4) {
      memberData.m4_JobTitle = jobTitle || undefined
      memberData.m4_StateEnterpriseId = stateEnterpriseId
      memberData.m4_JobStartDate = formatDate(jobStartDate)
    } else if (userTypeId === 5) {
      memberData.m5_JobTitle = jobTitle || undefined
      memberData.m5_OccupationId = occupationId
      memberData.m5_Workplace = workplace || undefined
    }

    // Submit update using user's id
    dispatch(signupActions.updateMember(user.id, memberData) as any)
  }

  // Get display text for picker
  const getPickerDisplayText = (
    fieldName: string,
    value: any,
    options: any[],
    defaultText: string
  ): string => {
    if (!value) return defaultText
    const option = options.find(
      (opt: any) => opt.id === value || opt.value === value
    )
    return option?.name || option?.label || defaultText
  }

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
        options = filteredJobLevels.map((j: any) => ({
          value: j.id,
          label: j.name,
        }))
        title = 'เลือกระดับตำแหน่ง'
        currentValue = jobLevelId
        break
      case 'jobTitle':
        options = filteredPositions.map((p: any) => ({
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

    const handleSelect = () => {
      const valueToSet = tempPickerValue ?? currentValue
      if (valueToSet && showPickerModal) {
        clearError(showPickerModal)
      }
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
          setJobLevelId(null)
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
      closePickerModal()
    }

    return (
      <Modal
        visible={!!showPickerModal}
        transparent
        animationType='none'
        onRequestClose={closePickerModal}
      >
        <Animated.View
          style={[styles.pickerModalOverlay, { opacity: pickerOverlayOpacity }]}
        >
          <TouchableOpacity
            style={styles.pickerModalBackdrop}
            activeOpacity={1}
            onPress={closePickerModal}
          />
          <Animated.View
            style={[
              styles.pickerModalContent,
              { transform: [{ translateY: pickerSlideAnim }] },
            ]}
          >
            <View style={styles.pickerModalHandle} />
            <View style={styles.pickerModalHeader}>
              <TouchableOpacity onPress={closePickerModal}>
                <ThemedText
                  style={[styles.pickerModalCancel, { color: tintColor }]}
                >
                  ปิด
                </ThemedText>
              </TouchableOpacity>
              <ThemedText style={styles.pickerModalTitle}>{title}</ThemedText>
              <TouchableOpacity onPress={handleSelect}>
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
          </Animated.View>
        </Animated.View>
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
    clearError,
    closePickerModal,
    pickerOverlayOpacity,
    pickerSlideAnim,
  ])

  // Render picker field
  const renderPickerField = (
    label: string,
    fieldName: string,
    value: any,
    options: any[],
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
            value && styles.pickerTextSelected,
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
    error?: string,
    errorFieldName?: string
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
              if (errorFieldName) {
                clearError(errorFieldName)
              }
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
        errors.jobStartDate,
        'jobStartDate'
      )}

      {renderPickerField(
        'กระทรวง',
        'ministryId',
        ministryId,
        ministries,
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
        departmentId,
        departments,
        getPickerDisplayText(
          'departmentId',
          departmentId,
          departments,
          '-- เลือกส่วนราชการต้นสังกัด --'
        ),
        errors.departmentId,
        !ministryId || isDepartmentsLoading
      )}

      <ThemedView style={styles.inputContainer}>
        <ThemedText style={styles.inputLabel}>หน่วยงาน (ถ้ามี)</ThemedText>
        <ThemedView style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            value={division}
            onChangeText={setDivision}
            placeholder='กรอกหน่วยงาน'
            placeholderTextColor='#999'
          />
        </ThemedView>
      </ThemedView>

      {renderPickerField(
        'ประเภทตำแหน่ง',
        'jobTypeId',
        jobTypeId,
        jobTypes1,
        getPickerDisplayText(
          'jobTypeId',
          jobTypeId,
          jobTypes1,
          '-- เลือกประเภทตำแหน่ง --'
        ),
        errors.jobTypeId
      )}

      {renderPickerField(
        'ระดับตำแหน่ง',
        'jobLevelId',
        jobLevelId,
        filteredJobLevels,
        getPickerDisplayText(
          'jobLevelId',
          jobLevelId,
          filteredJobLevels,
          '-- เลือกระดับตำแหน่ง --'
        ),
        errors.jobLevelId,
        !jobTypeId
      )}

      {renderPickerField(
        'ตำแหน่ง',
        'jobTitle',
        jobTitle,
        filteredPositions.map((p: any) => ({ id: p.name, name: p.name })),
        jobTitle || '-- เลือกตำแหน่ง --',
        errors.jobTitle,
        !ministryId || !departmentId
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
        errors.jobStartDate,
        'jobStartDate'
      )}

      {renderPickerField(
        'กระทรวง',
        'ministryId',
        ministryId,
        ministries,
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
        departmentId,
        departments,
        getPickerDisplayText(
          'departmentId',
          departmentId,
          departments,
          '-- เลือกส่วนราชการต้นสังกัด --'
        ),
        errors.departmentId,
        !ministryId || isDepartmentsLoading
      )}

      <ThemedView style={styles.inputContainer}>
        <ThemedText style={styles.inputLabel}>หน่วยงาน (ถ้ามี)</ThemedText>
        <ThemedView style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            value={division}
            onChangeText={setDivision}
            placeholder='กรอกหน่วยงาน'
            placeholderTextColor='#999'
          />
        </ThemedView>
      </ThemedView>

      {renderPickerField(
        'ประเภทข้าราชการ',
        'jobTypeId',
        jobTypeId,
        jobTypes2,
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
            onChangeText={(text) => {
              setJobTitle(text)
              clearError('jobTitle')
            }}
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
        errors.jobStartDate,
        'jobStartDate'
      )}

      {renderPickerField(
        'กระทรวง',
        'ministryId',
        ministryId,
        ministries,
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
        departmentId,
        departments,
        getPickerDisplayText(
          'departmentId',
          departmentId,
          departments,
          '-- เลือกส่วนราชการต้นสังกัด --'
        ),
        errors.departmentId,
        !ministryId || isDepartmentsLoading
      )}

      <ThemedView style={styles.inputContainer}>
        <ThemedText style={styles.inputLabel}>หน่วยงาน (ถ้ามี)</ThemedText>
        <ThemedView style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            value={division}
            onChangeText={setDivision}
            placeholder='กรอกหน่วยงาน'
            placeholderTextColor='#999'
          />
        </ThemedView>
      </ThemedView>

      {renderPickerField(
        'ประเภทเจ้าหน้าที่ของรัฐ',
        'jobTypeId',
        jobTypeId,
        jobTypes3,
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
            onChangeText={(text) => {
              setJobTitle(text)
              clearError('jobTitle')
            }}
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
        stateEnterpriseId,
        stateEnterprises,
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
        errors.jobStartDate,
        'jobStartDate'
      )}

      <ThemedView style={styles.inputContainer}>
        <ThemedText style={styles.inputLabel}>ตำแหน่ง</ThemedText>
        <ThemedView style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            value={jobTitle}
            onChangeText={(text) => {
              setJobTitle(text)
              clearError('jobTitle')
            }}
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
        occupationId,
        occupations,
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
            onChangeText={(text) => {
              setJobTitle(text)
              clearError('jobTitle')
            }}
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
          <ThemedText type='title' style={styles.headerTitle}>
            แก้ไขข้อมูลส่วนบุคคล
          </ThemedText>
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
              แก้ไขข้อมูลประเภท:{' '}
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
                {/* Personal Information Section */}
                <ThemedText type='subtitle' style={styles.sectionTitle}>
                  ข้อมูลส่วนตัว
                </ThemedText>

                {/* Title */}
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
                      name='person'
                      size={20}
                      color={iconColor}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.textInput}
                      value={title}
                      onChangeText={(text) => {
                        setTitle(text)
                        clearError('title')
                      }}
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

                {/* First Name */}
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
                      onChangeText={(text) => {
                        setFirstName(text)
                        clearError('firstName')
                      }}
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

                {/* Last Name */}
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
                      onChangeText={(text) => {
                        setLastName(text)
                        clearError('lastName')
                      }}
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

                {/* Gender */}
                {renderPickerField(
                  'เพศ',
                  'gender',
                  gender,
                  genderOptions,
                  gender
                    ? genderOptions.find((g) => g.value === gender)?.label ||
                        '-- เลือกเพศ --'
                    : '-- เลือกเพศ --',
                  errors.gender
                )}

                {/* Birth Year */}
                {renderPickerField(
                  'ปีเกิด (พ.ศ.)',
                  'birthYear',
                  birthYear,
                  yearOptions,
                  birthYear || '-- เลือกปีเกิด --',
                  errors.birthYear
                )}

                {/* Education */}
                {renderPickerField(
                  'ระดับการศึกษา',
                  'educationId',
                  educationId,
                  educations,
                  getPickerDisplayText(
                    'educationId',
                    educationId,
                    educations,
                    '-- เลือกระดับการศึกษา --'
                  ),
                  errors.educationId
                )}

                {/* Email */}
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
                      onChangeText={(text) => {
                        setEmail(text)
                        clearError('email')
                      }}
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
              disabled={isUpdating}
            >
              {isUpdating ? (
                <ActivityIndicator size='small' color='white' />
              ) : (
                <>
                  <IconSymbol name='checkmark.circle' size={20} color='white' />
                  <ThemedText style={styles.primaryButtonText}>
                    บันทึกข้อมูล
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
                  ออกจากหน้าแก้ไขข้อมูล?
                </ThemedText>
                <ThemedText style={styles.exitModalMessage}>
                  คุณแน่ใจหรือไม่ว่าต้องการออกจากหน้านี้?{'\n'}
                  การเปลี่ยนแปลงที่ยังไม่ได้บันทึกจะสูญหาย
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
  pickerModalBackdrop: {
    flex: 1,
  },
  pickerModalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 10,
  },
  pickerModalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
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
    minWidth: 30,
    fontFamily: 'Prompt-Medium',
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
