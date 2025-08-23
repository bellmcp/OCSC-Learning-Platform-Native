import React, { useEffect, useState } from 'react'
import { Platform, StyleSheet, View } from 'react-native'
import {
  ProgressBar as PaperProgressBar,
  Text,
  useTheme,
} from 'react-native-paper'

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
  const theme = useTheme()
  const [seconds, setSeconds] = useState(0) // Count seconds
  const [accumulatedMinutes, setAccumulatedMinutes] = useState(0) // Accumulated learning minutes
  const totalRequiredMinutes = 2 // Total required minutes for this content
  const [isActive, setIsActive] = useState(true)

  // Reset timer when selected content changes
  useEffect(() => {
    if (selectedContent) {
      setSeconds(0)
      setAccumulatedMinutes(0)
      setIsActive(true)
    }
  }, [selectedContent?.id])

  // Count seconds and convert to minutes
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null

    if (isActive) {
      interval = setInterval(() => {
        setSeconds((prevSeconds) => {
          const newSeconds = prevSeconds + 1

          // When reaching 60 seconds, increment accumulated minutes
          if (newSeconds >= 60) {
            setAccumulatedMinutes((prevMinutes) => {
              const newMinutes = prevMinutes + 1
              // Stop accumulating if we reach the total required minutes
              if (newMinutes >= totalRequiredMinutes) {
                setIsActive(false)
                return totalRequiredMinutes
              }
              return newMinutes
            })
            return 0 // Reset seconds to 0
          }

          return newSeconds
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, totalRequiredMinutes])

  // Calculate progress percentage
  const progressPercentage = (accumulatedMinutes / totalRequiredMinutes) * 100

  return (
    <View style={[styles.fixedBottomContainer, { backgroundColor }]}>
      <View style={styles.progressBar}>
        {/* Left: Circular Progress for Seconds */}
        <View style={{ width: 100 }}>
          <View style={styles.circularProgress}>
            <View style={styles.circularContent}>
              <ThemedText style={styles.secondsText}>{seconds} วิ</ThemedText>
            </View>

            {/* Circular progress ring with segments */}
            <View style={styles.circularProgressRing}>
              {/* Progress segments based on percentage */}
              {progressPercentage > 0 && (
                <View
                  style={[
                    styles.progressSegment,
                    {
                      transform: [{ rotate: '0deg' }],
                      opacity: progressPercentage > 0 ? 1 : 0,
                    },
                  ]}
                />
              )}
              {progressPercentage > 25 && (
                <View
                  style={[
                    styles.progressSegment,
                    {
                      transform: [{ rotate: '90deg' }],
                      opacity: progressPercentage > 25 ? 1 : 0,
                    },
                  ]}
                />
              )}
              {progressPercentage > 50 && (
                <View
                  style={[
                    styles.progressSegment,
                    {
                      transform: [{ rotate: '180deg' }],
                      opacity: progressPercentage > 50 ? 1 : 0,
                    },
                  ]}
                />
              )}
              {progressPercentage > 75 && (
                <View
                  style={[
                    styles.progressSegment,
                    {
                      transform: [{ rotate: '270deg' }],
                      opacity: progressPercentage > 75 ? 1 : 0,
                    },
                  ]}
                />
              )}
            </View>
          </View>
        </View>

        {/* Center: Accumulated Learning Time */}
        <View style={styles.timeProgress}>
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
    position: 'relative',
    overflow: 'hidden',
  },
  circularContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  secondsText: {
    fontSize: 12,
    fontFamily: 'Prompt-Medium',
    color: '#1F2937',
  },
  minutesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  overline: {
    width: 10,
    height: 1,
    backgroundColor: '#1F2937',
    marginHorizontal: 4,
  },
  minutesText: {
    fontSize: 12,
    fontFamily: 'Prompt-Medium',
    color: '#1F2937',
  },
  circularProgressRing: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    transformOrigin: 'center',
  },

  progressSegment: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#183A7C',
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    transformOrigin: 'center',
  },

  timeProgress: {
    flex: 1,
    alignItems: 'center',
  },
  timeProgressText: {
    fontSize: 14,
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
