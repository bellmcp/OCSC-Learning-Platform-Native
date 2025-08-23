import * as React from 'react'
import { BottomNavigation, useTheme } from 'react-native-paper'
import AccountScreen from './account'
import HomeScreen from './index'
import LearnScreen from './learn'
import SearchScreen from './search'
import SupportScreen from './support'

export default function TabLayout() {
  const theme = useTheme()
  const [index, setIndex] = React.useState(0)
  const [routes] = React.useState([
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
  ])

  const renderScene = ({ route, jumpTo }: any) => {
    switch (route.key) {
      case 'home':
        return <HomeScreen key={`home-${index}`} />
      case 'search':
        return <SearchScreen key={`search-${index}`} />
      case 'learn':
        return <LearnScreen key={`learn-${index}`} />
      case 'support':
        return <SupportScreen key={`support-${index}`} />
      case 'account':
        return <AccountScreen key={`account-${index}`} />
      default:
        return null
    }
  }

  return (
    <BottomNavigation
      navigationState={{ index, routes }}
      onIndexChange={setIndex}
      renderScene={renderScene}
      activeColor={theme.colors.primary}
      inactiveColor={theme.colors.onSurfaceVariant}
      barStyle={{
        backgroundColor: theme.colors.surface,
        borderTopWidth: 0.5,
        borderTopColor: '#F0F0F0',
      }}
    />
  )
}
