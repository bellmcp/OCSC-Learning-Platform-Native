import React, { useContext, useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

import MyCourseItem, { type RegisteredCourse } from '@/components/MyCourseItem'
import MyCurriculumItem, {
  type RegisteredCurriculum,
} from '@/components/MyCurriculumItem'
import StatusBarGradient from '@/components/StatusBarGradient'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { useThemeColor } from '@/hooks/useThemeColor'
import * as registrationsActions from '@/modules/registrations/actions'
import type { AppDispatch, RootState } from '@/store/types'
import { router } from 'expo-router'
import { LoginContext } from './_layout'

export default function LearnScreen() {
  const backgroundColor = useThemeColor({}, 'background')
  const tintColor = useThemeColor({}, 'tint')
  const iconColor = useThemeColor({}, 'icon')

  const dispatch = useDispatch<AppDispatch>()

  // Get login context
  const { isLoggedIn } = useContext(LoginContext)

  // Redux state selectors
  const {
    isCourseRegistrationsLoading,
    isCurriculumRegistrationsLoading,
    myCourses,
    myCurriculums,
  } = useSelector((state: RootState) => state.registrations)

  // Local state
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'courses' | 'curriculums'>(
    'courses'
  )
  const [filteredCourses, setFilteredCourses] = useState<RegisteredCourse[]>([])
  const [filteredCurriculums, setFilteredCurriculums] = useState<
    RegisteredCurriculum[]
  >([])

  // Cache flag to prevent unnecessary reloads
  const hasLoadedInitialData = useRef(false)

  // Filter courses that don't belong to any curriculum (matching desktop behavior)
  const standaloneCourses = myCourses.filter(
    (course: RegisteredCourse) => course.curriculumRegistrationId === null
  )

  // Load registrations data when logged in
  useEffect(() => {
    if (isLoggedIn && !hasLoadedInitialData.current) {
      console.log('LearnScreen: Loading registrations from API...')
      dispatch(registrationsActions.loadCourseRegistrations())
      dispatch(registrationsActions.loadCurriculumRegistrations())
      dispatch(registrationsActions.loadLocalDateTime())
      hasLoadedInitialData.current = true
    } else if (!isLoggedIn) {
      hasLoadedInitialData.current = false
    }
  }, [isLoggedIn, dispatch])

  // Update filtered data when Redux data changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCourses(standaloneCourses)
      setFilteredCurriculums(myCurriculums)
    } else {
      handleSearch(searchQuery)
    }
  }, [myCourses, myCurriculums, standaloneCourses.length])

  // Search functionality
  const handleSearch = (query: string) => {
    setSearchQuery(query)

    if (query.trim() === '') {
      setFilteredCourses(standaloneCourses)
      setFilteredCurriculums(myCurriculums)
      return
    }

    const searchLower = query.toLowerCase()

    // Filter registered courses
    const coursesResults = standaloneCourses.filter(
      (course: RegisteredCourse) =>
        course.name?.toLowerCase().includes(searchLower) ||
        course.learningObjective?.toLowerCase().includes(searchLower) ||
        course.code?.toLowerCase().includes(searchLower) ||
        course.courseRoundName?.toLowerCase().includes(searchLower)
    )

    // Filter registered curriculums
    const curriculumsResults = myCurriculums.filter(
      (curriculum: RegisteredCurriculum) =>
        curriculum.name?.toLowerCase().includes(searchLower) ||
        curriculum.learningObjective?.toLowerCase().includes(searchLower) ||
        curriculum.code?.toLowerCase().includes(searchLower) ||
        curriculum.learningTopic?.toLowerCase().includes(searchLower)
    )

    setFilteredCourses(coursesResults)
    setFilteredCurriculums(curriculumsResults)
  }

  const handleCoursePress = (course: RegisteredCourse) => {
    // Use courseId (actual course ID), not id (registration ID)
    router.push(`/classroom?courseId=${course.courseId}`)
  }

  const handleCurriculumPress = (curriculum: RegisteredCurriculum) => {
    router.push(`/curriculum-detail?id=${curriculum.curriculumId}`)
  }

  const handleUpdateSatisfactionScore = (
    curriculumId: number,
    score: number
  ) => {
    dispatch(
      registrationsActions.updateCurriculumSatisfactionScore(
        curriculumId,
        score
      )
    )
  }

  const handleUnregisterCurriculum = (
    curriculumId: number,
    curriculumName: string
  ) => {
    dispatch(registrationsActions.unEnrollCurriculum(curriculumId))
  }

  const linkToCourses = () => {
    router.push('/courses')
  }

  const linkToCurriculums = () => {
    router.push('/curriculums')
  }

  const renderCourseItem = ({ item }: { item: RegisteredCourse }) => (
    <View style={styles.courseItemWrapper}>
      <MyCourseItem registeredCourse={item} onPress={handleCoursePress} />
    </View>
  )

  const renderCurriculumItem = ({ item }: { item: RegisteredCurriculum }) => (
    <View style={styles.curriculumItemWrapper}>
      <MyCurriculumItem
        registeredCurriculum={item}
        myCourses={myCourses}
        onPress={handleCurriculumPress}
        onUpdateSatisfactionScore={handleUpdateSatisfactionScore}
        onUnregister={handleUnregisterCurriculum}
      />
    </View>
  )

  // Get current data based on active tab
  const currentData =
    activeTab === 'courses' ? filteredCourses : filteredCurriculums
  const isCurrentTabLoading =
    activeTab === 'courses'
      ? isCourseRegistrationsLoading
      : isCurriculumRegistrationsLoading
  const hasRegistrations =
    activeTab === 'courses'
      ? standaloneCourses.length > 0
      : myCurriculums.length > 0
  const showNoResults = searchQuery.trim() !== '' && currentData.length === 0
  const showWelcome = !hasRegistrations && !isCurrentTabLoading

  // Render function that handles both types
  const renderListItem = ({
    item,
  }: {
    item: RegisteredCourse | RegisteredCurriculum
  }) => {
    if (activeTab === 'courses') {
      return renderCourseItem({ item: item as RegisteredCourse })
    } else {
      return renderCurriculumItem({ item: item as RegisteredCurriculum })
    }
  }

  // If not logged in, show login prompt
  if (!isLoggedIn) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        {/* Header */}
        <ThemedView style={styles.header}>
          <ThemedText type='title' style={styles.headerTitle}>
            เข้าเรียน
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.loginPromptContainer}>
          <IconSymbol name='person.circle' size={80} color={iconColor + '60'} />
          <ThemedText
            type='subtitle'
            style={[styles.loginPromptTitle, { color: '#000000' }]}
          >
            กรุณาเข้าสู่ระบบ
          </ThemedText>
          <ThemedText
            style={[styles.loginPromptDescription, { color: iconColor }]}
          >
            เพื่อดูรายวิชาและหลักสูตรที่ลงทะเบียน
          </ThemedText>
          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: tintColor }]}
            onPress={() => router.push('/(tabs)/account')}
          >
            <ThemedText style={styles.loginButtonText}>เข้าสู่ระบบ</ThemedText>
          </TouchableOpacity>
        </ThemedView>
        <StatusBarGradient />
      </ThemedView>
    )
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
            placeholder='ค้นหาหลักสูตร หรือ รายวิชา...'
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
                    fontFamily: 'Prompt-SemiBold',
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
                    fontFamily: 'Prompt-SemiBold',
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
        {/* Loading state */}
        {isCurrentTabLoading && (
          <ThemedView style={styles.loadingContainer}>
            <ActivityIndicator size='large' color={tintColor} />
            <ThemedText style={styles.loadingText}>
              {activeTab === 'courses'
                ? 'กำลังโหลดรายวิชา...'
                : 'กำลังโหลดหลักสูตร...'}
            </ThemedText>
          </ThemedView>
        )}

        {/* Show welcome message when no registered items */}
        {!isCurrentTabLoading && showWelcome && (
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
            <TouchableOpacity
              style={[styles.viewAllButton, { backgroundColor: tintColor }]}
              onPress={
                activeTab === 'courses' ? linkToCourses : linkToCurriculums
              }
            >
              <ThemedText style={styles.viewAllButtonText}>
                {activeTab === 'courses'
                  ? 'ดูรายวิชาทั้งหมด'
                  : 'ดูหลักสูตรทั้งหมด'}
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        )}

        {/* No Results */}
        {!isCurrentTabLoading && !showWelcome && showNoResults && (
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
        {!isCurrentTabLoading && !showWelcome && !showNoResults && (
          <FlatList
            data={currentData}
            renderItem={renderListItem}
            keyExtractor={(item) =>
              activeTab === 'courses'
                ? (item as RegisteredCourse).id.toString()
                : (item as RegisteredCurriculum).id.toString()
            }
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
    elevation: 0,
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
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Prompt-Regular',
    opacity: 0.6,
    marginTop: 16,
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
  // Login prompt styles
  loginPromptContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  loginPromptTitle: {
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  loginPromptDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  loginButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    minWidth: 200,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Prompt-SemiBold',
  },
})
