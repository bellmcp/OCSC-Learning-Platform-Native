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
          <View style={styles.gradientOverlay} />
          <View style={styles.heroContent}>
            <ThemedText style={styles.curriculumType}>หลักสูตร</ThemedText>
            <ThemedText style={styles.heroTitle}>{curriculum.name}</ThemedText>
            <ThemedText style={styles.curriculumCode}>
              {curriculum.code}
            </ThemedText>
          </View>
        </View>

        {/* Course Stats */}
        {/* <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <IconSymbol name='clock' size={18} color={tintColor} />
            <ThemedText style={styles.statLabel}>ระยะเวลา</ThemedText>
            <ThemedText style={styles.statValue}>8 ชั่วโมง</ThemedText>
          </View>
          <View style={styles.statCard}>
            <IconSymbol name='star' size={18} color={tintColor} />
            <ThemedText style={styles.statLabel}>ระดับ</ThemedText>
            <ThemedText style={styles.statValue}>เริ่มต้น</ThemedText>
          </View>
          <View style={styles.statCard}>
            <IconSymbol name='person.3' size={18} color={tintColor} />
            <ThemedText style={styles.statLabel}>ผู้เรียน</ThemedText>
            <ThemedText style={styles.statValue}>156 คน</ThemedText>
          </View>
        </View> */}

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Learning Objectives Section */}
          <ThemedView style={styles.section}>
            <View style={styles.sectionHeader}>
              <IconSymbol name='target' size={20} color={tintColor} />
              <ThemedText type='defaultSemiBold' style={styles.sectionTitle}>
                เป้าหมายการเรียนรู้
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
                ประเด็นการเรียนรู้
              </ThemedText>
            </View>
            <ThemedText style={styles.sectionContent}>
              {cleanHtmlText(curriculum.learningTopic)}
            </ThemedText>
          </ThemedView>

          {/* Assessment Section */}
          <ThemedView style={styles.section}>
            <View style={styles.sectionHeader}>
              <IconSymbol name='checkmark.circle' size={20} color={tintColor} />
              <ThemedText type='defaultSemiBold' style={styles.sectionTitle}>
                วิธีการประเมินผล
              </ThemedText>
            </View>
            <ThemedText style={styles.sectionContent}>
              {cleanHtmlText(curriculum.assessment)}
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
              <ThemedText style={styles.bulletItem}>
                • เป็นข้าราชการพลเรือน หรือข้าราชการประเภทอื่น ๆ
                ที่ได้รับอนุญาตให้เรียนได้
              </ThemedText>
              {'\n'}
              <ThemedText style={styles.bulletItem}>
                • เป็นผู้มีวินัยต่อการพัฒนาตนเอง
                มีความตั้งใจจริงในการเข้ารับการอบรมแบบออนไลน์
              </ThemedText>
              {'\n'}
              <ThemedText style={styles.bulletItem}>
                • พร้อมจะปฏิบัติตามหลักเกณฑ์
              </ThemedText>
              {'\n'}
              <ThemedText style={styles.bulletItem}>
                •
                เป็นผู้สามารถใช้เครื่องคอมพิวเตอร์ที่เชื่อมต่อระบบเครือข่ายอินเทอร์เน็ต
                เพื่อการอบรมออนไลน์ได้ตามกำหนด
              </ThemedText>
            </ThemedText>
          </ThemedView>
        </View>
      </ScrollView>

      {/* Fixed Registration Button */}
      <View style={[styles.fixedButtonContainer, { backgroundColor }]}>
        <TouchableOpacity
          style={[styles.registerButton, { backgroundColor: tintColor }]}
          onPress={() => router.push('/learn')}
        >
          <IconSymbol name='arrow.right.square' size={20} color='white' />
          <ThemedText style={styles.registerButtonText}>
            ลงทะเบียนหลักสูตร
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
    paddingTop: Platform.OS === 'ios' ? 70 : 40,
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
    borderLeftWidth: 8,
    borderLeftColor: 'rgb(255, 193, 7)',
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
    backgroundColor: 'transparent',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  heroContent: {
    position: 'absolute',
    bottom: 40,
    left: 25,
    right: 20,
  },
  curriculumBadge: {
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ffc107',
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  curriculumType: {
    fontSize: 14,
    color: '#ffc107',
    fontFamily: 'Prompt-SemiBold',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 28,
    color: 'white',
    fontFamily: 'Prompt-SemiBold',
    lineHeight: 36,
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  curriculumCode: {
    fontSize: 20,
    color: 'white',
    fontFamily: 'Prompt-Medium',
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginTop: -40,
    zIndex: 1,
  },
  statCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 100,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    marginBottom: 4,
    fontFamily: 'Prompt-Regular',
  },
  statValue: {
    fontSize: 14,
    color: '#374151',
    fontFamily: 'Prompt-SemiBold',
  },
  mainContent: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
    padding: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
  },
  sectionTitle: {
    fontSize: 18,
    marginLeft: 12,
    color: '#374151',
    flex: 1,
    fontFamily: 'Prompt-SemiBold',
  },
  sectionContent: {
    fontSize: 16,
    lineHeight: 26,
    color: '#6B7280',
    fontFamily: 'Prompt-Regular',
  },
  bulletItem: {
    fontSize: 16,
    lineHeight: 24,
    color: '#6B7280',
    fontFamily: 'Prompt-Regular',
    marginBottom: 12,
    paddingLeft: 8,
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
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  registerButtonText: {
    fontSize: 18,
    fontFamily: 'Prompt-SemiBold',
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
