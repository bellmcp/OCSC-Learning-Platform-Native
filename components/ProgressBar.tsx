import React, { useEffect, useRef, useState } from 'react'
import { Platform, StyleSheet, View } from 'react-native'
import { AnimatedCircularProgress } from 'react-native-circular-progress'
import {
  ProgressBar as PaperProgressBar,
  Text,
  useTheme,
} from 'react-native-paper'
import { useDispatch, useSelector } from 'react-redux'

import { ThemedText } from '@/components/ThemedText'
import { IconSymbol } from '@/components/ui/IconSymbol'
import * as learnActions from '@/modules/learn/actions'
import * as uiActions from '@/modules/ui/actions'
import type { AppDispatch, RootState } from '@/store/types'

import { ClassroomContent } from './types'

interface ProgressBarProps {
  contents: ClassroomContent[]
  selectedContent: ClassroomContent | null
  completedContents: Set<number>
  contentProgress: Map<number, number>
  backgroundColor: string
  onMinuteComplete?: () => void
  onContentComplete?: (contentId: number) => void
  courseRegistrationId?: number
}

export function ProgressBar({
  contents,
  selectedContent,
  completedContents,
  contentProgress,
  backgroundColor,
  onMinuteComplete,
  onContentComplete,
  courseRegistrationId,
}: ProgressBarProps) {
  const theme = useTheme()
  const dispatch = useDispatch<AppDispatch>()
  const { isContentViewsLoading } = useSelector(
    (state: RootState) => state.learn
  )

  const [seconds, setSeconds] = useState(0) // Count seconds (0-59)
  const [accumulatedMinutes, setAccumulatedMinutes] = useState(0) // Accumulated learning minutes
  const [isCompleted, setIsCompleted] = useState(false)

  // Ref to track accumulated minutes for interval callback (avoids stale closure)
  const accumulatedMinutesRef = useRef(accumulatedMinutes)

  // Get the total required minutes from the selected content
  const totalRequiredMinutes = selectedContent?.minutes || 0
  const contentViewId = selectedContent?.contentViewId

  // Check if current content is completed (from props or local state)
  const isContentCompleted = selectedContent
    ? completedContents.has(selectedContent.id) || isCompleted
    : false

  // Reset timer and state when selected content changes
  useEffect(() => {
    if (selectedContent) {
      setSeconds(0)
      // Initialize with existing content seconds (converted to minutes)
      const existingMinutes = selectedContent.contentSeconds
        ? Math.round(selectedContent.contentSeconds / 60)
        : 0
      setAccumulatedMinutes(existingMinutes)
      accumulatedMinutesRef.current = existingMinutes
      // Reset completed state based on completedContents
      setIsCompleted(completedContents.has(selectedContent.id))
    }
  }, [selectedContent?.id, completedContents])

  // Show "เริ่มจับเวลาเข้าเรียนแล้ว" when starting to track (matching desktop Timer.tsx)
  useEffect(() => {
    if (
      selectedContent?.type === 'c' &&
      !isContentViewsLoading &&
      !isContentCompleted
    ) {
      dispatch(uiActions.setFlashMessage('เริ่มจับเวลาเข้าเรียนแล้ว', 'info'))
    }
  }, [selectedContent?.id, isContentViewsLoading, isContentCompleted])

  // CLOCK - Count seconds (matching desktop Timer.tsx lines 70-85)
  useEffect(() => {
    let clockInterval: ReturnType<typeof setInterval> | null = null

    // Only run for content type 'c' and if not completed and not loading
    if (
      selectedContent?.type === 'c' &&
      !isContentCompleted &&
      !isContentViewsLoading
    ) {
      clockInterval = setInterval(() => {
        setSeconds((prevSeconds) => (prevSeconds >= 59 ? 0 : prevSeconds + 1))
      }, 1000)
    }

    return () => {
      if (clockInterval) clearInterval(clockInterval)
    }
  }, [selectedContent?.id, isContentCompleted, isContentViewsLoading])

  // MINUTE PROGRESS - Update API every 60 seconds (matching desktop Timer.tsx lines 88-144)
  useEffect(() => {
    let minuteInterval: ReturnType<typeof setInterval> | null = null

    // Only run for content type 'c' and if not completed and not loading
    if (
      selectedContent?.type === 'c' &&
      !isContentCompleted &&
      !isContentViewsLoading &&
      courseRegistrationId &&
      contentViewId
    ) {
      minuteInterval = setInterval(() => {
        // Use ref to get current value (avoids stale closure)
        const newMinutes = accumulatedMinutesRef.current + 1

        // Update both ref and state
        accumulatedMinutesRef.current = newMinutes
        setAccumulatedMinutes(newMinutes)

        // Check if this minute will complete the content
        const isGoingToComplete =
          newMinutes >= totalRequiredMinutes && totalRequiredMinutes > 0

        // Update content view via API (matching desktop Timer.tsx lines 98-104)
        dispatch(
          learnActions.updateContentView(
            courseRegistrationId,
            contentViewId,
            60, // Always send 60 seconds increment (matching desktop)
            !isGoingToComplete // Don't show flash if completing
          )
        )

        // If completed, show success message and update state
        if (isGoingToComplete) {
          dispatch(
            uiActions.setFlashMessage(
              'คุณเรียนเนื้อหานี้ครบเวลาที่กำหนดแล้ว',
              'success'
            )
          )
          setIsCompleted(true)
          // Notify parent component - use setTimeout to avoid updating parent during render
          if (onContentComplete && selectedContent) {
            setTimeout(() => onContentComplete(selectedContent.id), 0)
          }
        } else {
          // Call the callback when a minute is completed
          if (onMinuteComplete) {
            setTimeout(() => onMinuteComplete(), 0)
          }
        }
      }, 60000) // Every 60 seconds
    }

    return () => {
      if (minuteInterval) clearInterval(minuteInterval)
    }
  }, [
    selectedContent?.id,
    selectedContent?.type,
    isContentCompleted,
    isContentViewsLoading,
    courseRegistrationId,
    contentViewId,
    totalRequiredMinutes,
    dispatch,
    onMinuteComplete,
    onContentComplete,
  ])

  // Calculate progress percentage
  const progressPercentage =
    totalRequiredMinutes > 0
      ? Math.min((accumulatedMinutes / totalRequiredMinutes) * 100, 100)
      : 0

  // Don't show progress bar for non-content types (test/evaluation)
  if (selectedContent?.type !== 'c') {
    return null
  }

  // Show completion message when content is completed
  if (isContentCompleted) {
    return (
      <View style={[styles.fixedBottomContainer, { backgroundColor }]}>
        <View style={styles.completedContainer}>
          <IconSymbol name='checkmark.circle.fill' size={24} color='#2e7d32' />
          <ThemedText style={styles.completedText}>
            คุณสะสมเวลาเรียนเนื้อหานี้ครบแล้ว
          </ThemedText>
        </View>
      </View>
    )
  }

  // Calculate seconds progress (0-100% based on 60 seconds)
  // Matching desktop: value={props.value * (100 / 60)}
  const secondsProgress = (seconds / 60) * 100

  return (
    <View style={[styles.fixedBottomContainer, { backgroundColor }]}>
      <View style={styles.progressBar}>
        {/* Left: Circular Progress for Seconds */}
        <View style={styles.circularContainer}>
          <AnimatedCircularProgress
            size={50}
            width={4}
            fill={secondsProgress}
            tintColor='#183A7C'
            backgroundColor='#E5E7EB'
            rotation={0}
            lineCap='round'
          >
            {() => (
              <ThemedText style={styles.secondsText}>{seconds} วิ</ThemedText>
            )}
          </AnimatedCircularProgress>
        </View>

        {/* Center: Accumulated Learning Time */}
        <View style={styles.timeProgress}>
          <Text variant='bodySmall' style={styles.timeProgressLabel}>
            เวลาเรียนสะสม
          </Text>
          <Text variant='bodyMedium' style={styles.timeProgressText}>
            {accumulatedMinutes}/{totalRequiredMinutes} นาที
          </Text>
        </View>

        {/* Right: Progress Bar and Percentage */}
        <View style={{ width: 100 }}>
          <View style={styles.percentageProgress}>
            <View style={styles.percentageBarContainer}>
              <PaperProgressBar
                progress={progressPercentage / 100}
                color={theme.colors.primary}
                style={styles.percentageBar}
              />
              <Text variant='labelSmall' style={styles.percentageText}>
                {Math.round(progressPercentage)}%
              </Text>
            </View>
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
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 40 : 30,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  completedContainer: {
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  completedText: {
    fontSize: 16,
    fontFamily: 'Prompt-SemiBold',
    color: '#1F2937',
    lineHeight: 24,
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  circularContainer: {
    width: 50,
    alignItems: 'center',
  },
  secondsText: {
    fontSize: 12,
    fontFamily: 'Prompt-Medium',
    color: '#1F2937',
  },

  timeProgress: {
    flex: 1,
    alignItems: 'center',
  },
  timeProgressLabel: {
    fontSize: 12,
    fontFamily: 'Prompt-Regular',
    color: '#6B7280',
    textAlign: 'center',
  },
  timeProgressText: {
    fontSize: 16,
    fontFamily: 'Prompt-Medium',
    color: '#374151',
    textAlign: 'center',
  },
  percentageProgress: {
    alignItems: 'flex-end',
    minWidth: 80,
  },
  percentageBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  percentageBar: {
    width: 60,
    height: 6,
    borderRadius: 3,
  },
  percentageText: {
    fontSize: 12,
    fontFamily: 'Prompt-Medium',
    color: '#1F2937',
    textAlign: 'center',
    minWidth: 30,
  },
})
