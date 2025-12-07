import AsyncStorage from '@react-native-async-storage/async-storage'
import { useLocalSearchParams } from 'expo-router'
import * as React from 'react'
import { StyleSheet, View } from 'react-native'
import { BottomNavigation, useTheme } from 'react-native-paper'
import { useDispatch, useSelector } from 'react-redux'

import * as uiActions from '@/modules/ui/actions'
import type { AppDispatch, RootState } from '@/store/types'
import AccountScreen from './account'
import HomeScreen from './index'
import LearnScreen from './learn'
import SearchScreen from './search'
import SupportScreen from './support'

// Scene wrapper that keeps scenes mounted but hidden when not active
// Uses position absolute + opacity instead of display:none to prevent image reloading
const SceneWrapper = React.memo(
  ({
    children,
    isActive,
    shouldRender,
  }: {
    children: React.ReactNode
    isActive: boolean
    shouldRender: boolean
  }) => {
    if (!shouldRender) return null
    return (
      <View
        style={[sceneStyles.scene, !isActive && sceneStyles.hidden]}
        pointerEvents={isActive ? 'auto' : 'none'}
      >
        {children}
      </View>
    )
  }
)

const sceneStyles = StyleSheet.create({
  scene: {
    flex: 1,
  },
  hidden: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
  },
})

// Create a context for sharing login state and tab navigation
export const LoginContext = React.createContext({
  isLoggedIn: false,
  setIsLoggedIn: (value: boolean) => {},
  goToAccountTab: () => {},
})

export default function TabLayout() {
  const theme = useTheme()
  const dispatch = useDispatch<AppDispatch>()
  const [index, setIndex] = React.useState(0)
  const [isLoggedIn, setIsLoggedIn] = React.useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = React.useState(true)
  const params = useLocalSearchParams<{ tab?: string }>()

  // Get support info from Redux
  const { supportInfo } = useSelector((state: RootState) => state.ui)

  // Determine if support tab should be shown (logged in AND not hidden)
  const showSupportTab = isLoggedIn && !supportInfo?.isHidden

  // Log state changes
  React.useEffect(() => {
    console.log('[TabLayout] isLoggedIn state changed to:', isLoggedIn)
  }, [isLoggedIn])

  // Load support info when logged in
  React.useEffect(() => {
    if (isLoggedIn) {
      console.log('[TabLayout] Loading support info...')
      dispatch(uiActions.loadSupportInfo())
    }
  }, [isLoggedIn, dispatch])

  // Check for existing token on mount
  React.useEffect(() => {
    const checkLoginStatus = async () => {
      console.log('[TabLayout] Checking for stored token...')
      try {
        const token = await AsyncStorage.getItem('token')
        if (token) {
          console.log('[TabLayout] ✅ Token found! Setting isLoggedIn to TRUE')
          setIsLoggedIn(true)
        } else {
          console.log('[TabLayout] ❌ No token found, user is NOT logged in')
          setIsLoggedIn(false)
        }
      } catch (error) {
        console.error('[TabLayout] Error checking login status:', error)
        setIsLoggedIn(false)
      } finally {
        setIsCheckingAuth(false)
        console.log('[TabLayout] Auth check complete')
      }
    }

    checkLoginStatus()
  }, [])

  // Function to navigate to account tab
  const goToAccountTab = React.useCallback(() => {
    if (isLoggedIn) {
      // Account index depends on whether support tab is shown
      setIndex(showSupportTab ? 4 : 3) // account is at index 4 with support, 3 without
    } else {
      setIndex(2) // account is at index 2 when not logged in
    }
  }, [isLoggedIn, showSupportTab])

  // Handle tab parameter from URL
  React.useEffect(() => {
    if (params.tab === 'account') {
      goToAccountTab()
    } else if (params.tab === 'learn' && isLoggedIn) {
      setIndex(2) // learn is at index 2 when logged in
    }
  }, [params.tab, goToAccountTab, isLoggedIn])

  // Define routes based on login state and support info
  const routes = React.useMemo(() => {
    console.log(
      '[TabLayout] Rebuilding routes, isLoggedIn:',
      isLoggedIn,
      'showSupportTab:',
      showSupportTab
    )
    if (isLoggedIn) {
      const loggedInRoutes = [
        {
          key: 'home',
          title: 'หน้าหลัก',
          focusedIcon: 'home',
          unfocusedIcon: 'home-outline',
        },
        {
          key: 'search',
          title: 'ค้นหา',
          focusedIcon: 'magnify',
          unfocusedIcon: 'magnify',
        },
        {
          key: 'learn',
          title: 'เข้าเรียน',
          focusedIcon: 'play',
          unfocusedIcon: 'play-outline',
        },
      ]

      // Add support tab only if not hidden
      if (showSupportTab) {
        loggedInRoutes.push({
          key: 'support',
          title: supportInfo?.text || 'ช่วยเหลือ',
          focusedIcon: 'robot',
          unfocusedIcon: 'robot-outline',
        })
      }

      loggedInRoutes.push({
        key: 'account',
        title: 'บัญชี',
        focusedIcon: 'account',
        unfocusedIcon: 'account-outline',
      })

      return loggedInRoutes
    } else {
      return [
        {
          key: 'home',
          title: 'หน้าหลัก',
          focusedIcon: 'home',
          unfocusedIcon: 'home-outline',
        },
        {
          key: 'search',
          title: 'ค้นหา',
          focusedIcon: 'magnify',
          unfocusedIcon: 'magnify',
        },
        {
          key: 'account',
          title: 'บัญชี',
          focusedIcon: 'account',
          unfocusedIcon: 'account-outline',
        },
      ]
    }
  }, [isLoggedIn, showSupportTab, supportInfo?.text])

  // Ensure index is always valid for current routes
  const validIndex = Math.min(index, routes.length - 1)

  // Track which scenes have been visited (for lazy loading while preserving state)
  const [visitedScenes, setVisitedScenes] = React.useState<Set<string>>(
    new Set(['home'])
  )

  // Update visited scenes when index changes
  React.useEffect(() => {
    const currentRoute = routes[validIndex]
    if (currentRoute && !visitedScenes.has(currentRoute.key)) {
      setVisitedScenes((prev) => new Set([...prev, currentRoute.key]))
    }
  }, [validIndex, routes, visitedScenes])

  // Custom render scene that keeps all visited scenes mounted
  const renderScene = React.useCallback(
    ({ route }: any) => {
      const currentRouteKey = routes[validIndex]?.key
      const isActive = route.key === currentRouteKey
      const shouldRender = visitedScenes.has(route.key)

      switch (route.key) {
        case 'home':
          return (
            <SceneWrapper isActive={isActive} shouldRender={shouldRender}>
              <HomeScreen />
            </SceneWrapper>
          )
        case 'search':
          return (
            <SceneWrapper isActive={isActive} shouldRender={shouldRender}>
              <SearchScreen />
            </SceneWrapper>
          )
        case 'learn':
          return isLoggedIn ? (
            <SceneWrapper isActive={isActive} shouldRender={shouldRender}>
              <LearnScreen />
            </SceneWrapper>
          ) : null
        case 'support':
          return isLoggedIn ? (
            <SceneWrapper isActive={isActive} shouldRender={shouldRender}>
              <SupportScreen />
            </SceneWrapper>
          ) : null
        case 'account':
          return (
            <SceneWrapper isActive={isActive} shouldRender={shouldRender}>
              <AccountScreen />
            </SceneWrapper>
          )
        default:
          return null
      }
    },
    [isLoggedIn, validIndex, routes, visitedScenes]
  )

  // Reset index when login state changes to prevent invalid indices
  React.useEffect(() => {
    if (index >= routes.length) {
      setIndex(0)
    }
  }, [routes.length, index])

  // Reset to home tab when logging out to prevent navigation errors
  React.useEffect(() => {
    if (!isLoggedIn && index > 2) {
      setIndex(0) // Reset to home tab when logged out
    }
  }, [isLoggedIn, index])

  // Show loading while checking auth
  if (isCheckingAuth) {
    console.log('[TabLayout] Still checking auth, showing loading...')
    return null // or a loading spinner
  }

  console.log('[TabLayout] Rendering with isLoggedIn:', isLoggedIn)

  return (
    <LoginContext.Provider
      value={{ isLoggedIn, setIsLoggedIn, goToAccountTab }}
    >
      <BottomNavigation
        navigationState={{ index: validIndex, routes }}
        onIndexChange={setIndex}
        renderScene={renderScene}
        sceneAnimationEnabled={false}
        sceneAnimationType='shifting'
        activeColor={theme.colors.primary}
        inactiveColor={theme.colors.onSurfaceVariant}
        labelMaxFontSizeMultiplier={1}
        barStyle={{
          backgroundColor: theme.colors.surface,
          borderTopWidth: 0.5,
          borderTopColor: '#F0F0F0',
          height: 100,
          paddingHorizontal: 14,
        }}
        theme={{
          ...theme,
          fonts: {
            ...theme.fonts,
            labelMedium: {
              ...theme.fonts.labelMedium,
              letterSpacing: 0,
            },
          },
        }}
      />
    </LoginContext.Provider>
  )
}
