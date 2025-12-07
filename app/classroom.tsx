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

  const scrollViewRef = useRef<ScrollView>(null)

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

  // Initialize course rating from registration's satisfactionScore
  useEffect(() => {
    if (preferredRegistration?.satisfactionScore) {
      setCourseRating(preferredRegistration.satisfactionScore)
    }
  }, [preferredRegistration?.satisfactionScore])

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
  }, [dispatch, courseId])

  // Track if initial load is done (to use silent refresh on content switch)
  const [initialLoadDone, setInitialLoadDone] = useState(false)

  // Create session when registration is available
  useEffect(() => {
    if (courseRegistrationId) {
      dispatch(learnActions.createSession())
    }
  }, [dispatch, courseRegistrationId])

  // Load content views when registration is available (initial load with spinner)
  useEffect(() => {
    if (courseRegistrationId && !initialLoadDone) {
      dispatch(learnActions.loadContentViews(courseRegistrationId, false))
      setInitialLoadDone(true)
    }
  }, [dispatch, courseRegistrationId, initialLoadDone])

  // Silently refresh content views when switching content
  // This matches desktop behavior (Learn.tsx line 189-195) where contentViews are
  // refetched when contentId changes to get the latest progress
  useEffect(() => {
    if (courseRegistrationId && initialLoadDone && selectedContentId) {
      dispatch(learnActions.loadContentViews(courseRegistrationId, true)) // silent = true
    }
  }, [dispatch, courseRegistrationId, selectedContentId, initialLoadDone])

  // Build course data from Redux state
  // IMPORTANT: When course is completed (isCourseCompleted), mark ALL contents as completed
  // This matches the desktop behavior in ContentList.tsx
  const courseData: CourseData | null = useMemo(() => {
    if (!currentCourse || courseContents.length === 0) return null

    const contents: ClassroomContent[] = courseContents
      .map((content: any) => {
        // Find the corresponding content view for this content
        const view = contentViews.find(
          (cv: any) => cv.courseContentId === content.id
        )

        // When course is completed, mark all content as completed (matching desktop logic)
        const isContentCompleted = isCourseCompleted
          ? true
          : view?.isCompleted || false

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
          completed: isContentCompleted,
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
  }, [currentCourse, courseContents, contentViews, isCourseCompleted])

  // Initialize completed contents and progress when data is loaded
  // Note: Do NOT auto-select content - show welcome screen first (matching desktop behavior)
  useEffect(() => {
    if (courseData && courseData.contents.length > 0) {
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

  // Handle content completion callback from ProgressBar
  const handleContentComplete = (contentId: number) => {
    setCompletedContents((prev) => new Set([...prev, contentId]))
    setShowCoinAnimation(true)
  }

  const handleContentSelect = (contentId: number) => {
    setSelectedContentId(contentId)
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

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true })
  }

  const handleCourseRatingChange = (rating: number) => {
    setCourseRating(rating)
    if (courseRegistrationId) {
      dispatch(
        registrationsActions.updateCourseSatisfactionScore(
          courseRegistrationId,
          rating
        )
      )
    }
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
          isSeqFlow={courseData.seqFlow}
        />

        {/* Star Rating Section */}
        <ThemedView style={styles.ratingSection}>
          <ThemedText style={styles.ratingLabel}>
            โปรดให้คะแนนรายวิชา
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
        onContentComplete={handleContentComplete}
        courseRegistrationId={courseRegistrationId}
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
