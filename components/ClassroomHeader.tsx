import { router } from 'expo-router'
import React from 'react'
import { Platform, StyleSheet, TouchableOpacity } from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { useThemeColor } from '@/hooks/useThemeColor'

interface ClassroomHeaderProps {
  courseName: string
}

export function ClassroomHeader({ courseName }: ClassroomHeaderProps) {
  const textColor = useThemeColor({}, 'text')

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
        <IconSymbol name='ellipsis' size={20} color={textColor} />
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
