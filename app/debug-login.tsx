import AsyncStorage from '@react-native-async-storage/async-storage'
import { router } from 'expo-router'
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
import * as userActions from '@/modules/user/actions'
import type { AppDispatch } from '@/store/types'
import { useDispatch } from 'react-redux'
import { LoginContext } from './(tabs)/_layout'

const DEBUG_LOGIN_URL = 'https://learningportal.ocsc.go.th/helpdesk/login.html'

export default function DebugLoginScreen() {
  const backgroundColor = useThemeColor({}, 'background')
  const tintColor = useThemeColor({}, 'tint')
  const iconColor = useThemeColor({}, 'icon')

  const webViewRef = useRef<WebView>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasProcessedToken, setHasProcessedToken] = useState(false)
  const initialTokenRef = useRef<string | null>(null)
  const initialTokenCaptured = useRef(false)
  const dispatch = useDispatch<AppDispatch>()
  const { setIsLoggedIn } = useContext(LoginContext)

  const handleBack = () => {
    router.back()
  }

  const handleReload = () => {
    setHasProcessedToken(false)
    initialTokenRef.current = null
    initialTokenCaptured.current = false
    webViewRef.current?.reload()
  }

  // JavaScript to clear token cookie before page loads
  const clearTokenScript = `
    (function() {
      // Clear the token cookie on all possible domains
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.ocsc.go.th;';
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=learningportal.ocsc.go.th;';
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      console.log('[DebugLogin] Token cookie cleared');
    })();
    true;
  `

  // Script to capture the initial token (if any) on first load
  const captureInitialTokenScript = `
    (function() {
      try {
        const cookies = document.cookie || '';
        const tokenMatch = cookies.match(/token=([^;]+)/);
        const token = tokenMatch && tokenMatch[1] ? tokenMatch[1] : null;
        if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ 
            type: 'initial_token', 
            token: token 
          }));
        }
      } catch(e) {
        console.error('Error capturing initial token:', e);
      }
    })();
    true;
  `

  // Check for token periodically
  const checkTokenScript = `
    (function() {
      try {
        let checkCount = 0;
        const maxChecks = 300; // Check for 5 minutes max
        
        const intervalId = setInterval(function() {
          try {
            checkCount++;
            if (checkCount > maxChecks) {
              clearInterval(intervalId);
              return;
            }
            
            const cookies = document.cookie || '';
            const tokenMatch = cookies.match(/token=([^;]+)/);
            if (tokenMatch && tokenMatch[1] && tokenMatch[1].length > 10) {
              if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ 
                  type: 'token', 
                  token: tokenMatch[1] 
                }));
              }
            }
          } catch(e) {
            console.error('Error in token check interval:', e);
          }
        }, 1000);
      } catch(e) {
        console.error('Error setting up token check:', e);
      }
    })();
    true;
  `

  const handleMessage = async (event: any) => {
    try {
      const rawData = event?.nativeEvent?.data
      if (!rawData) {
        console.log('[DebugLogin] No data in message')
        return
      }

      const data = JSON.parse(rawData)
      console.log('[DebugLogin] Received message:', data?.type)

      if (data?.type === 'initial_token') {
        // Store the initial token to compare later
        initialTokenRef.current = data?.token || null
        console.log(
          '[DebugLogin] Initial token captured:',
          data?.token ? 'exists' : 'none'
        )
        return
      }

      if (data?.type === 'token' && data?.token && !hasProcessedToken) {
        const token = data.token

        // Only process if the token is different from the initial one
        // This means the user actually logged in
        if (initialTokenRef.current === token) {
          console.log('[DebugLogin] Token is same as initial, ignoring...')
          return
        }

        console.log('[DebugLogin] New token received, length:', token.length)
        setHasProcessedToken(true)

        // Store token in AsyncStorage
        await AsyncStorage.setItem('token', token)
        console.log('[DebugLogin] Token saved to AsyncStorage')

        // Update login state
        setIsLoggedIn(true)

        // Load user info
        dispatch(userActions.loadUser())

        // Navigate to account tab
        router.replace('/(tabs)?tab=account')
      }
    } catch (error) {
      console.error('[DebugLogin] Error parsing message:', error)
    }
  }

  const handleNavigationStateChange = (navState: WebViewNavigation) => {
    console.log('[DebugLogin] Navigation:', navState.url)

    // Re-inject token check script on navigation (page might have changed)
    if (!navState.loading && webViewRef.current && !hasProcessedToken) {
      console.log(
        '[DebugLogin] Re-injecting token check script after navigation'
      )
      webViewRef.current.injectJavaScript(checkTokenScript)
    }
  }

  const handleLoadEnd = () => {
    setIsLoading(false)

    if (webViewRef.current) {
      // Only capture initial token once (on first page load)
      if (!initialTokenCaptured.current) {
        console.log('[DebugLogin] Capturing initial token...')
        webViewRef.current.injectJavaScript(captureInitialTokenScript)
        initialTokenCaptured.current = true
      }

      // Always inject the token check script on every page load
      console.log('[DebugLogin] Injecting token check script...')
      setTimeout(() => {
        webViewRef.current?.injectJavaScript(checkTokenScript)
      }, 500)
    }
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
            Debug Login
          </ThemedText>
          <TouchableOpacity style={styles.backButton} onPress={handleReload}>
            <IconSymbol name='arrow.clockwise' size={20} color={iconColor} />
          </TouchableOpacity>
        </View>
      </ThemedView>

      {/* Info Banner */}
      <ThemedView style={styles.infoBanner}>
        <IconSymbol name='exclamationmark.triangle' size={16} color='#F59E0B' />
        <ThemedText style={styles.infoText}>
          เข้าสู่ระบบเพื่อดีบัก - Token จะถูกบันทึกอัตโนมัติ
        </ThemedText>
      </ThemedView>

      {/* WebView */}
      <WebView
        ref={webViewRef}
        source={{ uri: DEBUG_LOGIN_URL }}
        style={styles.webview}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size='large' color={tintColor} />
            <ThemedText style={styles.loadingText}>กำลังโหลด...</ThemedText>
          </View>
        )}
        injectedJavaScriptBeforeContentLoaded={clearTokenScript}
        onLoadEnd={handleLoadEnd}
        onNavigationStateChange={handleNavigationStateChange}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        sharedCookiesEnabled={true}
        thirdPartyCookiesEnabled={true}
        cacheEnabled={false}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent
          console.warn('[DebugLogin] WebView error:', nativeEvent)
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
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#FEF3C7',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#92400E',
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
})
