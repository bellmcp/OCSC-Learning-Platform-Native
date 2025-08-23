import { router } from 'expo-router'
import React, { useEffect, useRef, useState } from 'react'
import {
  Alert,
  Dimensions,
  FlatList,
  Platform,
  StyleSheet,
  TouchableOpacity,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import WebView from 'react-native-webview'

import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { contentViews } from '@/constants/ContentViews'
import { courseContents } from '@/constants/CourseContents'
import { useThemeColor } from '@/hooks/useThemeColor'

const { width, height } = Dimensions.get('window')

// Enhanced data structure for classroom content
interface ClassroomContent {
  id: number
  courseId: number
  no: number
  type: 'c' | 't' | 'e' // content, test, evaluation
  name: string
  content1?: string | null
  content2?: string | null
  minutes?: number | null
  testId1?: number | null
  testId2?: number | null
  testId3?: number | null
  evaluationId?: number | null
  completed: boolean
  completeDate?: string | null
  contentSeconds?: number | null
  testScore?: number | null
  testTries?: number | null
}

interface CourseData {
  id: number
  code: string
  name: string
  courseCategoryId: number
  learningObjective: string
  instructor: string
  learningTopic: string
  targetGroup: string
  assessment: string
  thumbnail: string
  seqFlow: boolean
  contents: ClassroomContent[]
}

interface ContentView {
  id: number
  courseRegistrationId: number
  courseContentId: number
  isCompleted: boolean
  completeDate?: string | null
  contentSeconds?: number | null
  testScore?: number | null
  testTries?: number | null
  no: number
}

// Demo data - hardcoded for demonstration purposes
const createDemoData = (): CourseData => {
  // Use course ID 1001 content from constants
  const demoContents: ClassroomContent[] = courseContents
    .filter((content) => content.courseId === 1001)
    .map((content, index) => {
      const view = contentViews.find((cv) => cv.courseContentId === content.id)

      // Mock some completed content for demo purposes
      const isCompleted = index < 3 // First 3 items are completed
      const mockProgress = isCompleted
        ? content.minutes
        : Math.floor((content.minutes || 0) * Math.random())

      return {
        id: content.id,
        courseId: content.courseId,
        no: content.no,
        type: content.type as 'c' | 't' | 'e',
        name: content.name,
        content1: content.content1,
        content2: content.content2,
        minutes: content.minutes,
        testId1: content.testId1,
        testId2: content.testId2,
        testId3: content.testId3,
        evaluationId: content.evaluationId,
        completed: isCompleted,
        completeDate: isCompleted ? new Date().toISOString() : null,
        contentSeconds:
          mockProgress && content.minutes ? mockProgress * 60 : null,
        testScore: content.type === 't' && isCompleted ? 85 : null,
        testTries: content.type === 't' && isCompleted ? 1 : null,
      }
    })
    .sort((a, b) => a.no - b.no)

  return {
    id: 1001,
    code: 'NOF001',
    name: 'การเป็นข้าราชการที่ดี',
    courseCategoryId: 1,
    learningObjective: 'เพื่อให้ผู้เรียนเข้าใจบทบาทและหน้าที่ของข้าราชการ',
    instructor: 'ทีมผู้สอน ก.พ.',
    learningTopic: 'การเป็นข้าราชการที่ดี ความรู้พื้นฐาน และจริยธรรม',
    targetGroup: 'ข้าราชการบรรจุใหม่',
    assessment: 'ทำแบบทดสอบหลังเรียนได้ตั้งแต่ 60% ขึ้นไป',
    thumbnail:
      'https://learningportal.ocsc.go.th/content/images/courses/ocsc/NOF001.jpg',
    seqFlow: true,
    contents: demoContents,
  }
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

export default function ClassroomScreen() {
  const backgroundColor = useThemeColor({}, 'background')
  const textColor = useThemeColor({}, 'text')
  const iconColor = useThemeColor({}, 'icon')

  const [selectedContentId, setSelectedContentId] = useState<number | null>(
    null
  )
  const [completedContents, setCompletedContents] = useState<Set<number>>(
    new Set()
  )
  const [contentProgress, setContentProgress] = useState<Map<number, number>>(
    new Map()
  )
  const webViewRef = useRef<WebView>(null)
  const contentStartTime = useRef<number | null>(null)

  // Use hardcoded demo data
  const courseData = createDemoData()

  useEffect(() => {
    if (courseData && courseData.contents.length > 0) {
      // Set initial selected content to first uncompleted item or first item
      const firstUncompleted = courseData.contents.find((c) => !c.completed)
      const initialContentId = firstUncompleted
        ? firstUncompleted.id
        : courseData.contents[0].id
      setSelectedContentId(initialContentId)

      // Initialize completed contents from data
      const completedIds = new Set(
        courseData.contents.filter((c) => c.completed).map((c) => c.id)
      )
      setCompletedContents(completedIds)

      // Initialize progress tracking
      const progressMap = new Map()
      courseData.contents.forEach((content) => {
        if (content.contentSeconds && content.minutes) {
          const progress = Math.min(
            content.contentSeconds / (content.minutes * 60),
            1
          )
          progressMap.set(content.id, progress)
        }
      })
      setContentProgress(progressMap)
    }
  }, [])

  // Demo data is always available, no loading needed

  const selectedContent = selectedContentId
    ? courseData.contents.find((content) => content.id === selectedContentId)
    : null

  const handleContentSelect = (contentId: number) => {
    // Track time spent on previous content
    if (selectedContentId && contentStartTime.current) {
      const timeSpent = Math.floor(
        (Date.now() - contentStartTime.current) / 1000
      )
      setContentProgress((prev) => {
        const newMap = new Map(prev)
        const content = courseData.contents.find(
          (c) => c.id === selectedContentId
        )
        if (content && content.minutes) {
          const totalSeconds = content.minutes * 60
          const currentSeconds =
            (prev.get(selectedContentId) || 0) * totalSeconds
          const newSeconds = Math.min(currentSeconds + timeSpent, totalSeconds)
          const newProgress = newSeconds / totalSeconds
          newMap.set(selectedContentId, newProgress)

          // Auto-complete if watched more than 80%
          if (newProgress >= 0.8 && !completedContents.has(selectedContentId)) {
            setCompletedContents(
              (prevCompleted) => new Set([...prevCompleted, selectedContentId])
            )
          }
        }
        return newMap
      })
    }

    setSelectedContentId(contentId)
    contentStartTime.current = Date.now()
  }

  const handleMarkComplete = (contentId: number) => {
    const content = courseData.contents.find((c) => c.id === contentId)
    if (!content) return

    if (content.type === 't') {
      // Handle test content
      Alert.alert('แบบทดสอบ', 'คุณต้องการเริ่มทำแบบทดสอบหรือไม่?', [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'เริ่มทำ',
          onPress: () => {
            // Mock test completion
            setCompletedContents((prev) => new Set([...prev, contentId]))
            Alert.alert('สำเร็จ', 'คุณได้คะแนน 85% ผ่านแบบทดสอบแล้ว')
          },
        },
      ])
      return
    }

    if (content.type === 'e') {
      // Handle evaluation content
      Alert.alert('แบบประเมิน', 'คุณต้องการทำแบบประเมินหรือไม่?', [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'ทำแบบประเมิน',
          onPress: () => {
            setCompletedContents((prev) => new Set([...prev, contentId]))
            Alert.alert('สำเร็จ', 'บันทึกแบบประเมินเรียบร้อยแล้ว')
          },
        },
      ])
      return
    }

    // Regular content completion toggle
    setCompletedContents((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(contentId)) {
        newSet.delete(contentId)
      } else {
        newSet.add(contentId)
        // Set progress to 100% when manually marked complete
        setContentProgress((prevProgress) => {
          const newMap = new Map(prevProgress)
          newMap.set(contentId, 1)
          return newMap
        })
      }
      return newSet
    })
  }

  const getContentIcon = (type: 'c' | 't' | 'e') => {
    switch (type) {
      case 'c':
        return 'play.circle.fill'
      case 't':
        return 'questionmark.circle.fill'
      case 'e':
        return 'star.circle.fill'
      default:
        return 'doc.fill'
    }
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

  const renderContent = () => {
    if (!selectedContent)
      return (
        <ThemedView style={styles.defaultContent}>
          <IconSymbol name='book.closed' size={60} color={iconColor} />
          <ThemedText style={styles.defaultContentText}>
            เลือกเนื้อหาที่ต้องการเรียน
          </ThemedText>
        </ThemedView>
      )

    const getContentUrl = () => {
      if (selectedContent.type === 't') {
        return 'https://docs.google.com/forms/d/e/1FAIpQLSdMockTest/viewform' // Mock test URL
      }
      if (selectedContent.type === 'e') {
        return 'https://docs.google.com/forms/d/e/1FAIpQLSdMockEval/viewform' // Mock evaluation URL
      }
      return selectedContent.content1 || selectedContent.content2 || null
    }

    const contentUrl = getContentUrl()

    if (!contentUrl) {
      return (
        <ThemedView style={styles.defaultContent}>
          <IconSymbol
            name='exclamationmark.triangle'
            size={60}
            color={iconColor}
          />
          <ThemedText style={styles.defaultContentText}>
            เนื้อหานี้ยังไม่พร้อมใช้งาน
          </ThemedText>
        </ThemedView>
      )
    }

    return (
      <WebView
        ref={webViewRef}
        source={{ uri: contentUrl }}
        style={styles.webView}
        allowsFullscreenVideo={true}
        javaScriptEnabled={true}
        startInLoadingState={true}
        onLoadStart={() => {
          if (!contentStartTime.current) {
            contentStartTime.current = Date.now()
          }
        }}
        onError={() => {
          Alert.alert('ข้อผิดพลาด', 'ไม่สามารถโหลดเนื้อหาได้')
        }}
      />
    )
  }

  const renderContentItem = ({
    item,
    index,
  }: {
    item: ClassroomContent
    index: number
  }) => {
    const isCompleted = completedContents.has(item.id)
    const isSelected = selectedContentId === item.id
    const progress = contentProgress.get(item.id) || 0
    const progressPercentage = Math.round(progress * 100)

    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.contentItem,
          isSelected && styles.selectedContentItem,
          isCompleted && styles.completedContentItem,
        ]}
        onPress={() => handleContentSelect(item.id)}
      >
        <ThemedView style={styles.contentItemContainer}>
          <ThemedView style={styles.contentItemLeft}>
            <ThemedView style={styles.contentIconContainer}>
              <IconSymbol
                name={getContentIcon(item.type)}
                size={20}
                color='#183A7C'
              />
              <ThemedText style={styles.contentNo}>{item.no}</ThemedText>
            </ThemedView>
            <ThemedView style={styles.contentTextContainer}>
              <ThemedText
                style={[
                  styles.contentItemTitle,
                  isSelected && styles.selectedContentItemTitle,
                  isCompleted && styles.completedContentItemTitle,
                ]}
                numberOfLines={2}
              >
                {item.name}
              </ThemedText>
              <ThemedView style={styles.contentMetaContainer}>
                <ThemedText style={styles.contentTypeLabel}>
                  {getContentTypeLabel(item.type)}
                </ThemedText>
                {item.minutes && (
                  <ThemedText style={styles.contentItemDuration}>
                    • {formatDuration(item.minutes)}
                  </ThemedText>
                )}
              </ThemedView>
              {/* Progress bar for content type */}
              {item.type === 'c' && progress > 0 && (
                <ThemedView style={styles.progressContainer}>
                  <ThemedView style={styles.progressBarBackground}>
                    <ThemedView
                      style={[
                        styles.progressBarFill,
                        { width: `${progressPercentage}%` },
                      ]}
                    />
                  </ThemedView>
                  <ThemedText style={styles.progressText}>
                    {progressPercentage}%
                  </ThemedText>
                </ThemedView>
              )}
            </ThemedView>
          </ThemedView>
          <ThemedView style={styles.contentItemRight}>
            {isCompleted && (
              <IconSymbol
                name='checkmark.circle.fill'
                size={24}
                color='#4CAF50'
              />
            )}
            {item.testScore !== null && item.testScore !== undefined && (
              <ThemedText style={styles.testScore}>
                {item.testScore}%
              </ThemedText>
            )}
          </ThemedView>
        </ThemedView>
      </TouchableOpacity>
    )
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
            {courseData.name}
          </ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            {courseData.code}
          </ThemedText>
        </ThemedView>
        <TouchableOpacity style={styles.menuButton}>
          <IconSymbol name='ellipsis' size={20} color={textColor} />
        </TouchableOpacity>
      </ThemedView>

      {/* Main Content Container */}
      <ThemedView style={styles.mainContainer}>
        {/* Content Display Area */}
        <ThemedView style={styles.contentArea}>
          {selectedContent && (
            <ThemedView style={styles.contentHeader}>
              <ThemedView style={styles.contentTitleRow}>
                <IconSymbol
                  name={getContentIcon(selectedContent.type)}
                  size={20}
                  color='#183A7C'
                />
                <ThemedText style={styles.contentTitle} numberOfLines={1}>
                  {selectedContent.name}
                </ThemedText>
              </ThemedView>
              <ThemedView style={styles.contentMetaRow}>
                <ThemedText style={styles.contentTypeLabel}>
                  {getContentTypeLabel(selectedContent.type)}
                </ThemedText>
                {selectedContent.minutes && (
                  <ThemedText style={styles.contentDuration}>
                    • {formatDuration(selectedContent.minutes)}
                  </ThemedText>
                )}
              </ThemedView>
            </ThemedView>
          )}

          <ThemedView style={styles.contentContainer}>
            {renderContent()}
          </ThemedView>
        </ThemedView>

        {/* Content List Bottom Section */}
        <ThemedView style={styles.bottomSection}>
          <ThemedView style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>เนื้อหาบทเรียน</ThemedText>
            <ThemedText style={styles.progressSummary}>
              เรียนจบ {completedContents.size}/{courseData.contents.length}{' '}
              รายการ
            </ThemedText>
          </ThemedView>
          <FlatList
            data={courseData.contents}
            renderItem={({ item, index }) => renderContentItem({ item, index })}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentListContainer}
            style={styles.contentList}
          />
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
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Prompt-SemiBold',
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Prompt-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainContainer: {
    flex: 1,
  },
  contentArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  contentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contentTitle: {
    fontSize: 16,
    fontFamily: 'Prompt-SemiBold',
    marginLeft: 8,
    flex: 1,
  },
  contentMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contentTypeLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Prompt-Regular',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  contentDuration: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Prompt-Regular',
    marginLeft: 8,
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
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
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
  bottomSection: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 20,
    minHeight: 200, // Minimum height to ensure visibility
    maxHeight: height * 0.4, // 40% of screen height
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
  contentList: {
    flex: 1,
  },
  contentListContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  contentItem: {
    backgroundColor: '#FFFFFF',
    marginBottom: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  selectedContentItem: {
    backgroundColor: '#F0F7FF',
    borderLeftColor: '#183A7C',
  },
  completedContentItem: {
    backgroundColor: '#F8FFF8',
  },
  contentItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  contentItemLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  contentIconContainer: {
    alignItems: 'center',
    marginRight: 12,
    minWidth: 30,
  },
  contentNo: {
    fontSize: 10,
    fontFamily: 'Prompt-Medium',
    color: '#6B7280',
    marginTop: 2,
  },
  contentTextContainer: {
    flex: 1,
  },
  contentMetaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  contentItemRight: {
    alignItems: 'center',
    marginLeft: 12,
  },
  contentItemTitle: {
    fontSize: 15,
    fontFamily: 'Prompt-Regular',
    lineHeight: 20,
    color: '#1F2937',
    marginBottom: 4,
  },
  selectedContentItemTitle: {
    color: '#183A7C',
    fontFamily: 'Prompt-SemiBold',
  },
  completedContentItemTitle: {
    color: '#4CAF50',
  },
  contentItemDuration: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Prompt-Regular',
    marginLeft: 4,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  progressBarBackground: {
    flex: 1,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginRight: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
    fontFamily: 'Prompt-Medium',
    color: '#6B7280',
    minWidth: 30,
  },
  testScore: {
    fontSize: 12,
    fontFamily: 'Prompt-SemiBold',
    color: '#4CAF50',
    marginTop: 4,
  },
})
