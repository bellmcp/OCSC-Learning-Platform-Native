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

export default function ChangePasswordScreen() {
  const backgroundColor = useThemeColor({}, 'background')
  const tintColor = useThemeColor({}, 'tint')
  const iconColor = useThemeColor({}, 'icon')

  // Password state
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleBack = () => {
    router.back()
  }

  const handleSubmit = () => {
    // Validate passwords match
    if (newPassword !== confirmPassword) {
      // You can add an alert or toast here
      return
    }

    // Handle password change logic here
    // For now, just go back
    router.back()
  }

  const isFormValid =
    newPassword.length > 0 &&
    confirmPassword.length > 0 &&
    newPassword === confirmPassword

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      {/* Fixed Header */}
      <ThemedView style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <IconSymbol name='chevron.left' size={24} color={iconColor} />
          </TouchableOpacity>
          <ThemedText type='title' style={styles.headerTitle}>
            เปลี่ยนรหัสผ่าน
          </ThemedText>
          <View style={styles.backButton} />
        </View>
      </ThemedView>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Card */}
        <ThemedView style={styles.infoCard}>
          <IconSymbol
            name='lock.shield'
            size={48}
            color={tintColor}
            style={styles.infoIcon}
          />
          <ThemedText type='subtitle' style={styles.infoTitle}>
            ตั้งค่ารหัสผ่านใหม่
          </ThemedText>
          <ThemedText style={styles.infoSubtitle}>
            กรุณากรอกรหัสผ่านใหม่และยืนยันรหัสผ่าน
          </ThemedText>
        </ThemedView>

        {/* New Password Input */}
        <ThemedView style={styles.inputContainer}>
          <ThemedText style={styles.inputLabel}>
            รหัสผ่านใหม่ <ThemedText style={styles.required}>*</ThemedText>
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
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder='กรอกรหัสผ่านใหม่'
              placeholderTextColor='#999'
              secureTextEntry={!showNewPassword}
            />
            <TouchableOpacity
              onPress={() => setShowNewPassword(!showNewPassword)}
              style={styles.passwordToggle}
            >
              <IconSymbol
                name={showNewPassword ? 'eye.slash' : 'eye'}
                size={20}
                color={iconColor}
              />
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>

        {/* Confirm Password Input */}
        <ThemedView style={styles.inputContainer}>
          <ThemedText style={styles.inputLabel}>
            ยืนยันรหัสผ่านใหม่{' '}
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
              placeholder='กรอกรหัสผ่านใหม่อีกครั้ง'
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

        {/* Password Requirements */}
        <ThemedView style={styles.requirementsCard}>
          <ThemedText type='subtitle' style={styles.requirementsTitle}>
            ข้อกำหนดรหัสผ่าน
          </ThemedText>
          <ThemedView style={styles.requirementsList}>
            <ThemedView style={styles.requirementItem}>
              <IconSymbol
                name='checkmark.circle.fill'
                size={16}
                color='#2e7d32'
              />
              <ThemedText style={styles.requirementText}>
                ความยาวอย่างน้อย 8 ตัวอักษร
              </ThemedText>
            </ThemedView>
            <ThemedView style={styles.requirementItem}>
              <IconSymbol
                name='checkmark.circle.fill'
                size={16}
                color='#2e7d32'
              />
              <ThemedText style={styles.requirementText}>
                ประกอบด้วยตัวอักษรและตัวเลข
              </ThemedText>
            </ThemedView>
            <ThemedView style={styles.requirementItem}>
              <IconSymbol
                name='checkmark.circle.fill'
                size={16}
                color='#2e7d32'
              />
              <ThemedText style={styles.requirementText}>
                มีตัวพิมพ์ใหญ่และตัวพิมพ์เล็ก
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </ScrollView>

      {/* Fixed Mark All Read Button */}
      <View style={[styles.fixedButtonContainer, { backgroundColor }]}>
        <TouchableOpacity
          style={[
            styles.markAllReadButton,
            { backgroundColor: isFormValid ? tintColor : '#CCCCCC' },
          ]}
          onPress={handleSubmit}
          disabled={!isFormValid}
        >
          <IconSymbol name='checkmark.circle' size={20} color='white' />
          <ThemedText style={styles.markAllReadButtonText}>
            บันทึกรหัสผ่านใหม่
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
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 120, // Space for fixed bottom bar
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
  infoCard: {
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 30,
    padding: 24,
    borderRadius: 16,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  infoIcon: {
    marginBottom: 16,
  },
  infoTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  infoSubtitle: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 20,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: 'Prompt-SemiBold',
    marginBottom: 8,
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
    borderWidth: 0,
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    paddingVertical: 0, // Fix for Android text alignment
  },
  passwordToggle: {
    padding: 4,
  },
  requirementsCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  requirementsTitle: {
    marginBottom: 16,
  },
  requirementsList: {
    gap: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  requirementText: {
    marginLeft: 12,
    fontSize: 14,
    lineHeight: 20,
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
  markAllReadButton: {
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
  markAllReadButtonText: {
    fontSize: 18,
    fontFamily: 'Prompt-SemiBold',
    marginLeft: 8,
    color: 'white',
  },
})
