import AsyncStorage from '@react-native-async-storage/async-storage'
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

import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { useThemeColor } from '@/hooks/useThemeColor'
import * as curriculumsActions from '@/modules/curriculums/actions'
import * as registrationsActions from '@/modules/registrations/actions'
import type { AppDispatch, RootState } from '@/store/types'

import { LoginContext } from './(tabs)/_layout'

// Prepare HTML for rendering - keeps HTML structure and converts legacy font tags
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
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
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
      // Convert legacy <font color="..."> tags to spans with text-red class
      .replace(
        /<font[^>]*color=["']?([^"'\s>]+)["']?[^>]*>/gi,
        '<span class="text-red">'
      )
      // Close font tags properly
      .replace(/<\/font>/gi, '</span>')
  )
}

// Common RenderHtml configuration
const systemFonts = [
  ...defaultSystemFonts,
  'Prompt-Regular',
  'Prompt-Medium',
  'Prompt-SemiBold',
  'Prompt-SemiBold',
]

const baseStyle = {
  fontFamily: 'Prompt-Regular',
  fontSize: 16,
  color: '#6B7280',
}

const tagsStyles = {
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
    textDecorationLine: 'underline' as const,
  },
}

const classesStyles = {
  'text-red': { color: 'red' },
  'text-danger': { color: 'red' },
  'text-red-500': { color: '#EF4444' },
  'text-red-600': { color: '#DC2626' },
}

const renderersProps = {
  ol: {
    markerBoxStyle: {
      paddingRight: 8,
      alignItems: 'flex-start' as const,
      justifyContent: 'flex-start' as const,
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
      paddingRight: 8,
      alignItems: 'flex-start' as const,
      justifyContent: 'flex-start' as const,
      paddingTop: 4,
    },
    markerTextStyle: {
      fontSize: 14,
      color: '#6B7280',
    },
  },
}

export default function CurriculumDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const backgroundColor = useThemeColor({}, 'background')
  const iconColor = useThemeColor({}, 'icon')
  const tintColor = useThemeColor({}, 'tint')

  const { width: contentWidth } = useWindowDimensions()

  const dispatch = useDispatch<AppDispatch>()

  // Register button state
  const [isRegisterButtonDisabled, setIsRegisterButtonDisabled] =
    useState(false)
  const [registerButtonLabel, setRegisterButtonLabel] =
    useState('ลงทะเบียนหลักสูตร')

  // Login context
  const { isLoggedIn: contextIsLoggedIn } = useContext(LoginContext)

  // Local state to track login status independently
  const [isLoggedIn, setIsLoggedIn] = useState(contextIsLoggedIn)

  // Check token directly on mount and when context changes
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('token')
        const hasToken = !!token
        console.log('[CurriculumDetail] Direct token check:', hasToken)
        console.log('[CurriculumDetail] Context isLoggedIn:', contextIsLoggedIn)
        // Use whichever is true (token exists OR context says logged in)
        const loggedIn = hasToken || contextIsLoggedIn
        setIsLoggedIn(loggedIn)
        console.log('[CurriculumDetail] Final isLoggedIn set to:', loggedIn)
      } catch (error) {
        console.error('[CurriculumDetail] Error checking auth:', error)
        setIsLoggedIn(contextIsLoggedIn)
      }
    }
    checkAuth()
  }, [contextIsLoggedIn])
  // Redux state selectors
  const { isLoading, currentCurriculum: curriculum } = useSelector(
    (state: RootState) => state.curriculums
  )
  const { myCurriculums } = useSelector(
    (state: RootState) => state.registrations
  )

  // Load curriculum data on mount
  useEffect(() => {
    if (id) {
      console.log('CurriculumDetail: Loading curriculum data for ID:', id)
      dispatch(curriculumsActions.loadCurriculum(id) as any)
    }
  }, [dispatch, id])

  // Load curriculum registrations when logged in
  useEffect(() => {
    if (isLoggedIn) {
      dispatch(registrationsActions.loadCurriculumRegistrations())
    }
  }, [dispatch, isLoggedIn])

  // Check if user is already registered for this curriculum
  const isAlreadyRegistered = myCurriculums.some(
    (reg: any) => reg.curriculumId === parseInt(id || '0')
  )

  // Calculate content width for RenderHtml (accounting for padding)
  const htmlContentWidth = contentWidth - 88 // 20 padding + 24 section padding on each side

  // Render registration button based on login state
  const renderRegisterButton = () => {
    if (!isLoggedIn) {
      return (
        <View style={styles.registerMessageContainer}>
          <ThemedText style={styles.registerMessage}>
            โปรดเข้าสู่ระบบเพื่อลงทะเบียนหลักสูตร
          </ThemedText>
          <TouchableOpacity
            style={[styles.registerButton, { backgroundColor: tintColor }]}
            onPress={() => router.replace('/(tabs)?tab=account')}
          >
            <IconSymbol name='person.fill' size={20} color='white' />
            <ThemedText style={styles.registerButtonText}>
              เข้าสู่ระบบ
            </ThemedText>
          </TouchableOpacity>
        </View>
      )
    }

    if (isAlreadyRegistered) {
      return (
        <View style={styles.registerMessageContainer}>
          <ThemedText style={styles.registerMessage}>
            คุณลงทะเบียนหลักสูตรนี้แล้ว เข้าเรียนได้เลย
          </ThemedText>
          <TouchableOpacity
            style={[styles.registerButton, { backgroundColor: tintColor }]}
            onPress={() => router.replace('/(tabs)?tab=learn')}
          >
            <IconSymbol name='arrow.right.square' size={20} color='white' />
            <ThemedText style={styles.registerButtonText}>เข้าเรียน</ThemedText>
          </TouchableOpacity>
        </View>
      )
    }

    return (
      <TouchableOpacity
        style={[
          styles.registerButton,
          { backgroundColor: tintColor },
          isRegisterButtonDisabled && { opacity: 0.6 },
        ]}
        onPress={async () => {
          if (isRegisterButtonDisabled) return
          console.log('Register for curriculum:', id)
          setIsRegisterButtonDisabled(true)
          setRegisterButtonLabel('กำลังลงทะเบียน...')
          // Dispatch register curriculum action and await result
          const success = await dispatch(
            registrationsActions.registerCurriculum(parseInt(id || '0'))
          )
          // Navigate to learn page on success
          if (success) {
            router.replace('/(tabs)?tab=learn')
          } else {
            // Reset button state on failure
            setIsRegisterButtonDisabled(false)
            setRegisterButtonLabel('ลงทะเบียนหลักสูตร')
          }
        }}
        disabled={isRegisterButtonDisabled}
      >
        <IconSymbol name='arrow.right.square' size={20} color='white' />
        <ThemedText style={styles.registerButtonText}>
          {registerButtonLabel}
        </ThemedText>
      </TouchableOpacity>
    )
  }

  // Loading state
  if (isLoading && !curriculum) {
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
              รายละเอียดหลักสูตร
            </ThemedText>
            <View style={styles.backButton} />
          </View>
        </ThemedView>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color={tintColor} />
          <ThemedText style={styles.loadingText}>
            กำลังโหลดรายละเอียดหลักสูตร...
          </ThemedText>
        </View>
      </ThemedView>
    )
  }

  // Curriculum not found
  if (!curriculum && !isLoading) {
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
        <View style={styles.emptyContainer}>
          <ThemedText style={styles.emptyText}>
            ไม่พบข้อมูลหลักสูตรที่ต้องการ
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
            รายละเอียดหลักสูตร
          </ThemedText>
          <View style={styles.backButton} />
        </View>
      </ThemedView>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={[
          styles.scrollContent,
          isLoading && { flexGrow: 1 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size='large' color={tintColor} />
            <ThemedText style={styles.loadingText}>
              กำลังโหลดรายละเอียดหลักสูตร...
            </ThemedText>
          </View>
        ) : (
          <>
            {/* Hero Section - Mobile Style with Blur Background */}
            <View style={styles.heroContainer}>
              {/* Blurred Background Image with Color Overlay */}
              <Image
                source={{ uri: curriculum?.thumbnail || '' }}
                style={styles.heroBlurBackground}
                contentFit='cover'
                blurRadius={15}
              />
              {/* Dark overlay matching desktop: rgba(0,0,0,0.35) */}
              <View style={styles.heroDarkOverlay} />

              {/* Yellow left border overlay */}
              <View style={styles.heroLeftBorder} />

              {/* Hero Content - Vertical Layout for Mobile */}
              <View style={styles.heroContentWrapper}>
                {/* Curriculum Info */}
                <View style={styles.heroInfoSection}>
                  <ThemedText style={styles.curriculumType}>
                    หลักสูตร
                  </ThemedText>
                  <ThemedText style={styles.heroTitle}>
                    {curriculum?.name || 'หลักสูตร'}
                  </ThemedText>
                  <ThemedText style={styles.curriculumCode}>
                    {curriculum?.code || ''}
                  </ThemedText>
                </View>

                {/* Curriculum Thumbnail */}
                <View style={styles.heroThumbnailSection}>
                  <View style={styles.heroThumbnailShadow}>
                    <Image
                      source={{ uri: curriculum?.thumbnail || '' }}
                      style={styles.heroThumbnail}
                      contentFit='cover'
                      transition={200}
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* Main Content */}
            <View style={styles.mainContent}>
              {/* Learning Objectives Section */}
              <ThemedView style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIconContainer}>
                    <IconSymbol name='flag.fill' size={20} color='white' />
                  </View>
                  <ThemedText
                    type='defaultSemiBold'
                    style={styles.sectionTitle}
                  >
                    เป้าหมายการเรียนรู้
                  </ThemedText>
                </View>
                <RenderHtml
                  contentWidth={htmlContentWidth}
                  source={{
                    html: prepareHtmlContent(curriculum?.learningObjective),
                  }}
                  systemFonts={systemFonts}
                  baseStyle={baseStyle}
                  enableExperimentalMarginCollapsing={true}
                  tagsStyles={tagsStyles}
                  classesStyles={classesStyles}
                  renderersProps={renderersProps}
                />
              </ThemedView>

              {/* Learning Topics Section */}
              <ThemedView style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIconContainer}>
                    <IconSymbol name='doc.text.fill' size={20} color='white' />
                  </View>
                  <ThemedText
                    type='defaultSemiBold'
                    style={styles.sectionTitle}
                  >
                    ประเด็นการเรียนรู้
                  </ThemedText>
                </View>
                <RenderHtml
                  contentWidth={htmlContentWidth}
                  source={{
                    html: prepareHtmlContent(curriculum?.learningTopic),
                  }}
                  systemFonts={systemFonts}
                  baseStyle={baseStyle}
                  enableExperimentalMarginCollapsing={true}
                  tagsStyles={tagsStyles}
                  classesStyles={classesStyles}
                  renderersProps={renderersProps}
                />
              </ThemedView>

              {/* Assessment Section */}
              <ThemedView style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIconContainer}>
                    <IconSymbol name='chart.bar.fill' size={20} color='white' />
                  </View>
                  <ThemedText
                    type='defaultSemiBold'
                    style={styles.sectionTitle}
                  >
                    วิธีการประเมินผล
                  </ThemedText>
                </View>
                <RenderHtml
                  contentWidth={htmlContentWidth}
                  source={{ html: prepareHtmlContent(curriculum?.assessment) }}
                  systemFonts={systemFonts}
                  baseStyle={baseStyle}
                  enableExperimentalMarginCollapsing={true}
                  tagsStyles={tagsStyles}
                  classesStyles={classesStyles}
                  renderersProps={renderersProps}
                />
              </ThemedView>

              {/* Target Group Section */}
              <ThemedView style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIconContainer}>
                    <IconSymbol name='person.2.fill' size={20} color='white' />
                  </View>
                  <ThemedText
                    type='defaultSemiBold'
                    style={styles.sectionTitle}
                  >
                    กลุ่มเป้าหมาย
                  </ThemedText>
                </View>
                <RenderHtml
                  contentWidth={htmlContentWidth}
                  source={{ html: prepareHtmlContent(curriculum?.targetGroup) }}
                  systemFonts={systemFonts}
                  baseStyle={baseStyle}
                  enableExperimentalMarginCollapsing={true}
                  tagsStyles={tagsStyles}
                  classesStyles={classesStyles}
                  renderersProps={renderersProps}
                />
              </ThemedView>
            </View>
          </>
        )}
      </ScrollView>

      {/* Fixed Registration Button */}
      {!isLoading && curriculum && (
        <View style={[styles.fixedButtonContainer, { backgroundColor }]}>
          {renderRegisterButton()}
        </View>
      )}
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 40,
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
    textAlign: 'center',
    fontSize: 20,
    fontFamily: 'Prompt-SemiBold',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Add space for fixed button
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
  heroDarkOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  heroLeftBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 8,
    backgroundColor: 'rgb(255, 193, 7)',
    zIndex: 10,
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
  curriculumType: {
    fontSize: 18,
    color: '#ffc107',
    fontFamily: 'Prompt-SemiBold',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  heroTitle: {
    fontSize: 26,
    color: 'white',
    fontFamily: 'Prompt-SemiBold',
    lineHeight: 36,
    marginBottom: 16,
    marginTop: 12,
    textAlign: 'left',
    textShadowColor: 'rgba(68, 56, 56, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  curriculumCode: {
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
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 40,
    borderTopWidth: 0.5,
    borderTopColor: '#F0F0F0',
  },
  registerMessageContainer: {
    alignItems: 'center',
  },
  registerMessage: {
    fontSize: 14,
    fontFamily: 'Prompt-Regular',
    color: '#6B7280',
    marginBottom: 12,
    textAlign: 'center',
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
    width: '100%',
  },
  registerButtonText: {
    fontSize: 18,
    fontFamily: 'Prompt-SemiBold',
    marginLeft: 8,
    color: 'white',
  },
})
