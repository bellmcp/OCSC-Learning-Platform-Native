import { Image } from 'expo-image'
import { router } from 'expo-router'
import React, { useRef, useState } from 'react'
import {
  Dimensions,
  FlatList,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
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
import { pressReleases } from '@/constants/PressReleases'
import { recommendedCourses } from '@/constants/RecommendedCourses'
import { useThemeColor } from '@/hooks/useThemeColor'

const { width: screenWidth } = Dimensions.get('window')

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

// Utility function to convert recommended course data to display format
const convertRecommendedCourseToDisplayFormat = (
  recommendedCourse: any
): Course => {
  const cleanDescription =
    recommendedCourse.learningObjective
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\n/g, ' ') // Replace newlines with spaces
      .trim()
      .substring(0, 100) + '...' // Limit length

  return {
    id: recommendedCourse.code,
    title: recommendedCourse.name,
    description: cleanDescription,
    image: recommendedCourse.thumbnail,
    category: recommendedCourse.courseCategory || 'ทั่วไป',
    courseCategoryId: recommendedCourse.courseCategoryId,
    level: 'ทักษะขั้นพื้นฐาน',
    badge: recommendedCourse.courseCategory || 'ทั่วไป',
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
    title: realCurriculum.name,
    description: cleanDescription,
    image: realCurriculum.thumbnail,
    type: realCurriculum.code.includes('mini')
      ? realCurriculum.code
      : 'หลักสูตร',
  }
}

// Define types for press release
type PressRelease = {
  id: number
  headline: string
  imageUrl: string
  targetUrl: string
}

// Define type for banner data
type BannerItem = {
  id: string
  image: string
  title: string
  subtitle: string
  targetUrl: string
}

// Transform press releases data for banner display
const bannerData: BannerItem[] = pressReleases.map((release: PressRelease) => ({
  id: release.id.toString(),
  image: release.imageUrl,
  title: release.headline || 'ข้อมูลข่าวสาร',
  subtitle: '', // Press releases don't have subtitles, so we'll leave this empty
  targetUrl: release.targetUrl,
}))

// Convert real course data to display format
const coursesData: Course[] = courses
  .slice(0, 6)
  .map(convertCourseToDisplayFormat)

// Convert real course data to recommended format
const recommendedData: Course[] = recommendedCourses.map(
  convertRecommendedCourseToDisplayFormat
)

// Convert real curriculum data to display format
const curriculumData: Curriculum[] = curriculums.map(
  convertCurriculumToDisplayFormat
)

export default function HomeScreen() {
  const backgroundColor = useThemeColor({}, 'background')
  const tintColor = useThemeColor({}, 'tint')
  const iconColor = useThemeColor({}, 'icon')

  const [currentBannerIndex, setCurrentBannerIndex] = useState(0)
  const bannerFlatListRef = useRef<FlatList>(null)
  const scrollViewRef = useRef<ScrollView>(null)

  // Reset scroll position when component mounts or becomes visible
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false })
    }, 100) // Small delay to ensure component is mounted

    return () => clearTimeout(timeout)
  }, [])

  const handleBannerScroll = (event: any) => {
    const slideWidth = screenWidth - 24 // Match the snapToInterval
    const contentOffsetX = event.nativeEvent.contentOffset.x
    const index = Math.round(contentOffsetX / slideWidth)
    const clampedIndex = Math.max(0, Math.min(index, bannerData.length - 1))
    setCurrentBannerIndex(clampedIndex)
  }

  const handleBannerPress = (targetUrl: string) => {
    if (targetUrl) {
      Linking.openURL(targetUrl).catch((err: any) =>
        console.error('Failed to open URL:', err)
      )
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
    <CourseItem item={item} />
  )

  const renderRecommendedItem = ({ item }: { item: Course }) => (
    <CourseItem item={item} />
  )

  const handleCurriculumPress = (item: Curriculum) => {
    router.push({
      pathname: '/curriculum-detail',
      params: { id: item.id },
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
      >
        {/* Header */}
        <ThemedView style={styles.header}>
          <ThemedText type='title' style={styles.headerTitle}>
            หน้าหลัก
          </ThemedText>
        </ThemedView>

        {/* Banner Carousel */}
        <ThemedView style={styles.section}>
          <FlatList
            ref={bannerFlatListRef}
            data={bannerData}
            renderItem={renderBannerItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled={true}
            snapToInterval={screenWidth - 40 + 16}
            snapToAlignment='start'
            decelerationRate='fast'
            bounces={false}
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

        {/* Courses Section */}
        <ThemedView style={styles.section}>
          <ThemedView style={styles.sectionHeader}>
            <ThemedText type='subtitle' style={styles.sectionTitle}>
              รายการแนะนำ
            </ThemedText>
          </ThemedView>
          <FlatList
            data={recommendedData}
            renderItem={renderCourseItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselContainer}
          />
        </ThemedView>

        {/* Recommended Section */}
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
          <FlatList
            data={coursesData}
            renderItem={renderRecommendedItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselContainer}
          />
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
          <FlatList
            data={curriculumData}
            renderItem={renderCurriculumItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselContainer}
          />
        </ThemedView>
      </ScrollView>
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
    fontWeight: 'bold',
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
  section: {
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
    fontWeight: 'bold',
  },
  seeAllText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Prompt-Medium',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerPillContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerPill: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    maxWidth: '90%',
  },
  bannerPillText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'Prompt-Medium',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
  },
  activeDot: {
    backgroundColor: '#183A7C',
  },
})
