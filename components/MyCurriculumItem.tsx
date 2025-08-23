import { Image } from 'expo-image'
import React, { useEffect, useState } from 'react'
import { Alert, Modal, StyleSheet, TouchableOpacity } from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { RegisteredCourse } from './MyCourseItem'
import { IconSymbol } from './ui/IconSymbol'

// Interface for registered curriculum data
export interface RegisteredCurriculum {
  id: number
  userId: string
  curriculumId: number
  registrationDate: string
  satisfactionScore?: number | null
  isCompleted: boolean
  completeDate?: string | null
  code: string
  name: string
  learningObjective: string
  learningTopic: string
  targetGroup: string
  assessment: string
  thumbnail: string
}

interface MyCurriculumItemProps {
  registeredCurriculum: RegisteredCurriculum
  myCourses: RegisteredCourse[]
  onPress?: (registeredCurriculum: RegisteredCurriculum) => void
  onCoursePress?: (registeredCourse: RegisteredCourse) => void
  onUpdateSatisfactionScore?: (curriculumId: number, score: number) => void
  onUnregister?: (curriculumId: number, curriculumName: string) => void
}

// Star Rating Component
const StarRating = ({
  rating,
  onRatingChange,
  editable = true,
}: {
  rating: number
  onRatingChange?: (rating: number) => void
  editable?: boolean
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
            size={20}
            color={star <= currentRating ? '#FFD700' : '#E5E7EB'}
          />
        </TouchableOpacity>
      ))}
    </ThemedView>
  )
}

// Helper function to format Thai dates
const formatThaiDate = (dateString: string): string => {
  const date = new Date(dateString)
  const day = date.getDate()
  const month = date.getMonth()
  const year = date.getFullYear().toString().slice(-2)

  const thaiMonths = [
    'ม.ค.',
    'ก.พ.',
    'มี.ค.',
    'เม.ย.',
    'พ.ค.',
    'มิ.ย.',
    'ก.ค.',
    'ส.ค.',
    'ก.ย.',
    'ต.ค.',
    'พ.ย.',
    'ธ.ค.',
  ]

  return `${day} ${thaiMonths[month]} ${year}`
}

export default function MyCurriculumItem({
  registeredCurriculum,
  myCourses,
  onPress,
  onCoursePress,
  onUpdateSatisfactionScore,
  onUnregister,
}: MyCurriculumItemProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [satisfactionScore, setSatisfactionScore] = useState(
    registeredCurriculum.satisfactionScore || 0
  )

  // Filter courses that belong to this curriculum
  const childCourses = myCourses.filter(
    (course) => course.curriculumRegistrationId === registeredCurriculum.id
  )

  const handlePress = () => {
    onPress?.(registeredCurriculum)
  }

  const handleCardPress = () => {
    // Navigate to curriculum courses page
    const { router } = require('expo-router')
    router.push(
      `/curriculum-courses?curriculumId=${registeredCurriculum.curriculumId}&curriculumRegistrationId=${registeredCurriculum.id}`
    )
  }

  const handleSatisfactionScoreChange = (score: number) => {
    setSatisfactionScore(score)
    onUpdateSatisfactionScore?.(registeredCurriculum.id, score)
  }

  const handleUnregister = () => {
    setShowMenu(false)
    Alert.alert(
      'ยกเลิกการลงทะเบียนหลักสูตร',
      `คุณต้องการยกเลิกการลงทะเบียนหลักสูตร "${registeredCurriculum.name}" หรือไม่?`,
      [
        {
          text: 'ยกเลิก',
          style: 'cancel',
        },
        {
          text: 'ยืนยัน',
          style: 'destructive',
          onPress: () => {
            onUnregister?.(
              registeredCurriculum.curriculumId,
              registeredCurriculum.name
            )
          },
        },
      ]
    )
  }

  const handleShowDetails = () => {
    setShowMenu(false)
    handlePress()
  }

  return (
    <TouchableOpacity
      style={styles.curriculumCard}
      onPress={handleCardPress}
      activeOpacity={0.95}
    >
      {/* Main content area */}
      <ThemedView style={styles.mainContent}>
        <ThemedView style={styles.imageContainer}>
          <ThemedView
            style={[
              styles.statusBorder,
              {
                backgroundColor: registeredCurriculum.isCompleted
                  ? '#22C55E'
                  : '#F59E0B',
              },
            ]}
          />
          <Image
            source={{ uri: registeredCurriculum.thumbnail }}
            style={styles.curriculumImage}
            contentFit='cover'
            transition={200}
          />
        </ThemedView>

        <ThemedView style={styles.curriculumContent}>
          <ThemedView style={styles.contentHeader}>
            <ThemedView style={styles.titleSection}>
              <ThemedText style={styles.curriculumLabel}>หลักสูตร</ThemedText>
              <ThemedText
                type='defaultSemiBold'
                style={styles.curriculumTitle}
                numberOfLines={2}
              >
                {registeredCurriculum.name}
              </ThemedText>
              <ThemedText style={styles.curriculumCode} numberOfLines={1}>
                {registeredCurriculum.code}
              </ThemedText>
              <ThemedText style={styles.dateLabel} numberOfLines={1}>
                <ThemedText style={styles.dateLabelBold}>ลงทะเบียน </ThemedText>
                {formatThaiDate(registeredCurriculum.registrationDate)}
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.actionSection}>
              <TouchableOpacity
                style={styles.menuButton}
                onPress={() => setShowMenu(true)}
              >
                <IconSymbol name='ellipsis' size={20} color='#6B7280' />
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      {/* Divider */}
      <ThemedView style={styles.divider} />

      {/* Rating and completion section */}
      <ThemedView style={styles.ratingSection}>
        <ThemedText style={styles.ratingLabel}>โปรดให้คะแนนหลักสูตร</ThemedText>
        <StarRating
          rating={satisfactionScore}
          onRatingChange={handleSatisfactionScoreChange}
        />

        {registeredCurriculum.isCompleted && (
          <ThemedView style={styles.completionInfo}>
            <IconSymbol
              name='checkmark.circle.fill'
              size={16}
              color='#22C55E'
            />
            <ThemedText style={styles.completionText}>
              <ThemedText style={styles.completionTextBold}>
                สำเร็จการศึกษา{' '}
              </ThemedText>
              {registeredCurriculum.completeDate
                ? formatThaiDate(registeredCurriculum.completeDate)
                : 'ไม่มีข้อมูล'}
            </ThemedText>
          </ThemedView>
        )}
      </ThemedView>

      {/* Course count indicator */}
      <ThemedView style={styles.courseIndicatorContainer}>
        <IconSymbol name='book.closed' size={16} color='#6B7280' />
        <ThemedText style={styles.courseIndicatorText}>
          {childCourses.length} รายวิชา • แตะเพื่อดูรายละเอียด
        </ThemedText>
        <IconSymbol name='chevron.right' size={16} color='#6B7280' />
      </ThemedView>

      {/* Options Menu */}
      <Modal
        visible={showMenu}
        transparent={true}
        animationType='fade'
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <ThemedView style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleShowDetails}
            >
              <IconSymbol name='info.circle' size={20} color='#6B7280' />
              <ThemedText style={styles.menuItemText}>
                ข้อมูลหลักสูตร
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleUnregister}
            >
              <IconSymbol name='trash' size={20} color='#EF4444' />
              <ThemedText style={[styles.menuItemText, { color: '#EF4444' }]}>
                ยกเลิกการลงทะเบียนหลักสูตร
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </TouchableOpacity>
      </Modal>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  curriculumCard: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    overflow: 'hidden',
    // Shadow effect similar to the sample stackHide/stack classes
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  mainContent: {
    flexDirection: 'row',
    minHeight: 140,
  },
  imageContainer: {
    position: 'relative',
    width: 140,
    height: 140,
    flexShrink: 0,
  },
  statusBorder: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
    zIndex: 1,
  },
  curriculumImage: {
    width: '100%',
    height: '100%',
  },
  curriculumContent: {
    padding: 16,
    flex: 1,
    justifyContent: 'center',
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleSection: {
    flex: 1,
    paddingRight: 12,
  },
  curriculumLabel: {
    fontSize: 12,
    fontFamily: 'Prompt-SemiBold',
    color: '#F59E0B',
    marginBottom: 4,
  },
  curriculumTitle: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
    marginBottom: 4,
  },
  curriculumCode: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  courseCount: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  dateLabel: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  dateLabelBold: {
    fontSize: 12,
    fontFamily: 'Prompt-SemiBold',
    lineHeight: 16,
  },
  actionSection: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 8,
  },
  menuButton: {
    padding: 8,
    borderRadius: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
  },
  ratingSection: {
    paddingTop: 16,
    alignItems: 'center',
  },
  ratingLabel: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
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
  completionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completionText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 6,
    textAlign: 'center',
  },
  completionTextBold: {
    fontSize: 12,
    fontFamily: 'Prompt-SemiBold',
    color: '#22C55E',
  },
  courseIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#F9FAFB',
  },
  courseIndicatorText: {
    fontSize: 14,
    color: '#6B7280',
    marginHorizontal: 8,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 250,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuItemText: {
    fontSize: 16,
    fontFamily: 'Prompt-Regular',
    color: '#374151',
    marginLeft: 12,
  },
})
