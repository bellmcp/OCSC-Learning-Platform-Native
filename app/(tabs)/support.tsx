import * as DocumentPicker from 'expo-document-picker'
import React, { useState } from 'react'
import {
  Alert,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native'

import StatusBarGradient from '@/components/StatusBarGradient'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { useThemeColor } from '@/hooks/useThemeColor'

// Mock data for recent tickets
const mockRecentTickets = [
  {
    id: 'MD3',
    title: 'องค์ประกอบเรียนในใต้',
    description: 'การเป็นนักวิชาการ คู่ระบบสติศาสตร์ครับ',
    date: '14/5/2564 02:13',
    status: 'ใหม่ล่าสุด',
    type: 'completed',
  },
]

// Get screen dimensions for responsive design
const { width: screenWidth } = Dimensions.get('window')
const isTablet = screenWidth >= 768

export default function SupportScreen() {
  const backgroundColor = useThemeColor({}, 'background')
  const tintColor = useThemeColor({}, 'tint')
  const iconColor = useThemeColor({}, 'icon')
  const textColor = useThemeColor({}, 'text')

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    organization: '',
    message: '',
  })
  const [selectedFile, setSelectedFile] = useState<any>(null)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev: typeof formData) => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf', '.doc', '.docx'],
        copyToCacheDirectory: true,
      })

      if (!result.canceled && result.assets[0]) {
        setSelectedFile(result.assets[0])
      }
    } catch (error) {
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเลือกไฟล์ได้')
    }
  }

  const handleSubmit = () => {
    if (!formData.name || !formData.phone || !formData.organization) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกข้อมูลให้ครบถ้วน')
      return
    }

    Alert.alert('สำเร็จ', 'ส่งข้อความเรียบร้อยแล้ว', [
      {
        text: 'ตกลง',
        onPress: () => {
          setFormData({ name: '', phone: '', organization: '', message: '' })
          setSelectedFile(null)
        },
      },
    ])
  }

  const renderContactForm = () => (
    <>
      <ThemedText type='title' style={styles.formTitle}>
        ช่วยเหลือ
      </ThemedText>
      <ThemedView style={styles.formContainer}>
        {/* Name Input */}
        <ThemedView style={styles.inputGroup}>
          <ThemedText style={styles.inputLabel}>
            ปัญหาที่พบ <ThemedText style={styles.required}>*</ThemedText>
          </ThemedText>
          <TextInput
            style={[
              styles.textInput,
              { color: textColor, borderColor: '#F0F0F0' },
            ]}
            value={formData.name}
            onChangeText={(value: string) => handleInputChange('name', value)}
            placeholder='กรุณากรอกปัญหาที่พบ'
            placeholderTextColor={iconColor}
          />
        </ThemedView>

        {/* Message Input */}
        <ThemedView style={styles.inputGroup}>
          <ThemedText style={styles.inputLabel}>รายละเอียด (ถ้ามี)</ThemedText>
          <TextInput
            style={[
              styles.textAreaInput,
              { color: textColor, borderColor: '#F0F0F0' },
            ]}
            value={formData.message}
            onChangeText={(value: string) =>
              handleInputChange('message', value)
            }
            placeholder='กรุณาระบุรายละเอียดปัญหา'
            placeholderTextColor={iconColor}
            multiline
            numberOfLines={4}
            textAlignVertical='top'
          />
        </ThemedView>

        {/* Phone Input */}
        <ThemedView style={styles.inputGroup}>
          <ThemedText style={styles.inputLabel}>
            ช่องทางติดต่อกลับ <ThemedText style={styles.required}>*</ThemedText>
          </ThemedText>
          <TextInput
            style={[
              styles.textInput,
              { color: textColor, borderColor: '#F0F0F0' },
            ]}
            value={formData.phone}
            onChangeText={(value: string) => handleInputChange('phone', value)}
            placeholder='กรุณากรอกช่องทางติดต่อกลับ'
            placeholderTextColor={iconColor}
            keyboardType='phone-pad'
          />
          <ThemedText style={styles.fileHint}>
            เบอร์โทรศัพท์ หรือ อีเมล และเวลาที่สะดวกติดต่อกลับ (ถ้ามี)
          </ThemedText>
        </ThemedView>

        {/* File Upload */}
        <ThemedView style={styles.inputGroup}>
          <ThemedText style={styles.inputLabel}>ไฟล์แนบ (ถ้ามี)</ThemedText>
          <ThemedText style={styles.fileHint}>
            รองรับไฟล์ JPG, PNG, PDF, ZIP ขนาดไม่เกิน 20 MB
          </ThemedText>

          <TouchableOpacity
            style={[styles.fileUploadButton, { borderColor: '#F0F0F0' }]}
            onPress={handleFileUpload}
          >
            <IconSymbol name='paperclip' size={20} color={iconColor} />
            <ThemedText style={[styles.fileUploadText, { color: iconColor }]}>
              {selectedFile ? selectedFile.name : 'เลือกไฟล์...'}
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitButton, { backgroundColor: tintColor }]}
        onPress={handleSubmit}
      >
        <IconSymbol name='paperplane' size={20} color='white' />
        <ThemedText style={styles.submitButtonText}>ส่ง</ThemedText>
      </TouchableOpacity>
    </>
  )

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <ScrollView style={styles.scrollContainer}>
        <ThemedView
          style={[styles.mainContent, isTablet && styles.tabletLayout]}
        >
          {isTablet ? (
            <ThemedView style={styles.desktopLayout}>
              <ThemedView style={styles.formSection}>
                {renderContactForm()}
              </ThemedView>
            </ThemedView>
          ) : (
            <ThemedView>{renderContactForm()}</ThemedView>
          )}
        </ThemedView>
      </ScrollView>
      <StatusBarGradient />
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  mainContent: {
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  tabletLayout: {
    paddingHorizontal: 40,
  },
  desktopLayout: {
    flexDirection: 'row',
    gap: 30,
    alignItems: 'flex-start',
  },
  formSection: {
    flex: 2,
    minWidth: 400,
  },
  sidebarSection: {
    flex: 1,
    minWidth: 300,
  },

  // Form Styles
  formContainer: {
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: isTablet ? 0 : 20,
  },
  formTitle: {
    marginTop: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Prompt-SemiBold',
    marginBottom: 8,
  },
  required: {
    color: '#ff4444',
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'transparent',
    fontFamily: 'Prompt-Regular',
  },
  textAreaInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'transparent',
    minHeight: 100,
    fontFamily: 'Prompt-Regular',
  },
  fileHint: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 8,
  },
  fileUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  fileUploadText: {
    marginLeft: 8,
    fontSize: 16,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    color: 'white',
  },

  // Sidebar Styles
  sidebar: {
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sidebarContent: {
    marginBottom: 24,
  },
  sidebarTitle: {
    marginBottom: 8,
  },
  sidebarSubtitle: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  ticketCount: {
    fontSize: 14,
  },
  notificationBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  ticketItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  ticketHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ticketTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  ticketId: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
    lineHeight: 20,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketDate: {
    fontSize: 12,
    opacity: 0.6,
    flex: 1,
  },
  ticketStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  successButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  successButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
})
