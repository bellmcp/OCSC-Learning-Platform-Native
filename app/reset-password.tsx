import { router } from 'expo-router'
import React, { useState } from 'react'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useDispatch, useSelector } from 'react-redux'

import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { useThemeColor } from '@/hooks/useThemeColor'
import * as resetPasswordActions from '@/modules/reset-password/actions'
import type { AppDispatch, RootState } from '@/store/types'

export default function ResetPasswordScreen() {
  const dispatch = useDispatch<AppDispatch>()
  const backgroundColor = useThemeColor({}, 'background')
  const iconColor = useThemeColor({}, 'icon')
  const tintColor = useThemeColor({}, 'tint')

  const { isLoading } = useSelector((state: RootState) => state.resetPassword)

  const [password1, setPassword1] = useState('')
  const [password2, setPassword2] = useState('')
  const [showPassword1, setShowPassword1] = useState(false)
  const [showPassword2, setShowPassword2] = useState(false)
  const [errors, setErrors] = useState<{
    password1?: string
    password2?: string
  }>({})

  const handleGoBack = () => {
    router.back()
  }

  const validateForm = (): boolean => {
    const newErrors: { password1?: string; password2?: string } = {}

    if (!password1.trim()) {
      newErrors.password1 = 'กรุณากรอกรหัสผ่านใหม่'
    } else if (password1.length < 6) {
      newErrors.password1 = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'
    }

    if (!password2.trim()) {
      newErrors.password2 = 'กรุณากรอกรหัสผ่านใหม่ (พิมพ์ซ้ำอีกครั้ง)'
    } else if (password1 !== password2) {
      newErrors.password2 = 'กรุณากรอกรหัสให้เหมือนกัน'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    const success = await dispatch(
      resetPasswordActions.resetPassword({
        password1,
        password2,
      })
    )

    if (success) {
      // Clear form on success
      setPassword1('')
      setPassword2('')
      setErrors({})
    }
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor }]}
      edges={['top']}
    >
      {/* Header */}
      <ThemedView style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <IconSymbol name='chevron.left' size={24} color={iconColor} />
        </TouchableOpacity>
        <ThemedView style={styles.headerTitleContainer}>
          <ThemedText style={styles.headerTitle}>ตั้งรหัสผ่านใหม่</ThemedText>
        </ThemedView>
        <View style={styles.backButton} />
      </ThemedView>

      {/* Content */}
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps='handled'
        >
          {/* Form Title */}
          <ThemedText style={styles.sectionTitle}>
            ตั้งรหัสผ่านใหม่ / ลืมรหัสผ่าน
          </ThemedText>
          <ThemedText style={styles.sectionDescription}>
            กรุณากรอกรหัสผ่านใหม่ที่ต้องการใช้งาน
          </ThemedText>

          {/* Password 1 Input */}
          <View style={styles.inputContainer}>
            <ThemedText style={styles.inputLabel}>
              รหัสผ่านใหม่ <ThemedText style={styles.required}>*</ThemedText>
            </ThemedText>
            <View
              style={[
                styles.inputWrapper,
                errors.password1 && styles.inputError,
              ]}
            >
              <IconSymbol
                name='lock.fill'
                size={20}
                color='#9CA3AF'
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.textInput}
                placeholder='กรอกรหัสผ่านใหม่'
                placeholderTextColor='#9CA3AF'
                value={password1}
                onChangeText={(text) => {
                  setPassword1(text)
                  if (errors.password1) {
                    setErrors((prev) => ({ ...prev, password1: undefined }))
                  }
                }}
                secureTextEntry={!showPassword1}
                autoCapitalize='none'
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={() => setShowPassword1(!showPassword1)}
                style={styles.passwordToggle}
              >
                <IconSymbol
                  name={showPassword1 ? 'eye.slash.fill' : 'eye.fill'}
                  size={20}
                  color='#9CA3AF'
                />
              </TouchableOpacity>
            </View>
            {errors.password1 && (
              <ThemedText style={styles.errorText}>
                {errors.password1}
              </ThemedText>
            )}
          </View>

          {/* Password 2 Input */}
          <View style={styles.inputContainer}>
            <ThemedText style={styles.inputLabel}>
              รหัสผ่านใหม่ (พิมพ์ซ้ำอีกครั้ง){' '}
              <ThemedText style={styles.required}>*</ThemedText>
            </ThemedText>
            <View
              style={[
                styles.inputWrapper,
                errors.password2 && styles.inputError,
              ]}
            >
              <IconSymbol
                name='lock.fill'
                size={20}
                color='#9CA3AF'
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.textInput}
                placeholder='กรอกรหัสผ่านใหม่อีกครั้ง'
                placeholderTextColor='#9CA3AF'
                value={password2}
                onChangeText={(text) => {
                  setPassword2(text)
                  if (errors.password2) {
                    setErrors((prev) => ({ ...prev, password2: undefined }))
                  }
                }}
                secureTextEntry={!showPassword2}
                autoCapitalize='none'
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={() => setShowPassword2(!showPassword2)}
                style={styles.passwordToggle}
              >
                <IconSymbol
                  name={showPassword2 ? 'eye.slash.fill' : 'eye.fill'}
                  size={20}
                  color='#9CA3AF'
                />
              </TouchableOpacity>
            </View>
            {errors.password2 && (
              <ThemedText style={styles.errorText}>
                {errors.password2}
              </ThemedText>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Fixed Bottom Button */}
      <View style={[styles.fixedButtonContainer, { backgroundColor }]}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            { backgroundColor: tintColor },
            isLoading && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size='small' color='#FFFFFF' />
          ) : (
            <>
              <IconSymbol name='checkmark.circle' size={20} color='#FFFFFF' />
              <ThemedText style={styles.submitButtonText}>ส่งข้อมูล</ThemedText>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    textAlign: 'center',
    fontSize: 20,
    fontFamily: 'Prompt-SemiBold',
    lineHeight: 32,
  },
  keyboardAvoid: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Prompt-SemiBold',
    marginBottom: 8,
    color: '#333',
  },
  sectionDescription: {
    fontSize: 14,
    fontFamily: 'Prompt-Regular',
    color: '#6B7280',
    marginBottom: 24,
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
  errorText: {
    color: '#ff4444',
    fontSize: 14,
    fontFamily: 'Prompt-Regular',
    marginTop: 4,
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
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
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'Prompt-SemiBold',
    color: '#FFFFFF',
  },
})
