import { router, useLocalSearchParams } from 'expo-router'
import React, { useState } from 'react'
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import WebView from 'react-native-webview'

import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { useThemeColor } from '@/hooks/useThemeColor'

const { width } = Dimensions.get('window')

// Mock data structure for classroom content
interface ClassroomContent {
  id: string
  title: string
  type: 'video' | 'pdf' | 'web'
  url: string
  duration?: string
  completed: boolean
}

interface CourseData {
  id: string
  title: string
  description: string
  thumbnail: string
  contents: ClassroomContent[]
}

// Mock course data
const mockCourseData: { [key: string]: CourseData } = {
  default: {
    id: 'default',
    title: 'หลักสูตรตัวอย่าง',
    description: 'คำอธิบายหลักสูตรตัวอย่าง',
    thumbnail: 'https://via.placeholder.com/400x225',
    contents: [
      {
        id: '1',
        title: 'บทนำ - ความรู้เบื้องต้น',
        type: 'video',
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        duration: '15:30',
        completed: false,
      },
      {
        id: '2',
        title: 'เอกสารการเรียนรู้ PDF',
        type: 'pdf',
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        completed: false,
      },
      {
        id: '3',
        title: 'แบบทดสอบออนไลน์',
        type: 'web',
        url: 'https://docs.google.com/forms/d/e/1FAIpQLSf0123456789/viewform',
        completed: false,
      },
      {
        id: '4',
        title: 'วิดีโอบทที่ 2 - การประยุกต์ใช้',
        type: 'video',
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        duration: '22:45',
        completed: true,
      },
      {
        id: '5',
        title: 'เอกสารเสริม - คู่มือการใช้งาน',
        type: 'pdf',
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        completed: false,
      },
    ],
  },
}

export default function ClassroomScreen() {
  const params = useLocalSearchParams()
  const courseId = (params.courseId as string) || 'default'

  const backgroundColor = useThemeColor({}, 'background')
  const textColor = useThemeColor({}, 'text')
  const iconColor = useThemeColor({}, 'icon')

  const [selectedContentId, setSelectedContentId] = useState<string>('1')
  const [completedContents, setCompletedContents] = useState<Set<string>>(
    new Set(['4'])
  )

  // Get course data (in real app, this would fetch from API)
  const courseData = mockCourseData[courseId] || mockCourseData.default

  const selectedContent = courseData.contents.find(
    (content) => content.id === selectedContentId
  )

  const handleContentSelect = (contentId: string) => {
    setSelectedContentId(contentId)
  }

  const handleMarkComplete = (contentId: string) => {
    setCompletedContents((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(contentId)) {
        newSet.delete(contentId)
      } else {
        newSet.add(contentId)
      }
      return newSet
    })
  }

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video':
        return 'play.circle.fill'
      case 'pdf':
        return 'doc.fill'
      case 'web':
        return 'globe'
      default:
        return 'doc'
    }
  }

  const getContentColor = (type: string) => {
    switch (type) {
      case 'video':
        return '#FF6B6B'
      case 'pdf':
        return '#4ECDC4'
      case 'web':
        return '#45B7D1'
      default:
        return '#95A5A6'
    }
  }

  const renderContent = () => {
    if (!selectedContent) return null

    switch (selectedContent.type) {
      case 'video':
        return (
          <WebView
            source={{ uri: selectedContent.url }}
            style={styles.webView}
            allowsFullscreenVideo={true}
            javaScriptEnabled={true}
            startInLoadingState={true}
          />
        )
      case 'pdf':
      case 'web':
        return (
          <WebView
            source={{ uri: selectedContent.url }}
            style={styles.webView}
            javaScriptEnabled={true}
            startInLoadingState={true}
          />
        )
      default:
        return (
          <ThemedView style={styles.defaultContent}>
            <IconSymbol
              name='exclamationmark.triangle'
              size={60}
              color={iconColor}
            />
            <ThemedText style={styles.defaultContentText}>
              ไม่สามารถแสดงเนื้อหาได้
            </ThemedText>
          </ThemedView>
        )
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <ThemedView style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <IconSymbol name='chevron.left' size={24} color={textColor} />
        </TouchableOpacity>
        <ThemedView style={styles.headerTitleContainer}>
          <ThemedText style={styles.headerTitle} numberOfLines={1}>
            {courseData.title}
          </ThemedText>
        </ThemedView>
        <TouchableOpacity style={styles.menuButton}>
          <IconSymbol name='ellipsis' size={20} color={textColor} />
        </TouchableOpacity>
      </ThemedView>

      <ThemedView style={styles.content}>
        {/* Content Display Area */}
        <ThemedView style={styles.contentArea}>
          {selectedContent && (
            <ThemedView style={styles.contentHeader}>
              <ThemedView style={styles.contentTitleRow}>
                <IconSymbol
                  name={getContentIcon(selectedContent.type)}
                  size={20}
                  color={getContentColor(selectedContent.type)}
                />
                <ThemedText style={styles.contentTitle} numberOfLines={1}>
                  {selectedContent.title}
                </ThemedText>
              </ThemedView>
              {selectedContent.duration && (
                <ThemedText style={styles.contentDuration}>
                  {selectedContent.duration}
                </ThemedText>
              )}
            </ThemedView>
          )}

          <ThemedView style={styles.contentContainer}>
            {renderContent()}
          </ThemedView>

          {/* Action Buttons */}
          {selectedContent && (
            <ThemedView style={styles.actionButtons}>
              <TouchableOpacity
                style={[
                  styles.completeButton,
                  completedContents.has(selectedContent.id) &&
                    styles.completedButton,
                ]}
                onPress={() => handleMarkComplete(selectedContent.id)}
              >
                <IconSymbol
                  name={
                    completedContents.has(selectedContent.id)
                      ? 'checkmark.circle.fill'
                      : 'circle'
                  }
                  size={20}
                  color={
                    completedContents.has(selectedContent.id)
                      ? '#FFFFFF'
                      : '#183A7C'
                  }
                />
                <ThemedText
                  style={[
                    styles.completeButtonText,
                    completedContents.has(selectedContent.id) &&
                      styles.completedButtonText,
                  ]}
                >
                  {completedContents.has(selectedContent.id)
                    ? 'เรียนจบแล้ว'
                    : 'ทำเครื่องหมายว่าเรียนจบ'}
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>
          )}
        </ThemedView>

        {/* Content List Sidebar */}
        <ThemedView style={styles.sidebar}>
          <ThemedText style={styles.sidebarTitle}>เนื้อหาบทเรียน</ThemedText>
          <ScrollView
            style={styles.contentList}
            showsVerticalScrollIndicator={false}
          >
            {courseData.contents.map((content, index) => (
              <TouchableOpacity
                key={content.id}
                style={[
                  styles.contentItem,
                  selectedContentId === content.id &&
                    styles.selectedContentItem,
                ]}
                onPress={() => handleContentSelect(content.id)}
              >
                <ThemedView style={styles.contentItemHeader}>
                  <ThemedView style={styles.contentItemLeft}>
                    <ThemedView
                      style={[
                        styles.contentItemNumber,
                        { backgroundColor: getContentColor(content.type) },
                      ]}
                    >
                      <ThemedText style={styles.contentItemNumberText}>
                        {index + 1}
                      </ThemedText>
                    </ThemedView>
                    <IconSymbol
                      name={getContentIcon(content.type)}
                      size={16}
                      color={getContentColor(content.type)}
                    />
                  </ThemedView>
                  {completedContents.has(content.id) && (
                    <IconSymbol
                      name='checkmark.circle.fill'
                      size={18}
                      color='#4CAF50'
                    />
                  )}
                </ThemedView>
                <ThemedText
                  style={[
                    styles.contentItemTitle,
                    selectedContentId === content.id &&
                      styles.selectedContentItemTitle,
                  ]}
                  numberOfLines={2}
                >
                  {content.title}
                </ThemedText>
                {content.duration && (
                  <ThemedText style={styles.contentItemDuration}>
                    {content.duration}
                  </ThemedText>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </ThemedView>
      </ThemedView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Prompt-SemiBold',
  },
  menuButton: {
    padding: 8,
    marginLeft: 8,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  contentArea: {
    flex: 2,
    backgroundColor: '#FFFFFF',
  },
  contentHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  contentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  contentTitle: {
    fontSize: 16,
    fontFamily: 'Prompt-SemiBold',
    marginLeft: 8,
    flex: 1,
  },
  contentDuration: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Prompt-Regular',
  },
  contentContainer: {
    flex: 1,
  },
  webView: {
    flex: 1,
  },
  defaultContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  defaultContentText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  actionButtons: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#183A7C',
    backgroundColor: 'transparent',
  },
  completedButton: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  completeButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontFamily: 'Prompt-Medium',
    color: '#183A7C',
  },
  completedButtonText: {
    color: '#FFFFFF',
  },
  sidebar: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderLeftWidth: 1,
    borderLeftColor: '#F0F0F0',
  },
  sidebarTitle: {
    fontSize: 16,
    fontFamily: 'Prompt-SemiBold',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  contentList: {
    flex: 1,
  },
  contentItem: {
    padding: 12,
    margin: 8,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedContentItem: {
    borderColor: '#183A7C',
    backgroundColor: '#F0F7FF',
  },
  contentItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  contentItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contentItemNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  contentItemNumberText: {
    fontSize: 12,
    fontFamily: 'Prompt-SemiBold',
    color: '#FFFFFF',
  },
  contentItemTitle: {
    fontSize: 14,
    fontFamily: 'Prompt-Regular',
    lineHeight: 20,
    color: '#374151',
  },
  selectedContentItemTitle: {
    color: '#183A7C',
    fontFamily: 'Prompt-SemiBold',
  },
  contentItemDuration: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    fontFamily: 'Prompt-Regular',
  },
})
