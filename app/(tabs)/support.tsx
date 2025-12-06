import AsyncStorage from '@react-native-async-storage/async-storage'
import React, { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import { WebView } from 'react-native-webview'
import { useSelector } from 'react-redux'

import StatusBarGradient from '@/components/StatusBarGradient'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { useThemeColor } from '@/hooks/useThemeColor'
import type { RootState } from '@/store/types'

export default function SupportScreen() {
  const backgroundColor = useThemeColor({}, 'background')
  const tintColor = useThemeColor({}, 'tint')
  const iconColor = useThemeColor({}, 'icon')

  const webViewRef = useRef<WebView>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isTokenLoading, setIsTokenLoading] = useState(true)

  // Get support info from Redux
  const { supportInfo } = useSelector((state: RootState) => state.ui)

  const supportUrl = supportInfo?.url || ''
  const supportTitle = supportInfo?.text || 'ช่วยเหลือ'

  // Load token from AsyncStorage
  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token')
        setToken(storedToken)
      } catch (error) {
        console.error('[Support] Error loading token:', error)
      } finally {
        setIsTokenLoading(false)
      }
    }
    loadToken()
  }, [])

  // JavaScript to inject cookie before page loads
  // This sets the token cookie so the chatbot can authenticate
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

  // If no URL or still loading token, show loading state
  if (!supportUrl || isTokenLoading) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <ThemedView style={styles.header}>
          <ThemedText type='title' style={styles.headerTitle}>
            {supportTitle}
          </ThemedText>
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
        <View style={styles.headerContent}>
          <ThemedText type='title' style={styles.headerTitle}>
            {supportTitle}
          </ThemedText>
          <TouchableOpacity style={styles.reloadButton} onPress={handleReload}>
            <IconSymbol
              name='arrow.clockwise'
              size={20}
              color={iconColor}
              style={{ marginBottom: 10 }}
            />
          </TouchableOpacity>
        </View>
      </ThemedView>

      {/* WebView */}
      <WebView
        ref={webViewRef}
        source={{ uri: supportUrl }}
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
    paddingTop: Platform.OS === 'ios' ? 80 : 40,
    paddingHorizontal: 20,
    paddingBottom: 0,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  headerTitle: {
    textAlign: 'center',
  },
  reloadButton: {
    position: 'absolute',
    right: 0,
    padding: 8,
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
