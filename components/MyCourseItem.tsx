import { Image } from 'expo-image'
import React, { useState } from 'react'
import { Animated, Modal, StyleSheet, TouchableOpacity } from 'react-native'
import { useDispatch } from 'react-redux'

import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import * as registrationsActions from '@/modules/registrations/actions'
import type { AppDispatch } from '@/store/types'
import { IconSymbol } from './ui/IconSymbol'

// Interface for registered course data
export interface RegisteredCourse {
  id: number
  userId: string
  curriculumRegistrationId?: number | null
  courseRoundId: number
  courseRoundName: string
  courseStart: string
  courseEnd: string
  registrationDate: string
  satisfactionScore?: number | null
  isCompleted: boolean
  completeDate?: string | null
  courseId: number
  code: string
  name: string
  categoryId: number
  learningObjective: string
  learningTopic: string
  targetGroup: string
  assessment: string
  thumbnail: string
  seqFlow: boolean
  hideStartEnd: boolean
}

interface MyCourseItemProps {
  registeredCourse: RegisteredCourse
  onPress?: (registeredCourse: RegisteredCourse) => void
  variant?: 'default' | 'fullWidth'
}

// Category colors following Material-UI color palette
const getCategoryColor = (categoryId: number) => {
  const colors: { [key: number]: string } = {
    1: '#9C27B0', // purple[500] - การพัฒนาองค์ความรู้
    2: '#3F51B5', // indigo[500] - การพัฒนากรอบความคิด
    3: '#E91E63', // pink[500] - ทักษะเชิงยุทธศาสตร์และภาวะผู้นำ
    4: '#FF9800', // orange[500] - ทักษะดิจิทัล
    5: '#4CAF50', // green[500] - ทักษะด้านภาษา
    6: '#2196F3', // blue[500]
    7: '#795548', // brown[500]
  }
  return colors[categoryId] || '#9E9E9E' // grey[500] as default
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

export default function MyCourseItem({
  registeredCourse,
  onPress,
}: MyCourseItemProps) {
  const dispatch = useDispatch<AppDispatch>()
  const [showMenu, setShowMenu] = useState(false)
  const overlayOpacity = useState(new Animated.Value(0))[0]
  const slideAnim = useState(new Animated.Value(300))[0]

  const handlePress = () => {
    onPress?.(registeredCourse)
  }

  const showBottomSheet = () => {
    setShowMenu(true)
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start()
  }

  const hideBottomSheet = () => {
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowMenu(false)
    })
  }

  const handleRequestCompletion = () => {
    hideBottomSheet()
    dispatch(registrationsActions.completeCourse(registeredCourse.id))
  }

  const handleShowDetails = () => {
    hideBottomSheet()
    // Navigate to course detail page
    const { router } = require('expo-router')
    router.push(`/course-detail?id=${registeredCourse.courseId}`)
  }

  const handleUnregister = () => {
    hideBottomSheet()
    dispatch(registrationsActions.unEnrollCourse(registeredCourse.id))
  }

  // Check if this is a child course (part of a curriculum)
  const isChildCourse = !!registeredCourse.curriculumRegistrationId

  return (
    <ThemedView style={styles.courseCard}>
      {/* Main content area */}
      <ThemedView style={styles.mainContent}>
        <Image
          source={{ uri: registeredCourse.thumbnail }}
          style={styles.courseImage}
          contentFit='cover'
          transition={200}
        />
        <ThemedView style={styles.courseContent}>
          <ThemedView style={styles.contentHeader}>
            <ThemedView style={styles.titleSection}>
              <ThemedText
                type='defaultSemiBold'
                style={styles.courseTitle}
                numberOfLines={1}
              >
                {registeredCourse.name}
              </ThemedText>
              <ThemedText style={styles.courseCode} numberOfLines={1}>
                {registeredCourse.code}
              </ThemedText>
              <ThemedText style={styles.courseRound} numberOfLines={1}>
                {registeredCourse.courseRoundName}
              </ThemedText>

              <ThemedView style={styles.dateInfo}>
                <ThemedText
                  style={[styles.dateLabel, { marginBottom: 4 }]}
                  numberOfLines={1}
                >
                  <ThemedText style={styles.dateLabelBold}>
                    ลงทะเบียน{' '}
                  </ThemedText>
                  {formatThaiDate(registeredCourse.registrationDate)}
                </ThemedText>
                <ThemedText style={styles.dateLabel} numberOfLines={1}>
                  <ThemedText style={styles.dateLabelBold}>
                    เข้าเรียนได้{' '}
                  </ThemedText>
                  {formatThaiDate(registeredCourse.courseStart)} ถึง{' '}
                  {registeredCourse.courseEnd.includes('3000')
                    ? 'ไม่มีกำหนด'
                    : formatThaiDate(registeredCourse.courseEnd)}
                </ThemedText>
              </ThemedView>
            </ThemedView>

            <ThemedView style={styles.actionSection}>
              <TouchableOpacity
                style={styles.menuButton}
                onPress={showBottomSheet}
              >
                <IconSymbol
                  name='ellipsis'
                  size={20}
                  color='#6B7280'
                  style={{ transform: [{ rotate: '90deg' }] }}
                />
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      {/* Divider */}
      <ThemedView style={styles.divider} />

      {/* Button section */}
      <ThemedView style={styles.buttonSection}>
        <TouchableOpacity style={styles.studyButton} onPress={handlePress}>
          <IconSymbol name='play.fill' size={16} color='#183A7C' />
          <ThemedText style={styles.studyButtonText}>เข้าเรียน</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {/* Bottom Sheet */}
      <Modal
        visible={showMenu}
        transparent={true}
        animationType='none'
        onRequestClose={hideBottomSheet}
      >
        <Animated.View
          style={[
            styles.bottomSheetOverlay,
            {
              opacity: overlayOpacity,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.bottomSheetBackdrop}
            activeOpacity={1}
            onPress={hideBottomSheet}
          />
          <Animated.View
            style={[
              styles.bottomSheetContainer,
              {
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Handle Bar */}
            <ThemedView style={styles.bottomSheetHandle} />

            {/* Menu Items */}
            <ThemedView style={styles.bottomSheetContent}>
              <TouchableOpacity
                style={styles.bottomSheetItem}
                onPress={handleShowDetails}
              >
                <IconSymbol name='info.circle' size={20} color='#6B7280' />
                <ThemedText style={styles.bottomSheetItemText}>
                  ข้อมูลรายวิชา
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.bottomSheetItem}
                onPress={handleRequestCompletion}
              >
                <IconSymbol name='graduationcap' size={20} color='#6B7280' />
                <ThemedText style={styles.bottomSheetItemText}>
                  ขอสำเร็จการศึกษา
                </ThemedText>
              </TouchableOpacity>

              {!isChildCourse && (
                <TouchableOpacity
                  style={styles.bottomSheetItem}
                  onPress={handleUnregister}
                >
                  <IconSymbol name='trash' size={20} color='#EF4444' />
                  <ThemedText
                    style={[styles.bottomSheetItemText, { color: '#EF4444' }]}
                  >
                    ยกเลิกการลงทะเบียนรายวิชา
                  </ThemedText>
                </TouchableOpacity>
              )}
            </ThemedView>
          </Animated.View>
        </Animated.View>
      </Modal>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  courseCard: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    overflow: 'hidden',
  },
  mainContent: {
    flexDirection: 'row',
    minHeight: 140,
  },
  courseImage: {
    width: 140,
    height: '100%',
    flexShrink: 0,
  },
  courseContent: {
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
  actionSection: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 8,
  },
  menuButton: {
    padding: 8,
    borderRadius: 8,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: 'medium',
    marginBottom: 0,
  },
  courseCode: {
    fontSize: 14,
    marginBottom: 4,
  },
  courseRound: {
    fontSize: 14,
    lineHeight: 20,
    color: '#6B7280',
    marginBottom: 14,
  },
  dateInfo: {
    marginBottom: 0,
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
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
  },
  buttonSection: {
    padding: 12,
  },
  studyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: 'transparent',
    width: '100%',
  },
  studyButtonText: {
    fontSize: 16,
    fontFamily: 'Prompt-Medium',
    color: '#183A7C',
    marginLeft: 8,
  },
  bottomSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheetBackdrop: {
    flex: 1,
  },
  bottomSheetContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34, // Safe area for iOS
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 10,
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  bottomSheetContent: {
    paddingTop: 8,
  },
  bottomSheetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  bottomSheetItemText: {
    fontSize: 16,
    fontFamily: 'Prompt-Regular',
    color: '#374151',
    marginLeft: 12,
  },
})
