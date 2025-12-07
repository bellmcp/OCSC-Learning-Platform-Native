import React from 'react'
import { Image, StyleSheet, TouchableOpacity } from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { useThemeColor } from '@/hooks/useThemeColor'

import { ClassroomContent } from './types'

// Hero image for completed state
const HeroImage = require('@/assets/images/hero-evaluation.png')

interface EvaluationWelcomeCardProps {
  selectedContent: ClassroomContent
  courseName: string
  onOpenEvaluation: () => void
}

export function EvaluationWelcomeCard({
  selectedContent,
  courseName,
  onOpenEvaluation,
}: EvaluationWelcomeCardProps) {
  const tintColor = useThemeColor({}, 'tint')
  const isCompleted = selectedContent.completed

  // Show completed state
  if (isCompleted) {
    return (
      <ThemedView style={styles.completedContainer}>
        <Image
          source={HeroImage}
          style={styles.heroImage}
          resizeMode='contain'
        />
        <ThemedText style={styles.completedTitle}>บันทึกข้อมูลแล้ว</ThemedText>
        <ThemedText style={styles.completedSubtitle}>
          ขอบคุณสำหรับความคิดเห็นของคุณ
        </ThemedText>
      </ThemedView>
    )
  }

  return (
    <ThemedView style={styles.evaluationWelcomeContainer}>
      {/* Evaluation Details */}
      <ThemedText style={styles.evaluationSubject}>
        {selectedContent.name}
      </ThemedText>
      <ThemedText style={styles.evaluationCourseName}>
        รายวิชา {courseName}
      </ThemedText>

      <ThemedView style={styles.separator} />

      <ThemedText style={styles.evaluationInfo}>
        <ThemedText style={styles.evaluationInfoBold}>คำชี้แจง</ThemedText>{' '}
        โปรดกรอกแบบประเมินผลรายวิชาบทเรียนอิเล็กทรอนิกส์
      </ThemedText>

      <ThemedView style={styles.separator} />

      {/* Important Notes */}
      <ThemedText style={styles.warningText}>
        โปรดส่งแบบประเมินให้ครบทุกข้อ
      </ThemedText>
      <ThemedText style={styles.warningText}>
        ความคิดเห็นของคุณจะช่วยพัฒนาเนื้อหาให้ดียิ่งขึ้น
      </ThemedText>

      {/* Action Button */}
      <TouchableOpacity
        style={[
          styles.actionButton,
          { backgroundColor: tintColor, marginTop: 18 },
        ]}
        onPress={onOpenEvaluation}
      >
        <IconSymbol name='doc.text.fill' size={20} color='white' />
        <ThemedText style={styles.actionButtonText}>ทำแบบประเมิน</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  evaluationWelcomeContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
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
    marginBottom: 8,
    textAlign: 'center',
  },
  completedSubtitle: {
    fontSize: 16,
    fontFamily: 'Prompt-Regular',
    color: '#6B7280',
    textAlign: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  evaluationSubject: {
    fontSize: 18,
    fontFamily: 'Prompt-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  evaluationCourseName: {
    fontSize: 14,
    fontFamily: 'Prompt-Regular',
    color: '#6B7280',
    marginBottom: 8,
  },
  evaluationInfo: {
    fontSize: 16,
    lineHeight: 26,
    fontFamily: 'Prompt-Regular',
    color: '#6B7280',
    marginBottom: 4,
  },
  evaluationInfoBold: {
    fontSize: 16,
    fontFamily: 'Prompt-SemiBold',
    color: '#1F2937',
  },
  warningText: {
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
  actionButtonText: {
    fontSize: 16,
    fontFamily: 'Prompt-SemiBold',
    marginLeft: 8,
    color: 'white',
  },
})
