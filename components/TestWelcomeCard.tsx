import React from 'react'
import { Alert, StyleSheet, TouchableOpacity } from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { useThemeColor } from '@/hooks/useThemeColor'

import { ClassroomContent } from './types'

interface TestWelcomeCardProps {
  selectedContent: ClassroomContent
  courseName: string
  onOpenTest: () => void
}

export function TestWelcomeCard({
  selectedContent,
  courseName,
  onOpenTest,
}: TestWelcomeCardProps) {
  const tintColor = useThemeColor({}, 'tint')

  return (
    <ThemedView style={styles.testWelcomeContainer}>
      {/* Test Details Card */}

      <ThemedText style={styles.testSubject}>
        {selectedContent.name} รายวิชา {courseName}
      </ThemedText>
      <ThemedText style={styles.testInfo}>
        <ThemedText style={styles.testInfoBold}>คำชี้แจง </ThemedText>
        จงเลือกคำตอบที่ถูกที่สุดเพียงข้อเดียว
      </ThemedText>
      <ThemedText style={styles.testInfo}>
        <ThemedText style={styles.testInfoBold}>เกณฑ์ผ่าน </ThemedText>50 คะแนน
      </ThemedText>
      <ThemedText style={styles.testInfo}>
        <ThemedText style={styles.testInfoBold}>
          เวลาที่ใช้ทำแบบทดสอบ{' '}
        </ThemedText>
        {selectedContent.minutes || 45} นาที
      </ThemedText>
      <ThemedText style={styles.testInfo}>
        <ThemedText style={styles.testInfoBold}>
          ทำแบบทดสอบได้ไม่เกิน{' '}
        </ThemedText>
        10 ครั้ง
      </ThemedText>

      {/* Separator Line */}
      <ThemedView style={styles.separator} />

      {/* Current Status Card */}
      <ThemedText style={styles.testStatusText}>
        ทำแบบทดสอบแล้ว {selectedContent.testTries || 0} จาก 10 ครั้ง
      </ThemedText>
      <ThemedText style={styles.testStatusText}>
        คะแนนสูงสุดที่ทำได้ {selectedContent.testScore || 0} เต็ม 100 คะแนน
      </ThemedText>

      {/* Separator Line */}
      <ThemedView style={styles.separator} />

      {/* Important Notes Card */}
      <ThemedText style={styles.testWarningText}>
        โปรดส่งแบบทดสอบก่อนออกจากห้องสอบ
      </ThemedText>
      <ThemedText style={styles.testWarningText}>
        คำตอบของคุณจะถูกบันทึกโดยอัตโนมัติเมื่อหมดเวลา
      </ThemedText>

      {/* Action Button */}
      <TouchableOpacity
        style={[
          styles.actionButton,
          { backgroundColor: tintColor, marginTop: 60 },
        ]}
        onPress={() => {
          Alert.alert(
            'เริ่มทำแบบทดสอบ',
            'คุณต้องการเริ่มทำแบบทดสอบหรือไม่?\n\nเมื่อเริ่มแล้ว เวลาจะเริ่มนับทันที',
            [
              { text: 'ยกเลิก', style: 'cancel' },
              {
                text: 'เริ่มทำ',
                onPress: () => {
                  onOpenTest()
                },
              },
            ]
          )
        }}
      >
        <IconSymbol name='play.circle.fill' size={20} color='white' />
        <ThemedText style={styles.actionButtonText}>เริ่มทำแบบทดสอบ</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  testWelcomeContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  testCard: {
    borderRadius: 12,
    padding: 22,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 30,
  },
  testSubject: {
    fontSize: 16,
    fontFamily: 'Prompt-SemiBold',
    color: '#1F2937',
    marginBottom: 12,
  },
  testInfo: {
    fontSize: 15,
    fontFamily: 'Prompt-Regular',
    color: '#6B7280',
    marginBottom: 4,
  },
  testInfoBold: {
    fontSize: 15,
    fontFamily: 'Prompt-Medium',
    color: '#6B7280',
    paddingRight: 4,
  },
  testStatusText: {
    fontSize: 16,
    fontFamily: 'Prompt-Medium',
    color: '#6B7280',
    marginBottom: 2,
    textAlign: 'center',
  },
  testWarningText: {
    fontSize: 15,
    fontFamily: 'Prompt-Regular',
    color: '#D14343',
    textAlign: 'center',
    marginBottom: 2,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    color: 'white',
  },
})
