import { router } from 'expo-router'
import React, { useState } from 'react'
import {
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { useThemeColor } from '@/hooks/useThemeColor'

// User type data
const userTypes = [
  {
    id: 'civil_servant',
    title: 'ข้าราชการ\nพลเรือนสามัญ',
    icon: 'briefcase',
  },
  {
    id: 'other_official',
    title: 'ข้าราชการ\nประเภทอื่น',
    icon: 'graduationcap',
  },
  {
    id: 'government_staff',
    title: 'เจ้าหน้าที่\nของรัฐ',
    icon: 'building.2',
  },
  {
    id: 'state_enterprise',
    title: 'พนักงานรัฐวิสาหกิจ',
    icon: 'building.columns',
  },
  {
    id: 'general_public',
    title: 'บุคคลทั่วไป',
    icon: 'person.crop.circle',
  },
]

export default function RegisterScreen() {
  const backgroundColor = useThemeColor({}, 'background')
  const tintColor = useThemeColor({}, 'tint')
  const iconColor = useThemeColor({}, 'icon')
  const [selectedUserType, setSelectedUserType] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(1)

  // Form state variables
  const [nationalId, setNationalId] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [title, setTitle] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [birthYear, setBirthYear] = useState('')
  const [gender, setGender] = useState('')
  const [educationLevel, setEducationLevel] = useState('')
  const [email, setEmail] = useState('')

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
    setSelectedUserType(null)
  }

  const handleCheckNationalId = () => {
    // TODO: Implement national ID validation
    console.log('Checking national ID:', nationalId)
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      {/* Fixed Header */}
      <ThemedView style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <IconSymbol name='chevron.left' size={24} color={iconColor} />
          </TouchableOpacity>
          <ThemedText type='title' style={styles.headerTitle}>
            สมัครสมาชิก
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
                    // Make the last item (5th item) span full width
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
              กรุณากรอกข้อมูลส่วนตัวเพื่อสมัครสมาชิก
            </ThemedText>

            {/* Registration Form */}
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
                <ThemedView style={styles.inputWrapper}>
                  <IconSymbol
                    name='person'
                    size={20}
                    color={iconColor}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.textInput}
                    value={nationalId}
                    onChangeText={setNationalId}
                    placeholder='0-0000-00000-00-0'
                    placeholderTextColor='#999'
                    keyboardType='numeric'
                    maxLength={13}
                  />
                </ThemedView>
              </ThemedView>

              {/* Password Input */}
              <ThemedView style={styles.inputContainer}>
                <ThemedText style={styles.inputLabel}>
                  รหัสผ่าน <ThemedText style={styles.required}>*</ThemedText>
                </ThemedText>
                <ThemedView style={styles.inputWrapper}>
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
                    placeholder='กรอกรหัสผ่าน'
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
              </ThemedView>

              {/* Confirm Password Input */}
              <ThemedView style={styles.inputContainer}>
                <ThemedText style={styles.inputLabel}>
                  ยืนยันรหัสผ่าน{' '}
                  <ThemedText style={styles.required}>*</ThemedText>
                </ThemedText>
                <ThemedView style={styles.inputWrapper}>
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
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.passwordToggle}
                  >
                    <IconSymbol
                      name={showConfirmPassword ? 'eye.slash' : 'eye'}
                      size={20}
                      color={iconColor}
                    />
                  </TouchableOpacity>
                </ThemedView>
              </ThemedView>

              {/* Check National ID Button */}
              <TouchableOpacity
                style={[styles.checkButton, { backgroundColor: tintColor }]}
                onPress={handleCheckNationalId}
              >
                <ThemedText style={styles.checkButtonText}>
                  ตรวจสอบว่ามีเลขประจำตัวประชาชนหรือไม่
                </ThemedText>
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
                <ThemedView style={styles.inputWrapper}>
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
              </ThemedView>

              {/* First Name Input */}
              <ThemedView style={styles.inputContainer}>
                <ThemedText style={styles.inputLabel}>
                  ชื่อ <ThemedText style={styles.required}>*</ThemedText>
                </ThemedText>
                <ThemedView style={styles.inputWrapper}>
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
              </ThemedView>

              {/* Last Name Input */}
              <ThemedView style={styles.inputContainer}>
                <ThemedText style={styles.inputLabel}>
                  นามสกุล <ThemedText style={styles.required}>*</ThemedText>
                </ThemedText>
                <ThemedView style={styles.inputWrapper}>
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
              </ThemedView>

              {/* Year of Birth Input */}
              <ThemedView style={styles.inputContainer}>
                <ThemedText style={styles.inputLabel}>
                  ปีเกิด <ThemedText style={styles.required}>*</ThemedText>
                </ThemedText>
                <ThemedView style={styles.inputWrapper}>
                  <IconSymbol
                    name='calendar'
                    size={20}
                    color={iconColor}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.textInput}
                    value={birthYear}
                    onChangeText={setBirthYear}
                    placeholder='ปี พ.ศ. เช่น 2530'
                    placeholderTextColor='#999'
                    keyboardType='numeric'
                    maxLength={4}
                  />
                </ThemedView>
              </ThemedView>

              {/* Gender Input */}
              <ThemedView style={styles.inputContainer}>
                <ThemedText style={styles.inputLabel}>
                  เพศ <ThemedText style={styles.required}>*</ThemedText>
                </ThemedText>
                <ThemedView style={styles.inputWrapper}>
                  <IconSymbol
                    name='person.2'
                    size={20}
                    color={iconColor}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.textInput}
                    value={gender}
                    onChangeText={setGender}
                    placeholder='ชาย, หญิง'
                    placeholderTextColor='#999'
                  />
                </ThemedView>
              </ThemedView>

              {/* Education Level Input */}
              <ThemedView style={styles.inputContainer}>
                <ThemedText style={styles.inputLabel}>
                  ระดับการศึกษา{' '}
                  <ThemedText style={styles.required}>*</ThemedText>
                </ThemedText>
                <ThemedView style={styles.inputWrapper}>
                  <IconSymbol
                    name='graduationcap'
                    size={20}
                    color={iconColor}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.textInput}
                    value={educationLevel}
                    onChangeText={setEducationLevel}
                    placeholder='เช่น ปริญญาตรี, มัธยมศึกษา'
                    placeholderTextColor='#999'
                  />
                </ThemedView>
              </ThemedView>

              {/* Email Input */}
              <ThemedView style={styles.inputContainer}>
                <ThemedText style={styles.inputLabel}>
                  อีเมล <ThemedText style={styles.required}>*</ThemedText>
                </ThemedText>
                <ThemedView style={styles.inputWrapper}>
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
                  />
                </ThemedView>
              </ThemedView>
            </ThemedView>
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
            >
              <IconSymbol name='checkmark.circle' size={20} color='white' />
              <ThemedText style={styles.primaryButtonText}>
                สมัครสมาชิก
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 70,
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
    fontWeight: 'bold',
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
    paddingBottom: Platform.OS === 'ios' ? 120 : 100,
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
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
    width: '48%', // Two items per row with equal spacing
    alignItems: 'center',
    marginVertical: 10,
    padding: 10,
    borderRadius: 10,
    minHeight: 100,
  },
  lastItem: {
    width: '100%', // Last item spans full width
  },
  selectedUserTypeItem: {
    backgroundColor: '#183A7C',
  },
  // Form styles
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
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
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
})
