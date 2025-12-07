import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  BackHandler,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import { RadioButton } from 'react-native-paper'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useDispatch, useSelector } from 'react-redux'

import { ThemedText } from '@/components/ThemedText'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { useThemeColor } from '@/hooks/useThemeColor'
import * as learnActions from '@/modules/learn/actions'
import * as uiActions from '@/modules/ui/actions'
import type { AppDispatch, RootState } from '@/store/types'

interface TestItem {
  id: number
  no: number
  question: string
  numChoices: number
  choice1?: string
  choice2?: string
  choice3?: string
  choice4?: string
  choice5?: string
  imgUrl?: string
  imgUrl1?: string
  imgUrl2?: string
  imgUrl3?: string
  imgUrl4?: string
  imgUrl5?: string
}

export default function TestScreen() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const backgroundColor = useThemeColor({}, 'background')
  const tintColor = useThemeColor({}, 'tint')

  const {
    testId,
    contentViewId,
    courseRegistrationId,
    testName,
    testMinutes,
    testMaxTries,
    testTries,
    testScore,
    autoStart,
  } = useLocalSearchParams<{
    testId: string
    contentViewId: string
    courseRegistrationId: string
    testName: string
    testMinutes: string
    testMaxTries: string
    testTries: string
    testScore: string
    autoStart: string
  }>()

  const { test, testItems, isLoading } = useSelector(
    (state: RootState) => state.learn
  )

  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [timeRemaining, setTimeRemaining] = useState<number>(
    parseInt(testMinutes || '30') * 60
  )
  const [testStarted, setTestStarted] = useState(false)
  const [currentTries, setCurrentTries] = useState(parseInt(testTries || '0'))
  const maxTries = parseInt(testMaxTries || '10')

  // Exit confirmation modal state
  const [exitModalVisible, setExitModalVisible] = useState(false)

  // Load test data
  useEffect(() => {
    if (testId) {
      dispatch(learnActions.loadTest(parseInt(testId)))
      dispatch(learnActions.loadTestItems(parseInt(testId)))
    }
  }, [dispatch, testId])

  // Track if auto-start has been triggered
  const [autoStartTriggered, setAutoStartTriggered] = useState(false)

  // Auto-start test if navigated with autoStart flag
  useEffect(() => {
    if (
      autoStart === 'true' &&
      !testStarted &&
      !isLoading &&
      testItems?.length > 0 &&
      !autoStartTriggered &&
      currentTries < maxTries
    ) {
      setAutoStartTriggered(true)
      // Update test tries
      dispatch(
        learnActions.updateTestTries(
          parseInt(courseRegistrationId || '0'),
          parseInt(contentViewId || '0')
        )
      )
      setCurrentTries((prev) => prev + 1)
      setTestStarted(true)
      setTimeRemaining(parseInt(testMinutes || '30') * 60)
    }
  }, [
    autoStart,
    isLoading,
    testItems,
    testStarted,
    autoStartTriggered,
    currentTries,
    maxTries,
  ])

  // Timer countdown
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null
    if (testStarted && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Auto submit when time's up
            handleSubmitTest(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [testStarted, timeRemaining])

  // Handle back button to prevent accidental exit during test
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (testStarted) {
          setExitModalVisible(true)
          return true
        }
        return false
      }
    )
    return () => backHandler.remove()
  }, [testStarted])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`
  }

  const handleStartTest = () => {
    if (currentTries >= maxTries) {
      dispatch(
        uiActions.setFlashMessage(
          'คุณทำแบบทดสอบครบจำนวนครั้งที่กำหนดแล้ว',
          'error'
        )
      )
      return
    }

    // Update test tries
    dispatch(
      learnActions.updateTestTries(
        parseInt(courseRegistrationId || '0'),
        parseInt(contentViewId || '0')
      )
    )
    setCurrentTries((prev) => prev + 1)
    setTestStarted(true)
    setTimeRemaining(parseInt(testMinutes || '30') * 60)
  }

  const handleSelectAnswer = (questionNo: number, choiceId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionNo]: choiceId,
    }))
  }

  const handleSubmitTest = useCallback(
    (autoSubmit: boolean = false) => {
      if (!testStarted && !autoSubmit) return

      // Build answer string
      const answerString = testItems
        .map((item: TestItem) => answers[item.no] || '0')
        .join('')

      // Submit the test (button is disabled until all answered, so just submit)
      submitTest(answerString)
    },
    [testStarted, testItems, answers]
  )

  const submitTest = (answerString: string) => {
    dispatch(
      learnActions.updateTest(
        parseInt(courseRegistrationId || '0'),
        parseInt(contentViewId || '0'),
        answerString,
        testItems.length
      )
    )
    setTestStarted(false)
    // Navigate back after submission
    setTimeout(() => {
      router.back()
    }, 500)
  }

  const handleGoBack = () => {
    if (testStarted) {
      setExitModalVisible(true)
    } else {
      router.back()
    }
  }

  const handleExitModalCancel = () => {
    setExitModalVisible(false)
  }

  const handleExitModalConfirm = () => {
    setExitModalVisible(false)
    handleSubmitTest(false)
  }

  const answeredCount = Object.keys(answers).length
  const totalQuestions = testItems?.length || 0

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color={tintColor} />
          <ThemedText style={styles.loadingText}>
            กำลังโหลดแบบทดสอบ...
          </ThemedText>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <IconSymbol name='chevron.left' size={24} color='#1F2937' />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <ThemedText style={styles.headerText} numberOfLines={1}>
            {test?.name || testName || 'แบบทดสอบ'}
          </ThemedText>
        </View>
        {testStarted && (
          <View style={styles.timerContainer}>
            <IconSymbol name='clock.fill' size={16} color='#f44336' />
            <ThemedText style={styles.timerText}>
              {formatTime(timeRemaining)}
            </ThemedText>
          </View>
        )}
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {!testStarted ? (
          // Test Info Screen
          <View style={styles.infoContainer}>
            <ThemedText style={styles.testTitle}>
              {test?.name || testName}
            </ThemedText>

            <View style={styles.infoCard}>
              <ThemedText style={styles.infoLabel}>คำชี้แจง</ThemedText>
              <ThemedText style={styles.infoValue}>
                {test?.instruction || 'จงเลือกคำตอบที่ถูกที่สุดเพียงข้อเดียว'}
              </ThemedText>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <ThemedText style={styles.infoLabel}>เกณฑ์ผ่าน</ThemedText>
                <ThemedText style={styles.infoValue}>
                  {test?.minScore || 0} คะแนน
                </ThemedText>
              </View>
              <View style={styles.infoItem}>
                <ThemedText style={styles.infoLabel}>เวลา</ThemedText>
                <ThemedText style={styles.infoValue}>
                  {test?.minutes || testMinutes || 30} นาที
                </ThemedText>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <ThemedText style={styles.infoLabel}>ทำได้ไม่เกิน</ThemedText>
                <ThemedText style={styles.infoValue}>
                  {maxTries} ครั้ง
                </ThemedText>
              </View>
              <View style={styles.infoItem}>
                <ThemedText style={styles.infoLabel}>จำนวนข้อ</ThemedText>
                <ThemedText style={styles.infoValue}>
                  {totalQuestions} ข้อ
                </ThemedText>
              </View>
            </View>

            <View style={styles.separator} />

            <View style={styles.statusContainer}>
              <ThemedText style={styles.statusText}>
                ทำแบบทดสอบแล้ว {currentTries} จาก {maxTries} ครั้ง
              </ThemedText>
              <ThemedText style={styles.statusText}>
                คะแนนสูงสุดที่ทำได้ {testScore || 0} เต็ม {totalQuestions} คะแนน
              </ThemedText>
            </View>

            <View style={styles.separator} />

            <View style={styles.warningContainer}>
              <ThemedText style={styles.warningText}>
                โปรดส่งแบบทดสอบก่อนออกจากห้องสอบ
              </ThemedText>
              <ThemedText style={styles.warningText}>
                คำตอบของคุณจะถูกบันทึกโดยอัตโนมัติเมื่อหมดเวลา
              </ThemedText>
            </View>

            <TouchableOpacity
              style={[
                styles.startButton,
                currentTries >= maxTries && styles.disabledButton,
              ]}
              onPress={handleStartTest}
              disabled={currentTries >= maxTries}
            >
              <IconSymbol name='play.circle.fill' size={24} color='#FFFFFF' />
              <ThemedText style={styles.startButtonText}>
                {currentTries >= maxTries
                  ? 'ครบจำนวนครั้งที่กำหนดแล้ว'
                  : 'เริ่มจับเวลา และ ทำแบบทดสอบ'}
              </ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          // Test Questions
          <View style={styles.questionsContainer}>
            {testItems.map((item: TestItem) => (
              <View key={item.id} style={styles.questionCard}>
                <View style={styles.questionHeader}>
                  <View style={styles.questionNumber}>
                    <ThemedText style={styles.questionNumberText}>
                      {item.no}
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.questionText}>
                    {item.question?.replace(/<[^>]*>/g, '') || ''}
                  </ThemedText>
                </View>

                <RadioButton.Group
                  onValueChange={(value) => handleSelectAnswer(item.no, value)}
                  value={answers[item.no] || ''}
                >
                  {[
                    { id: '1', text: item.choice1, img: item.imgUrl1 },
                    { id: '2', text: item.choice2, img: item.imgUrl2 },
                    { id: '3', text: item.choice3, img: item.imgUrl3 },
                    { id: '4', text: item.choice4, img: item.imgUrl4 },
                    { id: '5', text: item.choice5, img: item.imgUrl5 },
                  ]
                    .filter((choice) => choice.text || choice.img)
                    .map((choice) => (
                      <TouchableOpacity
                        key={choice.id}
                        style={styles.optionContainer}
                        onPress={() => handleSelectAnswer(item.no, choice.id)}
                      >
                        <RadioButton.Android
                          value={choice.id}
                          color='#183A7C'
                          uncheckedColor='#9CA3AF'
                        />
                        <ThemedText style={styles.optionText}>
                          {choice.text?.replace(/<[^>]*>/g, '') || ''}
                        </ThemedText>
                      </TouchableOpacity>
                    ))}
                </RadioButton.Group>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Fixed Bottom Bar - Progress and Submit Button */}
      {testStarted && (
        <View style={[styles.fixedBottomBar, { backgroundColor }]}>
          <ThemedText style={styles.bottomProgressText}>
            ตอบแล้ว {answeredCount}/{totalQuestions} ข้อ
          </ThemedText>
          <TouchableOpacity
            style={[
              styles.submitButton,
              answeredCount < totalQuestions && styles.submitButtonDisabled,
            ]}
            onPress={() => handleSubmitTest(false)}
            disabled={answeredCount < totalQuestions}
          >
            <IconSymbol name='paperplane.fill' size={20} color='#FFFFFF' />
            <ThemedText style={styles.submitButtonText}>ส่งแบบทดสอบ</ThemedText>
          </TouchableOpacity>
        </View>
      )}

      {/* Exit Confirmation Modal */}
      <Modal
        visible={exitModalVisible}
        transparent
        animationType='fade'
        onRequestClose={handleExitModalCancel}
      >
        <TouchableWithoutFeedback onPress={handleExitModalCancel}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContainer}>
                <ThemedText style={styles.modalTitle}>
                  ออกจากห้องสอบ?
                </ThemedText>
                <ThemedText style={styles.modalMessage}>
                  คุณแน่ใจหรือไม่ว่าต้องการออกจากห้องสอบ?{'\n'}
                  คำตอบของคุณจะถูกบันทึกโดยอัตโนมัติ
                </ThemedText>
                <View style={styles.modalButtonRow}>
                  <TouchableOpacity
                    style={styles.modalButtonCancel}
                    onPress={handleExitModalCancel}
                  >
                    <ThemedText style={styles.modalButtonCancelText}>
                      ยกเลิก
                    </ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalButtonConfirm}
                    onPress={handleExitModalConfirm}
                  >
                    <ThemedText style={styles.modalButtonConfirmText}>
                      ออก
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    marginHorizontal: 8,
  },
  headerText: {
    fontSize: 18,
    fontFamily: 'Prompt-SemiBold',
    color: '#1F2937',
  },
  timerContainer: {
    minWidth: 90,
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  timerText: {
    fontSize: 14,
    fontFamily: 'Prompt-SemiBold',
    color: '#f44336',
    marginLeft: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 160, // Space for fixed bottom bar
  },
  infoContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  testTitle: {
    fontSize: 20,
    fontFamily: 'Prompt-SemiBold',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  infoCard: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: 'Prompt-Medium',
    color: '#6B7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    fontFamily: 'Prompt-Regular',
    color: '#1F2937',
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 20,
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusText: {
    fontSize: 15,
    fontFamily: 'Prompt-Medium',
    color: '#374151',
    marginBottom: 4,
  },
  warningContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  warningText: {
    fontSize: 14,
    fontFamily: 'Prompt-Regular',
    color: '#f44336',
    textAlign: 'center',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#183A7C',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  startButtonText: {
    fontSize: 16,
    fontFamily: 'Prompt-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  questionsContainer: {
    paddingBottom: 20,
  },
  fixedBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 40,
    borderTopWidth: 0.5,
    borderTopColor: '#E5E7EB',
    alignItems: 'center',
  },
  bottomProgressText: {
    fontSize: 14,
    fontFamily: 'Prompt-Medium',
    color: '#6B7280',
    marginBottom: 12,
    textAlign: 'center',
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
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
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  questionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#183A7C',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    marginTop: 2,
  },
  questionNumberText: {
    fontSize: 14,
    fontFamily: 'Prompt-SemiBold',
    color: '#FFFFFF',
  },
  questionText: {
    flex: 1,
    paddingTop: 5,
    fontSize: 16,
    fontFamily: 'Prompt-Medium',
    color: '#1F2937',
    lineHeight: 24,
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 3,
    borderRadius: 8,
    marginBottom: 4,
  },
  optionText: {
    fontSize: 15,
    fontFamily: 'Prompt-Regular',
    color: '#374151',
    marginLeft: 8,
    flex: 1,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#183A7C',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    fontSize: 18,
    fontFamily: 'Prompt-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    maxWidth: 400,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Prompt-SemiBold',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    fontFamily: 'Prompt-Regular',
    color: '#4B5563',
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  modalButtonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButtonCancel: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  modalButtonCancelText: {
    fontSize: 16,
    fontFamily: 'Prompt-SemiBold',
    color: '#1F2937',
  },
  modalButtonConfirm: {
    flex: 1,
    backgroundColor: '#f44336',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  modalButtonConfirmText: {
    fontSize: 16,
    fontFamily: 'Prompt-SemiBold',
    color: 'white',
  },
})
