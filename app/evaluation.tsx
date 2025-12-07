import { router, useLocalSearchParams } from 'expo-router'
import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { RadioButton } from 'react-native-paper'
import { useDispatch, useSelector } from 'react-redux'

import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { useThemeColor } from '@/hooks/useThemeColor'
import * as learnActions from '@/modules/learn/actions'
import type { AppDispatch, RootState } from '@/store/types'

// Hero image for completed state
const HeroImage = require('@/assets/images/hero-evaluation.png')

interface EvaluationItem {
  id: number
  no: number
  question: string
  choice1?: string
  choice2?: string
  choice3?: string
  choice4?: string
  choice5?: string
}

export default function EvaluationScreen() {
  const {
    evaluationId,
    contentViewId,
    courseRegistrationId,
    isCompleted: isCompletedParam,
  } = useLocalSearchParams<{
    evaluationId: string
    contentViewId: string
    courseRegistrationId: string
    isCompleted: string
  }>()

  const dispatch = useDispatch<AppDispatch>()
  const backgroundColor = useThemeColor({}, 'background')
  const iconColor = useThemeColor({}, 'icon')
  const tintColor = useThemeColor({}, 'tint')

  const { isLoading, evaluation, evaluationItems } = useSelector(
    (state: RootState) => state.learn
  )

  const [selectedAnswers, setSelectedAnswers] = useState<Map<number, string>>(
    new Map()
  )
  const [opinion, setOpinion] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCompleted, setIsCompleted] = useState(isCompletedParam === 'true')

  // Load evaluation data
  useEffect(() => {
    if (evaluationId) {
      dispatch(learnActions.loadEvaluation(parseInt(evaluationId)))
      dispatch(learnActions.loadEvaluationItems(parseInt(evaluationId)))
    }
  }, [dispatch, evaluationId])

  const handleAnswerSelect = (questionNo: number, choiceId: string) => {
    setSelectedAnswers((prev) => new Map(prev).set(questionNo, choiceId))
  }

  const handleSubmitEvaluation = async () => {
    setIsSubmitting(true)

    // Build evaluation answer string
    const answerString = evaluationItems
      .map((item: EvaluationItem) => selectedAnswers.get(item.no) || '0')
      .join('')

    try {
      await dispatch(
        learnActions.updateEvaluation(
          parseInt(courseRegistrationId || '0'),
          parseInt(contentViewId || '0'),
          answerString,
          opinion
        )
      )
      setIsCompleted(true)
    } catch (error) {
      console.error('Failed to submit evaluation:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const answeredCount = selectedAnswers.size
  const totalQuestions = evaluationItems?.length || 0
  const allAnswered = answeredCount >= totalQuestions

  const renderQuestion = (item: EvaluationItem) => {
    const choices = [
      { id: '1', text: item.choice1 },
      { id: '2', text: item.choice2 },
      { id: '3', text: item.choice3 },
      { id: '4', text: item.choice4 },
      { id: '5', text: item.choice5 },
    ].filter((choice) => choice.text)

    return (
      <ThemedView key={item.id} style={styles.questionCard}>
        {/* Question Header */}
        <ThemedView style={styles.questionHeader}>
          <ThemedView
            style={[styles.questionNumber, { backgroundColor: tintColor }]}
          >
            <ThemedText style={styles.questionNumberText}>{item.no}</ThemedText>
          </ThemedView>
          <ThemedText style={styles.questionText}>{item.question}</ThemedText>
        </ThemedView>

        {/* Options */}
        <RadioButton.Group
          onValueChange={(value) => handleAnswerSelect(item.no, value)}
          value={selectedAnswers.get(item.no) || ''}
        >
          {choices.map((choice) => (
            <TouchableOpacity
              key={choice.id}
              style={styles.optionContainer}
              onPress={() => handleAnswerSelect(item.no, choice.id)}
            >
              <RadioButton.Android
                value={choice.id}
                color={tintColor}
                uncheckedColor='#9CA3AF'
              />
              <ThemedText style={styles.optionText}>{choice.text}</ThemedText>
            </TouchableOpacity>
          ))}
        </RadioButton.Group>
      </ThemedView>
    )
  }

  // Loading state
  if (isLoading && !evaluation) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <ThemedView style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <IconSymbol name='chevron.left' size={24} color={iconColor} />
            </TouchableOpacity>
            <ThemedText type='title' style={styles.headerTitle}>
              แบบประเมิน
            </ThemedText>
            <View style={styles.backButton} />
          </View>
        </ThemedView>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color={tintColor} />
          <ThemedText style={styles.loadingText}>
            กำลังโหลดแบบประเมิน...
          </ThemedText>
        </View>
      </ThemedView>
    )
  }

  // Completed state
  if (isCompleted) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <ThemedView style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <IconSymbol name='chevron.left' size={24} color={iconColor} />
            </TouchableOpacity>
            <ThemedText type='title' style={styles.headerTitle}>
              แบบประเมิน
            </ThemedText>
            <View style={styles.backButton} />
          </View>
        </ThemedView>
        <View style={styles.completedContainer}>
          <Image
            source={HeroImage}
            style={styles.heroImage}
            resizeMode='contain'
          />
          <ThemedText style={styles.completedTitle}>
            บันทึกข้อมูลแล้ว
          </ThemedText>
          <ThemedText style={styles.completedSubtitle}>
            ขอบคุณสำหรับความคิดเห็นของคุณ
          </ThemedText>
          <TouchableOpacity
            style={[
              styles.backToClassroomButton,
              { backgroundColor: tintColor },
            ]}
            onPress={() => router.back()}
          >
            <IconSymbol name='arrow.left' size={20} color='white' />
            <ThemedText style={styles.backToClassroomText}>
              กลับไปยังห้องเรียน
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    )
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
            แบบประเมิน
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
        {/* Evaluation Title & Instructions */}
        <ThemedView style={styles.instructionsSection}>
          <ThemedText style={styles.evaluationTitle}>
            {evaluation?.name || 'แบบประเมิน'}
          </ThemedText>
          {evaluation?.instruction && (
            <ThemedText style={styles.evaluationInstructions}>
              <ThemedText style={styles.instructionBold}>คำชี้แจง</ThemedText>{' '}
              {evaluation.instruction}
            </ThemedText>
          )}
        </ThemedView>

        {/* Questions */}
        <View style={styles.questionsContainer}>
          {evaluationItems.map((item: EvaluationItem) => renderQuestion(item))}
        </View>

        {/* Opinion Section */}
        <ThemedView style={styles.opinionSection}>
          <ThemedView style={styles.opinionHeader}>
            <View style={[styles.opinionIcon, { backgroundColor: tintColor }]}>
              <IconSymbol name='ellipsis' size={20} color='white' />
            </View>
            <ThemedText style={styles.opinionTitle}>
              ข้อคิดเห็น และ ข้อเสนอแนะ (ถ้ามี)
            </ThemedText>
          </ThemedView>
          <View style={styles.opinionDivider} />
          <TextInput
            style={styles.opinionInput}
            placeholder={evaluation?.opinion || 'แสดงความคิดเห็น'}
            placeholderTextColor='#9CA3AF'
            multiline
            numberOfLines={6}
            textAlignVertical='top'
            value={opinion}
            onChangeText={setOpinion}
          />
        </ThemedView>
      </ScrollView>

      {/* Fixed Bottom Bar */}
      <View style={[styles.fixedBottomBar, { backgroundColor }]}>
        <ThemedText style={styles.bottomProgressText}>
          ตอบแล้ว {answeredCount}/{totalQuestions} ข้อ
        </ThemedText>
        <TouchableOpacity
          style={[
            styles.submitButton,
            { backgroundColor: tintColor },
            !allAnswered && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmitEvaluation}
          disabled={!allAnswered || isSubmitting}
        >
          <IconSymbol name='paperplane.fill' size={20} color='white' />
          <ThemedText style={styles.submitButtonText}>
            {isSubmitting ? 'กำลังส่ง...' : 'ส่งแบบประเมิน'}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  heroImage: {
    width: '100%',
    height: 200,
    marginBottom: 24,
  },
  completedTitle: {
    fontSize: 22,
    fontFamily: 'Prompt-SemiBold',
    color: '#1F2937',
    marginBottom: 8,
  },
  completedSubtitle: {
    fontSize: 16,
    fontFamily: 'Prompt-Regular',
    color: '#6B7280',
    marginBottom: 32,
  },
  backToClassroomButton: {
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
  backToClassroomText: {
    fontSize: 16,
    fontFamily: 'Prompt-SemiBold',
    color: 'white',
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 160,
  },
  instructionsSection: {
    margin: 20,
    padding: 24,
    borderRadius: 20,
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
    backgroundColor: '#FFFFFF',
  },
  evaluationTitle: {
    fontSize: 18,
    fontFamily: 'Prompt-SemiBold',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  evaluationInstructions: {
    fontSize: 16,
    fontFamily: 'Prompt-Regular',
    color: '#6B7280',
    lineHeight: 24,
  },
  instructionBold: {
    fontFamily: 'Prompt-SemiBold',
    color: '#1F2937',
  },
  questionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
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
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    marginTop: 2,
  },
  questionNumberText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Prompt-SemiBold',
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
  opinionSection: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 24,
    borderRadius: 20,
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
    backgroundColor: '#FFFFFF',
  },
  opinionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  opinionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  opinionTitle: {
    fontSize: 16,
    fontFamily: 'Prompt-SemiBold',
    color: '#1F2937',
    flex: 1,
  },
  opinionDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  opinionInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    fontFamily: 'Prompt-Regular',
    color: '#1F2937',
    minHeight: 120,
    backgroundColor: '#F9FAFB',
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
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
    marginLeft: 8,
    color: 'white',
  },
})
