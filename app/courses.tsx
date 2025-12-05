import { router, useLocalSearchParams } from 'expo-router'
import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

import CourseItem, { type Course } from '@/components/CourseItem'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { useThemeColor } from '@/hooks/useThemeColor'
import * as categoriesActions from '@/modules/categories/actions'
import * as coursesActions from '@/modules/courses/actions'
import type { RootState } from '@/store/types'
import categoryColor from '@/utils/categoryColor'

// Utility function to convert real course data to display format
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

export default function CoursesScreen() {
  const backgroundColor = useThemeColor({}, 'background')
  const tintColor = useThemeColor({}, 'tint')
  const iconColor = useThemeColor({}, 'icon')
  const textColor = useThemeColor({}, 'text')

  // Get initial category from route params (from home page navigation)
  const params = useLocalSearchParams()
  const initialCategoryId = params.categoryId
    ? parseInt(params.categoryId as string)
    : null

  const dispatch = useDispatch()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<number | null>(
    initialCategoryId
  )
  const [refreshing, setRefreshing] = useState(false)

  // Redux state selectors
  const { isLoading, items: courses } = useSelector(
    (state: RootState) => state.courses
  )
  const { items: categories } = useSelector(
    (state: RootState) => state.categories
  )

  // Load categories on mount
  useEffect(() => {
    if (categories.length === 0) {
      console.log('CoursesScreen: Loading categories...')
      dispatch(categoriesActions.loadCategories() as any)
    }
  }, [dispatch, categories.length])

  // Load courses when category changes
  useEffect(() => {
    console.log(
      'CoursesScreen: Loading courses for category:',
      selectedCategory
    )
    if (selectedCategory === null) {
      dispatch(coursesActions.loadCourses() as any)
    } else {
      dispatch(coursesActions.loadCourses(selectedCategory.toString()) as any)
    }
  }, [dispatch, selectedCategory])

  // Pull to refresh
  const onRefresh = async () => {
    console.log('CoursesScreen: Pull-to-refresh triggered')
    setRefreshing(true)
    try {
      // Only refresh courses, not categories (categories are loaded once and cached)
      await dispatch(
        coursesActions.loadCourses(
          selectedCategory === null ? undefined : selectedCategory.toString()
        ) as any
      )
    } catch (error) {
      console.error('Error refreshing courses:', error)
    } finally {
      setRefreshing(false)
    }
  }

  // Convert all courses to display format
  const allCoursesData: Course[] = courses.map((course: any) =>
    convertCourseToDisplayFormat(course, categories)
  )

  // Filter courses based on search query (client-side search)
  const filteredCourses = allCoursesData.filter((course) => {
    const matchesSearch = course.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const renderCourseItem = ({ item }: { item: Course }) => (
    <View style={styles.courseItemWrapper}>
      <CourseItem
        item={item}
        variant='fullWidth'
        onPress={(course) =>
          router.push(`/course-detail?id=${course.numericId}`)
        }
      />
    </View>
  )

  const renderCategoryChip = ({ item }: { item: any }) => {
    const isSelected = selectedCategory === item.id

    return (
      <TouchableOpacity
        style={[
          styles.categoryChip,
          isSelected && { backgroundColor: tintColor },
        ]}
        onPress={() =>
          setSelectedCategory(selectedCategory === item.id ? null : item.id)
        }
      >
        {item.id && (
          <View
            style={[
              styles.categoryDot,
              {
                backgroundColor: isSelected
                  ? '#FFFFFF'
                  : categoryColor(item.id),
              },
            ]}
          />
        )}
        <ThemedText
          style={[styles.categoryChipText, isSelected && { color: '#FFFFFF' }]}
        >
          {item.courseCategory}
        </ThemedText>
      </TouchableOpacity>
    )
  }

  const renderEmptyState = () => {
    if (isLoading) {
      return null
    }

    return (
      <View style={styles.emptyContainer}>
        <ThemedText style={styles.emptyText}>
          {searchQuery
            ? `ไม่พบรายวิชาที่ค้นหา "${searchQuery}"`
            : 'ไม่พบรายวิชาในหมวดหมู่นี้'}
        </ThemedText>
      </View>
    )
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      {/* Fixed Header */}
      <ThemedView style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <IconSymbol name='chevron.left' size={24} color={iconColor} />
          </TouchableOpacity>
          <ThemedText type='title' style={styles.headerTitle}>
            รายวิชาทั้งหมด
          </ThemedText>
          <View style={styles.backButton} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <IconSymbol
            name='magnifyingglass'
            size={20}
            color='#999'
            style={styles.searchIcon}
          />
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            placeholder='ค้นหารายวิชา...'
            placeholderTextColor='#999'
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </ThemedView>

      {/* Category Filter - Outside header for full width scrolling */}
      <ThemedView style={styles.filterSection}>
        <FlatList
          data={[{ id: null, courseCategory: 'ทั้งหมด' }, ...categories]}
          renderItem={renderCategoryChip}
          keyExtractor={(item) => item.id?.toString() || 'all'}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        />
      </ThemedView>

      {/* Scrollable Content */}
      <ThemedView style={styles.content}>
        {isLoading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size='large' color={tintColor} />
            <ThemedText style={styles.loadingText}>
              กำลังโหลดรายวิชา...
            </ThemedText>
          </View>
        ) : (
          <>
            <ThemedText style={styles.resultCount}>
              ผลลัพธ์ {filteredCourses.length} รายการ
            </ThemedText>

            <FlatList
              data={filteredCourses}
              renderItem={renderCourseItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.coursesGrid}
              style={styles.coursesList}
              ListEmptyComponent={renderEmptyState}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor={tintColor}
                  colors={[tintColor]}
                />
              }
            />
          </>
        )}
      </ThemedView>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 70 : 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    textAlign: 'center',
    fontSize: 20,
    fontFamily: 'Prompt-SemiBold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Prompt-Regular',
    paddingVertical: 0,
  },
  filterSection: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  filterContainer: {
    paddingLeft: 20,
    paddingBottom: 16,
  },
  categoryChip: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryChipText: {
    fontSize: 14,
    fontFamily: 'Prompt-Medium',
    color: '#666',
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  resultCount: {
    fontSize: 16,
    fontFamily: 'Prompt-Medium',
    marginTop: 16,
    marginBottom: 16,
    color: '#666',
  },
  coursesList: {
    flex: 1,
  },
  coursesGrid: {
    paddingBottom: 20,
  },
  courseItemWrapper: {
    marginBottom: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Prompt-Regular',
    color: '#666',
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Prompt-Regular',
    color: '#999',
    textAlign: 'center',
  },
})
