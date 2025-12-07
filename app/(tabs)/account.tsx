import AsyncStorage from '@react-native-async-storage/async-storage'
import { Image } from 'expo-image'
import * as Linking from 'expo-linking'
import { router } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import React, { useContext, useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'

import StatusBarGradient from '@/components/StatusBarGradient'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { useThemeColor } from '@/hooks/useThemeColor'
import * as learnActions from '@/modules/learn/actions'
import * as meActions from '@/modules/me/actions'
import * as registrationsActions from '@/modules/registrations/actions'
import * as uiActions from '@/modules/ui/actions'
import * as userActions from '@/modules/user/actions'
import type { AppDispatch, RootState } from '@/store/types'
import {
  PORTAL_URL,
  THAID_API_URL,
  THAID_AUTH_URL,
  THAID_CLIENT_ID,
  THAID_REDIRECT_URI,
} from '@env'
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux'
import { LoginContext } from './_layout'

export default function AccountScreen() {
  const backgroundColor = useThemeColor({}, 'background')
  const tintColor = useThemeColor({}, 'tint')
  const iconColor = useThemeColor({}, 'icon')
  const scrollViewRef = useRef<ScrollView>(null)
  const dispatch = useReduxDispatch<AppDispatch>()

  // Get user data from Redux
  const { items: user } = useSelector((state: RootState) => state.user)

  // Use shared login context instead of local state
  const { isLoggedIn, setIsLoggedIn } = useContext(LoginContext)

  // Local form state
  const [activeTab, setActiveTab] = useState(0) // 0 = ThaiD, 1 = Traditional
  const [citizenId, setCitizenId] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isThaiDLoading, setIsThaiDLoading] = useState(false)
  const [thaiDState, setThaiDState] = useState<string | null>(null)

  // Secret debug login tap counter
  const [debugTapCount, setDebugTapCount] = useState(0)
  const debugTapTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleSecretTap = () => {
    // Reset timeout on each tap
    if (debugTapTimeout.current) {
      clearTimeout(debugTapTimeout.current)
    }

    const newCount = debugTapCount + 1
    setDebugTapCount(newCount)

    // Navigate to debug login after 5 taps
    if (newCount >= 5) {
      setDebugTapCount(0)
      router.push('/debug-login')
      return
    }

    // Reset counter after 2 seconds of inactivity
    debugTapTimeout.current = setTimeout(() => {
      setDebugTapCount(0)
    }, 2000)
  }

  // ThaiD OAuth configuration loaded from @env

  // Generate random state string for OAuth security
  const generateState = () => {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let state = ''
    for (let i = 0; i < 11; i++) {
      state += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return state
  }

  // Handle ThaiD OAuth login
  const handleThaiDLogin = async () => {
    try {
      setIsThaiDLoading(true)

      // Generate and save state for verification
      const state = generateState()
      setThaiDState(state)

      // Get the app's redirect URI for debugging
      const appRedirectUri = Linking.createURL('thaid/callback')
      console.log("App's expected deep link:", appRedirectUri)
      console.log(
        "Note: In Expo Go, custom schemes don't work. Use a development build."
      )

      // Build OAuth URL
      const authUrl = `${THAID_AUTH_URL}?response_type=code&client_id=${THAID_CLIENT_ID}&redirect_uri=${THAID_REDIRECT_URI}&scope=pid%20given_name%20family_name&state=${state}`

      console.log('ThaiD Auth URL:', authUrl)
      console.log('Server redirect URI:', THAID_REDIRECT_URI)
      console.log(
        "The server's callback2.html should redirect to:",
        'ocsclearningspace://thaid/callback?code=XXX&state=XXX'
      )

      // Use openAuthSessionAsync for better OAuth handling
      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        THAID_REDIRECT_URI
      )

      console.log('WebBrowser result:', JSON.stringify(result, null, 2))

      if (result.type === 'success' && result.url) {
        console.log('Callback URL received:', result.url)

        // Parse the callback URL
        const urlParams = new URL(result.url)
        const code = urlParams.searchParams.get('code')
        const returnedState = urlParams.searchParams.get('state')

        console.log('Code:', code)
        console.log('Returned state:', returnedState)

        // Verify state matches (security check)
        if (state && returnedState !== state) {
          throw new Error('State mismatch - possible CSRF attack')
        }

        if (!code) {
          throw new Error('No authorization code received')
        }

        // Exchange code for token
        console.log(
          'Exchanging code for token at:',
          `${THAID_API_URL}?code=${code}`
        )
        const response = await fetch(`${THAID_API_URL}?code=${code}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        const responseText = await response.text()
        console.log('Token exchange response:', responseText)

        if (!response.ok) {
          throw new Error(`Failed to exchange code for token: ${responseText}`)
        }

        const data = JSON.parse(responseText)

        if (data.token) {
          console.log('ThaiD login successful!')

          // Store token in AsyncStorage
          await AsyncStorage.setItem('token', data.token)
          console.log(
            '[Auth] Token stored in AsyncStorage:',
            data.token.substring(0, 50) + '...'
          )

          // Verify token was stored
          const storedToken = await AsyncStorage.getItem('token')
          console.log(
            '[Auth] Verified token in storage:',
            storedToken ? 'YES' : 'NO'
          )

          // Load user data (loadUser will get userId from token automatically)
          dispatch(userActions.loadUser())

          setIsLoggedIn(true)
          setThaiDState(null)
          dispatch(
            uiActions.setFlashMessage('เข้าสู่ระบบเรียบร้อยแล้ว', 'success')
          )
        } else {
          throw new Error('No token received')
        }
      } else if (result.type === 'cancel') {
        console.log('User cancelled the login')
      } else {
        console.log('Unexpected result type:', result.type)
      }

      setIsThaiDLoading(false)
    } catch (error: any) {
      console.error('ThaiD login error:', error)
      setIsThaiDLoading(false)

      // Handle different error types with appropriate messages
      let errorMessage =
        'ไม่สามารถเข้าสู่ระบบด้วย ThaiD ได้ กรุณาลองใหม่อีกครั้ง'

      if (error.response) {
        const status = error.response.status
        if (status === 401) {
          errorMessage = 'รหัสผ่านไม่ถูกต้อง'
        } else if (status === 404) {
          errorMessage = 'ไม่พบบัญชีผู้ใช้งานนี้ โปรดลองใหม่อีกครั้ง'
        } else if (status === 500) {
          errorMessage = `เกิดข้อผิดพลาด ${status} โปรดลองใหม่อีกครั้ง`
        } else {
          errorMessage = `เกิดข้อผิดพลาด ${status} โปรดลองใหม่อีกครั้ง`
        }
      } else if (error.message) {
        if (error.message.includes('State mismatch')) {
          errorMessage = 'เกิดข้อผิดพลาดด้านความปลอดภัย กรุณาลองใหม่อีกครั้ง'
        } else if (error.message.includes('No authorization code')) {
          errorMessage = 'ไม่พบรหัสยืนยันตัวตน กรุณาลองใหม่อีกครั้ง'
        }
      }

      dispatch(uiActions.setFlashMessage(errorMessage, 'error'))
    }
  }

  // Handle deep link callback from ThaiD
  useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      console.log('Deep link received:', event.url)
      const url = event.url

      // Check if this is a ThaiD callback
      if (url.includes('thaid/callback') || url.includes('thaid')) {
        try {
          setIsThaiDLoading(true)

          // Parse URL to get code and state
          const urlParams = new URL(
            url.replace('ocsclearningspace://', 'https://')
          )
          const code = urlParams.searchParams.get('code')
          const returnedState = urlParams.searchParams.get('state')

          // Verify state matches (security check)
          if (thaiDState && returnedState !== thaiDState) {
            throw new Error('State mismatch - possible CSRF attack')
          }

          if (!code) {
            throw new Error('No authorization code received')
          }

          // Exchange code for token
          const response = await fetch(`${THAID_API_URL}?code=${code}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          })

          if (!response.ok) {
            throw new Error('Failed to exchange code for token')
          }

          const data = await response.json()

          if (data.token) {
            // Store token in AsyncStorage
            await AsyncStorage.setItem('token', data.token)
            console.log(
              '[Auth] Token stored in AsyncStorage:',
              data.token.substring(0, 50) + '...'
            )

            // Verify token was stored
            const storedToken = await AsyncStorage.getItem('token')
            console.log(
              '[Auth] Verified token in storage:',
              storedToken ? 'YES' : 'NO'
            )
            console.log('ThaiD login successful')

            // Load user data (loadUser will get userId from token automatically)
            dispatch(userActions.loadUser())

            // Set logged in state
            setIsLoggedIn(true)
            setThaiDState(null)
            dispatch(
              uiActions.setFlashMessage('เข้าสู่ระบบเรียบร้อยแล้ว', 'success')
            )
          } else {
            throw new Error('No token received')
          }

          setIsThaiDLoading(false)
        } catch (error: any) {
          console.error('ThaiD callback error:', error)
          setIsThaiDLoading(false)

          // Handle different error types with appropriate messages
          let errorMessage =
            'ไม่สามารถเข้าสู่ระบบด้วย ThaiD ได้ กรุณาลองใหม่อีกครั้ง'

          if (error.response) {
            const status = error.response.status
            if (status === 401) {
              errorMessage = 'รหัสผ่านไม่ถูกต้อง'
            } else if (status === 404) {
              errorMessage = 'ไม่พบบัญชีผู้ใช้งานนี้ โปรดลองใหม่อีกครั้ง'
            } else if (status === 500) {
              errorMessage = `เกิดข้อผิดพลาด ${status} โปรดลองใหม่อีกครั้ง`
            } else {
              errorMessage = `เกิดข้อผิดพลาด ${status} โปรดลองใหม่อีกครั้ง`
            }
          } else if (error.message) {
            if (error.message.includes('State mismatch')) {
              errorMessage =
                'เกิดข้อผิดพลาดด้านความปลอดภัย กรุณาลองใหม่อีกครั้ง'
            } else if (error.message.includes('No authorization code')) {
              errorMessage = 'ไม่พบรหัสยืนยันตัวตน กรุณาลองใหม่อีกครั้ง'
            }
          }

          dispatch(uiActions.setFlashMessage(errorMessage, 'error'))
        }
      }
    }

    // Listen for deep links
    const subscription = Linking.addEventListener('url', handleDeepLink)

    // Check if app was opened via deep link
    console.log('Setting up deep link listener...')
    Linking.getInitialURL().then((url) => {
      console.log('Initial URL:', url)
      if (url) {
        handleDeepLink({ url })
      }
    })

    return () => {
      subscription.remove()
    }
  }, [thaiDState, setIsLoggedIn])

  // Load user data when logged in (only if not already cached)
  useEffect(() => {
    if (isLoggedIn && !user?.firstname) {
      // Only load user data if not already in cache
      dispatch(userActions.loadUser())
    }
  }, [isLoggedIn, dispatch, user?.firstname])

  // Reset scroll position when component mounts or becomes visible
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false })
    }, 100) // Small delay to ensure component is mounted

    return () => clearTimeout(timeout)
  }, [])

  const handleLogin = () => {
    // Bypass all validation - allow login with any input or empty fields
    setIsLoggedIn(true)
    setCitizenId('')
    setPassword('')
    setOtp('')
  }

  const handleLogout = () => {
    Alert.alert('ยืนยันการออกจากระบบ', 'คุณต้องการออกจากระบบหรือไม่?', [
      { text: 'ยกเลิก', style: 'cancel' },
      {
        text: 'ออกจากระบบ',
        style: 'destructive',
        onPress: async () => {
          // Clear token from AsyncStorage
          await AsyncStorage.removeItem('token')
          console.log('[Auth] Token removed from AsyncStorage')

          // Clear all Redux state
          dispatch(userActions.clearUser())
          dispatch(registrationsActions.clearRegistrations())
          dispatch(meActions.clearAllCertificates())
          dispatch(learnActions.clearLearnState())
          console.log('[Auth] Redux state cleared')

          setIsLoggedIn(false)
        },
      },
    ])
  }

  const handlePrintCertificate = () => {
    router.push('/certificate-list')
  }

  // Login Form Component with Tabs
  const LoginForm = () => (
    <ThemedView style={styles.loginContainer}>
      {/* Header */}
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={handleSecretTap} activeOpacity={1}>
          <ThemedText type='title' style={styles.headerTitle}>
            OCSC Learning Space
          </ThemedText>
        </TouchableOpacity>
        <ThemedText type='subtitle' style={styles.subtitleText}>
          คุณสามารถเข้าสู่ระบบได้ 2 วิธี
        </ThemedText>
        <ThemedText type='subtitle' style={styles.subtitleText}>
          <ThemedText type='default' style={styles.regularText}>
            โปรด{' '}
          </ThemedText>
          <ThemedText type='link' style={styles.highlightedText}>
            สมัครสมาชิก
          </ThemedText>
          <ThemedText type='default' style={styles.regularText}>
            {' '}
            ก่อนเข้าสู่ระบบ
          </ThemedText>
        </ThemedText>
      </ThemedView>

      {/* Tab Navigation */}
      <ThemedView style={styles.tabSection}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,

              activeTab === 0 && {
                backgroundColor: tintColor,
                borderColor: tintColor,
                shadowColor: tintColor,
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 3,
              },
              { borderTopRightRadius: 0, borderBottomRightRadius: 0 },
            ]}
            onPress={() => setActiveTab(0)}
            activeOpacity={0.9}
          >
            <View style={styles.tabContent}>
              <Image
                source={require('@/assets/images/thaid_logo.jpg')}
                style={[
                  styles.tabIcon,
                  activeTab !== 0 && { opacity: 0.5 },
                  { borderRadius: 4 },
                ]}
                contentFit='contain'
              />
              <ThemedText
                style={[
                  styles.tabButtonText,
                  activeTab === 0 && {
                    color: '#FFFFFF',
                    fontFamily: 'Prompt-SemiBold',
                  },
                ]}
              >
                แอปพลิเคชัน{'\n'}ThaiD
              </ThemedText>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 1 && {
                backgroundColor: tintColor,
                borderColor: tintColor,
                shadowColor: tintColor,
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 3,
              },
              { borderTopLeftRadius: 0, borderBottomLeftRadius: 0 },
            ]}
            onPress={() => setActiveTab(1)}
            activeOpacity={0.8}
          >
            <View style={styles.tabContent}>
              <IconSymbol
                name='creditcard'
                size={24}
                color={activeTab === 1 ? '#FFFFFF' : '#666666'}
                style={styles.tabIcon}
              />
              <ThemedText
                style={[
                  styles.tabButtonText,
                  activeTab === 1 && {
                    color: '#FFFFFF',
                    fontFamily: 'Prompt-SemiBold',
                  },
                ]}
              >
                เลขประชาชน {'\n'}รหัสผ่าน และ OTP
              </ThemedText>
            </View>
          </TouchableOpacity>
        </View>
      </ThemedView>

      <ThemedView style={styles.loginCard}>
        {/* ThaiD Login Tab */}
        {activeTab === 0 && (
          <ThemedView style={styles.tabContent}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: tintColor, marginVertical: 48 },
                isThaiDLoading && { opacity: 0.7 },
              ]}
              onPress={handleThaiDLogin}
              disabled={isThaiDLoading}
            >
              {isThaiDLoading ? (
                <ActivityIndicator
                  size='small'
                  color='white'
                  style={{ marginRight: 8 }}
                />
              ) : (
                <Image
                  source={require('@/assets/images/thaid_logo.jpg')}
                  style={styles.thaidLogo}
                  contentFit='contain'
                />
              )}
              <ThemedText style={styles.actionButtonText}>
                {isThaiDLoading
                  ? 'กำลังเข้าสู่ระบบ...'
                  : 'เข้าสู่ระบบด้วยแอปพลิเคชัน ThaiD'}
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        )}

        {/* Traditional Login Tab */}
        {activeTab === 1 && (
          <ThemedView style={styles.tabContent}>
            {/* Citizen ID Input */}
            <ThemedView style={styles.inputContainer}>
              <ThemedText style={styles.inputLabel}>
                เลขประจำตัวประชาชน{' '}
                <ThemedText style={styles.required}>*</ThemedText>
              </ThemedText>
              <ThemedView style={styles.inputWrapper}>
                <IconSymbol
                  name='person'
                  size={20}
                  color={iconColor}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  value={citizenId}
                  onChangeText={setCitizenId}
                  placeholder='0-0000-00000-00-0'
                  placeholderTextColor='#999'
                  keyboardType='numeric'
                  maxLength={13}
                />
              </ThemedView>
            </ThemedView>

            {/* Password Input */}
            <ThemedView style={styles.inputContainer}>
              <ThemedText style={styles.inputLabel}>
                รหัสผ่าน <ThemedText style={styles.required}>*</ThemedText>
              </ThemedText>
              <ThemedView style={styles.inputWrapper}>
                <IconSymbol
                  name='lock'
                  size={20}
                  color={iconColor}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  value={password}
                  onChangeText={setPassword}
                  placeholder='กรอกรหัสผ่าน'
                  placeholderTextColor='#999'
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.passwordToggle}
                >
                  <IconSymbol
                    name={showPassword ? 'eye.slash' : 'eye'}
                    size={20}
                    color={iconColor}
                  />
                </TouchableOpacity>
              </ThemedView>
            </ThemedView>

            {/* OTP Input */}
            <ThemedView style={styles.inputContainer}>
              <ThemedText style={styles.inputLabel}>
                OTP จากโมบายแอป JOB OCSC (6 หลัก){' '}
                <ThemedText style={styles.required}>*</ThemedText>
              </ThemedText>
              <ThemedView style={styles.inputWrapper}>
                <IconSymbol
                  name='key'
                  size={20}
                  color={iconColor}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  value={otp}
                  onChangeText={setOtp}
                  placeholder='0 0 0 0 0 0'
                  placeholderTextColor='#999'
                  keyboardType='numeric'
                  maxLength={6}
                />
              </ThemedView>
            </ThemedView>

            {/* Forgot Password */}
            <TouchableOpacity style={styles.forgotPassword}>
              <ThemedText
                style={[styles.forgotPasswordText, { color: tintColor }]}
              >
                ลืมรหัสผ่าน
              </ThemedText>
              <IconSymbol
                name='chevron.right'
                size={16}
                color={tintColor}
                style={styles.arrowIcon}
              />
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: '#ccc', width: '100%' },
              ]}
              onPress={handleLogin}
            >
              <ThemedText style={[styles.actionButtonText, { marginLeft: 0 }]}>
                เข้าสู่ระบบ
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        )}

        {/* Registration Link */}
        <ThemedView style={styles.registrationContainer}>
          <ThemedText style={styles.registrationText}>
            ยังไม่มีบัญชีใช่ไหม?
          </ThemedText>
          <TouchableOpacity
            style={styles.registrationLink}
            onPress={() => router.push('/register' as any)}
          >
            <ThemedText
              style={[styles.registrationLinkText, { color: tintColor }]}
            >
              สมัครสมาชิก
            </ThemedText>
            <IconSymbol
              name='chevron.right'
              size={16}
              color={tintColor}
              style={styles.arrowIcon}
            />
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  )

  // If not logged in, show login form
  if (!isLoggedIn) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.loginScrollContent}
        >
          <LoginForm />
        </ScrollView>
        <StatusBarGradient />
      </ThemedView>
    )
  }

  // If logged in, show account profile
  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <ScrollView ref={scrollViewRef} style={styles.scrollContainer}>
        {/* Header Section */}
        <ThemedView style={styles.profileHeader}>
          <ThemedView style={styles.avatarContainer}>
            {/* <Image
              source={{ uri: mockUser.avatar }}
              style={styles.avatar}
              contentFit='cover'
            /> */}
            <IconSymbol
              name='person.circle.fill'
              size={120}
              color={tintColor}
              style={styles.avatar}
            />
          </ThemedView>

          {/* Notification Bell Icon */}
          {/* <TouchableOpacity
            style={styles.notificationBell}
            onPress={() => router.push('/notifications' as any)}
          >
            <IconSymbol name='bell' size={24} color={iconColor} />
           
            <ThemedView style={styles.notificationBadge}>
              <ThemedText style={styles.notificationBadgeText}>2</ThemedText>
            </ThemedView>
          </TouchableOpacity> */}

          <ThemedView style={styles.userInfo}>
            {user?.firstname ? (
              <ThemedText type='title' style={styles.userName}>
                {`${user.title || ''}${user.firstname} ${user.lastname}`}
              </ThemedText>
            ) : (
              <ActivityIndicator
                size='small'
                color={tintColor}
                style={{ marginVertical: 8 }}
              />
            )}
            <ThemedText style={[styles.userRole, { color: tintColor }]}>
              {user?.id || ''}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Stats Section */}
        <ThemedView style={styles.statsContainer}>
          <ThemedView style={styles.statItem}>
            <IconSymbol name='book.closed' size={32} color={tintColor} />
            <ThemedText
              type='title'
              style={[styles.statNumber, { color: tintColor }]}
            >
              {user?.completedCourses || 0}
            </ThemedText>
            <ThemedText style={styles.statLabel}>
              เนื้อหาที่เรียนจบแล้ว
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.statDivider} />

          <TouchableOpacity
            style={styles.statItem}
            onPress={() => router.push('/coins' as any)}
          >
            <IconSymbol name='star.circle' size={32} color={tintColor} />
            <ThemedText
              type='title'
              style={[styles.statNumber, { color: tintColor }]}
            >
              {user?.totalHours || 0}
            </ThemedText>
            <ThemedText style={styles.statLabel}>คะแนนการเรียนรู้</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {/* Profile Details */}
        {/* <ThemedView style={styles.detailsContainer}>
          <ThemedText type='subtitle' style={styles.sectionTitle}>
            ข้อมูลส่วนตัว
          </ThemedText>

          <ThemedView style={styles.detailItem}>
            <IconSymbol name='calendar' size={20} color={iconColor} />
            <ThemedView style={styles.detailContent}>
              <ThemedText style={styles.detailLabel}>
                สมัครสมาชิกเมื่อ
              </ThemedText>
              <ThemedText type='defaultSemiBold'>
                {mockUser.joinDate}
              </ThemedText>
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.detailItem}>
            <IconSymbol name='envelope' size={20} color={iconColor} />
            <ThemedView style={styles.detailContent}>
              <ThemedText style={styles.detailLabel}>อีเมล</ThemedText>
              <ThemedText type='defaultSemiBold'>{mockUser.email}</ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView> */}

        {/* Action Buttons */}
        <ThemedView style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={handlePrintCertificate}
          >
            <IconSymbol name='printer' size={20} color={tintColor} />
            <ThemedText style={[styles.actionButtonText, { color: tintColor }]}>
              พิมพ์ประกาศนียบัตร ก.พ.
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() =>
              router.push({
                pathname: '/portal-webview',
                params: {
                  url: `${PORTAL_URL}history`,
                  title: 'ประวัติการเรียน',
                },
              })
            }
          >
            <IconSymbol name='doc.text' size={20} color={tintColor} />
            <ThemedText style={[styles.actionButtonText, { color: tintColor }]}>
              ประวัติการเรียน
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() =>
              router.push({
                pathname: '/portal-webview',
                params: {
                  url: `${PORTAL_URL}edit`,
                  title: 'แก้ไขข้อมูลส่วนบุคคล',
                },
              })
            }
          >
            <IconSymbol name='pencil' size={20} color={tintColor} />
            <ThemedText style={[styles.actionButtonText, { color: tintColor }]}>
              แก้ไขข้อมูลส่วนบุคคล
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() =>
              router.push({
                pathname: '/portal-webview',
                params: {
                  url: `${PORTAL_URL}reset`,
                  title: 'ตั้งรหัสผ่านใหม่',
                },
              })
            }
          >
            <IconSymbol name='lock' size={20} color={tintColor} />
            <ThemedText style={[styles.actionButtonText, { color: tintColor }]}>
              ตั้งรหัสผ่านใหม่ / ลืมรหัสผ่าน
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() =>
              router.push({
                pathname: '/portal-webview',
                params: {
                  url: `${PORTAL_URL}otp`,
                  title: 'ตั้งค่า OTP',
                },
              })
            }
          >
            <IconSymbol name='gear' size={20} color={tintColor} />
            <ThemedText style={[styles.actionButtonText, { color: tintColor }]}>
              ตั้งค่า OTP
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: tintColor, marginTop: 16 },
            ]}
            onPress={handleLogout}
          >
            <IconSymbol name='arrow.right.square' size={20} color='white' />
            <ThemedText style={styles.actionButtonText}>ออกจากระบบ</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {/* Footer */}
        <ThemedView style={styles.footer}>
          <ThemedText
            style={[
              styles.footerText,
              { fontFamily: 'Prompt-SemiBold', fontSize: 13, marginBottom: 10 },
            ]}
          >
            สำนักงานคณะกรรมการข้าราชการพลเรือน (สำนักงาน ก.พ.)
          </ThemedText>
          <ThemedText style={styles.footerText}>
            47/111 หมู่ 4 ถนนติวานนท์ ตำบลตลาดขวัญ{'\n'}อำเภอเมือง
            จังหวัดนนทบุรี 11000
          </ThemedText>
          <ThemedText style={[styles.footerText, styles.footerHighlight]}>
            นโยบายและแนวปฏิบัติในการคุ้มครองข้อมูลส่วนบุคคล
          </ThemedText>
          <ThemedText style={styles.footerText}>
            Copyright © 2568 Office of the Civil Service Commission
          </ThemedText>
        </ThemedView>
      </ScrollView>
      <StatusBarGradient />
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  required: {
    color: '#ff4444',
  },
  // Login styles
  loginContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  loginScrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 80 : 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 12,
    color: '#183A7C',
  },
  loginCard: {
    width: '100%',
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 1,
    marginTop: 0,
    backgroundColor: 'white',
  },

  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: 'Prompt-SemiBold',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 12 : 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 0,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontFamily: 'Prompt-Regular',
  },
  passwordToggle: {
    padding: 4,
  },
  forgotPassword: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontFamily: 'Prompt-Regular',
    marginRight: 4,
  },

  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#E0E0E0',
    marginBottom: 24,
  },
  registrationContainer: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  registrationText: {
    fontSize: 14,
    color: '#666',
  },
  registrationLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  registrationLinkText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  arrowIcon: {
    marginLeft: 2,
  },
  // Tab styles
  tabSection: {},
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  tabButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 0,
    transform: [{ scale: 1 }],
  },

  tabIcon: {
    width: 24,
    height: 24,
    marginBottom: 6,
  },

  tabContent: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Prompt-Medium',
    color: '#666666',
    textAlign: 'center',
  },

  // Existing account styles
  profileHeader: {
    alignItems: 'center',
    paddingTop: 100,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 0,
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 0,
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    marginBottom: 4,
    textAlign: 'center',
  },
  userRole: {
    fontSize: 18,
    fontFamily: 'Prompt-SemiBold',
    marginBottom: 4,
  },
  userDepartment: {
    fontSize: 16,
    opacity: 0.7,
  },
  idCard: {
    marginHorizontal: 20,
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
    elevation: 0,
  },
  idHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  idTitle: {
    marginLeft: 8,
    fontSize: 16,
  },
  userId: {
    fontSize: 24,
    fontFamily: 'Prompt-SemiBold',
    marginBottom: 4,
    letterSpacing: 1,
  },
  userEmail: {
    fontSize: 14,
    opacity: 0.7,
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
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
    elevation: 0,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E5E5',
    marginHorizontal: 20,
  },
  statNumber: {
    fontSize: 28,
    fontFamily: 'Prompt-SemiBold',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
  },
  detailsContainer: {
    marginHorizontal: 20,
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
    elevation: 0,
  },
  sectionTitle: {
    marginBottom: 20,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailContent: {
    marginLeft: 16,
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 2,
  },
  actionsContainer: {
    marginHorizontal: 20,
    marginBottom: 40,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 0,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#183A7C',
    elevation: 0,
  },
  actionButtonText: {
    fontSize: 15,
    fontFamily: 'Prompt-Medium',
    color: 'white',
    marginLeft: 8,
  },
  thaidLogo: {
    width: 24,
    height: 24,
    borderRadius: 4,
    marginRight: 6,
  },
  notificationBell: {
    position: 'absolute',
    top: 100,
    right: 30,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  notificationBadgeText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Prompt-SemiBold',
    lineHeight: 18,
  },
  loginNotificationBell: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  footerText: {
    fontSize: 12,
    lineHeight: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 14,
  },
  footerHighlight: {
    color: '#183A7C',
    fontFamily: 'Prompt-Medium',
  },
  subtitleText: {
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  regularText: {
    fontSize: 14,
    fontFamily: 'Prompt-Regular',
  },
  highlightedText: {
    fontSize: 14,
    fontFamily: 'Prompt-Medium',
    color: '#183A7C',
  },
})
