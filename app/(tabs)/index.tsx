import { Image } from 'expo-image'
import { router } from 'expo-router'
import React, { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Linking,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

import { CategoryBottomSheet } from '@/components/CategoryBottomSheet'
import CourseItem, { type Course } from '@/components/CourseItem'
import CurriculumItem, { type Curriculum } from '@/components/CurriculumItem'
import StatusBarGradient from '@/components/StatusBarGradient'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { useThemeColor } from '@/hooks/useThemeColor'
import * as categoriesActions from '@/modules/categories/actions'
import * as coursesActions from '@/modules/courses/actions'
import * as curriculumsActions from '@/modules/curriculums/actions'
import * as pressesActions from '@/modules/press/actions'
import * as uiActions from '@/modules/ui/actions'
import type { RootState } from '@/store/types'
import categoryColor from '@/utils/categoryColor'

const { width: screenWidth } = Dimensions.get('window')

// Utility function to convert course data to display format
const convertCourseToDisplayFormat = (
  realCourse: any,
  categories: any[]
): Course => {
  const category = categories.find(
    (cat) => cat.id === realCourse.courseCategoryId
  )
  const cleanDescription =
    realCourse.learningObjective
      ?.replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\n/g, ' ') // Replace newlines with spaces
      .trim()
      .substring(0, 100) + '...' || '' // Limit length

  return {
    id: realCourse.code, // Course code for display (e.g., "DS01")
    numericId: realCourse.id.toString(), // Numeric ID for API calls
    title: realCourse.name,
    description: cleanDescription,
    image: realCourse.thumbnail,
    category: category?.courseCategory || 'ทั่วไป',
    courseCategoryId: realCourse.courseCategoryId,
    level: 'ทักษะขั้นพื้นฐาน',
    badge: category?.courseCategory || 'ทั่วไป',
  }
}

// Utility function to convert curriculum data to display format
const convertCurriculumToDisplayFormat = (realCurriculum: any): Curriculum => {
  const cleanDescription =
    realCurriculum.learningObjective
      ?.replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\n/g, ' ') // Replace newlines with spaces
      .trim()
      .substring(0, 80) + '...' || '' // Limit length

  return {
    id: realCurriculum.code,
    numericId: realCurriculum.id,
    title: realCurriculum.name,
    description: cleanDescription,
    image: realCurriculum.thumbnail,
    type: realCurriculum.code.includes('mini')
      ? realCurriculum.code
      : 'หลักสูตร',
  }
}

// Define type for banner data
type BannerItem = {
  id: string
  image: string
  title: string
  subtitle: string
  targetUrl: string
}

export default function HomeScreen() {
  const backgroundColor = useThemeColor({}, 'background')
  const tintColor = useThemeColor({}, 'tint')
  const iconColor = useThemeColor({}, 'icon')

  const dispatch = useDispatch()
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0)
  const [selectedCategoryId, setSelectedCategoryId] = useState(0)
  const [showCategoryBottomSheet, setShowCategoryBottomSheet] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  // Local loading states for home page only (independent of Redux)
  const [isLoadingCourses, setIsLoadingCourses] = useState(false)
  const [isLoadingCurriculums, setIsLoadingCurriculums] = useState(false)
  // Local snapshots of data for home page (won't be affected by "See All" pages)
  const [homePageCourses, setHomePageCourses] = useState<any[]>([])
  const [homePageCurriculums, setHomePageCurriculums] = useState<any[]>([])
  const bannerFlatListRef = useRef<FlatList>(null)
  const scrollViewRef = useRef<ScrollView>(null)
  const autoScrollInterval = useRef<ReturnType<typeof setInterval> | null>(null)

  // Cache flags to prevent unnecessary reloads
  const hasLoadedInitialData = useRef(false)
  const lastLoadedCategoryId = useRef<number | null>(null)

  // Redux state selectors
  const { items: users } = useSelector((state: RootState) => state.user)
  const { isLoading: isPressesLoading, items: presses } = useSelector(
    (state: RootState) => state.press
  )
  const { isLoading: isCoursesLoading, items: courses } = useSelector(
    (state: RootState) => state.courses
  )
  const { isRecommendedCoursesLoading, recommended: recommendedCourses } =
    useSelector((state: RootState) => state.courses)
  const { isLoading: isCurriculumsLoading, items: curriculums } = useSelector(
    (state: RootState) => state.curriculums
  )
  const { items: categories } = useSelector(
    (state: RootState) => state.categories
  )
  const { chatbotInfo } = useSelector((state: RootState) => state.ui)

  // Transform press releases data for banner display
  const bannerData: BannerItem[] = presses.map((release: any) => ({
    id: release.id.toString(),
    image: release.imageUrl,
    title: release.headline || 'ข้อมูลข่าวสาร',
    subtitle: '',
    targetUrl: release.targetUrl,
  }))

  // Convert course data to display format (using home page snapshot)
  const coursesData: Course[] = homePageCourses
    .slice(0, 6)
    .map((course: any) => convertCourseToDisplayFormat(course, categories))

  // Convert recommended course data to display format
  const recommendedData: Course[] = recommendedCourses.map((course: any) =>
    convertCourseToDisplayFormat(course, categories)
  )

  // Convert curriculum data to display format (using home page snapshot)
  const curriculumData: Curriculum[] = homePageCurriculums.map(
    convertCurriculumToDisplayFormat
  )

  // Get selected category name for display
  const selectedCategoryName =
    selectedCategoryId === 0
      ? 'ทั้งหมด'
      : categories.find((cat) => cat.id === selectedCategoryId)
          ?.courseCategory || 'ทั้งหมด'

  // Load initial data on mount (only if not already loaded)
  useEffect(() => {
    // Check if we already have data in Redux OR in local snapshots - if yes, skip loading
    const hasReduxData =
      presses.length > 0 && categories.length > 0 && curriculums.length > 0
    const hasSnapshotData =
      homePageCurriculums.length > 0 && homePageCourses.length > 0
    const hasData = hasReduxData || hasSnapshotData

    if (!hasLoadedInitialData.current && !hasData) {
      console.log('HomeScreen: Loading initial data from API...')
      setIsLoadingCourses(true)
      setIsLoadingCurriculums(true)
      dispatch(pressesActions.loadPresses() as any)
      dispatch(coursesActions.loadRecommendedCourses() as any)
      dispatch(categoriesActions.loadCategories() as any)
      dispatch(curriculumsActions.loadCurriculums('') as any)
      dispatch(uiActions.loadChatbotInfo() as any)
      hasLoadedInitialData.current = true
      // Don't set lastLoadedCategoryId yet - let the category effect handle it
    } else if (hasData) {
      console.log('HomeScreen: Using cached data (Redux or snapshots)')
      hasLoadedInitialData.current = true
      // Don't set lastLoadedCategoryId - let it remain null if not set
      // This allows category changes to work properly
    }
  }, [
    dispatch,
    presses.length,
    categories.length,
    curriculums.length,
    homePageCurriculums.length,
    homePageCourses.length,
    selectedCategoryId,
  ])

  // Reload courses only when category actually changes
  useEffect(() => {
    // Load if: initialized AND (first time OR category changed)
    if (
      hasLoadedInitialData.current &&
      (lastLoadedCategoryId.current === null ||
        lastLoadedCategoryId.current !== selectedCategoryId)
    ) {
      console.log(
        'HomeScreen: Loading courses for category:',
        selectedCategoryId
      )
      // Clear old snapshot and show loading
      setHomePageCourses([])
      setIsLoadingCourses(true)

      if (selectedCategoryId === 0) {
        dispatch(coursesActions.loadCourses() as any)
      } else {
        dispatch(
          coursesActions.loadCourses(selectedCategoryId.toString()) as any
        )
      }
      lastLoadedCategoryId.current = selectedCategoryId
    }
  }, [selectedCategoryId])

  // Turn off local loading states and save snapshots when data arrives
  useEffect(() => {
    // Save snapshot of courses for home page (separate from "See All" page data)
    // Only update snapshot when Redux finishes loading (prevents showing old data during category filter)
    if (courses.length > 0 && !isCoursesLoading) {
      if (isLoadingCourses) {
        setHomePageCourses([...courses]) // Create snapshot
        setIsLoadingCourses(false)
      } else if (!refreshing && homePageCourses.length === 0) {
        // Initial load from cache
        setHomePageCourses([...courses])
      }
    }
    // Save snapshot of curriculums for home page (separate from "See All" page data)
    if (curriculums.length > 0 && !isCurriculumsLoading) {
      if (isLoadingCurriculums) {
        setHomePageCurriculums([...curriculums]) // Create snapshot
        setIsLoadingCurriculums(false)
      } else if (!refreshing && homePageCurriculums.length === 0) {
        // Initial load from cache
        setHomePageCurriculums([...curriculums])
      }
    }
  }, [
    isCoursesLoading,
    isCurriculumsLoading,
    courses,
    curriculums,
    isLoadingCourses,
    isLoadingCurriculums,
    refreshing,
    homePageCourses.length,
    homePageCurriculums.length,
  ])

  // Update snapshots after pull-to-refresh completes
  useEffect(() => {
    if (!refreshing && courses.length > 0 && curriculums.length > 0) {
      setHomePageCourses([...courses])
      setHomePageCurriculums([...curriculums])
    }
  }, [refreshing, courses, curriculums])

  // Debug: Log when data changes
  useEffect(() => {
    console.log('Redux State Updated:', {
      presses: presses.length,
      courses: courses.length,
      recommendedCourses: recommendedCourses.length,
      curriculums: curriculums.length,
      categories: categories.length,
    })
  }, [presses, courses, recommendedCourses, curriculums, categories])

  // Reset scroll position when component mounts or becomes visible
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false })
    }, 100) // Small delay to ensure component is mounted

    return () => clearTimeout(timeout)
  }, [])

  // Auto-scroll banner carousel (like desktop version)
  useEffect(() => {
    autoScrollInterval.current = setInterval(() => {
      setCurrentBannerIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % bannerData.length
        const slideWidth = screenWidth - 40 + 16

        bannerFlatListRef.current?.scrollToOffset({
          offset: nextIndex * slideWidth,
          animated: true,
        })

        return nextIndex
      })
    }, 6000) // 6 seconds interval (same as desktop)

    // Cleanup on unmount
    return () => {
      if (autoScrollInterval.current) {
        clearInterval(autoScrollInterval.current)
      }
    }
  }, [bannerData.length])

  // Pause auto-scroll when user manually scrolls
  const handleBannerPress = (targetUrl: string) => {
    if (targetUrl) {
      Linking.openURL(targetUrl).catch((err: any) =>
        console.error('Failed to open URL:', err)
      )
    }
  }

  const handleBannerScroll = (event: any) => {
    const slideWidth = screenWidth - 40 + 16
    const contentOffsetX = event.nativeEvent.contentOffset.x
    const index = Math.round(contentOffsetX / slideWidth)
    const clampedIndex = Math.max(0, Math.min(index, bannerData.length - 1))
    setCurrentBannerIndex(clampedIndex)

    // Reset auto-scroll timer when user manually scrolls
    if (autoScrollInterval.current) {
      clearInterval(autoScrollInterval.current)
    }

    // Only restart auto-scroll if there are more than 3 banners
    if (bannerData.length > 3) {
      autoScrollInterval.current = setInterval(() => {
        setCurrentBannerIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % bannerData.length
          const slideWidth = screenWidth - 40 + 16

          bannerFlatListRef.current?.scrollToOffset({
            offset: nextIndex * slideWidth,
            animated: true,
          })

          return nextIndex
        })
      }, 6000)
    }
  }

  const handleSelectCategory = (categoryId: number) => {
    console.log('Selected category:', categoryId)
    setSelectedCategoryId(categoryId)
  }

  const onRefresh = async () => {
    console.log('HomeScreen: Pull-to-refresh triggered')
    setRefreshing(true)

    // Reset carousel to first item
    setCurrentBannerIndex(0)
    bannerFlatListRef.current?.scrollToOffset({ offset: 0, animated: false })

    try {
      // Force reload all data
      // Note: Don't set local loading states here since refreshing state handles the UI
      await Promise.all([
        dispatch(pressesActions.loadPresses() as any),
        dispatch(
          coursesActions.loadCourses(
            selectedCategoryId === 0 ? undefined : selectedCategoryId.toString()
          ) as any
        ),
        dispatch(coursesActions.loadRecommendedCourses() as any),
        dispatch(categoriesActions.loadCategories() as any),
        dispatch(curriculumsActions.loadCurriculums('') as any),
        dispatch(uiActions.loadChatbotInfo() as any),
      ])
      // Update cache flags (snapshots will be auto-updated by useEffect)
      lastLoadedCategoryId.current = selectedCategoryId
    } catch (error) {
      console.error('Error refreshing data:', error)
    } finally {
      setRefreshing(false)
    }
  }

  const renderBannerItem = ({ item }: { item: BannerItem }) => (
    <TouchableOpacity
      style={styles.bannerItem}
      onPress={() => handleBannerPress(item.targetUrl)}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: item.image }}
        style={styles.bannerImage}
        contentFit='cover'
        placeholder='Loading...'
        transition={200}
      />
      {item.title && item.title.trim() !== '' && (
        <View style={styles.bannerPillContainer}>
          <View style={styles.bannerPill}>
            <ThemedText style={styles.bannerPillText} numberOfLines={1}>
              {item.title}
            </ThemedText>
          </View>
        </View>
      )}
    </TouchableOpacity>
  )

  const renderCourseItem = ({ item }: { item: Course }) => (
    <CourseItem
      item={item}
      onPress={(course) => router.push(`/course-detail?id=${course.numericId}`)}
    />
  )

  const renderRecommendedItem = ({ item }: { item: Course }) => (
    <CourseItem
      item={item}
      onPress={(course) => router.push(`/course-detail?id=${course.numericId}`)}
    />
  )

  const handleCurriculumPress = (item: Curriculum) => {
    router.push({
      pathname: '/curriculum-detail',
      params: { id: item.numericId.toString() },
    })
  }

  const renderCurriculumItem = ({ item }: { item: Curriculum }) => (
    <CurriculumItem item={item} onPress={handleCurriculumPress} />
  )

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={tintColor}
            colors={[tintColor]}
            progressViewOffset={70}
          />
        }
      >
        {/* Header */}
        <ThemedView style={styles.header}>
          <ThemedText type='title' style={styles.headerTitle}>
            {users?.firstname
              ? `สวัสดี คุณ${users.firstname}`
              : 'OCSC Learning Space'}
          </ThemedText>
          <ThemedText type='subtitle' style={styles.headerSubtitle}>
            โลกแห่งการเรียนรู้ ไม่มีวันจบสิ้น{'\n'}ยิ่งเรียนยิ่งรู้
            ยิ่งเพิ่มพลังทางปัญญา
          </ThemedText>
        </ThemedView>

        {/* Banner Carousel */}
        {isPressesLoading ? (
          <ThemedView style={styles.section}>
            <ThemedView style={styles.loadingContainer}>
              <ActivityIndicator size='large' color={tintColor} />
              <ThemedText style={styles.loadingText}>
                กำลังโหลดข่าวสาร...
              </ThemedText>
            </ThemedView>
          </ThemedView>
        ) : bannerData.length > 0 ? (
          <ThemedView style={styles.section}>
            <FlatList
              ref={bannerFlatListRef}
              data={bannerData}
              renderItem={renderBannerItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={screenWidth - 40 + 16}
              snapToAlignment='start'
              decelerationRate='fast'
              scrollEventThrottle={16}
              onMomentumScrollEnd={handleBannerScroll}
              onScrollEndDrag={handleBannerScroll}
              contentContainerStyle={styles.carouselContainer}
              getItemLayout={(data, index) => ({
                length: screenWidth - 40 + 16,
                offset: (screenWidth - 40 + 16) * index,
                index,
              })}
            />
            <ThemedView style={styles.dotsContainer}>
              {bannerData.map((_: BannerItem, index: number) => (
                <ThemedView
                  key={index}
                  style={[
                    styles.dot,
                    index === currentBannerIndex && styles.activeDot,
                  ]}
                />
              ))}
            </ThemedView>
          </ThemedView>
        ) : null}

        {/* Recommended Courses Section */}
        <ThemedView style={styles.section}>
          <ThemedView style={styles.sectionHeader}>
            <ThemedText type='subtitle' style={styles.sectionTitle}>
              รายการแนะนำ
            </ThemedText>
          </ThemedView>
          {isRecommendedCoursesLoading ? (
            <ThemedView style={styles.loadingContainer}>
              <ActivityIndicator size='large' color={tintColor} />
              <ThemedText style={styles.loadingText}>
                กำลังโหลดรายวิชาแนะนำ...
              </ThemedText>
            </ThemedView>
          ) : recommendedData.length > 0 ? (
            <FlatList
              data={recommendedData}
              renderItem={renderCourseItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carouselContainer}
            />
          ) : (
            <ThemedView style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>
                ไม่มีรายวิชาแนะนำในขณะนี้
              </ThemedText>
            </ThemedView>
          )}
        </ThemedView>

        {/* Courses Section */}
        <ThemedView style={styles.section}>
          <ThemedView style={styles.sectionHeader}>
            <ThemedText type='subtitle' style={styles.sectionTitle}>
              รายวิชา
            </ThemedText>
            <TouchableOpacity
              style={styles.seeAllButton}
              onPress={() => router.push('/courses')}
            >
              <ThemedText style={[styles.seeAllText, { color: tintColor }]}>
                ดูทั้งหมด
              </ThemedText>
              <IconSymbol
                name='chevron.right'
                size={18}
                color={tintColor}
                style={styles.seeAllIcon}
              />
            </TouchableOpacity>
          </ThemedView>

          {/* Category Filter */}
          <ThemedView style={styles.categoryFilterSection}>
            <TouchableOpacity
              style={styles.categoryFilterButton}
              onPress={() => setShowCategoryBottomSheet(true)}
              activeOpacity={0.7}
            >
              <View style={styles.categoryFilterContent}>
                {selectedCategoryId === 0 ? (
                  <View style={styles.categoryDotsContainer}>
                    {categories.slice(0, 5).map((cat) => (
                      <View
                        key={cat.id}
                        style={[
                          styles.categoryDot,
                          { backgroundColor: categoryColor(cat.id) },
                        ]}
                      />
                    ))}
                  </View>
                ) : (
                  <View
                    style={[
                      styles.categoryIndicator,
                      { backgroundColor: categoryColor(selectedCategoryId) },
                    ]}
                  />
                )}
                <ThemedText style={styles.categoryFilterText}>
                  {selectedCategoryName}
                </ThemedText>
              </View>
              <IconSymbol
                name='chevron.down'
                size={18}
                color='#6B7280'
                style={styles.categoryFilterIcon}
              />
            </TouchableOpacity>
          </ThemedView>

          {coursesData.length > 0 ? (
            <FlatList
              data={coursesData}
              renderItem={renderRecommendedItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carouselContainer}
            />
          ) : isLoadingCourses ? (
            <ThemedView style={styles.loadingContainer}>
              <ActivityIndicator size='large' color={tintColor} />
              <ThemedText style={styles.loadingText}>
                กำลังโหลดรายวิชา...
              </ThemedText>
            </ThemedView>
          ) : coursesData.length === 0 ? (
            <ThemedView style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>
                ไม่มีรายวิชาในขณะนี้
              </ThemedText>
            </ThemedView>
          ) : null}
        </ThemedView>

        {/* Curriculum Section */}
        <ThemedView style={styles.section}>
          <ThemedView style={styles.sectionHeader}>
            <ThemedText type='subtitle' style={styles.sectionTitle}>
              หลักสูตร
            </ThemedText>
            <TouchableOpacity
              style={styles.seeAllButton}
              onPress={() => router.push('/curriculums')}
            >
              <ThemedText style={[styles.seeAllText, { color: tintColor }]}>
                ดูทั้งหมด
              </ThemedText>
              <IconSymbol
                name='chevron.right'
                size={18}
                color={tintColor}
                style={styles.seeAllIcon}
              />
            </TouchableOpacity>
          </ThemedView>
          {curriculumData.length > 0 ? (
            <FlatList
              data={curriculumData}
              renderItem={renderCurriculumItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carouselContainer}
            />
          ) : isLoadingCurriculums ? (
            <ThemedView style={styles.loadingContainer}>
              <ActivityIndicator size='large' color={tintColor} />
              <ThemedText style={styles.loadingText}>
                กำลังโหลดหลักสูตร...
              </ThemedText>
            </ThemedView>
          ) : curriculumData.length === 0 ? (
            <ThemedView style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>
                ไม่มีหลักสูตรในขณะนี้
              </ThemedText>
            </ThemedView>
          ) : null}
        </ThemedView>
      </ScrollView>

      {/* Category Bottom Sheet */}
      <CategoryBottomSheet
        visible={showCategoryBottomSheet}
        onClose={() => setShowCategoryBottomSheet(false)}
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={handleSelectCategory}
      />

      <StatusBarGradient />
    </ThemedView>
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
    paddingTop: 0, // Allow content to start from the very top
  },
  testContent: {
    backgroundColor: '#FF6B6B', // Red background to make it visible
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginTop: 0,
  },
  testText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'Prompt-SemiBold',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 80 : 50,
    paddingHorizontal: 20,
    paddingBottom: 24,
    backgroundColor: 'transparent', // Allow RefreshControl spinner to be visible
  },
  headerTitle: {
    fontSize: 28,
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 0,
    color: '#183A7C',
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Prompt-Regular',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
    opacity: 0.7,
  },
  heroSection: {
    height: 300, // Adjust height as needed
    position: 'relative',
    marginBottom: 32,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dark overlay
    padding: 20,
  },
  heroTitle: {
    color: 'white',
    fontSize: 36,
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'Prompt-SemiBold',
  },
  heroSubtitle: {
    color: 'white',
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'Prompt-Medium',
  },
  heroDescription: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    fontFamily: 'Prompt-Regular',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'Prompt-SemiBold',
    letterSpacing: -0.3,
  },
  seeAllText: {
    fontSize: 15,
    fontFamily: 'Prompt-SemiBold',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    borderRadius: 8,
  },
  seeAllIcon: {
    marginTop: 1,
  },
  carouselContainer: {
    paddingLeft: 20,
  },

  // Banner styles
  bannerItem: {
    width: screenWidth - 40,
    height: 250,
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#F8F9FA',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 0,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerPillContainer: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerPill: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 28,
    maxWidth: '90%',
    backdropFilter: 'blur(10px)',
  },
  bannerPillText: {
    color: 'white',
    fontSize: 15,
    textAlign: 'center',
    fontFamily: 'Prompt-Medium',
    letterSpacing: 0.2,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E5E7EB',
  },
  activeDot: {
    backgroundColor: '#183A7C',
    width: 20,
    borderRadius: 3,
  },
  loadingContainer: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Prompt-Regular',
    opacity: 0.6,
    marginTop: 16,
  },
  emptyContainer: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Prompt-Regular',
    opacity: 0.6,
  },
  // Category Filter styles
  categoryFilterSection: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  categoryFilterLabel: {
    fontSize: 14,
    fontFamily: 'Prompt-Medium',
    color: '#374151',
    marginBottom: 8,
  },
  categoryFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  categoryFilterContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryDotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 7,
    marginRight: 4,
  },
  categoryIndicator: {
    width: 8,
    height: 8,
    borderRadius: 7,
    marginRight: 10,
  },
  categoryFilterText: {
    fontSize: 16,
    fontFamily: 'Prompt-Regular',
    color: '#374151',
    flex: 1,
  },
  categoryFilterIcon: {
    marginLeft: 8,
  },
})
