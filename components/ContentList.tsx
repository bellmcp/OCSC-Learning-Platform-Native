import React from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { IconSymbol } from '@/components/ui/IconSymbol'

import { ClassroomContent } from './types'

interface ContentListProps {
  contents: ClassroomContent[]
  selectedContentId: number | null
  completedContents: Set<number>
  onContentSelect: (contentId: number) => void
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

export function ContentList({
  contents,
  selectedContentId,
  completedContents,
  onContentSelect,
}: ContentListProps) {
  const renderContentItem = ({
    item,
    index,
  }: {
    item: ClassroomContent
    index: number
  }) => {
    const isCompleted = completedContents.has(item.id)
    const isSelected = selectedContentId === item.id

    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.contentItem,
          isCompleted && styles.completedContentItem,
          isSelected &&
            (isCompleted
              ? styles.selectedCompletedContentItem
              : styles.selectedContentItem),
        ]}
        onPress={() => onContentSelect(item.id)}
      >
        <View style={styles.contentItemContainer}>
          <ThemedView style={styles.iconContainer}>
            <IconSymbol
              name={item.type === 't' ? 'doc.text.fill' : 'play.circle.fill'}
              size={32}
              color='#6B7280'
            />
            {isCompleted && (
              <ThemedView style={styles.completedBadge}>
                <IconSymbol
                  name='checkmark.circle.fill'
                  size={20}
                  color='#2e7d32'
                />
              </ThemedView>
            )}
          </ThemedView>
          <View style={styles.contentTextContainer}>
            <ThemedText
              style={[
                styles.contentItemTitle,
                isSelected && styles.selectedContentItemTitle,
              ]}
              numberOfLines={2}
            >
              {item.name}
            </ThemedText>
            {item.type === 'c' && (
              <View style={styles.contentMetaContainer}>
                <ThemedText style={styles.contentMeta}>
                  {getContentTypeLabel(item.type)}
                  {item.minutes && ` • ${formatDuration(item.minutes)}`}
                </ThemedText>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <ThemedView style={styles.bottomSection}>
      <ThemedView style={styles.sectionHeader}>
        <ThemedText style={styles.sectionTitle}>สารบัญ</ThemedText>
        <ThemedText style={styles.progressSummary}>
          สำเร็จแล้ว {completedContents.size}/{contents.length} รายการ
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.contentListWrapper}>
        {contents.map((item, index) => (
          <ThemedView key={item.id.toString()}>
            {renderContentItem({ item, index })}
          </ThemedView>
        ))}
      </ThemedView>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  bottomSection: {
    backgroundColor: 'transparent',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 20,
    paddingBottom: 40,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Prompt-SemiBold',
    color: '#1F2937',
  },
  progressSummary: {
    fontSize: 14,
    fontFamily: 'Prompt-Regular',
    color: '#6B7280',
  },
  contentListWrapper: {
    paddingHorizontal: 0,
  },
  contentItem: {
    backgroundColor: 'transparent',
    marginBottom: 0,
    paddingVertical: 16,
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
    width: '100%',
  },
  completedContentItem: {
    borderLeftColor: '#2e7d32',
  },
  selectedCompletedContentItem: {
    backgroundColor: '#F0F7FF',
    borderLeftColor: '#2e7d32',
  },
  selectedContentItem: {
    backgroundColor: '#F0F7FF',
    borderLeftColor: '#183A7C',
  },
  contentItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  iconContainer: {
    position: 'relative',
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    backgroundColor: 'transparent',
    borderRadius: 8,
  },
  completedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
  },
  contentTextContainer: {
    flex: 1,
  },
  contentMetaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contentItemTitle: {
    fontSize: 16,
    fontFamily: 'Prompt-Medium',
    lineHeight: 22,
    color: '#1F2937',
  },
  selectedContentItemTitle: {},
  contentMeta: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Prompt-Regular',
  },
})
