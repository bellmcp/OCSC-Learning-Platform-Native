import { Image } from 'expo-image'
import { router, useLocalSearchParams } from 'expo-router'
import React from 'react'
import {
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { curriculums } from '@/constants/Curriculums'
import { useThemeColor } from '@/hooks/useThemeColor'

export default function CurriculumDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const backgroundColor = useThemeColor({}, 'background')
  const iconColor = useThemeColor({}, 'icon')
  const textColor = useThemeColor({}, 'text')
  const tintColor = useThemeColor({}, 'tint')

  // Find the curriculum by code (id)
  const curriculum = curriculums.find((curr) => curr.code === id)

  if (!curriculum) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <ThemedView style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <IconSymbol name='chevron.left' size={24} color={iconColor} />
            </TouchableOpacity>
            <ThemedText type='title' style={styles.headerTitle}>
              ไม่พบหลักสูตร
            </ThemedText>
            <View style={styles.backButton} />
          </View>
        </ThemedView>
      </ThemedView>
    )
  }

  // Function to clean HTML tags from text
  const cleanHtmlText = (htmlText: string) => {
    return htmlText
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&nbsp;/g, ' ')
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .trim()
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
            รายละเอียดหลักสูตร
          </ThemedText>
          <View style={styles.backButton} />
        </View>
      </ThemedView>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: curriculum.thumbnail }}
            style={styles.heroImage}
            contentFit='cover'
            transition={200}
          />
          <View style={styles.imageOverlay} />
          <View style={styles.heroContent}>
            <ThemedText style={styles.curriculumType}>หลักสูตร</ThemedText>
            <ThemedText style={styles.heroTitle}>{curriculum.name}</ThemedText>
            <ThemedText style={styles.curriculumCode}>
              {curriculum.code}
            </ThemedText>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Learning Objectives Section */}
          <ThemedView style={styles.section}>
            <View style={styles.sectionHeader}>
              <IconSymbol name='target' size={20} color={tintColor} />
              <ThemedText type='defaultSemiBold' style={styles.sectionTitle}>
                วัตถุประสงค์การเรียนรู้
              </ThemedText>
            </View>
            <ThemedText style={styles.sectionContent}>
              {cleanHtmlText(curriculum.learningObjective)}
            </ThemedText>
          </ThemedView>

          {/* Learning Topics Section */}
          <ThemedView style={styles.section}>
            <View style={styles.sectionHeader}>
              <IconSymbol name='book.closed' size={20} color={tintColor} />
              <ThemedText type='defaultSemiBold' style={styles.sectionTitle}>
                หัวข้อการเรียนรู้
              </ThemedText>
            </View>
            <ThemedText style={styles.sectionContent}>
              {cleanHtmlText(curriculum.learningTopic)}
            </ThemedText>
          </ThemedView>

          {/* Target Group Section */}
          <ThemedView style={styles.section}>
            <View style={styles.sectionHeader}>
              <IconSymbol name='person.2' size={20} color={tintColor} />
              <ThemedText type='defaultSemiBold' style={styles.sectionTitle}>
                กลุ่มเป้าหมาย
              </ThemedText>
            </View>
            <ThemedText style={styles.sectionContent}>
              {cleanHtmlText(curriculum.targetGroup)}
            </ThemedText>
          </ThemedView>

          {/* Assessment Section */}
          <ThemedView style={styles.section}>
            <View style={styles.sectionHeader}>
              <IconSymbol name='checkmark.circle' size={20} color={tintColor} />
              <ThemedText type='defaultSemiBold' style={styles.sectionTitle}>
                การประเมินผล
              </ThemedText>
            </View>
            <ThemedText style={styles.sectionContent}>
              {cleanHtmlText(curriculum.assessment)}
            </ThemedText>
          </ThemedView>
        </View>
      </ScrollView>

      {/* Fixed Registration Button */}
      <View style={[styles.fixedButtonContainer, { backgroundColor }]}>
        <TouchableOpacity
          style={[styles.registerButton, { backgroundColor: tintColor }]}
        >
          <IconSymbol name='arrow.right.square' size={20} color='white' />
          <ThemedText style={styles.registerButtonText}>
            ลงทะเบียนเรียน
          </ThemedText>
        </TouchableOpacity>
      </View>
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
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Add space for fixed button
  },
  imageContainer: {
    height: 300,
    position: 'relative',
    borderTopWidth: 8,
    borderTopColor: 'rgb(255, 193, 7)',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  heroContent: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
  },
  curriculumType: {
    fontSize: 16,
    color: '#ffc107',
    fontFamily: 'Prompt-SemiBold',
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 28,
    color: 'white',
    fontFamily: 'Prompt-SemiBold',
    lineHeight: 36,
    marginBottom: 8,
  },
  curriculumCode: {
    fontSize: 16,
    color: 'white',
    fontFamily: 'Prompt-Medium',
    opacity: 0.9,
  },
  mainContent: {
    padding: 20,
  },
  section: {
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    marginLeft: 12,
    color: '#374151',
    flex: 1,
  },
  sectionContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#6B7280',
    fontFamily: 'Prompt-Regular',
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    borderTopWidth: 0.5,
    borderTopColor: '#F0F0F0',
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    color: 'white',
  },
  contactSection: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  contactTitle: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 4,
  },
})
