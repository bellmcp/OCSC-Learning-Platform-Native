import AsyncStorage from '@react-native-async-storage/async-storage'
import { useLocalSearchParams } from 'expo-router'
import * as React from 'react'
import { BottomNavigation, useTheme } from 'react-native-paper'
import AccountScreen from './account'
import HomeScreen from './index'
import LearnScreen from './learn'
import SearchScreen from './search'
import SupportScreen from './support'

// Create a context for sharing login state and tab navigation
export const LoginContext = React.createContext({
  isLoggedIn: false,
  setIsLoggedIn: (value: boolean) => {},
  goToAccountTab: () => {},
})

export default function TabLayout() {
  const theme = useTheme()
  const [index, setIndex] = React.useState(0)
  const [isLoggedIn, setIsLoggedIn] = React.useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = React.useState(true)
  const params = useLocalSearchParams<{ tab?: string }>()

  // Log state changes
  React.useEffect(() => {
    console.log('[TabLayout] isLoggedIn state changed to:', isLoggedIn)
  }, [isLoggedIn])

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
      setIndex(4) // account is at index 4 when logged in
    } else {
      setIndex(2) // account is at index 2 when not logged in
    }
  }, [isLoggedIn])

  // Handle tab parameter from URL
  React.useEffect(() => {
    if (params.tab === 'account') {
      goToAccountTab()
    }
  }, [params.tab, goToAccountTab])

  // Define routes based on login state
  const routes = React.useMemo(() => {
    console.log('[TabLayout] Rebuilding routes, isLoggedIn:', isLoggedIn)
    if (isLoggedIn) {
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
          key: 'learn',
          title: 'เข้าเรียน',
          focusedIcon: 'play',
          unfocusedIcon: 'play-outline',
        },
        {
          key: 'support',
          title: 'ช่วยเหลือ',
          focusedIcon: 'help-circle',
          unfocusedIcon: 'help-circle-outline',
        },
        {
          key: 'account',
          title: 'บัญชี',
          focusedIcon: 'account',
          unfocusedIcon: 'account-outline',
        },
      ]
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
  }, [isLoggedIn])

  // Ensure index is always valid for current routes
  const validIndex = Math.min(index, routes.length - 1)

  const renderScene = ({ route, jumpTo }: any) => {
    switch (route.key) {
      case 'home':
        return <HomeScreen key={`home-${validIndex}`} />
      case 'search':
        return <SearchScreen key={`search-${validIndex}`} />
      case 'learn':
        return isLoggedIn ? <LearnScreen key={`learn-${validIndex}`} /> : null
      case 'support':
        return isLoggedIn ? (
          <SupportScreen key={`support-${validIndex}`} />
        ) : null
      case 'account':
        return <AccountScreen key={`account-${validIndex}`} />
      default:
        return null
    }
  }

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
    <LoginContext.Provider value={{ isLoggedIn, setIsLoggedIn, goToAccountTab }}>
      <BottomNavigation
        navigationState={{ index: validIndex, routes }}
        onIndexChange={setIndex}
        renderScene={renderScene}
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
