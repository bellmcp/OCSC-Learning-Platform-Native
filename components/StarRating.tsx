import React, { useEffect, useState } from 'react'
import { StyleSheet, TouchableOpacity } from 'react-native'

import { ThemedView } from '@/components/ThemedView'
import { IconSymbol } from './ui/IconSymbol'

interface StarRatingProps {
  rating: number
  onRatingChange?: (rating: number) => void
  editable?: boolean
  size?: number
  color?: string
  emptyColor?: string
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  onRatingChange,
  editable = true,
  size = 20,
  color = '#ffb400',
  emptyColor = '#E5E7EB',
}) => {
  const [currentRating, setCurrentRating] = useState(rating)

  useEffect(() => {
    setCurrentRating(rating)
  }, [rating])

  const handleStarPress = (starRating: number) => {
    if (!editable) return
    setCurrentRating(starRating)
    onRatingChange?.(starRating)
  }

  return (
    <ThemedView style={styles.ratingContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => handleStarPress(star)}
          disabled={!editable}
          style={styles.starButton}
        >
          <IconSymbol
            name={star <= currentRating ? 'star.fill' : 'star'}
            size={size}
            color={star <= currentRating ? color : emptyColor}
          />
        </TouchableOpacity>
      ))}
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  starButton: {
    padding: 4,
    marginHorizontal: 2,
  },
})
