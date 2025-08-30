import * as React from 'react'
import { BottomNavigation, useTheme } from 'react-native-paper'
import AccountScreen from './account'
import HomeScreen from './index'
import LearnScreen from './learn'
import SearchScreen from './search'
import SupportScreen from './support'

// Create a context for sharing login state
export const LoginContext = React.createContext({
  isLoggedIn: false,
  setIsLoggedIn: (value: boolean) => {},
})

export default function TabLayout() {
  const theme = useTheme()
  const [index, setIndex] = React.useState(0)
  const [isLoggedIn, setIsLoggedIn] = React.useState(false)

  // Define routes based on login state
  const routes = React.useMemo(() => {
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

  return (
    <LoginContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
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
