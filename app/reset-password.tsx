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
    <ThemedView style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <ThemedView style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <IconSymbol name='chevron.left' size={24} color={iconColor} />
          </TouchableOpacity>
          <ThemedText type='title' style={styles.headerTitle}>
            ตั้งรหัสผ่านใหม่
          </ThemedText>
          <View style={styles.backButton} />
        </View>
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
          <ThemedView style={styles.formCard}>
            <ThemedText style={styles.formTitle}>
              ตั้งรหัสผ่านใหม่ / ลืมรหัสผ่าน
            </ThemedText>
            <ThemedText style={styles.formDescription}>
              กรุณากรอกรหัสผ่านใหม่ที่ต้องการใช้งาน
            </ThemedText>

            {/* Password 1 Input */}
            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>รหัสผ่านใหม่</ThemedText>
              <View
                style={[
                  styles.inputContainer,
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
                  style={styles.eyeButton}
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
            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>
                รหัสผ่านใหม่ (พิมพ์ซ้ำอีกครั้ง)
              </ThemedText>
              <View
                style={[
                  styles.inputContainer,
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
                  style={styles.eyeButton}
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

            {/* Submit Button */}
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
                  <IconSymbol
                    name='paperplane.fill'
                    size={20}
                    color='#FFFFFF'
                  />
                  <ThemedText style={styles.submitButtonText}>
                    ส่งข้อมูล
                  </ThemedText>
                </>
              )}
            </TouchableOpacity>
          </ThemedView>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 80 : 50,
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
  keyboardAvoid: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 0,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  formTitle: {
    fontSize: 20,
    lineHeight: 36,
    fontFamily: 'Prompt-SemiBold',
    color: '#1F2937',
    marginBottom: 0,
  },
  formDescription: {
    fontSize: 14,
    fontFamily: 'Prompt-Regular',
    color: '#6B7280',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Prompt-Medium',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    height: 52,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Prompt-Regular',
    color: '#1F2937',
  },
  eyeButton: {
    padding: 8,
    marginRight: -8,
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Prompt-Regular',
    color: '#EF4444',
    marginTop: 6,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
    gap: 8,
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
