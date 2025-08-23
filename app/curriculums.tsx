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

// Define curriculum types for filtering
const curriculumTypes = [
  { id: 'all', name: 'ทั้งหมด' },
  { id: 'mini', name: 'Mini Course' },
  { id: 'regular', name: 'หลักสูตรปกติ' },
]

export default function CurriculumsScreen() {
  const backgroundColor = useThemeColor({}, 'background')
  const tintColor = useThemeColor({}, 'tint')
  const iconColor = useThemeColor({}, 'icon')
  const textColor = useThemeColor({}, 'text')

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')

  // Convert all curriculums to display format
  const allCurriculumsData: Curriculum[] = curriculums.map(
    convertCurriculumToDisplayFormat
  )

  // Filter curriculums based on search query and selected type
  const filteredCurriculums = allCurriculumsData.filter((curriculum) => {
    const matchesSearch = curriculum.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase())

    let matchesType = true
    if (selectedType === 'mini') {
      matchesType = curriculum.id.includes('mini')
    } else if (selectedType === 'regular') {
      matchesType = !curriculum.id.includes('mini')
    }

    return matchesSearch && matchesType
  })

  const renderCurriculumItem = ({ item }: { item: Curriculum }) => (
    <View style={styles.curriculumItemWrapper}>
      <CurriculumItem item={item} variant='fullWidth' />
    </View>
  )

  const renderTypeChip = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.typeChip,
        selectedType === item.id && { backgroundColor: tintColor },
      ]}
      onPress={() => setSelectedType(item.id)}
    >
      <ThemedText
        style={[
          styles.typeChipText,
          selectedType === item.id && { color: '#FFFFFF' },
        ]}
      >
        {item.name}
      </ThemedText>
    </TouchableOpacity>
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

        {/* Type Filter */}
        <FlatList
          data={curriculumTypes}
          renderItem={renderTypeChip}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.typeContainer}
        />
      </ThemedView>

      {/* Scrollable Content */}
      <ThemedView style={styles.content}>
        <ThemedText style={styles.resultCount}>
          พบ {filteredCurriculums.length} หลักสูตร
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
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
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
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Prompt-Regular',
  },
  typeContainer: {
    paddingVertical: 8,
  },
  typeChip: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  typeChipText: {
    fontSize: 14,
    fontFamily: 'Prompt-Medium',
    color: '#666',
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
