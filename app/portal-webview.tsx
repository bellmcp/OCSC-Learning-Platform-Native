import AsyncStorage from '@react-native-async-storage/async-storage'
import { router, useLocalSearchParams } from 'expo-router'
import React, { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import { WebView } from 'react-native-webview'

import StatusBarGradient from '@/components/StatusBarGradient'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { useThemeColor } from '@/hooks/useThemeColor'

/**
 * Portal WebView Screen
 * Opens portal pages (edit profile, history, password reset, OTP settings)
 * with authentication token injected as cookie
 */
export default function PortalWebViewScreen() {
  const { url, title } = useLocalSearchParams<{ url: string; title: string }>()
  const backgroundColor = useThemeColor({}, 'background')
  const tintColor = useThemeColor({}, 'tint')
  const iconColor = useThemeColor({}, 'icon')

  const webViewRef = useRef<WebView>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isTokenLoading, setIsTokenLoading] = useState(true)

  // Load token from AsyncStorage
  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token')
        setToken(storedToken)
      } catch (error) {
        console.error('[PortalWebView] Error loading token:', error)
      } finally {
        setIsTokenLoading(false)
      }
    }
    loadToken()
  }, [])

  // JavaScript to inject cookie before page loads
  // This sets the token cookie so the portal can authenticate
  const injectedJavaScript = token
    ? `
    (function() {
      document.cookie = "token=${token}; path=/; domain=.ocsc.go.th; SameSite=Lax";
      document.cookie = "token=${token}; path=/";
    })();
    true;
  `
    : ''

  // Handle reload
  const handleReload = () => {
    webViewRef.current?.reload()
  }

  // Handle back navigation
  const handleBack = () => {
    router.back()
  }

  // Page title to display
  const pageTitle = title || 'โปรไฟล์'

  // If no URL or still loading token, show loading state
  if (!url || isTokenLoading) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <ThemedView style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <IconSymbol name='chevron.left' size={24} color={iconColor} />
            </TouchableOpacity>
            <ThemedText type='title' style={styles.headerTitle}>
              {pageTitle}
            </ThemedText>
            <View style={styles.backButton} />
          </View>
        </ThemedView>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color={tintColor} />
          <ThemedText style={styles.loadingText}>กำลังโหลด...</ThemedText>
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
            {pageTitle}
          </ThemedText>
          <TouchableOpacity style={styles.backButton} onPress={handleReload}>
            <IconSymbol name='arrow.clockwise' size={20} color={iconColor} />
          </TouchableOpacity>
        </View>
      </ThemedView>

      {/* WebView */}
      <WebView
        ref={webViewRef}
        source={{ uri: url }}
        style={styles.webview}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.webviewLoading}>
            <ActivityIndicator size='large' color={tintColor} />
          </View>
        )}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent
          console.warn('WebView error:', nativeEvent)
        }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        scalesPageToFit={true}
        // Inject token as cookie before page loads
        injectedJavaScriptBeforeContentLoaded={injectedJavaScript}
        // Share cookies between requests
        sharedCookiesEnabled={true}
        // Allow third-party cookies
        thirdPartyCookiesEnabled={true}
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
  webview: {
    flex: 1,
  },
  webviewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
})
