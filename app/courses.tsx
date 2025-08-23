import { router } from 'expo-router'
import React, { useState } from 'react'
import {
  FlatList,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'

import CourseItem, {
  type Course,
  type RealCourse,
} from '@/components/CourseItem'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { courseCategories } from '@/constants/CourseCategories'
import { courses } from '@/constants/Courses'
import { useThemeColor } from '@/hooks/useThemeColor'

// Removed Dimensions since we're using full-width layout

// Utility function to convert real course data to display format
const convertCourseToDisplayFormat = (realCourse: RealCourse): Course => {
  const category = courseCategories.find(
    (cat) => cat.id === realCourse.courseCategoryId
  )
  const cleanDescription =
    realCourse.learningObjective
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\n/g, ' ') // Replace newlines with spaces
      .trim()
      .substring(0, 100) + '...' // Limit length

  return {
    id: realCourse.code,
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

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)

  // Convert all courses to display format
  const allCoursesData: Course[] = courses.map(convertCourseToDisplayFormat)

  // Filter courses based on search query and selected category
  const filteredCourses = allCoursesData.filter((course) => {
    const matchesSearch = course.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    const matchesCategory =
      selectedCategory === null || course.courseCategoryId === selectedCategory
    return matchesSearch && matchesCategory
  })

  const renderCourseItem = ({ item }: { item: Course }) => (
    <View style={styles.courseItemWrapper}>
      <CourseItem item={item} variant='fullWidth' />
    </View>
  )

  const renderCategoryChip = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.categoryChip,
        selectedCategory === item.id && { backgroundColor: tintColor },
      ]}
      onPress={() =>
        setSelectedCategory(selectedCategory === item.id ? null : item.id)
      }
    >
      <ThemedText
        style={[
          styles.categoryChipText,
          selectedCategory === item.id && { color: '#FFFFFF' },
        ]}
      >
        {item.courseCategory}
      </ThemedText>
    </TouchableOpacity>
  )

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
          data={[{ id: null, courseCategory: 'ทั้งหมด' }, ...courseCategories]}
          renderItem={renderCategoryChip}
          keyExtractor={(item) => item.id?.toString() || 'all'}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        />
      </ThemedView>

      {/* Scrollable Content */}
      <ThemedView style={styles.content}>
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
        />
      </ThemedView>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
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
    fontWeight: 'bold',
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
  },
  categoryChipText: {
    fontSize: 14,
    fontFamily: 'Prompt-Medium',
    color: '#666',
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
})
