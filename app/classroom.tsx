import { router, useLocalSearchParams } from 'expo-router'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useDispatch, useSelector } from 'react-redux'

import {
  ClassroomContent,
  ClassroomHeader,
  CoinAnimation,
  ContentHeader,
  ContentList,
  ContentView,
  CourseData,
  ProgressBar,
  StarRating,
} from '@/components'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { useThemeColor } from '@/hooks/useThemeColor'
import * as coursesActions from '@/modules/courses/actions'
import * as learnActions from '@/modules/learn/actions'
import * as registrationsActions from '@/modules/registrations/actions'
import type { AppDispatch, RootState } from '@/store/types'

const { width, height } = Dimensions.get('window')

// Helper to get preferred registration when multiple exist
const getPreferredRegistration = (registrations: any[]) => {
  if (!registrations || registrations.length === 0) {
    return null
  }

  // Separate standalone and curriculum registrations
  const standaloneRegistrations = registrations.filter(
    (reg) => !reg.curriculumRegistrationId || reg.curriculumRegistrationId === 0
  )
  const curriculumRegistrations = registrations.filter(
    (reg) => reg.curriculumRegistrationId && reg.curriculumRegistrationId !== 0
  )

  // Prefer standalone registrations
  if (standaloneRegistrations.length > 0) {
    return standaloneRegistrations.sort(
      (a, b) =>
        new Date(b.registrationDate).getTime() -
        new Date(a.registrationDate).getTime()
    )[0]
  }

  // Fall back to curriculum registrations
  if (curriculumRegistrations.length > 0) {
    return curriculumRegistrations.sort(
      (a, b) =>
        new Date(b.registrationDate).getTime() -
        new Date(a.registrationDate).getTime()
    )[0]
  }

  return registrations[0]
}

// Helper to check if date is between start and end
const isBetween = (start: string, end: string, current: string[]): boolean => {
  if (!start || !end || !current || current.length < 3) return true

  const startDate = new Date(start)
  const endDate = new Date(end)
  const currentDate = new Date(
    parseInt(current[0]),
    parseInt(current[1]) - 1,
    parseInt(current[2])
  )

  return currentDate >= startDate && currentDate <= endDate
}

export default function ClassroomScreen() {
  const { courseId, contentId: initialContentId } = useLocalSearchParams<{
    courseId: string
    contentId?: string
  }>()

  const backgroundColor = useThemeColor({}, 'background')
  const tintColor = useThemeColor({}, 'tint')
  const dispatch = useDispatch<AppDispatch>()

  const [selectedContentId, setSelectedContentId] = useState<number | null>(
    initialContentId ? parseInt(initialContentId) : null
  )
  const [completedContents, setCompletedContents] = useState<Set<number>>(
    new Set()
  )
  const [contentProgress, setContentProgress] = useState<Map<number, number>>(
    new Map()
  )
  const [courseRating, setCourseRating] = useState<number>(0)
  const [showCoinAnimation, setShowCoinAnimation] = useState(false)
  const [accessible, setAccessible] = useState(true)

  const contentStartTime = useRef<number | null>(null)
  const scrollViewRef = useRef<ScrollView>(null)
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const accumulatedSecondsRef = useRef<number>(0)

  // Redux state selectors
  const {
    currentCourse,
    contents: courseContents,
    isLoading: isCourseLoading,
  } = useSelector((state: RootState) => state.courses)
  const { myCourses, localDateTime } = useSelector(
    (state: RootState) => state.registrations
  )
  const { contentViews, session, isContentViewsLoading } = useSelector(
    (state: RootState) => state.learn
  )

  // Get course registrations for this course
  const allCourseRegistrations = useMemo(
    () =>
      myCourses.filter(
        (myCourse: any) => myCourse.courseId === parseInt(courseId || '0')
      ),
    [myCourses, courseId]
  )

  const preferredRegistration = useMemo(
    () => getPreferredRegistration(allCourseRegistrations),
    [allCourseRegistrations]
  )

  const courseRegistrationId = preferredRegistration?.id
  const isCourseCompleted = preferredRegistration?.isCompleted

  // Check course accessibility based on start/end dates
  useEffect(() => {
    const courseStart = preferredRegistration?.courseStart
    const courseEnd = preferredRegistration?.courseEnd
    if (courseStart && courseEnd && localDateTime.length >= 3) {
      const check = isBetween(courseStart, courseEnd, localDateTime)
      setAccessible(check)
    }
  }, [preferredRegistration, localDateTime])

  // Load initial data
  useEffect(() => {
    if (courseId) {
      console.log('[Classroom] Loading course data for:', courseId)
      dispatch(coursesActions.loadCourse(courseId))
      dispatch(coursesActions.loadCourseContents(courseId))
      dispatch(registrationsActions.loadCourseRegistrations())
      dispatch(registrationsActions.loadLocalDateTime())
      dispatch(learnActions.loadConfig())
    }

    return () => {
      // Cleanup on unmount
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
    }
  }, [dispatch, courseId])

  // Create session and load content views when registration is available
  useEffect(() => {
    if (courseRegistrationId) {
      console.log(
        '[Classroom] Creating session for registration:',
        courseRegistrationId
      )
      dispatch(learnActions.createSession())
      dispatch(learnActions.loadContentViews(courseRegistrationId))
    }
  }, [dispatch, courseRegistrationId])

  // Build course data from Redux state
  const courseData: CourseData | null = useMemo(() => {
    if (!currentCourse || courseContents.length === 0) return null

    const contents: ClassroomContent[] = courseContents
      .map((content: any) => {
        // Find the corresponding content view for this content
        const view = contentViews.find(
          (cv: any) => cv.courseContentId === content.id
        )

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
          completed: view?.isCompleted || false,
          completeDate: view?.completeDate || null,
          contentSeconds: view?.contentSeconds || null,
          testScore: view?.testScore || null,
          testTries: view?.testTries || null,
          contentViewId: view?.id || null,
        }
      })
      .sort((a: any, b: any) => a.no - b.no)

    return {
      id: currentCourse.id,
      code: currentCourse.code,
      name: currentCourse.name,
      courseCategoryId: currentCourse.courseCategoryId,
      learningObjective: currentCourse.learningObjective,
      instructor: currentCourse.instructor,
      learningTopic: currentCourse.learningTopic,
      targetGroup: currentCourse.targetGroup,
      assessment: currentCourse.assessment,
      thumbnail: currentCourse.thumbnail,
      seqFlow: currentCourse.seqFlow,
      contents,
    }
  }, [currentCourse, courseContents, contentViews])

  // Initialize selected content and completed contents when data is loaded
  useEffect(() => {
    if (courseData && courseData.contents.length > 0) {
      // Set initial selected content if not already set
      if (!selectedContentId) {
        const firstUncompleted = courseData.contents.find((c) => !c.completed)
        const initialId = firstUncompleted
          ? firstUncompleted.id
          : courseData.contents[0].id
        setSelectedContentId(initialId)
      }

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
  }, [courseData])

  // Loading state
  const isLoading = isCourseLoading || isContentViewsLoading

  const selectedContent = useMemo(() => {
    if (!selectedContentId || !courseData) return null
    return (
      courseData.contents.find((content) => content.id === selectedContentId) ||
      null
    )
  }, [selectedContentId, courseData])

  // Start timer when content is selected
  useEffect(() => {
    // Clear previous timer
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
    }

    // Only track time for content type 'c' (video/content)
    if (
      selectedContent?.type === 'c' &&
      courseRegistrationId &&
      selectedContent.contentViewId &&
      session
    ) {
      console.log('[Classroom] Starting timer for content:', selectedContent.id)
      contentStartTime.current = Date.now()
      accumulatedSecondsRef.current = selectedContent.contentSeconds || 0

      // Update every 60 seconds
      timerIntervalRef.current = setInterval(() => {
        const currentSeconds = accumulatedSecondsRef.current + 60

        // Update content view via API
        dispatch(
          learnActions.updateContentView(
            courseRegistrationId,
            selectedContent.contentViewId!,
            currentSeconds,
            true // Show flash message
          )
        )

        accumulatedSecondsRef.current = currentSeconds

        // Update local progress
        if (selectedContent.minutes) {
          const progress = Math.min(
            currentSeconds / (selectedContent.minutes * 60),
            1
          )
          setContentProgress((prev) => {
            const newMap = new Map(prev)
            newMap.set(selectedContent.id, progress)
            return newMap
          })
        }

        // Show coin animation
        setShowCoinAnimation(true)
      }, 60000) // Every 60 seconds
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
    }
  }, [selectedContent, courseRegistrationId, session, dispatch])

  const handleContentSelect = (contentId: number) => {
    // Save progress for previous content before switching
    if (
      selectedContent?.type === 'c' &&
      contentStartTime.current &&
      courseRegistrationId &&
      selectedContent.contentViewId
    ) {
      const timeSpent = Math.floor(
        (Date.now() - contentStartTime.current) / 1000
      )
      const currentSeconds = accumulatedSecondsRef.current + timeSpent

      // Update via API (don't show flash message on content switch)
      dispatch(
        learnActions.updateContentView(
          courseRegistrationId,
          selectedContent.contentViewId,
          currentSeconds,
          false
        )
      )

      // Update local progress
      if (selectedContent.minutes) {
        const progress = Math.min(
          currentSeconds / (selectedContent.minutes * 60),
          1
        )
        setContentProgress((prev) => {
          const newMap = new Map(prev)
          newMap.set(selectedContent.id, progress)
          return newMap
        })
      }
    }

    setSelectedContentId(contentId)
    contentStartTime.current = Date.now()
    accumulatedSecondsRef.current = 0

    // Get the new content's accumulated seconds
    const newContent = courseData?.contents.find((c) => c.id === contentId)
    if (newContent?.contentSeconds) {
      accumulatedSecondsRef.current = newContent.contentSeconds
    }
  }

  const handleMarkComplete = (contentId: number) => {
    const content = courseData?.contents.find((c) => c.id === contentId)
    if (!content) return

    if (content.type === 't') {
      // Navigate to test page
      handleOpenTest()
      return
    }

    if (content.type === 'e') {
      // Navigate to evaluation page
      handleOpenEvaluation()
      return
    }

    // For regular content, the completion is handled by the timer
    // Users can't manually mark content as complete
  }

  const handleTestStart = (contentId: number) => {
    const content = courseData?.contents.find((c) => c.id === contentId)
    if (!content || !courseRegistrationId || !content.contentViewId) return

    // Update test tries via API
    dispatch(
      learnActions.updateTestTries(courseRegistrationId, content.contentViewId)
    )
  }

  const handleOpenTest = () => {
    if (selectedContent && courseData) {
      router.push({
        pathname: '/test',
        params: {
          contentId: selectedContent.id.toString(),
          courseId: courseData.id.toString(),
          courseName: courseData.name,
          registrationId: courseRegistrationId?.toString() || '',
          contentViewId: selectedContent.contentViewId?.toString() || '',
        },
      })
    }
  }

  const handleOpenEvaluation = () => {
    if (selectedContent && courseData) {
      router.push({
        pathname: '/evaluation',
        params: {
          contentId: selectedContent.id.toString(),
          courseId: courseData.id.toString(),
          courseName: courseData.name,
          registrationId: courseRegistrationId?.toString() || '',
          contentViewId: selectedContent.contentViewId?.toString() || '',
          evaluationId: selectedContent.evaluationId?.toString() || '',
        },
      })
    }
  }

  const handleContentLoadStart = () => {
    if (!contentStartTime.current) {
      contentStartTime.current = Date.now()
    }
  }

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true })
  }

  const handleCourseRatingChange = (rating: number) => {
    setCourseRating(rating)
    // TODO: Send rating to API if needed
  }

  const handleMinuteComplete = () => {
    setShowCoinAnimation(true)
  }

  const handleCoinAnimationComplete = () => {
    setShowCoinAnimation(false)
  }

  // Loading state
  if (isLoading || !courseData) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <ClassroomHeader courseName='กำลังโหลด...' showCelebration={false} />
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size='large' color={tintColor} />
          <ThemedText style={styles.loadingText}>
            กำลังโหลดข้อมูลรายวิชา...
          </ThemedText>
        </ThemedView>
      </SafeAreaView>
    )
  }

  // Course not accessible
  if (!accessible) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <ClassroomHeader courseName={courseData.name} showCelebration={false} />
        <ThemedView style={styles.loadingContainer}>
          <ThemedText style={styles.lockedTitle}>
            ไม่สามารถเข้าสู่บทเรียนได้
          </ThemedText>
          <ThemedText style={styles.lockedText}>
            รายวิชานี้ยังไม่เปิดให้เรียน หรือหมดเวลาเรียนแล้ว
          </ThemedText>
        </ThemedView>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <ClassroomHeader
        courseName={courseData.name}
        showCelebration={showCoinAnimation}
      />

      {/* Main Content Container */}
      <ScrollView
        ref={scrollViewRef}
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
              onOpenEvaluation={handleOpenEvaluation}
            />
          </ThemedView>
        </ThemedView>

        {/* Content List Section */}
        <ContentList
          contents={courseData.contents}
          selectedContentId={selectedContentId}
          completedContents={completedContents}
          onContentSelect={handleContentSelect}
          onScrollToTop={scrollToTop}
        />

        {/* Star Rating Section */}
        <ThemedView style={styles.ratingSection}>
          <ThemedText style={styles.ratingLabel}>
            โปรดให้คะแนนหลักสูตร
          </ThemedText>
          <StarRating
            rating={courseRating}
            onRatingChange={handleCourseRatingChange}
          />
        </ThemedView>
      </ScrollView>

      {/* Fixed Bottom Progress Bar */}
      <ProgressBar
        contents={courseData.contents}
        selectedContent={selectedContent}
        completedContents={completedContents}
        contentProgress={contentProgress}
        backgroundColor={backgroundColor}
        onMinuteComplete={handleMinuteComplete}
      />

      {/* Coin Animation Overlay */}
      <CoinAnimation
        isVisible={showCoinAnimation}
        onAnimationComplete={handleCoinAnimationComplete}
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
  ratingSection: {
    paddingTop: 36,
    paddingHorizontal: 16,
    paddingBottom: 20,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  ratingLabel: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Prompt-Regular',
    opacity: 0.6,
    textAlign: 'center',
  },
  lockedTitle: {
    fontSize: 18,
    fontFamily: 'Prompt-SemiBold',
    color: '#6B7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  lockedText: {
    fontSize: 14,
    fontFamily: 'Prompt-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 22,
  },
})
