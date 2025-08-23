import { Image } from 'expo-image'
import { StyleSheet, TouchableOpacity } from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'

// Original interface for real course data
export interface RealCourse {
  id: number
  code: string
  name: string
  courseCategoryId: number
  learningObjective: string
  instructor: string
  learningTopic: string
  targetGroup: string
  assessment: string
  thumbnail: string
  seqFlow: boolean
  courseCategory: any
  ocscCourseContent: any[]
  ocscCourseRound: any[]
  ocscCurriculumCoursePair: any[]
}

// Interface for display purposes
export interface Course {
  id: string
  title: string
  description: string
  image: string
  category: string
  courseCategoryId: number
  level: string
  badge: string
}

interface CourseItemProps {
  item: Course
  onPress?: (item: Course) => void
}

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

export default function CourseItem({ item, onPress }: CourseItemProps) {
  return (
    <TouchableOpacity style={styles.courseCard} onPress={() => onPress?.(item)}>
      <Image
        source={{ uri: item.image }}
        style={styles.courseImage}
        contentFit='cover'
        transition={200}
      />
      <ThemedView style={styles.courseContent}>
        <ThemedText
          type='defaultSemiBold'
          style={styles.courseTitle}
          numberOfLines={1}
        >
          {item.title || 'รายวิชา'}
        </ThemedText>
        <ThemedText style={styles.courseId} numberOfLines={1}>
          {item.id || 'รหัสรายวิชา'}
        </ThemedText>
        <ThemedText style={styles.courseDescription} numberOfLines={3}>
          {item.description || 'ไม่มีข้อมูล'}
        </ThemedText>
        <ThemedView style={styles.courseFooter}>
          <ThemedView style={styles.categoryContainer}>
            <ThemedView
              style={[
                styles.categoryDot,
                { backgroundColor: getCategoryColor(item.courseCategoryId) },
              ]}
            />
            <ThemedText style={styles.categoryText} numberOfLines={1}>
              {item.category}
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  courseCard: {
    width: 225,
    marginRight: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    overflow: 'hidden',
  },
  courseImage: {
    width: '100%',
    height: 200,
  },
  courseContent: {
    padding: 16,
    flex: 1,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: 'medium',
    marginBottom: 0,
  },
  courseId: {
    fontSize: 14,
    marginBottom: 8,
  },
  courseDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#6B7280',
    marginBottom: 12,
    flex: 1,
  },
  courseFooter: {
    marginTop: 'auto',
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
})
