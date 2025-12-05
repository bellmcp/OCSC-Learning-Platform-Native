import { Image } from 'expo-image'
import { router, useLocalSearchParams } from 'expo-router'
import React, { useContext, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native'
import RenderHtml, { defaultSystemFonts } from 'react-native-render-html'
import { useDispatch, useSelector } from 'react-redux'

import { ContentList } from '@/components/ContentList'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { courseRegistrations } from '@/constants/CourseRegistrations'
import { useThemeColor } from '@/hooks/useThemeColor'
import * as categoriesActions from '@/modules/categories/actions'
import * as coursesActions from '@/modules/courses/actions'
import type { RootState } from '@/store/types'
import categoryColor from '@/utils/categoryColor'
import isBetween from '@/utils/isBetween'

import { LoginContext } from './(tabs)/_layout'

// Function to clean HTML tags from text
const cleanHtmlText = (htmlText: string | undefined | null) => {
  if (!htmlText) return 'ไม่มีข้อมูล'
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

// Prepare HTML for rendering - keeps HTML structure
const prepareHtmlContent = (htmlText: string | undefined | null) => {
  if (!htmlText) return '<p>ไม่มีข้อมูล</p>'
  return (
    htmlText
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&nbsp;/g, ' ')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\\"/g, '"')
      // Convert inline color styles to custom tags for better rendering
      .replace(
        /<span[^>]*style=["'][^"']*color:\s*red[^"']*["'][^>]*>/gi,
        '<span class="text-red">'
      )
      .replace(
        /<span[^>]*style=["'][^"']*color:\s*#[a-fA-F0-9]{3,6}[^"']*["'][^>]*>/gi,
        (match) => {
          const colorMatch = match.match(/color:\s*(#[a-fA-F0-9]{3,6})/i)
          if (colorMatch) {
            return `<span data-color="${colorMatch[1]}">`
          }
          return match
        }
      )
      .replace(
        /<font[^>]*color=["']?([^"'\s>]+)["']?[^>]*>/gi,
        '<span class="text-red">'
      )
  )
}

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const backgroundColor = useThemeColor({}, 'background')
  const iconColor = useThemeColor({}, 'icon')
  const tintColor = useThemeColor({}, 'tint')

  // Login context
  const { isLoggedIn } = useContext(LoginContext)

  // Registration button state
  const [isRegisterButtonDisabled, setIsRegisterButtonDisabled] = useState(false)
  const [registerButtonLabel, setRegisterButtonLabel] = useState('ลงทะเบียนเรียน')

  const { width: contentWidth } = useWindowDimensions()

  const dispatch = useDispatch()

  // Redux state selectors
  const {
    isLoading: isCourseLoading,
    currentCourse,
    rounds,
    contents,
    hour = 0,
  } = useSelector((state: RootState) => state.courses)
  const { items: categories } = useSelector(
    (state: RootState) => state.categories
  )

  const course = currentCourse // Use currentCourse from reducer

  // Load course data on mount
  useEffect(() => {
    if (id) {
      console.log('CourseDetail: Loading course data for ID:', id)
      dispatch(coursesActions.loadCourse(id) as any)
      dispatch(coursesActions.loadCourseRounds(id) as any)
      dispatch(coursesActions.loadCourseContents(id) as any)
      dispatch(coursesActions.loadCourseHour(id) as any)
    }
  }, [dispatch, id])

  // Load categories if not already loaded
  useEffect(() => {
    if (categories.length === 0) {
      dispatch(categoriesActions.loadCategories() as any)
    }
  }, [dispatch, categories.length])

  // Find the course category
  const courseCategory = categories.find(
    (cat) => cat.id === course?.courseCategoryId
  )

  // Course info sections
  const courseInfoSections = [
    {
      title: 'เป้าหมายการเรียนรู้',
      detail: course?.learningObjective
        ? prepareHtmlContent(course.learningObjective)
        : '<p>ไม่มีข้อมูล</p>',
      isHtml: true,
      icon: 'flag.fill',
    },
    {
      title: 'วิทยากร',
      detail: course?.instructor
        ? prepareHtmlContent(course.instructor)
        : '<p>ไม่มีข้อมูล</p>',
      isHtml: true,
      icon: 'person.fill',
    },
    {
      title: 'ประเด็นการเรียนรู้',
      detail: course?.learningTopic
        ? prepareHtmlContent(course.learningTopic)
        : '<p>ไม่มีข้อมูล</p>',
      isHtml: true,
      icon: 'doc.text.fill',
    },
    {
      title: 'วิธีการประเมินผล',
      detail: course?.assessment
        ? prepareHtmlContent(course.assessment)
        : '<p>ไม่มีข้อมูล</p>',
      isHtml: true,
      icon: 'chart.bar.fill',
    },
    {
      title: 'กลุ่มเป้าหมาย',
      detail: course?.targetGroup
        ? prepareHtmlContent(course.targetGroup)
        : '<p>ไม่มีข้อมูล</p>',
      isHtml: true,
      icon: 'person.2.fill',
    },
    {
      title: 'หมายเหตุ',
      detail: course?.seqFlow
        ? 'บังคับเรียนตามลำดับเนื้อหา'
        : 'ไม่บังคับเรียนตามลำดับเนื้อหา',
      icon: 'bookmark.fill',
    },
    {
      title: 'จำนวนชั่วโมงการเรียนรู้',
      detail: `${hour ?? 0} ชั่วโมง`,
      icon: 'clock.fill',
    },
  ]

  // Loading state
  if (isCourseLoading && !course) {
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
              รายละเอียดรายวิชา
            </ThemedText>
            <View style={styles.backButton} />
          </View>
        </ThemedView>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color={tintColor} />
          <ThemedText style={styles.loadingText}>
            กำลังโหลดรายละเอียดรายวิชา...
          </ThemedText>
        </View>
      </ThemedView>
    )
  }

  // Course not found
  if (!course && !isCourseLoading) {
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
              ไม่พบรายวิชา
            </ThemedText>
            <View style={styles.backButton} />
          </View>
        </ThemedView>
        <View style={styles.emptyContainer}>
          <ThemedText style={styles.emptyText}>
            ไม่พบข้อมูลรายวิชาที่ต้องการ
          </ThemedText>
        </View>
      </ThemedView>
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
            รายละเอียดรายวิชา
          </ThemedText>
          <View style={styles.backButton} />
        </View>
      </ThemedView>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={[
          styles.scrollContent,
          isCourseLoading && { flexGrow: 1 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {isCourseLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size='large' color={tintColor} />
            <ThemedText style={styles.loadingText}>
              กำลังโหลดรายละเอียดรายวิชา...
            </ThemedText>
          </View>
        ) : (
          <>
            {/* Hero Section - Mobile Style with Blur Background */}
            <View style={styles.heroContainer}>
              {/* Blurred Background Image with Category Color Overlay */}
              <Image
                source={{ uri: course?.thumbnail || '' }}
                style={styles.heroBlurBackground}
                contentFit='cover'
                blurRadius={15}
              />
              <View
                style={[
                  styles.heroCategoryOverlay,
                  {
                    backgroundColor:
                      categoryColor(course?.courseCategoryId || 0) + '99',
                  },
                ]}
              />
              {/* Dark overlay to reduce vibrancy (simulates brightness(0.8)) */}
              <View style={styles.heroDarkOverlay} />

              {/* Hero Content - Vertical Layout for Mobile */}
              <View style={styles.heroContentWrapper}>
                {/* Course Info - Centered */}
                <View style={styles.heroInfoSection}>
                  <ThemedText style={styles.heroTitle}>
                    {course?.name || 'รายวิชา'}
                  </ThemedText>
                  <ThemedText style={styles.courseCode}>
                    {course?.code || ''}
                  </ThemedText>
                  {courseCategory && (
                    <View style={styles.categoryContainer}>
                      <View
                        style={[
                          styles.categoryDot,
                          {
                            backgroundColor: categoryColor(
                              course?.courseCategoryId || 0
                            ),
                          },
                        ]}
                      />
                      <ThemedText style={styles.courseType}>
                        {courseCategory.courseCategory}
                      </ThemedText>
                    </View>
                  )}
                </View>

                {/* Course Thumbnail - Full Width, No Crop */}
                <View style={styles.heroThumbnailSection}>
                  <View style={styles.heroThumbnailShadow}>
                    <Image
                      source={{ uri: course?.thumbnail || '' }}
                      style={styles.heroThumbnail}
                      contentFit='cover'
                      transition={200}
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* Course Rounds Section */}
            {rounds.length > 0 && (
              <>
                {rounds.map((round: any, index: number) => (
                  <View key={round.id || index} style={styles.roundContainer}>
                    <View style={styles.roundHeader}>
                      <ThemedText style={styles.roundTitle}>
                        {round.name || 'รอบการเรียน'}
                      </ThemedText>
                      <View style={styles.registrationCount}>
                        <ThemedText style={styles.registrationNumber}>
                          {round.numStudents?.toLocaleString() || 0} คน
                        </ThemedText>
                        <ThemedText style={styles.registrationText}>
                          ลงทะเบียนเรียนรอบนี้แล้ว
                        </ThemedText>
                      </View>
                    </View>

                    <View style={styles.roundInfo}>
                      {round.registrationStart && round.registrationEnd && (
                        <View style={styles.infoRow}>
                          <ThemedText style={styles.infoLabel}>
                            เปิดให้ลงทะเบียน
                          </ThemedText>
                          <ThemedText style={styles.infoValue}>
                            {new Date(
                              round.registrationStart
                            ).toLocaleDateString('th-TH', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}{' '}
                            ถึง{' '}
                            {new Date(round.registrationEnd).toLocaleDateString(
                              'th-TH',
                              {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              }
                            )}
                          </ThemedText>
                        </View>
                      )}

                      {round.registrationCondition && (
                        <View style={styles.infoRow}>
                          <ThemedText style={styles.infoLabel}>
                            เงื่อนไขการลงทะเบียน
                          </ThemedText>
                          <ThemedText style={styles.infoValue}>
                            {cleanHtmlText(round.registrationCondition)}
                          </ThemedText>
                        </View>
                      )}

                      {round.courseStart && round.courseEnd && (
                        <View style={styles.infoRow}>
                          <ThemedText style={styles.infoLabel}>
                            เข้าเรียนได้
                          </ThemedText>
                          <ThemedText style={styles.infoValue}>
                            {new Date(round.courseStart).toLocaleDateString(
                              'th-TH',
                              {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              }
                            )}{' '}
                            ถึง{' '}
                            {round.courseEnd === '3000-01-01T00:00:00' ||
                            round.courseEnd === '3000-01-01T00:00:00.000Z'
                              ? 'ไม่มีกำหนด'
                              : new Date(round.courseEnd).toLocaleDateString(
                                  'th-TH',
                                  {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  }
                                )}
                          </ThemedText>
                        </View>
                      )}

                      {/* Registration Button - Conditional Rendering */}
                      {(() => {
                        // Check if registration period is active
                        const isEligibleForAccess = isBetween(
                          round.registrationStart,
                          round.registrationEnd
                        )

                        // Check if user already registered for this round
                        const isAlreadyRegistered = courseRegistrations.some(
                          (reg: any) =>
                            reg.courseId === parseInt(id || '0') &&
                            reg.courseRoundId === round.id
                        )

                        // Case 1: Not logged in
                        if (!isLoggedIn) {
                          return (
                            <View style={styles.registerMessageContainer}>
                              <ThemedText style={styles.registerMessage}>
                                โปรดเข้าสู่ระบบเพื่อลงทะเบียนรายวิชา
                              </ThemedText>
                              <TouchableOpacity
                                style={[
                                  styles.registerButton,
                                  { backgroundColor: tintColor },
                                ]}
                                onPress={() => router.replace('/(tabs)?tab=account')}
                              >
                                <IconSymbol
                                  name='person.fill'
                                  size={20}
                                  color='white'
                                />
                                <ThemedText style={styles.registerButtonText}>
                                  เข้าสู่ระบบ
                                </ThemedText>
                              </TouchableOpacity>
                            </View>
                          )
                        }

                        // Case 2: Already registered for this round
                        if (isAlreadyRegistered) {
                          return (
                            <View style={styles.registerMessageContainer}>
                              <ThemedText style={styles.registerMessage}>
                                คุณลงทะเบียนรอบนี้แล้ว เข้าเรียนได้เลย
                              </ThemedText>
                              <TouchableOpacity
                                style={[
                                  styles.registerButton,
                                  { backgroundColor: tintColor },
                                ]}
                                onPress={() =>
                                  router.push(`/classroom?courseId=${id}`)
                                }
                              >
                                <IconSymbol
                                  name='arrow.right.square'
                                  size={20}
                                  color='white'
                                />
                                <ThemedText style={styles.registerButtonText}>
                                  เข้าเรียน
                                </ThemedText>
                              </TouchableOpacity>
                            </View>
                          )
                        }

                        // Case 3: Full capacity
                        if (
                          round.maxStudents &&
                          round.numStudents >= round.maxStudents
                        ) {
                          return (
                            <View style={styles.registerMessageContainer}>
                              <ThemedText style={styles.registerMessageDisabled}>
                                จำนวนผู้เรียนเต็มแล้ว
                              </ThemedText>
                            </View>
                          )
                        }

                        // Case 4: Not in registration period
                        if (!isEligibleForAccess) {
                          return (
                            <View style={styles.registerMessageContainer}>
                              <ThemedText style={styles.registerMessageDisabled}>
                                ไม่เปิดให้ลงทะเบียน
                              </ThemedText>
                            </View>
                          )
                        }

                        // Case 5: Can register
                        return (
                          <TouchableOpacity
                            style={[
                              styles.registerButton,
                              { backgroundColor: tintColor },
                              isRegisterButtonDisabled && { opacity: 0.6 },
                            ]}
                            onPress={() => {
                              if (isRegisterButtonDisabled) return
                              console.log(
                                'Register for course:',
                                id,
                                'round:',
                                round.id
                              )
                              setIsRegisterButtonDisabled(true)
                              setRegisterButtonLabel('กำลังลงทะเบียน...')
                              // TODO: Implement actual registration API call
                              // For now, just reset after 3 seconds
                              setTimeout(() => {
                                setIsRegisterButtonDisabled(false)
                                setRegisterButtonLabel('ลงทะเบียนเรียน')
                              }, 3000)
                            }}
                            disabled={isRegisterButtonDisabled}
                          >
                            <IconSymbol
                              name='arrow.right.square'
                              size={20}
                              color='white'
                            />
                            <ThemedText style={styles.registerButtonText}>
                              {registerButtonLabel}
                            </ThemedText>
                          </TouchableOpacity>
                        )
                      })()}
                    </View>
                  </View>
                ))}
              </>
            )}

            {/* Main Content */}
            <View style={styles.mainContent}>
              {/* Course Information Sections */}
              {courseInfoSections.map((section, index) => (
                <ThemedView key={index} style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionIconContainer}>
                      <IconSymbol
                        name={section.icon as any}
                        size={20}
                        color='white'
                      />
                    </View>
                    <ThemedText
                      type='defaultSemiBold'
                      style={styles.sectionTitle}
                    >
                      {section.title}
                    </ThemedText>
                  </View>
                  {section.isHtml ? (
                    <RenderHtml
                      contentWidth={contentWidth - 88}
                      source={{ html: section.detail }}
                      systemFonts={[
                        ...defaultSystemFonts,
                        'Prompt-Regular',
                        'Prompt-Medium',
                        'Prompt-SemiBold',
                        'Prompt-Bold',
                      ]}
                      baseStyle={{
                        fontFamily: 'Prompt-Regular',
                        fontSize: 16,
                        color: '#6B7280',
                      }}
                      enableExperimentalMarginCollapsing={true}
                      tagsStyles={{
                        body: {
                          fontFamily: 'Prompt-Regular',
                          fontSize: 16,
                        },
                        p: {
                          fontFamily: 'Prompt-Regular',
                          fontSize: 16,
                          marginVertical: 2,
                        },
                        li: {
                          fontFamily: 'Prompt-Regular',
                          fontSize: 16,
                          marginBottom: 10,
                          marginTop: 0,
                        },
                        ol: { paddingLeft: 16 },
                        ul: { paddingLeft: 20 },
                        strong: { fontFamily: 'Prompt-SemiBold' },
                        b: { fontFamily: 'Prompt-SemiBold' },
                        span: { fontFamily: 'Prompt-Regular' },
                        font: { fontFamily: 'Prompt-Regular' },
                        a: {
                          color: '#1D4ED8',
                          textDecorationLine: 'underline',
                        },
                      }}
                      classesStyles={{
                        'text-red': { color: 'red' },
                        'text-danger': { color: 'red' },
                        'text-red-500': { color: '#EF4444' },
                        'text-red-600': { color: '#DC2626' },
                      }}
                      renderersProps={{
                        ol: {
                          markerBoxStyle: {
                            paddingRight: 8,
                            alignItems: 'flex-start',
                            justifyContent: 'flex-start',
                            paddingTop: 0,
                            minWidth: 28,
                          },
                          markerTextStyle: {
                            fontFamily: 'Prompt-Regular',
                            fontSize: 16,
                            color: '#6B7280',
                            lineHeight: 24,
                          },
                        },
                        ul: {
                          markerBoxStyle: {
                            paddingRight: 10,
                            alignItems: 'flex-start',
                            justifyContent: 'flex-start',
                            paddingTop: 5,
                          },
                          markerTextStyle: {
                            fontSize: 10,
                            color: '#6B7280',
                          },
                        },
                      }}
                    />
                  ) : (
                    <ThemedText style={styles.sectionContent}>
                      {section.detail}
                    </ThemedText>
                  )}
                </ThemedView>
              ))}

              {/* Course Contents/Syllabus Section */}
              {contents.length > 0 && (
                <ThemedView style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <IconSymbol
                      name='list.bullet'
                      size={20}
                      color={tintColor}
                    />
                    <ThemedText
                      type='defaultSemiBold'
                      style={styles.sectionTitle}
                    >
                      ประมวลรายวิชา
                    </ThemedText>
                  </View>
                  <View style={styles.contentListContainer}>
                    <ContentList
                      contents={contents.map((content: any, index: number) => ({
                        id: content.id || index,
                        courseId: content.courseId,
                        no: content.no || index + 1,
                        name: content.name || `เนื้อหา ${index + 1}`,
                        type: content.type || 'c',
                        minutes: content.minutes || 0,
                        completed: false,
                      }))}
                      selectedContentId={null}
                      completedContents={new Set()}
                      onContentSelect={() => {}}
                      hideHeader={true}
                    />
                  </View>
                </ThemedView>
              )}
            </View>
          </>
        )}
      </ScrollView>
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
    textAlign: 'left',
    fontSize: 20,
    fontFamily: 'Prompt-Bold',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Prompt-Regular',
    opacity: 0.6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Prompt-Regular',
    opacity: 0.6,
  },
  heroContainer: {
    position: 'relative',
    overflow: 'hidden',
  },
  heroBlurBackground: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    transform: [{ scale: 1.1 }],
  },
  heroCategoryOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroDarkOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  heroContentWrapper: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: 36,
    paddingTop: 48,
    paddingBottom: 48,
    position: 'relative',
    zIndex: 1,
  },
  heroInfoSection: {
    width: '100%',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  heroThumbnailSection: {
    width: '100%',
    marginTop: 24,
    maxWidth: 280,
    aspectRatio: 4 / 3,
  },
  heroThumbnailShadow: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  heroThumbnail: {
    width: '100%',
    height: '100%',
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 16,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  courseType: {
    fontSize: 16,
    color: 'white',
    fontFamily: 'Prompt-Medium',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  heroTitle: {
    fontSize: 26,
    color: 'white',
    fontFamily: 'Prompt-SemiBold',
    lineHeight: 36,
    marginBottom: 16,
    textAlign: 'left',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  courseCode: {
    fontSize: 18,
    color: 'white',
    fontFamily: 'Prompt-Medium',
    textAlign: 'left',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
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
    elevation: 0,
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
  sectionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#183A7C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    marginLeft: 16,
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
  htmlContent: {
    fontSize: 16,
    lineHeight: 26,
    color: '#6B7280',
    fontFamily: 'Prompt-Regular',
  },
  roundContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 0,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  roundHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  roundTitle: {
    fontSize: 20,
    fontFamily: 'Prompt-SemiBold',
    color: '#374151',
    flex: 1,
    marginRight: 12,
  },
  registrationCount: {
    alignItems: 'flex-end',
  },
  registrationNumber: {
    fontSize: 24,
    lineHeight: 32,
    fontFamily: 'Prompt-Bold',
    color: '#183A7C',
  },
  registrationText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 0,
    fontFamily: 'Prompt-Regular',
  },
  roundInfo: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Prompt-Regular',
  },
  infoValue: {
    fontSize: 14,
    color: '#374151',
    fontFamily: 'Prompt-Medium',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 16,
    marginTop: 20,
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
  registerMessageContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  registerMessage: {
    fontSize: 14,
    fontFamily: 'Prompt-Regular',
    color: '#6B7280',
    marginBottom: 12,
    textAlign: 'center',
  },
  registerMessageDisabled: {
    fontSize: 16,
    fontFamily: 'Prompt-Medium',
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 20,
  },
  contentListContainer: {
    paddingHorizontal: 0,
    marginVertical: -24,
    marginBottom: -24,
    marginHorizontal: -24,
  },
})
