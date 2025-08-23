import React, { useRef, useState } from 'react'
import {
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'

import CourseItem, { type Course } from '@/components/CourseItem'
import CurriculumItem, { type Curriculum } from '@/components/CurriculumItem'
import StatusBarGradient from '@/components/StatusBarGradient'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { courseCategories } from '@/constants/CourseCategories'
import { courseRegistrations } from '@/constants/CourseRegistrations'
import { curriculumRegistrations } from '@/constants/CurriculumRegistrations'
import { useThemeColor } from '@/hooks/useThemeColor'
import { router } from 'expo-router'

// Utility function to convert course registration data to display format
const convertCourseRegistrationToDisplayFormat = (courseReg: any): Course => {
  const category = courseCategories.find(
    (cat) => cat.id === courseReg.categoryId
  )
  const cleanDescription =
    courseReg.learningObjective
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\n/g, ' ') // Replace newlines with spaces
      .trim()
      .substring(0, 100) + '...' // Limit length

  return {
    id: courseReg.code,
    title: courseReg.name,
    description: cleanDescription,
    image: courseReg.thumbnail,
    category: category?.courseCategory || 'ทั่วไป',
    courseCategoryId: courseReg.categoryId,
    level: 'ทักษะขั้นพื้นฐาน',
    badge: category?.courseCategory || 'ทั่วไป',
  }
}

// Utility function to convert curriculum registration data to display format
const convertCurriculumRegistrationToDisplayFormat = (
  curriculumReg: any
): Curriculum => {
  const cleanDescription =
    curriculumReg.learningObjective
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\n/g, ' ') // Replace newlines with spaces
      .trim()
      .substring(0, 80) + '...' // Limit length

  return {
    id: curriculumReg.code,
    title: curriculumReg.name,
    description: cleanDescription,
    image: curriculumReg.thumbnail,
    type: curriculumReg.code.includes('mini') ? curriculumReg.code : 'หลักสูตร',
  }
}

// Convert registered course data for search
const registeredCourses: Course[] = courseRegistrations.map(
  convertCourseRegistrationToDisplayFormat
)

// Convert registered curriculum data for search
const registeredCurriculums: Curriculum[] = curriculumRegistrations.map(
  convertCurriculumRegistrationToDisplayFormat
)

export default function LearnScreen() {
  const backgroundColor = useThemeColor({}, 'background')
  const tintColor = useThemeColor({}, 'tint')
  const iconColor = useThemeColor({}, 'icon')
  const textColor = useThemeColor({}, 'text')

  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'courses' | 'curriculums'>(
    'courses'
  )
  const scrollViewRef = useRef<ScrollView>(null)

  // Reset scroll position when component mounts or becomes visible
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false })
    }, 100) // Small delay to ensure component is mounted

    return () => clearTimeout(timeout)
  }, [])
  const [filteredCourses, setFilteredCourses] =
    useState<Course[]>(registeredCourses)
  const [filteredCurriculums, setFilteredCurriculums] = useState<Curriculum[]>(
    registeredCurriculums
  )

  // Search functionality
  const handleSearch = (query: string) => {
    setSearchQuery(query)

    if (query.trim() === '') {
      setFilteredCourses(registeredCourses)
      setFilteredCurriculums(registeredCurriculums)
      return
    }

    const searchLower = query.toLowerCase()

    // Filter registered courses
    const coursesResults = registeredCourses.filter(
      (course) =>
        course.title.toLowerCase().includes(searchLower) ||
        course.description.toLowerCase().includes(searchLower) ||
        course.id.toLowerCase().includes(searchLower) ||
        course.category.toLowerCase().includes(searchLower)
    )

    // Filter registered curriculums
    const curriculumsResults = registeredCurriculums.filter(
      (curriculum) =>
        curriculum.title.toLowerCase().includes(searchLower) ||
        curriculum.description.toLowerCase().includes(searchLower) ||
        curriculum.id.toLowerCase().includes(searchLower) ||
        curriculum.type.toLowerCase().includes(searchLower)
    )

    setFilteredCourses(coursesResults)
    setFilteredCurriculums(curriculumsResults)
  }

  // Reset search when tab changes
  React.useEffect(() => {
    if (searchQuery.trim() !== '') {
      handleSearch(searchQuery)
    }
  }, [activeTab])

  const renderCourseItem = ({ item }: { item: Course }) => (
    <View style={styles.courseItemWrapper}>
      <CourseItem
        item={item}
        variant='fullWidth'
        onPress={(course) => router.push(`/course-detail?id=${course.id}`)}
      />
    </View>
  )

  const renderCurriculumItem = ({ item }: { item: Curriculum }) => (
    <View style={styles.curriculumItemWrapper}>
      <CurriculumItem
        item={item}
        variant='fullWidth'
        onPress={(curriculum) =>
          router.push(`/curriculum-detail?id=${curriculum.id}`)
        }
      />
    </View>
  )

  // Get current data based on active tab
  const currentData =
    activeTab === 'courses' ? filteredCourses : filteredCurriculums
  const hasRegistrations =
    activeTab === 'courses'
      ? registeredCourses.length > 0
      : registeredCurriculums.length > 0
  const showNoResults = searchQuery.trim() !== '' && currentData.length === 0
  const showWelcome = !hasRegistrations

  // Render function that handles both types
  const renderListItem = ({ item }: { item: Course | Curriculum }) => {
    if (activeTab === 'courses') {
      return renderCourseItem({ item: item as Course })
    } else {
      return renderCurriculumItem({ item: item as Curriculum })
    }
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <ThemedView style={styles.header}>
        <ThemedText type='title' style={styles.headerTitle}>
          เข้าเรียน
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

      {/* Tab Section */}
      <ThemedView style={styles.tabSection}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'courses' && {
                backgroundColor: tintColor,
                borderColor: tintColor,
                shadowColor: tintColor,
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 3,
              },
            ]}
            onPress={() => setActiveTab('courses')}
            activeOpacity={0.9}
          >
            <View style={styles.tabContent}>
              <IconSymbol
                name='book.closed'
                size={16}
                color={activeTab === 'courses' ? '#FFFFFF' : '#666666'}
                style={styles.tabIcon}
              />
              <ThemedText
                style={[
                  styles.tabButtonText,
                  activeTab === 'courses' && {
                    color: '#FFFFFF',
                    fontWeight: '700',
                  },
                ]}
              >
                รายวิชา
              </ThemedText>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'curriculums' && {
                backgroundColor: tintColor,
                borderColor: tintColor,
                shadowColor: tintColor,
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 3,
              },
            ]}
            onPress={() => setActiveTab('curriculums')}
            activeOpacity={0.8}
          >
            <View style={styles.tabContent}>
              <IconSymbol
                name='graduationcap'
                size={16}
                color={activeTab === 'curriculums' ? '#FFFFFF' : '#666666'}
                style={styles.tabIcon}
              />
              <ThemedText
                style={[
                  styles.tabButtonText,
                  activeTab === 'curriculums' && {
                    color: '#FFFFFF',
                    fontWeight: '700',
                  },
                ]}
              >
                หลักสูตร
              </ThemedText>
            </View>
          </TouchableOpacity>
        </View>
      </ThemedView>

      {/* Content */}
      <ThemedView style={styles.content}>
        {/* Show welcome message when no registered items */}
        {showWelcome && (
          <ThemedView style={styles.welcomeContainer}>
            <IconSymbol name='book.circle' size={80} color={iconColor + '60'} />
            <ThemedText
              type='subtitle'
              style={[styles.welcomeTitle, { color: '#000000' }]}
            >
              {activeTab === 'courses'
                ? 'ยังไม่มีรายวิชาที่ลงทะเบียน'
                : 'ยังไม่มีหลักสูตรที่ลงทะเบียน'}
            </ThemedText>
            <ThemedText
              style={[styles.welcomeDescription, { color: iconColor }]}
            >
              ไปที่หน้าค้นหาเพื่อดู
              {activeTab === 'courses' ? 'รายวิชา' : 'หลักสูตร'}ที่มีให้เลือก
            </ThemedText>
            <ThemedText
              style={[styles.welcomeDescription, { color: iconColor }]}
            >
              และลงทะเบียนเรียน
              {activeTab === 'courses' ? 'รายวิชา' : 'หลักสูตร'}ที่สนใจ
            </ThemedText>
          </ThemedView>
        )}

        {/* No Results */}
        {!showWelcome && showNoResults && (
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

        {/* Results */}
        {!showWelcome && !showNoResults && (
          <FlatList
            data={currentData}
            renderItem={renderListItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            style={styles.list}
          />
        )}
      </ThemedView>
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
  tabSection: {},
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },
  tabButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 26,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    transform: [{ scale: 1 }],
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    marginRight: 6,
  },
  tabButtonText: {
    fontSize: 15,
    fontFamily: 'Prompt-Medium',
    color: '#666666',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
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

  list: {
    flex: 1,
  },
  listContainer: {
    paddingBottom: 20,
  },
  courseItemWrapper: {
    marginBottom: 12,
  },
  curriculumItemWrapper: {
    marginBottom: 12,
  },
})
