import { router, useLocalSearchParams } from 'expo-router'
import React, { useState } from 'react'
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import { RadioButton } from 'react-native-paper'

import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { testItems } from '@/constants/TestItems'
import { useThemeColor } from '@/hooks/useThemeColor'

interface TestQuestion {
  id: number
  question: string
  options: string[]
  correctAnswer: number
}

// Convert testItems to TestQuestion format
const sampleQuestions: TestQuestion[] = testItems.map((item) => ({
  id: item.no,
  question: item.question,
  options: [item.choice1, item.choice2, item.choice3, item.choice4].filter(
    Boolean
  ) as string[], // Filter out null values
  correctAnswer: item.solution - 1, // Convert from 1-based to 0-based index
}))

export default function TestScreen() {
  const { contentId, courseName } = useLocalSearchParams<{
    contentId: string
    courseName: string
  }>()

  const backgroundColor = useThemeColor({}, 'background')
  const iconColor = useThemeColor({}, 'icon')
  const tintColor = useThemeColor({}, 'tint')

  const styles = createStyles(tintColor)

  const [selectedAnswers, setSelectedAnswers] = useState<Map<number, number>>(
    new Map()
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAnswerSelect = (questionId: number, optionIndex: number) => {
    setSelectedAnswers((prev) => new Map(prev).set(questionId, optionIndex))
  }

  const handleSubmitTest = () => {
    const unansweredQuestions = sampleQuestions.filter(
      (q) => !selectedAnswers.has(q.id)
    )

    if (unansweredQuestions.length > 0) {
      Alert.alert(
        'คำเตือน',
        `คุณยังไม่ได้ตอบคำถาม ${unansweredQuestions
          .map((q) => q.id)
          .join(', ')} ต้องการส่งแบบทดสอบหรือไม่?`,
        [
          { text: 'ยกเลิก', style: 'cancel' },
          { text: 'ส่งแบบทดสอบ', onPress: submitTest },
        ]
      )
      return
    }

    submitTest()
  }

  const submitTest = () => {
    setIsSubmitting(true)

    // Calculate score
    let correctAnswers = 0
    sampleQuestions.forEach((question) => {
      const selectedAnswer = selectedAnswers.get(question.id)
      if (selectedAnswer === question.correctAnswer) {
        correctAnswers++
      }
    })

    const score = Math.round((correctAnswers / sampleQuestions.length) * 100)

    // Simulate API call delay
    setTimeout(() => {
      setIsSubmitting(false)

      Alert.alert(
        'ผลการทดสอบ',
        `คุณได้คะแนน ${score}% จาก ${sampleQuestions.length} ข้อ\n\n${
          score >= 60 ? 'ผ่านการทดสอบ' : 'ไม่ผ่านการทดสอบ'
        }`,
        [
          {
            text: 'กลับไปยังห้องเรียน',
            onPress: () => router.back(),
          },
        ]
      )
    }, 1000)
  }

  const renderQuestion = (question: TestQuestion) => {
    const selectedAnswer = selectedAnswers.get(question.id)

    return (
      <ThemedView key={question.id} style={styles.questionCard}>
        {/* Question Header */}
        <ThemedView style={styles.questionHeader}>
          <ThemedView style={styles.questionNumber}>
            <ThemedText style={styles.questionNumberText}>
              {question.id}
            </ThemedText>
          </ThemedView>
          <ThemedText style={styles.questionText}>
            {question.question}
          </ThemedText>
        </ThemedView>

        {/* Options */}
        <RadioButton.Group
          onValueChange={(value) =>
            handleAnswerSelect(question.id, parseInt(value))
          }
          value={selectedAnswer?.toString() || ''}
        >
          {question.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.optionContainer}
              onPress={() => handleAnswerSelect(question.id, index)}
            >
              <RadioButton.Android
                value={index.toString()}
                color={tintColor}
                uncheckedColor='#9CA3AF'
              />
              <ThemedText style={styles.optionText}>{option}</ThemedText>
            </TouchableOpacity>
          ))}
        </RadioButton.Group>
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
            แบบทดสอบ
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
        {/* Course Info */}
        {/* {courseName && (
          <ThemedView style={styles.courseInfoSection}>
            <ThemedText style={styles.courseName}>{courseName}</ThemedText>
            <ThemedText style={styles.contentId}>
              เนื้อหา: {contentId}
            </ThemedText>
          </ThemedView>
        )} */}

        {/* Instructions */}
        <ThemedView style={styles.instructionsSection}>
          <ThemedText style={styles.testInstructions}>
            จงเลือกคำตอบที่ถูกที่สุดเพียงข้อเดียว
          </ThemedText>
        </ThemedView>

        {/* Questions */}
        <View style={styles.questionsContainer}>
          {sampleQuestions.map(renderQuestion)}
        </View>
      </ScrollView>

      {/* Fixed Submit Button */}
      <View style={[styles.fixedButtonContainer, { backgroundColor }]}>
        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: tintColor }]}
          onPress={handleSubmitTest}
          disabled={isSubmitting}
        >
          <IconSymbol name='arrow.right.square' size={20} color='white' />
          <ThemedText style={styles.submitButtonText}>
            {isSubmitting ? 'กำลังส่ง...' : 'ส่งแบบทดสอบ'}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  )
}

const createStyles = (tintColor: string) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      paddingTop: Platform.OS === 'ios' ? 60 : 40,
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
    content: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 100, // Add space for fixed button
    },
    courseInfoSection: {
      margin: 20,
      marginBottom: 0,
      padding: 20,
      borderRadius: 16,
      backgroundColor: '#F8FAFC',
      borderWidth: 1,
      borderColor: '#E2E8F0',
    },
    courseName: {
      fontSize: 18,
      fontFamily: 'Prompt-SemiBold',
      color: '#1F2937',
      marginBottom: 4,
    },
    contentId: {
      fontSize: 14,
      fontFamily: 'Prompt-Regular',
      color: '#6B7280',
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
      elevation: 4,
      borderWidth: 1,
      borderColor: 'rgba(0, 0, 0, 0.05)',
      backgroundColor: '#FFFFFF',
    },
    testInstructions: {
      fontSize: 16,
      fontFamily: 'Prompt-Medium',
      color: '#6B7280',
      textAlign: 'center',
      lineHeight: 24,
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
      elevation: 4,
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
      backgroundColor: tintColor,
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
    submitButton: {
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
    submitButtonText: {
      fontSize: 18,
      fontFamily: 'Prompt-SemiBold',
      marginLeft: 8,
      color: 'white',
    },
  })
