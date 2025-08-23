import * as React from 'react'
import { BottomNavigation } from 'react-native-paper'
import AccountScreen from './account'
import ExploreScreen from './explore'
import HomeScreen from './index'

const HomeRoute = () => <HomeScreen />

const ExploreRoute = () => <ExploreScreen />

const AccountRoute = () => <AccountScreen />

export default function TabLayout() {
  const [index, setIndex] = React.useState(0)
  const [routes] = React.useState([
    {
      key: 'home',
      title: 'หน้าหลัก',
      focusedIcon: 'home',
      unfocusedIcon: 'home-outline',
    },
    {
      key: 'explore',
      title: 'เข้าเรียน',
      focusedIcon: 'play',
      unfocusedIcon: 'play-outline',
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
    explore: ExploreRoute,
    account: AccountRoute,
  })

  return (
    <BottomNavigation
      navigationState={{ index, routes }}
      onIndexChange={setIndex}
      renderScene={renderScene}
    />
  )
}
