import * as Haptics from 'expo-haptics'
import React, { useEffect, useRef, useState } from 'react'
import { Animated, Dimensions, StyleSheet, View } from 'react-native'
import { ThemedText } from './ThemedText'

const { width, height } = Dimensions.get('window')

interface CoinAnimationProps {
  isVisible: boolean
  onAnimationComplete: () => void
}

export function CoinAnimation({
  isVisible,
  onAnimationComplete,
}: CoinAnimationProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current
  const opacityAnim = useRef(new Animated.Value(0)).current
  const translateXAnim = useRef(new Animated.Value(0)).current
  const translateYAnim = useRef(new Animated.Value(0)).current
  const rotateAnim = useRef(new Animated.Value(0)).current
  const [showSparkles, setShowSparkles] = useState(false)

  useEffect(() => {
    if (isVisible) {
      // Reset animations
      scaleAnim.setValue(0)
      opacityAnim.setValue(0)
      translateXAnim.setValue(0)
      translateYAnim.setValue(0)
      rotateAnim.setValue(0)
      setShowSparkles(false)

      // Trigger haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

      // Start entrance animation
      Animated.sequence([
        // Pop in with scale and opacity
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1.2,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        // Bounce back to normal size with a small overshoot
        Animated.spring(scaleAnim, {
          toValue: 0.95,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        // Final settle to normal size
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        // Wait a bit to show the coin
        Animated.delay(800),
        // Start flying animation
        Animated.parallel([
          Animated.timing(translateXAnim, {
            toValue: width * 0.35, // Fly to right side
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(translateYAnim, {
            toValue: -height * 0.4, // Fly to top
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.3, // Shrink as it flies
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        onAnimationComplete()
      })

      // Show sparkles after coin appears
      setTimeout(() => setShowSparkles(true), 400)
    }
  }, [isVisible])

  if (!isVisible) return null

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })

  return (
    <View style={styles.container} pointerEvents='none'>
      {/* Main Coin */}
      <Animated.View
        style={[
          styles.coin,
          {
            transform: [
              { scale: scaleAnim },
              { translateX: translateXAnim },
              { translateY: translateYAnim },
              { rotate: spin },
            ],
            opacity: opacityAnim,
          },
        ]}
      >
        <View style={styles.coinInner}>
          <ThemedText style={styles.coinText}>🪙</ThemedText>
          <ThemedText style={styles.coinLabel}>+1</ThemedText>
        </View>
      </Animated.View>

      {/* Sparkles */}
      {showSparkles && (
        <>
          <Animated.View
            style={[
              styles.sparkle,
              styles.sparkle1,
              {
                opacity: opacityAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <ThemedText style={styles.sparkleText}>✨</ThemedText>
          </Animated.View>
          <Animated.View
            style={[
              styles.sparkle,
              styles.sparkle2,
              {
                opacity: opacityAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <ThemedText style={styles.sparkleText}>⭐</ThemedText>
          </Animated.View>
          <Animated.View
            style={[
              styles.sparkle,
              styles.sparkle3,
              {
                opacity: opacityAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <ThemedText style={styles.sparkleText}>💫</ThemedText>
          </Animated.View>
        </>
      )}

      {/* Success Message */}
      <Animated.View
        style={[
          styles.successMessage,
          {
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <ThemedText style={styles.successText}>เยี่ยมเลย!</ThemedText>
        <ThemedText style={styles.successSubtext}>
          คุณได้รับเหรียญแล้ว
        </ThemedText>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  coin: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinText: {
    fontSize: 48,
  },
  coinLabel: {
    fontSize: 16,
    fontFamily: 'Prompt-Bold',
    color: '#FFD700',
    marginTop: 4,
  },
  sparkle: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkle1: {
    top: '45%',
    left: '35%',
  },
  sparkle2: {
    top: '45%',
    right: '35%',
  },
  sparkle3: {
    top: '35%',
    alignSelf: 'center',
  },
  sparkleText: {
    fontSize: 24,
  },
  successMessage: {
    position: 'absolute',
    top: '55%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successText: {
    fontSize: 20,
    fontFamily: 'Prompt-Bold',
    color: '#059669',
    marginBottom: 4,
  },
  successSubtext: {
    fontSize: 14,
    fontFamily: 'Prompt-Medium',
    color: '#6B7280',
  },
})
