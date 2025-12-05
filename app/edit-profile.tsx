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

export default function EditProfileScreen() {
  const backgroundColor = useThemeColor({}, 'background')
  const tintColor = useThemeColor({}, 'tint')
  const iconColor = useThemeColor({}, 'icon')

  // Mock existing user data
  const mockUserData = {
    title: 'นาย',
    firstName: 'สมชาย',
    lastName: 'รักเรียน',
    birthYear: '2530',
    gender: 'ชาย',
    educationLevel: 'ปริญญาตรี',
    email: 'somchai.rakrian@example.com',
  }

  // Form state variables with prefilled values
  const [title, setTitle] = useState(mockUserData.title)
  const [firstName, setFirstName] = useState(mockUserData.firstName)
  const [lastName, setLastName] = useState(mockUserData.lastName)
  const [birthYear, setBirthYear] = useState(mockUserData.birthYear)
  const [gender, setGender] = useState(mockUserData.gender)
  const [educationLevel, setEducationLevel] = useState(
    mockUserData.educationLevel
  )
  const [email, setEmail] = useState(mockUserData.email)

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
            แก้ไขข้อมูลส่วนบุคคล
          </ThemedText>
          <View style={styles.headerRight} />
        </View>
      </ThemedView>

      {/* Body Content */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Personal Information Form */}
        <ThemedView style={styles.formContainer}>
          <ThemedText type='subtitle' style={styles.sectionTitle}>
            ข้อมูลส่วนบุคคล
          </ThemedText>

          {/* Title/Prefix Input */}
          <ThemedView style={styles.inputContainer}>
            <ThemedText style={styles.inputLabel}>
              คำนำหน้าชื่อ <ThemedText style={styles.required}>*</ThemedText>
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
              ระดับการศึกษา <ThemedText style={styles.required}>*</ThemedText>
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
      </ScrollView>

      {/* Fixed Bottom Bar */}
      <View style={[styles.fixedButtonContainer, { backgroundColor }]}>
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: tintColor }]}
        >
          <IconSymbol name='checkmark.circle' size={20} color='white' />
          <ThemedText style={styles.primaryButtonText}>
            บันทึกการเปลี่ยนแปลง
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 70 : 50,
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
    paddingTop: 20,
    paddingBottom: 120,
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
    paddingHorizontal: 32,
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
    elevation: 0,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontFamily: 'Prompt-Regular',
    paddingVertical: 0,
  },
})
