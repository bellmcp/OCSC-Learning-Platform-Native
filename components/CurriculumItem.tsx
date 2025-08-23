import { Image } from 'expo-image'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'

// Original interface for real curriculum data
export interface RealCurriculum {
  id: number
  code: string
  name: string
  learningObjective: string
  learningTopic: string
  targetGroup: string
  assessment: string
  thumbnail: string
  ocscCurriculumCoursePair: any[]
  ocscCurriculumRegistration: any[]
}

// Interface for display purposes
export interface Curriculum {
  id: string
  title: string
  description: string
  image: string
  type: string
}

interface CurriculumItemProps {
  item: Curriculum
  onPress?: (item: Curriculum) => void
}

export default function CurriculumItem({ item, onPress }: CurriculumItemProps) {
  return (
    <TouchableOpacity
      style={styles.curriculumCard}
      onPress={() => onPress?.(item)}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.image }}
          style={styles.curriculumImage}
          contentFit='cover'
        />
      </View>
      <ThemedView style={styles.curriculumContent}>
        <ThemedText style={styles.curriculumType}>หลักสูตร</ThemedText>
        <ThemedText
          type='defaultSemiBold'
          style={styles.curriculumTitle}
          numberOfLines={1}
        >
          {item.title}
        </ThemedText>
        <ThemedText style={styles.curriculumId} numberOfLines={1}>
          {item.id}
        </ThemedText>
        <ThemedText style={styles.curriculumDescription} numberOfLines={3}>
          {item.description}
        </ThemedText>
      </ThemedView>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  curriculumCard: {
    width: 225,
    marginRight: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    overflow: 'hidden',
  },
  imageContainer: {
    borderLeftWidth: 8,
    borderLeftColor: 'rgb(255, 193, 7)',
  },
  curriculumImage: {
    width: '100%',
    height: 200,
  },
  curriculumContent: {
    padding: 16,
    flex: 1,
  },
  curriculumTitle: {
    fontSize: 16,
    fontWeight: 'medium',
    marginBottom: 0,
  },
  curriculumId: {
    fontSize: 14,
    marginBottom: 8,
  },
  curriculumDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#6B7280',
    flex: 1,
  },
  curriculumFooter: {
    marginTop: 'auto',
  },
  curriculumType: {
    fontSize: 14,
    color: '#ffc107',
    fontFamily: 'Prompt-SemiBold',
    marginBottom: 4,
  },
})
