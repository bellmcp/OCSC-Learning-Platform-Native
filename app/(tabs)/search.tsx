import React, { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

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
import type { RootState } from '@/store/types'
import { router } from 'expo-router'

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
    type: realCurriculum.code?.includes('mini')
      ? realCurriculum.code
      : 'หลักสูตร',
  }
}

export default function SearchScreen() {
  const backgroundColor = useThemeColor({}, 'background')
  const tintColor = useThemeColor({}, 'tint')
  const iconColor = useThemeColor({}, 'icon')

  const dispatch = useDispatch()
  const scrollViewRef = useRef<ScrollView>(null)

  // Redux state selectors
  const { isLoading: isCoursesLoading, items: courses } = useSelector(
    (state: RootState) => state.courses
  )
  const { isLoading: isCurriculumsLoading, items: curriculums } = useSelector(
    (state: RootState) => state.curriculums
  )
  const { items: categories } = useSelector(
    (state: RootState) => state.categories
  )

  // Local loading states for search page only (independent of Redux)
  const [isLoadingCourses, setIsLoadingCourses] = useState(false)
  const [isLoadingCurriculums, setIsLoadingCurriculums] = useState(false)
  // Local snapshots of data for search page (won't be affected by detail pages)
  const [searchPageCourses, setSearchPageCourses] = useState<any[]>([])
  const [searchPageCurriculums, setSearchPageCurriculums] = useState<any[]>([])
  // Cache flag to prevent unnecessary reloads
  const hasLoadedInitialData = useRef(false)

  const [searchQuery, setSearchQuery] = useState('')
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [filteredCurriculums, setFilteredCurriculums] = useState<Curriculum[]>(
    []
  )
  const [hasSearched, setHasSearched] = useState(false)

  // Load initial data only if not already present
  useEffect(() => {
    // Check if we already have data in local snapshots or Redux
    const hasSnapshotData =
      searchPageCourses.length > 0 && searchPageCurriculums.length > 0
    const hasReduxData = courses.length > 0 && curriculums.length > 0

    if (!hasLoadedInitialData.current && !hasSnapshotData) {
      // Need to load data
      if (!hasReduxData) {
        console.log('SearchScreen: Loading data from API...')
        setIsLoadingCourses(true)
        setIsLoadingCurriculums(true)
        dispatch(coursesActions.loadCourses() as any)
        dispatch(curriculumsActions.loadCurriculums('') as any)
      }
      // Load categories if not present
      if (categories.length === 0) {
        dispatch(categoriesActions.loadCategories() as any)
      }
      hasLoadedInitialData.current = true
    } else if (hasSnapshotData || hasReduxData) {
      console.log('SearchScreen: Using cached data')
      hasLoadedInitialData.current = true
    }
  }, []) // Empty dependency - only run once on mount

  // Turn off local loading states and save snapshots when data arrives
  useEffect(() => {
    // Save snapshot of courses when Redux finishes loading
    if (courses.length > 0 && !isCoursesLoading) {
      if (isLoadingCourses) {
        setSearchPageCourses([...courses])
        setIsLoadingCourses(false)
      } else if (searchPageCourses.length === 0) {
        // Initial load from cache
        setSearchPageCourses([...courses])
      }
    }
    // Save snapshot of curriculums when Redux finishes loading
    if (curriculums.length > 0 && !isCurriculumsLoading) {
      if (isLoadingCurriculums) {
        setSearchPageCurriculums([...curriculums])
        setIsLoadingCurriculums(false)
      } else if (searchPageCurriculums.length === 0) {
        // Initial load from cache
        setSearchPageCurriculums([...curriculums])
      }
    }
  }, [
    isCoursesLoading,
    isCurriculumsLoading,
    courses,
    curriculums,
    isLoadingCourses,
    isLoadingCurriculums,
    searchPageCourses.length,
    searchPageCurriculums.length,
  ])

  // Filter results when search query or data changes (using local snapshots)
  useEffect(() => {
    // When search query is empty, show all courses and curriculums
    if (searchQuery.trim() === '') {
      const allCourses = searchPageCourses.map((course: any) =>
        convertCourseToDisplayFormat(course, categories)
      )
      const allCurriculums = searchPageCurriculums.map((curriculum: any) =>
        convertCurriculumToDisplayFormat(curriculum)
      )
      setFilteredCourses(allCourses)
      setFilteredCurriculums(allCurriculums)
      setHasSearched(true)
      return
    }

    const searchLower = searchQuery.toLowerCase()

    // Filter courses by name and code (matching desktop behavior)
    const courseResults = searchPageCourses
      .filter((course: any) => {
        return (
          course.name?.toLowerCase().includes(searchLower) ||
          course.code?.toLowerCase().includes(searchLower)
        )
      })
      .map((course: any) => convertCourseToDisplayFormat(course, categories))

    // Filter curriculums by name and code (matching desktop behavior)
    const curriculumResults = searchPageCurriculums
      .filter((curriculum: any) => {
        return (
          curriculum.name?.toLowerCase().includes(searchLower) ||
          curriculum.code?.toLowerCase().includes(searchLower)
        )
      })
      .map((curriculum: any) => convertCurriculumToDisplayFormat(curriculum))

    setFilteredCourses(courseResults)
    setFilteredCurriculums(curriculumResults)
    setHasSearched(true)
  }, [searchQuery, searchPageCourses, searchPageCurriculums, categories])

  // Reset scroll position when component mounts
  useEffect(() => {
    const timeout = setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false })
    }, 100)

    return () => clearTimeout(timeout)
  }, [])

  // Search functionality
  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleClearSearch = () => {
    setSearchQuery('')
  }

  const renderCourseItem = ({ item }: { item: Course }) => (
    <CourseItem
      item={item}
      onPress={(course) => router.push(`/course-detail?id=${course.numericId}`)}
    />
  )

  const renderCurriculumItem = ({ item }: { item: Curriculum }) => (
    <CurriculumItem
      item={item}
      onPress={(curriculum) =>
        router.push({
          pathname: '/curriculum-detail',
          params: { id: curriculum.numericId.toString() },
        })
      }
    />
  )

  const linkToCourses = () => {
    router.push('/courses')
  }

  const linkToCurriculums = () => {
    router.push('/curriculums')
  }

  // Use local loading states instead of Redux (independent of detail pages)
  const isLoading = isLoadingCourses || isLoadingCurriculums
  const hasResults =
    filteredCourses.length > 0 || filteredCurriculums.length > 0
  const showNoResults = hasSearched && !hasResults && !isLoading

  // Render course search section
  const renderCourseSection = () => {
    if (isLoadingCourses && hasSearched) {
      return (
        <ThemedView style={styles.sectionContainer}>
          <ThemedView style={styles.sectionHeader}>
            <ThemedText type='subtitle' style={styles.sectionTitle}>
              {searchQuery ? 'รายวิชา' : 'รายวิชาทั้งหมด'}
            </ThemedText>
          </ThemedView>
          <ThemedView style={styles.loadingContainer}>
            <ActivityIndicator size='large' color={tintColor} />
            <ThemedText style={styles.loadingText}>
              กำลังโหลดรายวิชา...
            </ThemedText>
          </ThemedView>
        </ThemedView>
      )
    }

    if (filteredCourses.length === 0 && hasSearched && searchQuery) {
      return (
        <ThemedView style={styles.sectionContainer}>
          <ThemedView style={styles.sectionHeader}>
            <ThemedText type='subtitle' style={styles.sectionTitle}>
              {searchQuery ? 'รายวิชา' : 'รายวิชาทั้งหมด'}
            </ThemedText>
          </ThemedView>
          <ThemedView style={styles.noResultsSection}>
            <ThemedText style={styles.noResultsSectionText}>
              ไม่พบผลลัพธ์การค้นหา
            </ThemedText>
            <TouchableOpacity
              style={[styles.viewAllButton, { backgroundColor: tintColor }]}
              onPress={linkToCourses}
            >
              <ThemedText style={styles.viewAllButtonText}>
                ดูรายวิชาทั้งหมด
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      )
    }

    if (filteredCourses.length > 0) {
      return (
        <ThemedView style={styles.sectionContainer}>
          <ThemedView style={styles.sectionHeader}>
            <ThemedText type='subtitle' style={styles.sectionTitle}>
              {searchQuery ? 'รายวิชา' : 'รายวิชาทั้งหมด'}
            </ThemedText>
            <ThemedText style={styles.resultsCount}>
              {searchQuery
                ? `ผลการค้นหา ${filteredCourses.length} รายการ`
                : `${filteredCourses.length} รายการ`}
            </ThemedText>
          </ThemedView>
          <FlatList
            data={filteredCourses}
            renderItem={renderCourseItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        </ThemedView>
      )
    }

    return null
  }

  // Render curriculum search section
  const renderCurriculumSection = () => {
    if (isLoadingCurriculums && hasSearched) {
      return (
        <ThemedView style={styles.sectionContainer}>
          <ThemedView style={styles.sectionHeader}>
            <ThemedText type='subtitle' style={styles.sectionTitle}>
              {searchQuery ? 'หลักสูตร' : 'หลักสูตรทั้งหมด'}
            </ThemedText>
          </ThemedView>
          <ThemedView style={styles.loadingContainer}>
            <ActivityIndicator size='large' color={tintColor} />
            <ThemedText style={styles.loadingText}>
              กำลังโหลดหลักสูตร...
            </ThemedText>
          </ThemedView>
        </ThemedView>
      )
    }

    if (filteredCurriculums.length === 0 && hasSearched && searchQuery) {
      return (
        <ThemedView style={styles.sectionContainer}>
          <ThemedView style={styles.sectionHeader}>
            <ThemedText type='subtitle' style={styles.sectionTitle}>
              {searchQuery ? 'หลักสูตร' : 'หลักสูตรทั้งหมด'}
            </ThemedText>
          </ThemedView>
          <ThemedView style={styles.noResultsSection}>
            <ThemedText style={styles.noResultsSectionText}>
              ไม่พบผลลัพธ์การค้นหา
            </ThemedText>
            <TouchableOpacity
              style={[styles.viewAllButton, { backgroundColor: tintColor }]}
              onPress={linkToCurriculums}
            >
              <ThemedText style={styles.viewAllButtonText}>
                ดูหลักสูตรทั้งหมด
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      )
    }

    if (filteredCurriculums.length > 0) {
      return (
        <ThemedView style={styles.sectionContainer}>
          <ThemedView style={styles.sectionHeader}>
            <ThemedText type='subtitle' style={styles.sectionTitle}>
              {searchQuery ? 'หลักสูตร' : 'หลักสูตรทั้งหมด'}
            </ThemedText>
            <ThemedText style={styles.resultsCount}>
              {searchQuery
                ? `ผลการค้นหา ${filteredCurriculums.length} รายการ`
                : `${filteredCurriculums.length} รายการ`}
            </ThemedText>
          </ThemedView>
          <FlatList
            data={filteredCurriculums}
            renderItem={renderCurriculumItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        </ThemedView>
      )
    }

    return null
  }

  // Render search results with curriculum first if it has results (matching desktop behavior)
  const renderSearchResults = () => {
    if (!hasSearched) {
      return null
    }

    // Show curriculum first if it has results, otherwise show courses first
    if (filteredCurriculums.length === 0) {
      return (
        <>
          {renderCourseSection()}
          <ThemedView style={styles.divider} />
          {renderCurriculumSection()}
        </>
      )
    } else {
      return (
        <>
          {renderCurriculumSection()}
          <ThemedView style={styles.divider} />
          {renderCourseSection()}
        </>
      )
    }
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <ThemedView style={styles.header}>
        <ThemedText type='title' style={styles.headerTitle}>
          ค้นหา
        </ThemedText>
      </ThemedView>

      {/* Search Input */}
      <ThemedView style={styles.searchContainer}>
        <ThemedView style={styles.searchInputContainer}>
          <IconSymbol name='magnifyingglass' size={20} color={iconColor} />
          <TextInput
            style={[styles.searchInput, { color: iconColor }]}
            placeholder='ค้นหาหลักสูตรหรือรายวิชา...'
            placeholderTextColor={iconColor + '80'}
            value={searchQuery}
            onChangeText={handleSearch}
            autoCapitalize='none'
            autoCorrect={false}
            returnKeyType='search'
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch}>
              <IconSymbol
                name='xmark.circle.fill'
                size={20}
                color={iconColor}
              />
            </TouchableOpacity>
          )}
        </ThemedView>
      </ThemedView>

      {/* Search Results */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.resultsContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps='handled'
      >
        {/* Show loading state when initially loading data */}
        {isLoading && (
          <ThemedView style={styles.loadingContainer}>
            <ActivityIndicator size='large' color={tintColor} />
            <ThemedText style={styles.loadingText}>
              กำลังโหลดข้อมูล...
            </ThemedText>
          </ThemedView>
        )}

        {/* Render search results */}
        {!isLoading && renderSearchResults()}

        {/* Bottom padding */}
        <ThemedView style={styles.bottomPadding} />
      </ScrollView>
      <StatusBarGradient />
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 80 : 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 0,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 2,
    fontFamily: 'Prompt-Regular',
  },
  resultsContainer: {
    flex: 1,
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
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Prompt-SemiBold',
    flex: 1,
    lineHeight: 28,
  },
  resultsCount: {
    fontSize: 14,
    fontFamily: 'Prompt-Regular',
    color: '#666666',
    marginLeft: 8,
  },
  horizontalList: {
    paddingLeft: 20,
  },
  noResultsSection: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noResultsSectionText: {
    fontSize: 16,
    fontFamily: 'Prompt-Regular',
    color: '#666666',
    marginBottom: 16,
  },
  viewAllButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 200,
    alignItems: 'center',
  },
  viewAllButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Prompt-SemiBold',
  },
  divider: {
    height: 0,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 20,
    marginVertical: 0,
  },
  bottomPadding: {
    height: 40,
  },
})
