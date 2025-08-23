import { useThemeColor } from '@/hooks/useThemeColor'
import { LinearGradient } from 'expo-linear-gradient'
import React from 'react'
import { StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

interface StatusBarGradientProps {
  /**
   * The intensity of the gradient fade.
   * 0 = completely transparent, 1 = solid color
   */
  intensity?: number
  /**
   * Custom height for the gradient. If not provided, uses safe area top inset + additional fade distance
   */
  height?: number
  /**
   * Additional fade distance below the status bar
   */
  fadeDistance?: number
  /**
   * Whether to use the theme background color or white
   */
  useThemeColor?: boolean
}

export default function StatusBarGradient({
  intensity = 1.0,
  height,
  fadeDistance = 40,
  useThemeColor: shouldUseThemeColor = true,
}: StatusBarGradientProps) {
  const insets = useSafeAreaInsets()
  const backgroundColor = useThemeColor({}, 'background')

  // Calculate the gradient height - make it longer for better effect
  const gradientHeight = height ?? insets.top + fadeDistance

  // Use white for better contrast
  const baseColor = '#FFFFFF'

  // Create gradient colors with varying opacity - more visible for testing
  const gradientColors: readonly [string, string, string, string, string] = [
    `${baseColor}FF`, // Top: fully opaque white
    `${baseColor}E6`, // 90% opacity
    `${baseColor}B3`, // 70% opacity
    `${baseColor}66`, // 40% opacity
    `${baseColor}00`, // Bottom: fully transparent
  ]

  return (
    <LinearGradient
      colors={gradientColors}
      locations={[0, 0.2, 0.5, 0.8, 1]}
      style={[
        styles.gradient,
        {
          height: gradientHeight,
          top: 0, // Always start from top
        },
      ]}
      pointerEvents='none' // Allow touches to pass through
    />
  )
}

const styles = StyleSheet.create({
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000, // High z-index to ensure it's above scrollable content
    // Add a subtle shadow for better visibility
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 5,
  },
})
