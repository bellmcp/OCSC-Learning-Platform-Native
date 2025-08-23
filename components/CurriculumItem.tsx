import { Image } from 'expo-image'
import { StyleSheet, TouchableOpacity } from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'

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
      <Image
        source={{ uri: item.image }}
        style={styles.curriculumImage}
        contentFit='cover'
      />
      <ThemedView style={styles.curriculumContent}>
        <ThemedText
          type='defaultSemiBold'
          style={styles.curriculumTitle}
          numberOfLines={2}
        >
          {item.title}
        </ThemedText>
        <ThemedText style={styles.curriculumId}>{item.id}</ThemedText>
        <ThemedText style={styles.curriculumDescription} numberOfLines={1}>
          {item.description}
        </ThemedText>
        <ThemedView style={styles.curriculumFooter}>
          <ThemedText style={styles.curriculumType}>{item.type}</ThemedText>
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  curriculumCard: {
    width: 260,
    marginRight: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    overflow: 'hidden',
  },
  curriculumImage: {
    width: '100%',
    height: 130,
  },
  curriculumContent: {
    padding: 16,
    flex: 1,
  },
  curriculumTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    lineHeight: 22,
  },
  curriculumId: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  curriculumDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#374151',
    marginBottom: 12,
    flex: 1,
  },
  curriculumFooter: {
    marginTop: 'auto',
  },
  curriculumType: {
    fontSize: 12,
    color: '#7C3AED',
    fontWeight: '600',
  },
})
