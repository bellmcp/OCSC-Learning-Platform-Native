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

  // Check for token periodically - check cookies, localStorage, sessionStorage, window objects, and DOM
  const checkTokenScript = `
    (function() {
      try {
        let checkCount = 0;
        const maxChecks = 300;
        let tokenFound = false;
        
        // Function to find JWT token pattern (starts with eyJ)
        function findJWT(str) {
          if (!str || typeof str !== 'string') return null;
          const jwtPattern = /eyJ[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+/g;
          const matches = str.match(jwtPattern);
          return matches && matches[0] ? matches[0] : null;
        }
        
        // Function to search object for token
        function searchForToken(obj, depth = 0) {
          if (depth > 3 || !obj) return null;
          try {
            if (typeof obj === 'string' && obj.length > 50) {
              const jwt = findJWT(obj);
              if (jwt) return jwt;
            }
            if (typeof obj === 'object') {
              for (let key of Object.keys(obj)) {
                if (key.toLowerCase().includes('token') || key.toLowerCase().includes('jwt') || key.toLowerCase().includes('auth')) {
                  const val = obj[key];
                  if (typeof val === 'string' && val.length > 50) {
                    const jwt = findJWT(val);
                    if (jwt) return jwt;
                    if (val.startsWith('eyJ')) return val;
                  }
                }
                const result = searchForToken(obj[key], depth + 1);
                if (result) return result;
              }
            }
          } catch(e) {}
          return null;
        }
        
        const intervalId = setInterval(function() {
          try {
            if (tokenFound) {
              clearInterval(intervalId);
              return;
            }
            
            checkCount++;
            if (checkCount > maxChecks) {
              clearInterval(intervalId);
              return;
            }
            
            let token = null;
            
            // 1. Check cookies
            const cookies = document.cookie || '';
            const tokenMatch = cookies.match(/token=([^;]+)/);
            if (tokenMatch && tokenMatch[1] && tokenMatch[1].length > 10) {
              token = tokenMatch[1];
            }
            
            // 2. Check localStorage
            if (!token) {
              try {
                for (let i = 0; i < localStorage.length; i++) {
                  const key = localStorage.key(i);
                  const value = localStorage.getItem(key);
                  if (value && value.length > 50) {
                    const jwt = findJWT(value);
                    if (jwt) { token = jwt; break; }
                  }
                }
              } catch(e) {}
            }
            
            // 3. Check sessionStorage
            if (!token) {
              try {
                for (let i = 0; i < sessionStorage.length; i++) {
                  const key = sessionStorage.key(i);
                  const value = sessionStorage.getItem(key);
                  if (value && value.length > 50) {
                    const jwt = findJWT(value);
                    if (jwt) { token = jwt; break; }
                  }
                }
              } catch(e) {}
            }
            
            // 4. Check window global variables
            if (!token) {
              try {
                const windowKeys = ['token', 'authToken', 'accessToken', 'jwt', 'userToken', '__INITIAL_STATE__', 'initialState', 'appState'];
                for (let key of windowKeys) {
                  if (window[key]) {
                    const result = searchForToken(window[key]);
                    if (result) { token = result; break; }
                    if (typeof window[key] === 'string' && window[key].length > 50) {
                      const jwt = findJWT(window[key]);
                      if (jwt) { token = jwt; break; }
                    }
                  }
                }
              } catch(e) {}
            }
            
            // 5. Check Redux store if exists
            if (!token) {
              try {
                if (window.__REDUX_DEVTOOLS_EXTENSION__ || window.store || window.__store__) {
                  const store = window.store || window.__store__;
                  if (store && store.getState) {
                    const state = store.getState();
                    const result = searchForToken(state);
                    if (result) token = result;
                  }
                }
              } catch(e) {}
            }
            
            // 6. Check page HTML for embedded token (some apps embed it in script tags)
            if (!token && checkCount === 1) {
              try {
                const scripts = document.querySelectorAll('script');
                for (let script of scripts) {
                  if (script.textContent && script.textContent.length > 100) {
                    const jwt = findJWT(script.textContent);
                    if (jwt) { token = jwt; break; }
                  }
                }
              } catch(e) {}
            }
            
            // Log status
            if (checkCount % 5 === 0) {
              console.log('[TokenCheck] Check #' + checkCount + ', URL: ' + window.location.href);
              console.log('[TokenCheck] Cookies length: ' + cookies.length + ', localStorage: ' + localStorage.length + ', sessionStorage: ' + sessionStorage.length);
            }
            
            if (token) {
              console.log('[TokenCheck] Token found! Length: ' + token.length);
              console.log('[TokenCheck] Token preview: ' + token.substring(0, 50) + '...');
              tokenFound = true;
              if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ 
                  type: 'token', 
                  token: token 
                }));
              }
              clearInterval(intervalId);
            }
          } catch(e) {
            console.error('Error in token check:', e.message);
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

      // Handle console messages from WebView
      if (data?.type === 'console') {
        console.log(`[WebView ${data.level}]`, data.message)
        return
      }

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
        const source = data?.source || 'unknown'

        // Only process if the token is different from the initial one
        // This means the user actually logged in
        if (initialTokenRef.current === token) {
          console.log('[DebugLogin] Token is same as initial, ignoring...')
          return
        }

        console.log(
          '[DebugLogin] New token received from:',
          source,
          ', length:',
          token.length
        )
        console.log(
          '[DebugLogin] Token preview:',
          token.substring(0, 50) + '...'
        )
        setHasProcessedToken(true)

        // Store token in AsyncStorage
        await AsyncStorage.setItem('token', token)
        console.log('[DebugLogin] Token saved to AsyncStorage')

        // Verify token was saved
        const savedToken = await AsyncStorage.getItem('token')
        console.log(
          '[DebugLogin] Verified saved token length:',
          savedToken?.length
        )

        // Update login state
        setIsLoggedIn(true)

        // Load user info
        dispatch(userActions.loadUser())

        // Navigate to account tab
        console.log('[DebugLogin] Navigating to account tab...')
        setTimeout(() => {
          router.replace('/(tabs)?tab=account')
        }, 500)
      }
    } catch (error) {
      console.error('[DebugLogin] Error parsing message:', error)
    }
  }

  const handleNavigationStateChange = (navState: WebViewNavigation) => {
    console.log('[DebugLogin] Navigation:', navState.url)

    // Check if we've navigated away from login page (login success indicator)
    const isLoginPage = navState.url.includes('/helpdesk/login')
    const isPortalPage =
      navState.url.includes('/learningportal') &&
      !navState.url.includes('/helpdesk')

    if (isPortalPage && !hasProcessedToken) {
      console.log(
        '[DebugLogin] Detected redirect to portal - login may have succeeded'
      )
    }

    // Re-inject token check script on navigation (page might have changed)
    if (!navState.loading && webViewRef.current && !hasProcessedToken) {
      console.log(
        '[DebugLogin] Re-injecting token check script after navigation'
      )

      // Also inject a script to dump all storage for debugging
      const debugScript = `
        (function() {
          try {
            console.log('[Debug] Current URL:', window.location.href);
            console.log('[Debug] All cookies:', document.cookie);
            console.log('[Debug] localStorage keys:', Object.keys(localStorage));
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              const value = localStorage.getItem(key);
              if (key && key.toLowerCase().includes('token')) {
                console.log('[Debug] Found in localStorage:', key, '=', value ? value.substring(0, 50) + '...' : 'null');
              }
            }
          } catch(e) {
            console.log('[Debug] Error:', e);
          }
        })();
        true;
      `
      webViewRef.current.injectJavaScript(debugScript)

      setTimeout(() => {
        webViewRef.current?.injectJavaScript(checkTokenScript)
      }, 500)
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
            Helpdesk
          </ThemedText>
          <TouchableOpacity style={styles.backButton} onPress={handleReload}>
            <IconSymbol name='arrow.clockwise' size={20} color={iconColor} />
          </TouchableOpacity>
        </View>
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
        injectedJavaScriptBeforeContentLoaded={`
          // Intercept console.log and network requests to capture token
          (function() {
            // Intercept console
            const originalLog = console.log;
            const originalError = console.error;
            console.log = function(...args) {
              originalLog.apply(console, args);
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'console',
                  level: 'log',
                  message: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')
                }));
              }
            };
            console.error = function(...args) {
              originalError.apply(console, args);
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'console',
                  level: 'error',
                  message: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')
                }));
              }
            };
            
            // Function to find JWT token
            function findJWT(str) {
              if (!str || typeof str !== 'string') return null;
              const jwtPattern = /eyJ[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+/g;
              const matches = str.match(jwtPattern);
              return matches && matches[0] ? matches[0] : null;
            }
            
            // Intercept XMLHttpRequest
            const originalXHROpen = XMLHttpRequest.prototype.open;
            const originalXHRSend = XMLHttpRequest.prototype.send;
            
            XMLHttpRequest.prototype.open = function(method, url) {
              this._url = url;
              return originalXHROpen.apply(this, arguments);
            };
            
            XMLHttpRequest.prototype.send = function() {
              this.addEventListener('load', function() {
                try {
                  const responseText = this.responseText;
                  if (responseText && responseText.length > 50) {
                    const jwt = findJWT(responseText);
                    if (jwt) {
                      console.log('[XHR] Found token in response from: ' + this._url);
                      if (window.ReactNativeWebView) {
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                          type: 'token',
                          token: jwt,
                          source: 'xhr'
                        }));
                      }
                    }
                  }
                } catch(e) {}
              });
              return originalXHRSend.apply(this, arguments);
            };
            
            // Intercept Fetch
            const originalFetch = window.fetch;
            window.fetch = function(...args) {
              return originalFetch.apply(this, args).then(response => {
                const clone = response.clone();
                clone.text().then(text => {
                  try {
                    if (text && text.length > 50) {
                      const jwt = findJWT(text);
                      if (jwt) {
                        console.log('[Fetch] Found token in response from: ' + args[0]);
                        if (window.ReactNativeWebView) {
                          window.ReactNativeWebView.postMessage(JSON.stringify({
                            type: 'token',
                            token: jwt,
                            source: 'fetch'
                          }));
                        }
                      }
                    }
                  } catch(e) {}
                }).catch(() => {});
                return response;
              });
            };
            
            // Clear token cookie
            document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.ocsc.go.th;';
            document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=learningportal.ocsc.go.th;';
            document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            console.log('[DebugLogin] Interceptors installed and token cookie cleared');
          })();
          true;
        `}
        onLoadEnd={handleLoadEnd}
        onNavigationStateChange={handleNavigationStateChange}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        sharedCookiesEnabled={true}
        thirdPartyCookiesEnabled={true}
        cacheEnabled={false}
        incognito={false}
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
