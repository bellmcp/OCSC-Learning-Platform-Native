import React, { useRef, useState } from 'react'
import {
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native'

import CourseItem, {
  type Course,
  type RealCourse,
} from '@/components/CourseItem'
import CurriculumItem, {
  type Curriculum,
  type RealCurriculum,
} from '@/components/CurriculumItem'
import StatusBarGradient from '@/components/StatusBarGradient'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { courseCategories } from '@/constants/CourseCategories'
import { courses } from '@/constants/Courses'
import { curriculums } from '@/constants/Curriculums'
import { useThemeColor } from '@/hooks/useThemeColor'
import { router } from 'expo-router'

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

// Utility function to convert real curriculum data to display format
const convertCurriculumToDisplayFormat = (
  realCurriculum: RealCurriculum
): Curriculum => {
  const cleanDescription =
    realCurriculum.learningObjective
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\n/g, ' ') // Replace newlines with spaces
      .trim()
      .substring(0, 80) + '...' // Limit length

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

// Convert real course data for search
const mockCourses: Course[] = courses.map(convertCourseToDisplayFormat)

// Convert real curriculum data for search
const mockCurriculums: Curriculum[] = curriculums.map(
  convertCurriculumToDisplayFormat
)

export default function SearchScreen() {
  const backgroundColor = useThemeColor({}, 'background')
  const tintColor = useThemeColor({}, 'tint')
  const iconColor = useThemeColor({}, 'icon')

  const [searchQuery, setSearchQuery] = useState('')
  const scrollViewRef = useRef<ScrollView>(null)

  // Reset scroll position when component mounts or becomes visible
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false })
    }, 100) // Small delay to ensure component is mounted

    return () => clearTimeout(timeout)
  }, [])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [filteredCurriculums, setFilteredCurriculums] = useState<Curriculum[]>(
    []
  )

  // Search functionality
  const handleSearch = (query: string) => {
    setSearchQuery(query)

    if (query.trim() === '') {
      setFilteredCourses([])
      setFilteredCurriculums([])
      return
    }

    const searchLower = query.toLowerCase()

    // Filter courses
    const coursesResults = mockCourses.filter(
      (course) =>
        course.title.toLowerCase().includes(searchLower) ||
        course.description.toLowerCase().includes(searchLower) ||
        course.id.toLowerCase().includes(searchLower) ||
        course.category.toLowerCase().includes(searchLower)
    )

    // Filter curriculums
    const curriculumsResults = mockCurriculums.filter(
      (curriculum) =>
        curriculum.title.toLowerCase().includes(searchLower) ||
        curriculum.description.toLowerCase().includes(searchLower) ||
        curriculum.id.toLowerCase().includes(searchLower) ||
        curriculum.type.toLowerCase().includes(searchLower)
    )

    setFilteredCourses(coursesResults)
    setFilteredCurriculums(curriculumsResults)
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
      onPress={(curriculum) => console.log('Curriculum selected:', curriculum)}
    />
  )

  const hasResults =
    filteredCourses.length > 0 || filteredCurriculums.length > 0
  const showNoResults = searchQuery.trim() !== '' && !hasResults

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
            <TouchableOpacity onPress={() => handleSearch('')}>
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
        {/* Show welcome message when no search */}
        {searchQuery.trim() === '' && (
          <ThemedView style={styles.welcomeContainer}>
            <IconSymbol
              name='magnifyingglass.circle'
              size={80}
              color={iconColor + '60'}
            />
            <ThemedText
              type='subtitle'
              style={[styles.welcomeTitle, { color: '#000000' }]}
            >
              ค้นหาหลักสูตรและรายวิชา
            </ThemedText>
            <ThemedText
              style={[styles.welcomeDescription, { color: iconColor }]}
            >
              พิมพ์คำค้นหาในช่องด้านบน
            </ThemedText>
            <ThemedText
              style={[styles.welcomeDescription, { color: iconColor }]}
            >
              เพื่อค้นหาหลักสูตรหรือรายวิชาที่คุณสนใจ
            </ThemedText>
          </ThemedView>
        )}

        {/* No Results */}
        {showNoResults && (
          <ThemedView style={styles.noResultsContainer}>
            <IconSymbol
              name='exclamationmark.circle'
              size={80}
              color={iconColor + '60'}
            />
            <ThemedText
              type='subtitle'
              style={[styles.noResultsTitle, { color: '#000000' }]}
            >
              ไม่พบผลการค้นหา
            </ThemedText>
            <ThemedText
              style={[styles.noResultsDescription, { color: iconColor }]}
            >
              ลองค้นหาด้วยคำค้นหาอื่น
            </ThemedText>
            <ThemedText
              style={[styles.noResultsDescription, { color: iconColor }]}
            >
              หรือตรวจสอบการสะกดคำ
            </ThemedText>
          </ThemedView>
        )}

        {/* Courses Results */}
        {filteredCourses.length > 0 && (
          <ThemedView style={styles.sectionContainer}>
            <ThemedView style={styles.sectionHeader}>
              <ThemedText type='subtitle' style={styles.sectionTitle}>
                รายวิชา
              </ThemedText>
              <ThemedText style={styles.resultsCount}>
                ผลลัพธ์ {filteredCourses.length} รายการ
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
        )}

        {/* Curriculums Results */}
        {filteredCurriculums.length > 0 && (
          <ThemedView style={styles.sectionContainer}>
            <ThemedView style={styles.sectionHeader}>
              <ThemedText type='subtitle' style={styles.sectionTitle}>
                หลักสูตร
              </ThemedText>
              <ThemedText style={styles.resultsCount}>
                ผลลัพธ์ {filteredCurriculums.length} รายการ
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
        )}
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
    paddingTop: Platform.OS === 'ios' ? 80 : 40,
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
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  welcomeTitle: {
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  welcomeDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  noResultsTitle: {
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  noResultsDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
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
    fontSize: 24,
    fontFamily: 'Prompt-Bold',
  },
  resultsCount: {
    fontSize: 16,
    fontFamily: 'Prompt-Regular',
    color: '#666666',
  },
  horizontalList: {
    paddingLeft: 20,
  },
})
