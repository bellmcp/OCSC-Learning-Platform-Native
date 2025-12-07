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
  id: string // curriculum code (e.g. "001M") for display
  numericId: number // curriculum id (e.g. 1001) for API calls
  title: string
  description: string
  image: string
  type: string
}

interface CurriculumItemProps {
  item: Curriculum
  onPress?: (item: Curriculum) => void
  variant?: 'default' | 'fullWidth'
}

export default function CurriculumItem({
  item,
  onPress,
  variant = 'default',
}: CurriculumItemProps) {
  const isFullWidth = variant === 'fullWidth'

  return (
    <View
      style={[styles.stackWrapper, isFullWidth && styles.stackWrapperFullWidth]}
    >
      {/* Stack layer 3 (bottom) */}
      <View
        style={[
          styles.stackLayer,
          styles.stackLayer3,
          isFullWidth && styles.stackLayerFullWidth,
        ]}
      />
      {/* Stack layer 2 (middle) */}
      <View
        style={[
          styles.stackLayer,
          styles.stackLayer2,
          isFullWidth && styles.stackLayerFullWidth,
        ]}
      />
      {/* Main card */}
      <TouchableOpacity
        style={[
          styles.curriculumCard,
          isFullWidth && styles.curriculumCardFullWidth,
        ]}
        onPress={() => onPress?.(item)}
        activeOpacity={0.9}
      >
        <View
          style={[
            styles.imageContainer,
            isFullWidth && styles.imageContainerFullWidth,
          ]}
        >
          <Image
            source={{ uri: item.image }}
            style={[
              styles.curriculumImage,
              isFullWidth && styles.curriculumImageFullWidth,
            ]}
            contentFit='cover'
            transition={200}
          />
        </View>
        <ThemedView
          style={[
            styles.curriculumContent,
            isFullWidth && styles.curriculumContentFullWidth,
          ]}
        >
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
          <ThemedText style={styles.curriculumDescription} numberOfLines={2}>
            {item.description}
          </ThemedText>
        </ThemedView>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  // Stack wrapper to contain all layers
  stackWrapper: {
    width: 225,
    marginRight: 16,
    marginTop: 8, // Space for stack layers above
    marginBottom: 8, // Extra space for shadow
  },
  stackWrapperFullWidth: {
    width: '100%',
    marginRight: 0,
  },
  // Stack layers (cards behind the main card)
  stackLayer: {
    position: 'absolute',
    left: 4,
    right: 4,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  stackLayer2: {
    top: -6,
    height: 12,
    backgroundColor: '#F5F5F5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  stackLayer3: {
    top: -12,
    left: 8,
    right: 8,
    height: 12,
    backgroundColor: '#EFEFEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 1,
    elevation: 1,
  },
  stackLayerFullWidth: {
    left: 4,
    right: 4,
  },
  curriculumCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    overflow: 'hidden',
    // Shadow for main card
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  curriculumCardFullWidth: {
    flexDirection: 'row',
    height: 140,
  },
  imageContainer: {
    borderLeftWidth: 8,
    borderLeftColor: 'rgb(255, 193, 7)',
  },
  imageContainerFullWidth: {
    borderLeftWidth: 8,
    borderLeftColor: 'rgb(255, 193, 7)',
    width: 140,
    height: '100%',
    flexShrink: 0,
  },
  curriculumImage: {
    width: '100%',
    height: 200,
  },
  curriculumImageFullWidth: {
    width: '100%',
    height: '100%',
  },
  curriculumContent: {
    padding: 16,
    flex: 1,
  },
  curriculumContentFullWidth: {
    padding: 16,
    paddingBottom: 16,
    flex: 1,
    justifyContent: 'space-between',
  },
  curriculumTitle: {
    fontSize: 16,
    fontWeight: 'medium',
    marginBottom: 2,
  },
  curriculumId: {
    fontSize: 14,
    marginBottom: 4,
  },
  curriculumDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#6B7280',
    marginBottom: 6,
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
