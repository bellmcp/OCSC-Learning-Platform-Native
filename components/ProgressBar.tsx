import React from 'react'
import { Platform, StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/ThemedText'

import { ClassroomContent } from './types'

interface ProgressBarProps {
  contents: ClassroomContent[]
  selectedContent: ClassroomContent | null
  completedContents: Set<number>
  contentProgress: Map<number, number>
  backgroundColor: string
}

export function ProgressBar({
  contents,
  selectedContent,
  completedContents,
  contentProgress,
  backgroundColor,
}: ProgressBarProps) {
  return (
    <View style={[styles.fixedBottomContainer, { backgroundColor }]}>
      <View style={styles.progressBar}>
        {/* Left: Circular Progress */}
        <View style={styles.circularProgress}>
          <ThemedText style={styles.progressText}>
            {completedContents.size}/{contents.length}
          </ThemedText>
        </View>

        {/* Center: Time Progress */}
        <View style={styles.timeProgress}>
          <ThemedText style={styles.timeProgressText}>
            {selectedContent
              ? `${Math.floor(
                  (contentProgress.get(selectedContent.id) || 0) *
                    (selectedContent.minutes || 0)
                )}/${selectedContent.minutes || 0} นาที`
              : `0/${contents.reduce(
                  (total, content) => total + (content.minutes || 0),
                  0
                )} นาที`}
          </ThemedText>
        </View>

        {/* Right: Percentage Progress */}
        <View style={styles.percentageProgress}>
          <View style={styles.percentageBarContainer}>
            <View style={styles.percentageBar}>
              <View
                style={[
                  styles.percentageFill,
                  {
                    width: `${Math.round(
                      (completedContents.size / contents.length) * 100
                    )}%`,
                  },
                ]}
              />
            </View>
            <ThemedText style={styles.percentageText}>
              {Math.round((completedContents.size / contents.length) * 100)}%
            </ThemedText>
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  fixedBottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  circularProgress: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  progressText: {
    fontSize: 12,
    fontFamily: 'Prompt-SemiBold',
    color: '#1F2937',
  },
  timeProgress: {
    flex: 1,
    alignItems: 'center',
  },
  timeProgressText: {
    fontSize: 14,
    fontFamily: 'Prompt-Medium',
    color: '#374151',
  },
  percentageProgress: {
    alignItems: 'flex-end',
    minWidth: 60,
  },
  percentageBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  percentageBar: {
    width: 60,
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    marginBottom: 4,
    overflow: 'hidden',
  },
  percentageFill: {
    height: '100%',
    backgroundColor: '#183A7C',
    borderRadius: 3,
  },
  percentageText: {
    fontSize: 12,
    fontFamily: 'Prompt-SemiBold',
    color: '#1F2937',
    textAlign: 'center',
  },
})
