import * as React from 'react'
import { BottomNavigation, useTheme } from 'react-native-paper'
import AccountScreen from './account'
import ExploreScreen from './explore'
import HomeScreen from './index'
import SupportScreen from './support'

const HomeRoute = () => <HomeScreen />

const SearchRoute = () => <ExploreScreen />

const LearnRoute = () => <ExploreScreen />

const SupportRoute = () => <SupportScreen />

const AccountRoute = () => <AccountScreen />

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

  const renderScene = BottomNavigation.SceneMap({
    home: HomeRoute,
    search: SearchRoute,
    learn: LearnRoute,
    support: SupportRoute,
    account: AccountRoute,
  })

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
        borderTopColor: theme.colors.outlineVariant,
      }}
    />
  )
}
