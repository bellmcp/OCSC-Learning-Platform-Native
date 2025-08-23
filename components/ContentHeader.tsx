import React from 'react'
import { StyleSheet } from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'

import { ClassroomContent } from './types'

interface ContentHeaderProps {
  selectedContent: ClassroomContent | null
}

const formatDuration = (minutes?: number | null): string => {
  if (!minutes) return ''
  if (minutes < 60) return `${minutes} นาที`
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes > 0
    ? `${hours}:${remainingMinutes.toString().padStart(2, '0')} ชั่วโมง`
    : `${hours} ชั่วโมง`
}

const getContentTypeLabel = (type: 'c' | 't' | 'e') => {
  switch (type) {
    case 'c':
      return 'เนื้อหา'
    case 't':
      return 'แบบทดสอบ'
    case 'e':
      return 'แบบประเมิน'
    default:
      return 'เนื้อหา'
  }
}

export function ContentHeader({ selectedContent }: ContentHeaderProps) {
  if (!selectedContent) return null

  return (
    <ThemedView style={styles.contentHeader}>
      <ThemedView style={styles.contentTitleRow}>
        <ThemedText style={styles.contentTitle} numberOfLines={1}>
          {selectedContent.name}
        </ThemedText>
      </ThemedView>
      <ThemedText style={styles.contentMeta}>
        {getContentTypeLabel(selectedContent.type)}
        {selectedContent.minutes &&
          ` • ${formatDuration(selectedContent.minutes)}`}
      </ThemedText>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  contentHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  contentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contentTitle: {
    fontSize: 16,
    fontFamily: 'Prompt-SemiBold',
    flex: 1,
    color: '#1F2937',
  },
  contentMeta: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Prompt-Regular',
  },
})
