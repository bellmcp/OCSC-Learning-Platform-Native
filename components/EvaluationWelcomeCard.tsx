import React from 'react'
import { StyleSheet, TouchableOpacity } from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { useThemeColor } from '@/hooks/useThemeColor'

import { ClassroomContent } from './types'

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

  return (
    <ThemedView style={styles.evaluationWelcomeContainer}>
      {/* Evaluation Details */}
      <ThemedText style={styles.evaluationSubject}>
        {selectedContent.name} รายวิชา {courseName}
      </ThemedText>
      <ThemedText style={styles.evaluationInfo}>
        <ThemedText style={styles.evaluationInfoBold}>คำชี้แจง </ThemedText>
        โปรดกรอกแบบประเมินผลรายวิชาบทเรียนอิเล็กทรอนิกส์
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
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 18,
  },
  evaluationSubject: {
    fontSize: 16,
    fontFamily: 'Prompt-SemiBold',
    color: '#1F2937',
    marginBottom: 12,
  },
  evaluationInfo: {
    fontSize: 15,
    fontFamily: 'Prompt-Regular',
    color: '#6B7280',
    marginBottom: 4,
  },
  evaluationInfoBold: {
    fontSize: 15,
    fontFamily: 'Prompt-Medium',
    color: '#6B7280',
    paddingRight: 4,
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
