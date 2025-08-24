import { Image } from 'expo-image'
import { router, useLocalSearchParams } from 'expo-router'
import React from 'react'
import {
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { courseCategories } from '@/constants/CourseCategories'
import { courses } from '@/constants/Courses'
import { useThemeColor } from '@/hooks/useThemeColor'

// Category colors following Material-UI color palette
const getCategoryColor = (categoryId: number) => {
  const colors: { [key: number]: string } = {
    1: '#9C27B0', // purple[500] - การพัฒนาองค์ความรู้
    2: '#3F51B5', // indigo[500] - การพัฒนากรอบความคิด
    3: '#E91E63', // pink[500] - ทักษะเชิงยุทธศาสตร์และภาวะผู้นำ
    4: '#FF9800', // orange[500] - ทักษะดิจิทัล
    5: '#4CAF50', // green[500] - ทักษะด้านภาษา
    6: '#2196F3', // blue[500]
    7: '#795548', // brown[500]
  }
  return colors[categoryId] || '#9E9E9E' // grey[500] as default
}

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const backgroundColor = useThemeColor({}, 'background')
  const iconColor = useThemeColor({}, 'icon')
  const textColor = useThemeColor({}, 'text')
  const tintColor = useThemeColor({}, 'tint')

  // Find the course by code (id)
  const course = courses.find((course) => course.code === id)

  // Find the course category
  const courseCategory = courseCategories.find(
    (cat: { id: number; courseCategory: string }) =>
      cat.id === course?.courseCategoryId
  )

  if (!course) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <ThemedView style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <IconSymbol name='chevron.left' size={24} color={iconColor} />
            </TouchableOpacity>
            <ThemedText type='title' style={styles.headerTitle}>
              ไม่พบรายวิชา
            </ThemedText>
            <View style={styles.backButton} />
          </View>
        </ThemedView>
      </ThemedView>
    )
  }

  // Function to clean HTML tags from text
  const cleanHtmlText = (htmlText: string) => {
    return htmlText
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&nbsp;/g, ' ')
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .trim()
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
            รายวิชา
          </ThemedText>
          <View style={styles.backButton} />
        </View>
      </ThemedView>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: course.thumbnail }}
            style={styles.heroImage}
            contentFit='cover'
            transition={200}
            blurRadius={2}
          />
          <View style={styles.imageOverlay} />
          <View style={styles.gradientOverlay} />
          <View style={styles.heroContent}>
            <ThemedText style={styles.heroTitle}>{course.name}</ThemedText>
            <ThemedText style={styles.courseCode}>{course.code}</ThemedText>
            <View style={styles.categoryContainer}>
              <View
                style={[
                  styles.categoryDot,
                  {
                    backgroundColor: getCategoryColor(course.courseCategoryId),
                  },
                ]}
              />
              <ThemedText style={styles.courseType}>
                {courseCategory?.courseCategory || 'ทั่วไป'}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Course Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <IconSymbol name='chart.bar' size={18} color={tintColor} />
            <ThemedText style={styles.statLabel}>วิธีการประเมินผล</ThemedText>
            <ThemedText style={styles.statValue}>
              ทำแบบทดสอบหลังเรียนได้ตั้งแต่ 60 % ขึ้นไป
            </ThemedText>
          </View>
          <View style={styles.statCard}>
            <IconSymbol name='target' size={18} color={tintColor} />
            <ThemedText style={styles.statLabel}>กลุ่มเป้าหมาย</ThemedText>
            <ThemedText style={styles.statValue}>
              บุคลากรภาครัฐ{'\n'}บุคคลทั่วไป
            </ThemedText>
          </View>
          <View style={styles.statCard}>
            <IconSymbol name='info.circle' size={18} color={tintColor} />
            <ThemedText style={styles.statLabel}>หมายเหตุ</ThemedText>
            <ThemedText style={styles.statValue}>
              ไม่มีข้อกำหนดข้อมูลสำเนีอื่นนอกจาก
            </ThemedText>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Learning Objectives Section */}
          <ThemedView style={styles.section}>
            <View style={styles.sectionHeader}>
              <IconSymbol name='target' size={20} color={tintColor} />
              <ThemedText type='defaultSemiBold' style={styles.sectionTitle}>
                เป้าหมายการเรียนรู้
              </ThemedText>
            </View>
            <ThemedText style={styles.sectionContent}>
              {cleanHtmlText(course.learningObjective)}
            </ThemedText>
          </ThemedView>

          {/* Instructor Section */}
          <ThemedView style={styles.section}>
            <View style={styles.sectionHeader}>
              <IconSymbol name='person.circle' size={20} color={tintColor} />
              <ThemedText type='defaultSemiBold' style={styles.sectionTitle}>
                วิทยากร
              </ThemedText>
            </View>
            <ThemedText style={styles.sectionContent}>
              {cleanHtmlText(course.instructor)}
            </ThemedText>
          </ThemedView>

          {/* Assessment Section */}
          <ThemedView style={styles.section}>
            <View style={styles.sectionHeader}>
              <IconSymbol name='checkmark.circle' size={20} color={tintColor} />
              <ThemedText type='defaultSemiBold' style={styles.sectionTitle}>
                ประเด็นการเรียนรู้
              </ThemedText>
            </View>
            <ThemedText style={styles.sectionContent}>
              {cleanHtmlText(course.learningTopic)}
            </ThemedText>
          </ThemedView>

          {/* Target Group Section */}
          <ThemedView style={styles.section}>
            <View style={styles.sectionHeader}>
              <IconSymbol name='person.2' size={20} color={tintColor} />
              <ThemedText type='defaultSemiBold' style={styles.sectionTitle}>
                กลุ่มเป้าหมาย
              </ThemedText>
            </View>
            <ThemedText style={styles.sectionContent}>
              {cleanHtmlText(course.targetGroup)}
            </ThemedText>
          </ThemedView>

          {/* Assessment Section */}
          <ThemedView style={styles.section}>
            <View style={styles.sectionHeader}>
              <IconSymbol name='chart.bar' size={20} color={tintColor} />
              <ThemedText type='defaultSemiBold' style={styles.sectionTitle}>
                หมายเหตุ
              </ThemedText>
            </View>
            <ThemedText style={styles.sectionContent}>
              ไม่มีข้อกำหนดเอกสารใดนอกจากไฟล์
            </ThemedText>
          </ThemedView>

          {/* Learning Hours Section */}
          <ThemedView style={styles.section}>
            <View style={styles.sectionHeader}>
              <IconSymbol name='clock' size={20} color={tintColor} />
              <ThemedText type='defaultSemiBold' style={styles.sectionTitle}>
                จำนวนชั่วโมงการเรียนรู้
              </ThemedText>
            </View>
            <ThemedText style={styles.sectionContent}>4 ชั่วโมง</ThemedText>
          </ThemedView>
        </View>
      </ScrollView>

      {/* Fixed Registration Button */}
      <View style={[styles.fixedButtonContainer, { backgroundColor }]}>
        <TouchableOpacity
          style={[styles.registerButton, { backgroundColor: tintColor }]}
        >
          <IconSymbol name='arrow.right.square' size={20} color='white' />
          <ThemedText style={styles.registerButtonText}>
            ลงทะเบียนเรียน
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 70 : 40,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Add space for fixed button
  },
  imageContainer: {
    height: 300,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
    backgroundColor: 'transparent',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  heroContent: {
    position: 'absolute',
    bottom: 40,
    left: 25,
    right: 20,
  },
  courseBadge: {
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ffc107',
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    marginTop: 12,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  courseType: {
    fontSize: 14,
    color: 'white',
    fontFamily: 'Prompt-SemiBold',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  heroTitle: {
    fontSize: 28,
    color: 'white',
    fontFamily: 'Prompt-SemiBold',
    lineHeight: 36,
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  courseCode: {
    fontSize: 16,
    color: 'white',
    fontFamily: 'Prompt-Medium',
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginTop: -40,
    zIndex: 1,
  },
  statCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 100,
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    marginBottom: 4,
    fontFamily: 'Prompt-Regular',
    textAlign: 'center',
  },
  statValue: {
    fontSize: 12,
    color: '#374151',
    fontFamily: 'Prompt-SemiBold',
    textAlign: 'center',
    lineHeight: 16,
  },
  mainContent: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
    padding: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
  },
  sectionTitle: {
    fontSize: 18,
    marginLeft: 12,
    color: '#374151',
    flex: 1,
    fontFamily: 'Prompt-SemiBold',
  },
  sectionContent: {
    fontSize: 16,
    lineHeight: 26,
    color: '#6B7280',
    fontFamily: 'Prompt-Regular',
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    borderTopWidth: 0.5,
    borderTopColor: '#F0F0F0',
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  registerButtonText: {
    fontSize: 18,
    fontFamily: 'Prompt-SemiBold',
    marginLeft: 8,
    color: 'white',
  },
  contactSection: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  contactTitle: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 4,
  },
})
