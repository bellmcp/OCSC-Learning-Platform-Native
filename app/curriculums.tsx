import { router } from 'expo-router'
import React, { useState } from 'react'
import {
  FlatList,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'

import CurriculumItem, {
  type Curriculum,
  type RealCurriculum,
} from '@/components/CurriculumItem'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { curriculums } from '@/constants/Curriculums'
import { useThemeColor } from '@/hooks/useThemeColor'

// Removed Dimensions since we're using full-width layout

// Utility function to convert real curriculum data to display format
const convertCurriculumToDisplayFormat = (
  realCurriculum: RealCurriculum
): Curriculum => {
  const cleanDescription =
    realCurriculum.learningObjective
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\n/g, ' ') // Replace newlines with spaces
      .trim()
      .substring(0, 80) + '...' // Limit length

  return {
    id: realCurriculum.code,
    title: realCurriculum.name,
    description: cleanDescription,
    image: realCurriculum.thumbnail,
    type: realCurriculum.code.includes('mini')
      ? realCurriculum.code
      : 'หลักสูตร',
  }
}

export default function CurriculumsScreen() {
  const backgroundColor = useThemeColor({}, 'background')
  const tintColor = useThemeColor({}, 'tint')
  const iconColor = useThemeColor({}, 'icon')
  const textColor = useThemeColor({}, 'text')

  const [searchQuery, setSearchQuery] = useState('')

  // Convert all curriculums to display format
  const allCurriculumsData: Curriculum[] = curriculums.map(
    convertCurriculumToDisplayFormat
  )

  // Filter curriculums based on search query only
  const filteredCurriculums = allCurriculumsData.filter((curriculum) => {
    const matchesSearch = curriculum.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const handleCurriculumPress = (item: Curriculum) => {
    router.push({
      pathname: '/curriculum-detail',
      params: { id: item.id },
    })
  }

  const renderCurriculumItem = ({ item }: { item: Curriculum }) => (
    <View style={styles.curriculumItemWrapper}>
      <CurriculumItem
        item={item}
        variant='fullWidth'
        onPress={handleCurriculumPress}
      />
    </View>
  )

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      {/* Fixed Header */}
      <ThemedView style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <IconSymbol name='chevron.left' size={24} color={iconColor} />
          </TouchableOpacity>
          <ThemedText type='title' style={styles.headerTitle}>
            หลักสูตรทั้งหมด
          </ThemedText>
          <View style={styles.backButton} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <IconSymbol
            name='magnifyingglass'
            size={20}
            color='#999'
            style={styles.searchIcon}
          />
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            placeholder='ค้นหาหลักสูตร...'
            placeholderTextColor='#999'
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </ThemedView>

      {/* Scrollable Content */}
      <ThemedView style={styles.content}>
        <ThemedText style={styles.resultCount}>
          ผลลัพธ์ {filteredCurriculums.length} รายการ
        </ThemedText>

        <FlatList
          data={filteredCurriculums}
          renderItem={renderCurriculumItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.curriculumsGrid}
          style={styles.curriculumsList}
        />
      </ThemedView>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 70 : 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    textAlign: 'center',
    fontSize: 20,
    fontFamily: 'Prompt-Bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Prompt-Regular',
    paddingVertical: 0,
  },

  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  resultCount: {
    fontSize: 16,
    fontFamily: 'Prompt-Medium',
    marginTop: 16,
    marginBottom: 16,
    color: '#666',
  },
  curriculumsList: {
    flex: 1,
  },
  curriculumsGrid: {
    paddingBottom: 20,
  },
  curriculumItemWrapper: {
    marginBottom: 12,
  },
})
