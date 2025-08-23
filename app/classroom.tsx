import { router } from 'expo-router'
import React, { useEffect, useRef, useState } from 'react'
import { Alert, Dimensions, ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import {
  ClassroomContent,
  ClassroomHeader,
  ContentHeader,
  ContentList,
  ContentView,
  CourseData,
  ProgressBar,
} from '@/components'
import { ThemedView } from '@/components/ThemedView'
import { contentViews } from '@/constants/ContentViews'
import { courseContents } from '@/constants/CourseContents'
import { useThemeColor } from '@/hooks/useThemeColor'

const { width, height } = Dimensions.get('window')

// ContentView interface for tracking user progress
interface ContentViewData {
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
      const view = contentViews.find(
        (cv: ContentViewData) => cv.courseContentId === content.id
      )

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

export default function ClassroomScreen() {
  const backgroundColor = useThemeColor({}, 'background')

  const [selectedContentId, setSelectedContentId] = useState<number | null>(
    null
  )
  const [completedContents, setCompletedContents] = useState<Set<number>>(
    new Set()
  )
  const [contentProgress, setContentProgress] = useState<Map<number, number>>(
    new Map()
  )

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
    ? courseData.contents.find((content) => content.id === selectedContentId) ||
      null
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

  const handleTestStart = (contentId: number) => {
    // Mock test completion for demo
    setCompletedContents((prev) => new Set([...prev, contentId]))
    Alert.alert('สำเร็จ', 'คุณได้คะแนน 85% ผ่านแบบทดสอบแล้ว')
  }

  const handleOpenTest = () => {
    if (selectedContent) {
      router.push({
        pathname: '/test',
        params: {
          contentId: selectedContent.id.toString(),
          courseName: courseData.name,
        },
      })
    }
  }

  const handleContentLoadStart = () => {
    if (!contentStartTime.current) {
      contentStartTime.current = Date.now()
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <ClassroomHeader courseName={courseData.name} />

      {/* Main Content Container */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Content Display Area */}
        <ThemedView style={styles.contentArea}>
          {selectedContent?.type === 'c' && (
            <ContentHeader selectedContent={selectedContent} />
          )}

          <ThemedView style={styles.contentContainer}>
            <ContentView
              selectedContent={selectedContent}
              courseName={courseData.name}
              onTestStart={handleTestStart}
              onContentLoadStart={handleContentLoadStart}
              onOpenTest={handleOpenTest}
            />
          </ThemedView>
        </ThemedView>

        {/* Content List Section */}
        <ContentList
          contents={courseData.contents}
          selectedContentId={selectedContentId}
          completedContents={completedContents}
          onContentSelect={handleContentSelect}
        />
      </ScrollView>

      {/* Fixed Bottom Progress Bar */}
      <ProgressBar
        contents={courseData.contents}
        selectedContent={selectedContent}
        completedContents={completedContents}
        contentProgress={contentProgress}
        backgroundColor={backgroundColor}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  contentContainer: {
    justifyContent: 'flex-start',
  },
})
