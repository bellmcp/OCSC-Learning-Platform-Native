import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { useThemeColor } from '@/hooks/useThemeColor'
import * as learnActions from '@/modules/learn/actions'
import type { AppDispatch, RootState } from '@/store/types'

import { ClassroomContent } from './types'

// Hero image for completed state
const HeroImage = require('@/assets/images/hero-evaluation.png')

interface TestWelcomeCardProps {
  selectedContent: ClassroomContent
  courseName: string
  courseRegistrationId?: number
  contentViewId?: number | null
  testId?: number | null
  onOpenTest: () => void
}

export function TestWelcomeCard({
  selectedContent,
  courseName,
  courseRegistrationId,
  contentViewId,
  testId,
  onOpenTest,
}: TestWelcomeCardProps) {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const tintColor = useThemeColor({}, 'tint')

  const { test, testItems, isLoading } = useSelector(
    (state: RootState) => state.learn
  )

  const [initialTestTries, setInitialTestTries] = useState(
    selectedContent.testTries || 0
  )
  const [initialTestScore, setInitialTestScore] = useState(
    selectedContent.testScore || 0
  )

  // Load test data when component mounts
  useEffect(() => {
    if (testId) {
      dispatch(learnActions.loadTest(testId))
      dispatch(learnActions.loadTestItems(testId))
    }
  }, [dispatch, testId])

  // Update local state when selectedContent changes
  useEffect(() => {
    setInitialTestTries(selectedContent.testTries || 0)
    setInitialTestScore(selectedContent.testScore || 0)
  }, [selectedContent])

  const testMaxTries = test?.maxTries || 10
  const testMinutes = test?.minutes || selectedContent.minutes || 30
  const isCompleted = selectedContent.completed

  const handleStartTest = () => {
    if (!courseRegistrationId || !contentViewId || !testId) {
      return
    }

    // Navigate to test screen with autoStart flag to immediately start the test
    router.push({
      pathname: '/test',
      params: {
        testId: testId.toString(),
        contentViewId: contentViewId.toString(),
        courseRegistrationId: courseRegistrationId.toString(),
        testName: test?.name || selectedContent.name,
        testMinutes: testMinutes.toString(),
        testMaxTries: testMaxTries.toString(),
        testTries: initialTestTries.toString(),
        testScore: initialTestScore.toString(),
        autoStart: 'true',
      },
    })
  }

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size='large' color={tintColor} />
        <ThemedText style={styles.loadingText}>กำลังโหลดแบบทดสอบ...</ThemedText>
      </ThemedView>
    )
  }

  // Show completed state
  if (isCompleted) {
    return (
      <ThemedView style={styles.completedContainer}>
        <Image
          source={HeroImage}
          style={styles.heroImage}
          resizeMode='contain'
        />
        <ThemedText style={styles.completedTitle}>คุณผ่านเกณฑ์แล้ว</ThemedText>
        <ThemedText style={styles.completedInfo}>
          <ThemedText style={styles.completedInfoBold}>ทำแบบทดสอบ </ThemedText>
          {initialTestTries} จาก {testMaxTries} ครั้ง
        </ThemedText>
        <ThemedText style={styles.completedInfo}>
          <ThemedText style={styles.completedInfoBold}>
            คะแนนสูงสุดที่ทำได้{' '}
          </ThemedText>
          {initialTestScore} เต็ม {testItems?.length || 0} คะแนน
        </ThemedText>
      </ThemedView>
    )
  }

  return (
    <ThemedView style={styles.testWelcomeContainer}>
      {/* Test Details Card */}
      <ThemedText style={styles.testSubject}>
        {test?.name || selectedContent.name}
      </ThemedText>
      <ThemedText style={styles.testSubtitle}>รายวิชา {courseName}</ThemedText>

      <View style={styles.separator} />

      <ThemedText style={styles.testInfo}>
        <ThemedText style={styles.testInfoBold}>คำชี้แจง</ThemedText>{' '}
        {test?.instruction || 'จงเลือกคำตอบที่ถูกที่สุดเพียงข้อเดียว'}
      </ThemedText>
      <ThemedText style={styles.testInfo}>
        <ThemedText style={styles.testInfoBold}>เกณฑ์ผ่าน</ThemedText>{' '}
        {test?.minScore || 0} คะแนน
      </ThemedText>
      <ThemedText style={styles.testInfo}>
        <ThemedText style={styles.testInfoBold}>
          เวลาที่ใช้ทำแบบทดสอบ
        </ThemedText>{' '}
        {testMinutes} นาที
      </ThemedText>
      <ThemedText style={styles.testInfo}>
        <ThemedText style={styles.testInfoBold}>
          ทำแบบทดสอบได้ไม่เกิน
        </ThemedText>{' '}
        {testMaxTries} ครั้ง
      </ThemedText>

      {/* Separator Line */}
      <View style={styles.separator} />

      {/* Current Status Card */}
      <ThemedText style={styles.testStatusText}>
        <ThemedText style={styles.testStatusBold}>ทำแบบทดสอบแล้ว</ThemedText>{' '}
        {initialTestTries} จาก {testMaxTries} ครั้ง
      </ThemedText>
      <ThemedText style={styles.testStatusText}>
        <ThemedText style={styles.testStatusBold}>
          คะแนนสูงสุดที่ทำได้
        </ThemedText>{' '}
        {initialTestScore} เต็ม {testItems?.length || 0} คะแนน
      </ThemedText>

      {/* Separator Line */}
      <View style={styles.separator} />

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
          { backgroundColor: tintColor, marginTop: 18 },
          initialTestTries >= testMaxTries && styles.disabledButton,
        ]}
        onPress={handleStartTest}
        disabled={initialTestTries >= testMaxTries}
      >
        <IconSymbol name='play.circle.fill' size={20} color='white' />
        <ThemedText style={styles.actionButtonText}>
          {initialTestTries >= testMaxTries
            ? 'ครบจำนวนครั้งที่กำหนดแล้ว'
            : 'เริ่มจับเวลา และ ทำแบบทดสอบ'}
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Prompt-Regular',
    color: '#6B7280',
  },
  completedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#FFFFFF',
  },
  heroImage: {
    width: '100%',
    height: 200,
    marginBottom: 24,
  },
  completedTitle: {
    fontSize: 22,
    lineHeight: 26,
    fontFamily: 'Prompt-SemiBold',
    color: '#1F2937',
    marginBottom: 16,
  },
  completedInfo: {
    fontSize: 15,
    fontFamily: 'Prompt-Regular',
    color: '#6B7280',
    marginBottom: 4,
    textAlign: 'center',
  },
  completedInfoBold: {
    fontFamily: 'Prompt-Medium',
  },
  testWelcomeContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  testSubject: {
    fontSize: 18,
    fontFamily: 'Prompt-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  testSubtitle: {
    fontSize: 14,
    fontFamily: 'Prompt-Regular',
    color: '#6B7280',
    marginBottom: 8,
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  testInfo: {
    fontSize: 16,
    lineHeight: 26,
    fontFamily: 'Prompt-Regular',
    color: '#6B7280',
    marginBottom: 4,
  },
  testInfoBold: {
    fontSize: 16,
    fontFamily: 'Prompt-SemiBold',
    color: '#1F2937',
  },
  testStatusText: {
    fontSize: 16,
    lineHeight: 26,
    fontFamily: 'Prompt-Regular',
    color: '#1F2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  testStatusBold: {
    fontSize: 16,
    fontFamily: 'Prompt-SemiBold',
    color: '#1F2937',
  },
  testWarningText: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Prompt-SemiBold',
    color: '#f44336',
    textAlign: 'center',
    marginBottom: 0,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
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
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  actionButtonText: {
    fontSize: 16,
    fontFamily: 'Prompt-SemiBold',
    marginLeft: 8,
    color: 'white',
  },
})
