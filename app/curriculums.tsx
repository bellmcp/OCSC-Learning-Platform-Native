import { router } from 'expo-router'
import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

import CurriculumItem, { type Curriculum } from '@/components/CurriculumItem'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { useThemeColor } from '@/hooks/useThemeColor'
import * as curriculumsActions from '@/modules/curriculums/actions'
import type { RootState } from '@/store/types'

// Utility function to convert real curriculum data to display format
const convertCurriculumToDisplayFormat = (realCurriculum: any): Curriculum => {
  const cleanDescription =
    realCurriculum.learningObjective
      ?.replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\n/g, ' ') // Replace newlines with spaces
      .trim()
      .substring(0, 80) + '...' || '' // Limit length

  return {
    id: realCurriculum.code,
    numericId: realCurriculum.id,
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

  const dispatch = useDispatch()
  const [searchQuery, setSearchQuery] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  // Redux state selectors
  const { isLoading, items: curriculums } = useSelector(
    (state: RootState) => state.curriculums
  )

  // Load curriculums on mount
  useEffect(() => {
    console.log('CurriculumsScreen: Loading curriculums...')
    dispatch(curriculumsActions.loadCurriculums('') as any)
  }, [dispatch])

  // Pull to refresh
  const onRefresh = async () => {
    console.log('CurriculumsScreen: Pull-to-refresh triggered')
    setRefreshing(true)
    try {
      await dispatch(curriculumsActions.loadCurriculums('') as any)
    } catch (error) {
      console.error('Error refreshing curriculums:', error)
    } finally {
      setRefreshing(false)
    }
  }

  // Convert all curriculums to display format
  const allCurriculumsData: Curriculum[] = curriculums.map((curriculum: any) =>
    convertCurriculumToDisplayFormat(curriculum)
  )

  // Filter curriculums based on search query (client-side search)
  const filteredCurriculums = allCurriculumsData.filter((curriculum) => {
    const matchesSearch = curriculum.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const handleCurriculumPress = (item: Curriculum) => {
    router.push({
      pathname: '/curriculum-detail',
      params: { id: item.numericId.toString() },
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

  const renderEmptyState = () => {
    if (isLoading) {
      return null
    }

    return (
      <View style={styles.emptyContainer}>
        <ThemedText style={styles.emptyText}>
          {searchQuery
            ? `ไม่พบหลักสูตรที่ค้นหา "${searchQuery}"`
            : 'ไม่พบหลักสูตรในขณะนี้'}
        </ThemedText>
      </View>
    )
  }

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
        {isLoading && !refreshing && curriculums.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size='large' color={tintColor} />
            <ThemedText style={styles.loadingText}>
              กำลังโหลดหลักสูตร...
            </ThemedText>
          </View>
        ) : (
          <>
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
              ListEmptyComponent={renderEmptyState}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor={tintColor}
                  colors={[tintColor]}
                />
              }
            />
          </>
        )}
      </ThemedView>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 80 : 50,
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
    fontFamily: 'Prompt-SemiBold',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Prompt-Regular',
    color: '#666',
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Prompt-Regular',
    color: '#999',
    textAlign: 'center',
  },
})
