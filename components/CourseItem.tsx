import { Image } from 'expo-image'
import { StyleSheet, TouchableOpacity } from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'

export interface Course {
  id: string
  title: string
  description: string
  image: string
  category: string
  level: string
  badge: string
}

interface CourseItemProps {
  item: Course
  onPress?: (item: Course) => void
}

export default function CourseItem({ item, onPress }: CourseItemProps) {
  return (
    <TouchableOpacity style={styles.courseCard} onPress={() => onPress?.(item)}>
      <Image
        source={{ uri: item.image }}
        style={styles.courseImage}
        contentFit='cover'
      />
      <ThemedView style={styles.courseContent}>
        {/* <ThemedView style={styles.courseBadge}>
          <ThemedText style={styles.courseBadgeText}>{item.badge}</ThemedText>
        </ThemedView> */}
        <ThemedText
          type='defaultSemiBold'
          style={styles.courseTitle}
          numberOfLines={1}
        >
          {item.title}
        </ThemedText>
        <ThemedText style={styles.courseId}>{item.id}</ThemedText>
        <ThemedText style={styles.courseDescription} numberOfLines={3}>
          {item.description}
        </ThemedText>
        <ThemedView style={styles.courseFooter}>
          <ThemedText style={styles.courseLevel}>● {item.level}</ThemedText>
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  courseCard: {
    width: 280,
    marginRight: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    overflow: 'hidden',
  },
  courseImage: {
    width: '100%',
    height: 140,
  },
  courseContent: {
    padding: 16,
    flex: 1,
  },
  courseBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  courseBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  courseId: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  courseDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#374151',
    marginBottom: 12,
    flex: 1,
  },
  courseFooter: {
    marginTop: 'auto',
  },
  courseLevel: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
})
