import { router, useLocalSearchParams } from 'expo-router'
import React from 'react'
import {
  FlatList,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'

import MyCourseItem, { RegisteredCourse } from '@/components/MyCourseItem'
import StatusBarGradient from '@/components/StatusBarGradient'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { courseRegistrations } from '@/constants/CourseRegistrations'
import { curriculumRegistrations } from '@/constants/CurriculumRegistrations'
import { useThemeColor } from '@/hooks/useThemeColor'

export default function CurriculumCoursesScreen() {
  const backgroundColor = useThemeColor({}, 'background')
  const iconColor = useThemeColor({}, 'icon')

  const { curriculumId, curriculumRegistrationId } = useLocalSearchParams<{
    curriculumId: string
    curriculumRegistrationId: string
  }>()

  // Find the curriculum registration
  const curriculumRegistration = curriculumRegistrations.find(
    (reg) => reg.id.toString() === curriculumRegistrationId
  )

  // Filter courses that belong to this curriculum registration
  const curriculumCourses = courseRegistrations.filter(
    (course) =>
      course.curriculumRegistrationId?.toString() === curriculumRegistrationId
  )

  const handleBackPress = () => {
    router.back()
  }

  const handleCoursePress = (course: RegisteredCourse) => {
    router.push(`/course-detail?id=${course.code}`)
  }

  const renderCourseItem = ({
    item,
    index,
  }: {
    item: RegisteredCourse
    index: number
  }) => (
    <View style={styles.courseItemWrapper}>
      <View style={styles.courseNumberContainer}>
        <ThemedText style={styles.courseNumber}>{index + 1}</ThemedText>
      </View>
      <View style={styles.courseItemContainer}>
        <MyCourseItem registeredCourse={item} onPress={handleCoursePress} />
      </View>
    </View>
  )

  if (!curriculumRegistration) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <ThemedView style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <IconSymbol name='chevron.left' size={24} color={iconColor} />
          </TouchableOpacity>
          <ThemedText type='title' style={styles.headerTitle}>
            หลักสูตรไม่พบ
          </ThemedText>
        </ThemedView>
        <ThemedView style={styles.content}>
          <ThemedText style={styles.errorText}>
            ไม่พบข้อมูลหลักสูตรที่ต้องการ
          </ThemedText>
        </ThemedView>
        <StatusBarGradient />
      </ThemedView>
    )
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <ThemedView style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <IconSymbol name='chevron.left' size={24} color={iconColor} />
        </TouchableOpacity>
        <ThemedText type='title' style={styles.headerTitle} numberOfLines={1}>
          รายวิชาในหลักสูตร
        </ThemedText>
      </ThemedView>

      {/* Curriculum Info */}
      <ThemedView style={styles.curriculumInfo}>
        <ThemedText style={styles.curriculumLabel}>หลักสูตร</ThemedText>
        <ThemedText
          type='defaultSemiBold'
          style={styles.curriculumName}
          numberOfLines={2}
        >
          {curriculumRegistration.name}
        </ThemedText>
        <ThemedText style={styles.curriculumCode}>
          {curriculumRegistration.code}
        </ThemedText>
        <ThemedText style={styles.courseCount}>
          {curriculumCourses.length} รายวิชา
        </ThemedText>
      </ThemedView>

      {/* Content */}
      <ThemedView style={styles.content}>
        {curriculumCourses.length === 0 ? (
          <ThemedView style={styles.emptyContainer}>
            <IconSymbol name='book.closed' size={80} color={iconColor + '60'} />
            <ThemedText type='subtitle' style={styles.emptyTitle}>
              ยังไม่มีรายวิชาในหลักสูตรนี้
            </ThemedText>
            <ThemedText style={styles.emptyDescription}>
              กรุณาติดต่อผู้ดูแลระบบหากคิดว่านี่เป็นข้อผิดพลาด
            </ThemedText>
          </ThemedView>
        ) : (
          <FlatList
            data={curriculumCourses}
            renderItem={renderCourseItem}
            keyExtractor={(item) => item.id.toString()}
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
    marginLeft: -8,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    marginRight: 40, // Compensate for back button
  },
  curriculumInfo: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  curriculumLabel: {
    fontSize: 12,
    fontFamily: 'Prompt-SemiBold',
    color: '#F59E0B',
    marginBottom: 4,
  },
  curriculumName: {
    fontSize: 18,
    lineHeight: 24,
    marginBottom: 4,
  },
  curriculumCode: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  courseCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    color: '#6B7280',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#6B7280',
  },
  list: {
    flex: 1,
  },
  listContainer: {
    paddingBottom: 20,
  },
  courseItemWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  courseNumberContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 8,
  },
  courseNumber: {
    fontSize: 14,
    fontFamily: 'Prompt-SemiBold',
    color: '#374151',
  },
  courseItemContainer: {
    flex: 1,
  },
})
