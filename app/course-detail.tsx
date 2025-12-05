import { Image } from 'expo-image'
import { router, useLocalSearchParams } from 'expo-router'
import React, { useEffect } from 'react'
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native'
import RenderHtml from 'react-native-render-html'
import { useDispatch, useSelector } from 'react-redux'

import { ContentList } from '@/components/ContentList'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { useThemeColor } from '@/hooks/useThemeColor'
import * as categoriesActions from '@/modules/categories/actions'
import * as coursesActions from '@/modules/courses/actions'
import type { RootState } from '@/store/types'
import categoryColor from '@/utils/categoryColor'

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
  return htmlText
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
}

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const backgroundColor = useThemeColor({}, 'background')
  const iconColor = useThemeColor({}, 'icon')
  const tintColor = useThemeColor({}, 'tint')

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
      icon: 'target',
    },
    {
      title: 'วิทยากร',
      detail: course?.instructor
        ? prepareHtmlContent(course.instructor)
        : '<p>ไม่มีข้อมูล</p>',
      isHtml: true,
      icon: 'person.circle',
    },
    {
      title: 'ประเด็นการเรียนรู้',
      detail: course?.learningTopic
        ? prepareHtmlContent(course.learningTopic)
        : '<p>ไม่มีข้อมูล</p>',
      isHtml: true,
      icon: 'square.and.pencil',
    },
    {
      title: 'วิธีการประเมินผล',
      detail: course?.assessment
        ? prepareHtmlContent(course.assessment)
        : '<p>ไม่มีข้อมูล</p>',
      isHtml: true,
      icon: 'chart.bar',
    },
    {
      title: 'กลุ่มเป้าหมาย',
      detail: course?.targetGroup
        ? prepareHtmlContent(course.targetGroup)
        : '<p>ไม่มีข้อมูล</p>',
      isHtml: true,
      icon: 'person.2',
    },
    {
      title: 'หมายเหตุ',
      detail: course?.seqFlow
        ? 'บังคับเรียนตามลำดับเนื้อหา'
        : 'ไม่บังคับเรียนตามลำดับเนื้อหา',
      icon: 'info.circle',
    },
    {
      title: 'จำนวนชั่วโมงการเรียนรู้',
      detail: `${hour ?? 0} ชั่วโมง`,
      icon: 'clock',
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
              กำลังโหลดข้อมูล...
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

                      {/* Registration Button */}
                      <TouchableOpacity
                        style={[
                          styles.registerButton,
                          { backgroundColor: tintColor },
                        ]}
                        onPress={() => {
                          console.log(
                            'Register for course:',
                            id,
                            'round:',
                            round.id
                          )
                          // TODO: Implement registration logic
                        }}
                      >
                        <IconSymbol
                          name='arrow.right.square'
                          size={20}
                          color='white'
                        />
                        <ThemedText style={styles.registerButtonText}>
                          ลงทะเบียนเรียน
                        </ThemedText>
                      </TouchableOpacity>
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
                      systemFonts={['Prompt-Regular', 'Prompt-Medium', 'Prompt-SemiBold', 'Prompt-Bold']}
                      defaultTextProps={{
                        style: { fontFamily: 'Prompt-Regular' }
                      }}
                      baseStyle={{
                        fontFamily: 'Prompt-Regular',
                        fontSize: 16,
                        color: '#6B7280',
                        lineHeight: 28,
                      }}
                      tagsStyles={{
                        body: { fontFamily: 'Prompt-Regular', fontSize: 16, color: '#6B7280', lineHeight: 28 },
                        p: { fontFamily: 'Prompt-Regular', fontSize: 16, color: '#6B7280', marginVertical: 2, lineHeight: 28 },
                        li: { fontFamily: 'Prompt-Regular', fontSize: 16, color: '#6B7280', marginVertical: 4, lineHeight: 28 },
                        ol: { fontFamily: 'Prompt-Regular', paddingLeft: 20, marginVertical: 0 },
                        ul: { fontFamily: 'Prompt-Regular', paddingLeft: 20, marginVertical: 0 },
                        strong: { fontFamily: 'Prompt-SemiBold' },
                        b: { fontFamily: 'Prompt-SemiBold' },
                        span: { fontFamily: 'Prompt-Regular' },
                      }}
                      renderersProps={{
                        ol: {
                          markerTextStyle: {
                            fontFamily: 'Prompt-Regular',
                            fontSize: 16,
                            color: '#6B7280',
                            lineHeight: 28,
                            top: 0,
                          },
                        },
                        ul: {
                          markerTextStyle: {
                            fontFamily: 'Prompt-Regular',
                            fontSize: 16,
                            color: '#6B7280',
                            lineHeight: 28,
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
    lineHeight: 34,
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
  contentListContainer: {
    paddingHorizontal: 0,
    marginVertical: -24,
    marginBottom: -24,
    marginHorizontal: -24,
  },
})
