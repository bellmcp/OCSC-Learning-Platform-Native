import { router } from 'expo-router'
import React, { useEffect, useRef, useState } from 'react'
import {
  Alert,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
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
  const tintColor = useThemeColor({}, 'tint')

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

  const convertToEmbedUrl = (url: string): string => {
    // Convert YouTube URLs to embed format with autoplay
    let videoId = ''

    if (url.includes('youtu.be/')) {
      // Extract video ID from youtu.be/VIDEO_ID format
      videoId = url.split('youtu.be/')[1].split('?')[0]
    } else if (url.includes('youtube.com/watch?v=')) {
      // Extract video ID from youtube.com/watch?v=VIDEO_ID format
      videoId = url.split('v=')[1].split('&')[0]
    } else if (url.includes('youtube.com/embed/')) {
      // Already in embed format, just add autoplay if not present
      if (url.includes('autoplay=1')) {
        return url
      }
      const separator = url.includes('?') ? '&' : '?'
      return `${url}${separator}autoplay=1&playsinline=1&rel=0&modestbranding=1`
    }

    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0&modestbranding=1&controls=1&showinfo=0&fs=1&iv_load_policy=3`
    }

    return url // Return original URL if not a recognized YouTube format
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

    // Render test welcome screen for test content type
    if (selectedContent.type === 't') {
      return (
        <ThemedView style={styles.testWelcomeContainer}>
          {/* Test Details */}
          <ThemedView style={styles.testDetailsSection}>
            <ThemedText style={styles.testSubject}>
              {selectedContent.name} รายวิชา {courseData.name}
            </ThemedText>
            <ThemedText style={styles.testInfo}>
              <ThemedText style={styles.testInfoBold}>คำชี้แจง </ThemedText>
              จงเลือกคำตอบที่ถูกที่สุดเพียงข้อเดียว
            </ThemedText>
            <ThemedText style={styles.testInfo}>
              <ThemedText style={styles.testInfoBold}>เกณฑ์ผ่าน </ThemedText>0
              คะแนน
            </ThemedText>
            <ThemedText style={styles.testInfo}>
              <ThemedText style={styles.testInfoBold}>
                เวลาที่ใช้ทำแบบทดสอบ{' '}
              </ThemedText>
              {selectedContent.minutes || 45} นาที
            </ThemedText>
            <ThemedText style={styles.testInfo}>
              <ThemedText style={styles.testInfoBold}>
                ทำแบบทดสอบได้ไม่เกิน{' '}
              </ThemedText>
              10 ครั้ง
            </ThemedText>
          </ThemedView>

          {/* Current Status */}
          <ThemedView style={styles.testStatusSection}>
            <ThemedText style={styles.testStatusText}>
              ทำแบบทดสอบแล้ว {selectedContent.testTries || 0} จาก 10 ครั้ง
            </ThemedText>
            <ThemedText style={styles.testStatusText}>
              คะแนนสูงสุดที่ทำได้ {selectedContent.testScore || 0} เต็ม 20 คะแนน
            </ThemedText>
          </ThemedView>

          {/* Important Notes */}
          <ThemedText style={styles.testWarningText}>
            โปรดส่งแบบทดสอบก่อนออกจากห้องสอบ
          </ThemedText>
          <ThemedText style={styles.testWarningText}>
            คำตอบของคุณจะถูกบันทึกโดยอัตโนมัติเมื่อหมดเวลา
          </ThemedText>

          {/* Action Button */}
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: tintColor, marginTop: 16 },
            ]}
            onPress={() => {
              // Handle test start logic here
              Alert.alert(
                'เริ่มทำแบบทดสอบ',
                'คุณต้องการเริ่มทำแบบทดสอบหรือไม่?\n\nเมื่อเริ่มแล้ว เวลาจะเริ่มนับทันที',
                [
                  { text: 'ยกเลิก', style: 'cancel' },
                  {
                    text: 'เริ่มทำ',
                    onPress: () => {
                      // Here you would typically navigate to the actual test
                      // For demo purposes, we'll show a completion message
                      Alert.alert(
                        'เริ่มทำแบบทดสอบ',
                        'แบบทดสอบได้เริ่มต้นแล้ว\n\nเวลาที่เหลือ: 45 นาที',
                        [
                          {
                            text: 'เข้าใจแล้ว',
                            onPress: () => {
                              // Mock test completion for demo
                              setCompletedContents(
                                (prev) => new Set([...prev, selectedContent.id])
                              )
                              Alert.alert(
                                'สำเร็จ',
                                'คุณได้คะแนน 85% ผ่านแบบทดสอบแล้ว'
                              )
                            },
                          },
                        ]
                      )
                    },
                  },
                ]
              )
            }}
          >
            <IconSymbol name='play.circle.fill' size={20} color='white' />
            <ThemedText style={styles.actionButtonText}>
              เริ่มทำแบบทดสอบ
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      )
    }

    const getContentUrl = () => {
      if (selectedContent.type === 'e') {
        return 'https://docs.google.com/forms/d/e/1FAIpQLSdMockEval/viewform' // Mock evaluation URL
      }

      // Handle YouTube URLs
      const rawUrl = selectedContent.content1 || selectedContent.content2
      if (
        rawUrl &&
        (rawUrl.includes('youtube.com') || rawUrl.includes('youtu.be'))
      ) {
        return convertToEmbedUrl(rawUrl)
      }

      return rawUrl || null
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

    const isVideoContent =
      selectedContent.type === 'c' &&
      (selectedContent.content1?.includes('youtube') ||
        selectedContent.content2?.includes('youtube'))

    if (isVideoContent) {
      return (
        <ThemedView style={styles.videoContainer}>
          <WebView
            ref={webViewRef}
            source={{ uri: contentUrl }}
            style={styles.videoWebView}
            allowsFullscreenVideo={true}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            mediaPlaybackRequiresUserAction={false}
            allowsInlineMediaPlayback={true}
            scalesPageToFit={false}
            bounces={false}
            scrollEnabled={false}
            onLoadStart={() => {
              if (!contentStartTime.current) {
                contentStartTime.current = Date.now()
              }
            }}
            onError={() => {
              Alert.alert('ข้อผิดพลาด', 'ไม่สามารถโหลดเนื้อหาได้')
            }}
          />
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
        domStorageEnabled={true}
        startInLoadingState={true}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
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
          isCompleted && styles.completedContentItem,
          isSelected && styles.selectedContentItem,
        ]}
        onPress={() => handleContentSelect(item.id)}
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
                  color='#4CAF50'
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
            <View style={styles.contentMetaContainer}>
              <ThemedText style={styles.contentMeta}>
                {getContentTypeLabel(item.type)}
                {item.minutes && ` • ${formatDuration(item.minutes)}`}
              </ThemedText>
            </View>
          </View>
        </View>
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
        </ThemedView>
        <TouchableOpacity style={styles.menuButton}>
          <IconSymbol name='ellipsis' size={20} color={textColor} />
        </TouchableOpacity>
      </ThemedView>

      {/* Main Content Container */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Content Display Area */}
        <ThemedView style={styles.contentArea}>
          {selectedContent && (
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
          )}

          <ThemedView style={styles.contentContainer}>
            {renderContent()}
          </ThemedView>
        </ThemedView>

        {/* Content List Section */}
        <ThemedView style={styles.bottomSection}>
          <ThemedView style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>สารบัญ</ThemedText>
            <ThemedText style={styles.progressSummary}>
              เรียนจบ {completedContents.size}/{courseData.contents.length}{' '}
              รายการ
            </ThemedText>
          </ThemedView>
          <ThemedView style={styles.contentListWrapper}>
            {courseData.contents.map((item, index) => (
              <ThemedView key={item.id.toString()}>
                {renderContentItem({ item, index })}
              </ThemedView>
            ))}
          </ThemedView>
        </ThemedView>
      </ScrollView>

      {/* Fixed Bottom Progress Bar */}
      <View style={[styles.fixedBottomContainer, { backgroundColor }]}>
        <View style={styles.progressBar}>
          {/* Left: Circular Progress */}
          <View style={styles.circularProgress}>
            <ThemedText style={styles.progressText}>
              {completedContents.size}/{courseData.contents.length}
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
                : `0/${courseData.contents.reduce(
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
                        (completedContents.size / courseData.contents.length) *
                          100
                      )}%`,
                    },
                  ]}
                />
              </View>
              <ThemedText style={styles.percentageText}>
                {Math.round(
                  (completedContents.size / courseData.contents.length) * 100
                )}
                %
              </ThemedText>
            </View>
          </View>
        </View>
      </View>
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
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100, // Add space for fixed bottom bar
  },
  contentArea: {
    backgroundColor: '#FFFFFF',
    minHeight: height * 0.6, // Minimum height for content area
  },
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
  contentTypeLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Prompt-Regular',
  },
  selectedContentTypeLabel: {
    color: '#6B7280', // Keep original gray color
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  videoContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  videoWebView: {
    flex: 1,
    backgroundColor: 'transparent',
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
    backgroundColor: 'transparent', // Make section background transparent
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 20,
    paddingBottom: 40, // Add bottom padding for safe area
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
    backgroundColor: 'transparent', // Make background transparent
    marginBottom: 0,
    paddingVertical: 16,
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
    width: '100%', // Ensure full width
  },
  completedContentItem: {
    borderLeftColor: '#2e7d32', // Green left border for completed items
  },
  selectedContentItem: {
    backgroundColor: '#F0F7FF', // Transparent blue background
    borderLeftColor: '#183A7C', // Solid blue left border
  },
  contentItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20, // Move padding here for proper full-width effect
    backgroundColor: 'transparent', // Ensure no background color
  },
  iconContainer: {
    position: 'relative',
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    backgroundColor: 'transparent', // Make icon background transparent
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
  contentItemDuration: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Prompt-Regular',
  },
  selectedContentItemDuration: {
    color: '#6B7280', // Keep original gray color
  },
  // Fixed Bottom Progress Bar Styles
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
  // Test Welcome Screen Styles
  testWelcomeContainer: {
    flex: 1,
    padding: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
  },
  testHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  testTitle: {
    fontSize: 24,
    fontFamily: 'Prompt-Bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  testHeaderDivider: {
    width: '100%',
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  testDetailsSection: {
    marginBottom: 20,
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
  },
  testSubject: {
    fontSize: 16,
    fontFamily: 'Prompt-SemiBold',
    color: '#1F2937',
    marginBottom: 12,
  },
  testInstructions: {
    fontSize: 16,
    fontFamily: 'Prompt-Regular',
    color: '#4B5563',
    marginBottom: 6,
  },
  testInfo: {
    fontSize: 15,
    fontFamily: 'Prompt-Regular',
    color: '#6B7280',
    marginBottom: 4,
  },
  testInfoBold: {
    fontSize: 15,
    fontFamily: 'Prompt-Medium',
    color: '#6B7280',
    paddingRight: 4,
  },
  testSectionDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginTop: 15,
    marginBottom: 15,
  },
  testStatusSection: {
    marginBottom: 20,
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
  },
  testStatusText: {
    fontSize: 16,
    fontFamily: 'Prompt-Medium',
    color: '#1F2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  testNotesSection: {
    marginBottom: 30,
    backgroundColor: '#FEF2F2',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#D14343',
  },
  testWarningText: {
    fontSize: 15,
    fontFamily: 'Prompt-Regular',
    color: '#D14343',
    textAlign: 'center',
  },
  testStartButton: {
    backgroundColor: '#183A7C',
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  testButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  testButtonIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 24,
    padding: 10,
    marginRight: 12,
  },
  testButtonText: {
    fontSize: 16,
    fontFamily: 'Prompt-Medium',
    color: '#FFFFFF',
    marginLeft: 4,
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
