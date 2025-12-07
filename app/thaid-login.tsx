import AsyncStorage from '@react-native-async-storage/async-storage'
import { router, useLocalSearchParams } from 'expo-router'
import React, { useContext, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import { WebView, WebViewNavigation } from 'react-native-webview'

import StatusBarGradient from '@/components/StatusBarGradient'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { useThemeColor } from '@/hooks/useThemeColor'
import * as uiActions from '@/modules/ui/actions'
import * as userActions from '@/modules/user/actions'
import type { AppDispatch } from '@/store/types'
import { THAID_API_URL, THAID_REDIRECT_URI } from '@env'
import { useDispatch } from 'react-redux'
import { LoginContext } from './(tabs)/_layout'

// Callback URL patterns to detect - the server redirects here with the code
const CALLBACK_PATTERNS = [
  'learningportal.ocsc.go.th/callback',
  'learningportal.ocsc.go.th/thaid',
  '/callback2.html',
  '/callback.html',
  'ocsclearningspace://',
]

export default function ThaiDLoginScreen() {
  const backgroundColor = useThemeColor({}, 'background')
  const tintColor = useThemeColor({}, 'tint')
  const iconColor = useThemeColor({}, 'icon')

  const params = useLocalSearchParams<{ authUrl?: string; state?: string }>()
  const authUrl = params.authUrl
  const expectedState = params.state

  const webViewRef = useRef<WebView>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const dispatch = useDispatch<AppDispatch>()
  const { setIsLoggedIn } = useContext(LoginContext)

  const handleBack = () => {
    router.back()
  }

  // Check if URL is a callback URL (not the original auth URL)
  const isCallbackUrl = (url: string): boolean => {
    // Check if URL matches any callback patterns
    const matchesPattern = CALLBACK_PATTERNS.some((pattern) =>
      url.includes(pattern)
    )

    // Also check if URL starts with our redirect URI
    const startsWithRedirectUri = THAID_REDIRECT_URI
      ? url.startsWith(THAID_REDIRECT_URI)
      : false

    // URL should have code= parameter AND match a callback pattern
    const hasCode = url.includes('code=')

    return hasCode && (matchesPattern || startsWithRedirectUri)
  }

  // Helper function to extract parameters from URL (handles both query string and fragment)
  const extractParamsFromUrl = (
    url: string
  ): { code: string | null; state: string | null } => {
    let code: string | null = null
    let state: string | null = null

    try {
      // First try standard URL parsing
      const urlObj = new URL(url)
      code = urlObj.searchParams.get('code')
      state = urlObj.searchParams.get('state')

      // If not found in query string, check the hash/fragment
      if (!code && urlObj.hash) {
        const hashParams = new URLSearchParams(urlObj.hash.substring(1))
        code = hashParams.get('code')
        state = state || hashParams.get('state')
      }

      // If still not found, try regex extraction as fallback
      if (!code) {
        const codeMatch = url.match(/[?&#]code=([^&#]+)/)
        if (codeMatch) code = decodeURIComponent(codeMatch[1])
      }
      if (!state) {
        const stateMatch = url.match(/[?&#]state=([^&#]+)/)
        if (stateMatch) state = decodeURIComponent(stateMatch[1])
      }
    } catch (e) {
      // If URL parsing fails, use regex
      console.log('[ThaiDLogin] URL parsing failed, using regex')
      const codeMatch = url.match(/[?&#]code=([^&#]+)/)
      const stateMatch = url.match(/[?&#]state=([^&#]+)/)
      if (codeMatch) code = decodeURIComponent(codeMatch[1])
      if (stateMatch) state = decodeURIComponent(stateMatch[1])
    }

    return { code, state }
  }

  // Process the callback URL with authorization code
  const processCallback = async (url: string) => {
    if (isProcessing) return

    setIsProcessing(true)
    console.log('[ThaiDLogin] Processing callback URL')
    console.log('[ThaiDLogin] Full URL:', url)

    try {
      // Parse the URL to get the code and state
      const { code, state: returnedState } = extractParamsFromUrl(url)

      console.log('[ThaiDLogin] Code:', code)
      console.log('[ThaiDLogin] Returned state:', returnedState)
      console.log('[ThaiDLogin] Expected state:', expectedState)

      // Only verify state if we have an expected state AND the URL returned a state
      if (expectedState && returnedState && returnedState !== expectedState) {
        throw new Error('State mismatch - possible CSRF attack')
      }

      if (!code) {
        throw new Error('No authorization code received')
      }

      // Exchange code for token
      console.log(
        '[ThaiDLogin] Exchanging code for token at:',
        `${THAID_API_URL}?code=${code}`
      )

      const response = await fetch(`${THAID_API_URL}?code=${code}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const responseText = await response.text()
      console.log('[ThaiDLogin] Token exchange response:', responseText)

      if (!response.ok) {
        throw new Error(`Failed to exchange code for token: ${responseText}`)
      }

      const data = JSON.parse(responseText)

      if (data.token) {
        console.log('[ThaiDLogin] Login successful!')

        // Store token in AsyncStorage
        await AsyncStorage.setItem('token', data.token)
        console.log(
          '[ThaiDLogin] Token stored in AsyncStorage:',
          data.token.substring(0, 50) + '...'
        )

        // Load user data
        dispatch(userActions.loadUser())

        // Update login state
        setIsLoggedIn(true)

        dispatch(
          uiActions.setFlashMessage('เข้าสู่ระบบเรียบร้อยแล้ว', 'success')
        )

        // Navigate back to account tab
        setTimeout(() => {
          router.replace('/(tabs)?tab=account')
        }, 300)
      } else {
        throw new Error('No token received')
      }
    } catch (error: any) {
      console.error('[ThaiDLogin] Error:', error)
      dispatch(
        uiActions.setFlashMessage(
          error?.message || 'เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง',
          'error'
        )
      )
      setIsProcessing(false)
      router.back()
    }
  }

  // Intercept URL requests before they load
  const handleShouldStartLoadWithRequest = (request: {
    url: string
    [key: string]: any
  }): boolean => {
    const url = request.url
    console.log('[ThaiDLogin] Request URL:', url)

    // Check if this is a callback URL with authorization code
    if (isCallbackUrl(url)) {
      console.log('[ThaiDLogin] ✅ Detected callback URL!')
      processCallback(url)
      return false // Prevent loading the callback URL
    }

    return true // Allow other URLs to load
  }

  const handleNavigationStateChange = (navState: WebViewNavigation) => {
    console.log('[ThaiDLogin] Navigation state:', navState.url)
  }

  const handleLoadEnd = () => {
    setIsLoading(false)
  }

  if (!authUrl) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <ThemedView style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <IconSymbol name='chevron.left' size={24} color={iconColor} />
            </TouchableOpacity>
            <ThemedText type='title' style={styles.headerTitle}>
              ThaiD Login
            </ThemedText>
            <View style={styles.backButton} />
          </View>
        </ThemedView>
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>
            ไม่พบ URL สำหรับเข้าสู่ระบบ
          </ThemedText>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: tintColor }]}
            onPress={handleBack}
          >
            <ThemedText style={styles.retryButtonText}>กลับ</ThemedText>
          </TouchableOpacity>
        </View>
        <StatusBarGradient />
      </ThemedView>
    )
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <ThemedView style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <IconSymbol name='chevron.left' size={24} color={iconColor} />
          </TouchableOpacity>
          <ThemedText type='title' style={styles.headerTitle}>
            เข้าสู่ระบบด้วย ThaiD
          </ThemedText>
          <View style={styles.backButton} />
        </View>
      </ThemedView>

      {/* Processing overlay */}
      {isProcessing && (
        <View style={styles.processingOverlay}>
          <ActivityIndicator size='large' color={tintColor} />
          <ThemedText style={styles.processingText}>
            กำลังเข้าสู่ระบบ...
          </ThemedText>
        </View>
      )}

      {/* WebView */}
      <WebView
        ref={webViewRef}
        source={{ uri: authUrl }}
        style={styles.webview}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size='large' color={tintColor} />
            <ThemedText style={styles.loadingText}>กำลังโหลด...</ThemedText>
          </View>
        )}
        onLoadEnd={handleLoadEnd}
        onNavigationStateChange={handleNavigationStateChange}
        onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        sharedCookiesEnabled={true}
        thirdPartyCookiesEnabled={true}
        userAgent='Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent
          console.warn('[ThaiDLogin] WebView error:', nativeEvent)
        }}
      />

      <StatusBarGradient />
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
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    opacity: 0.6,
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    zIndex: 100,
  },
  processingText: {
    marginTop: 16,
    fontSize: 18,
    fontFamily: 'Prompt-Medium',
    color: '#1F2937',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Prompt-Regular',
    color: '#6B7280',
    marginBottom: 20,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontFamily: 'Prompt-SemiBold',
    color: 'white',
  },
})
