import { router } from 'expo-router'
import React, { useEffect, useRef } from 'react'
import { Animated, Platform, StyleSheet, TouchableOpacity } from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { useThemeColor } from '@/hooks/useThemeColor'

interface ClassroomHeaderProps {
  courseName: string
  showCelebration?: boolean
}

export function ClassroomHeader({
  courseName,
  showCelebration,
}: ClassroomHeaderProps) {
  const textColor = useThemeColor({}, 'text')
  const scaleAnim = useRef(new Animated.Value(1)).current
  const rotateAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (showCelebration) {
      // Celebration animation sequence
      Animated.sequence([
        // Scale up and rotate
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1.3,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }),
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
        // Scale back to normal
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
      ]).start()

      // Reset rotation
      rotateAnim.setValue(0)
    }
  }, [showCelebration])

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })

  return (
    <ThemedView style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <IconSymbol name='chevron.left' size={24} color={textColor} />
      </TouchableOpacity>
      <ThemedView style={styles.headerTitleContainer}>
        <ThemedText style={styles.headerTitle} numberOfLines={1}>
          {courseName}
        </ThemedText>
      </ThemedView>
      <TouchableOpacity style={styles.menuButton}>
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }, { rotate: spin }],
          }}
        >
          <IconSymbol name='star.circle' size={26} color={textColor} />
        </Animated.View>
      </TouchableOpacity>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Prompt-SemiBold',
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
