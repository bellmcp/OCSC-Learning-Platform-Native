import { IconSymbol } from '@/components/ui/IconSymbol'
import * as uiActions from '@/modules/ui/actions'
import type { RootState } from '@/store/types'
import { useEffect, useRef } from 'react'
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

/**
 * Custom Toast Component - Matches app design with proper icons
 */
export default function ToastNotification() {
  const dispatch = useDispatch()
  const { isSnackbarOpen, flashMessage, alertType } = useSelector(
    (state: RootState) => state.ui
  )
  const translateY = useRef(new Animated.Value(200)).current
  const lastMessageRef = useRef<string | null>(null)

  useEffect(() => {
    console.log('[ToastNotification] State changed:', {
      isSnackbarOpen,
      flashMessage,
      alertType,
    })

    if (
      isSnackbarOpen &&
      flashMessage &&
      flashMessage !== lastMessageRef.current
    ) {
      lastMessageRef.current = flashMessage
      console.log('[ToastNotification] ✅ SHOWING TOAST')

      // Slide up
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start()

      // Auto hide after 6 seconds
      setTimeout(() => {
        hideToast()
      }, 6000)
    }
  }, [isSnackbarOpen, flashMessage, alertType])

  const hideToast = () => {
    console.log('[ToastNotification] Hiding toast')
    Animated.timing(translateY, {
      toValue: 200,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      dispatch(uiActions.clearFlashMessage())
      lastMessageRef.current = null
    })
  }

  if (!isSnackbarOpen || !flashMessage) {
    return null
  }

  // App color scheme with proper icons
  let backgroundColor = '#2196F3' // info (blue)
  let iconName: any = 'info.circle'

  if (alertType === 'error') {
    backgroundColor = '#D32F2F' // error (red)
    iconName = 'exclamationmark.circle'
  } else if (alertType === 'warning') {
    backgroundColor = '#FF9800' // warning (orange)
    iconName = 'exclamationmark.triangle'
  } else if (alertType === 'success') {
    backgroundColor = '#4CAF50' // success (green)
    iconName = 'checkmark.circle.fill'
  }

  const cleanMessage = flashMessage.replace(/<[^>]*>/g, '')

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor,
          transform: [{ translateY }],
        },
      ]}
    >
      <View style={styles.iconContainer}>
        <IconSymbol name={iconName} size={24} color='#FFFFFF' />
      </View>
      <View style={styles.messageContainer}>
        <Text style={styles.message} numberOfLines={0}>
          {cleanMessage}
        </Text>
      </View>
      <TouchableOpacity
        onPress={hideToast}
        style={styles.closeButton}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <IconSymbol name='xmark' size={22} color='#FFFFFF' />
      </TouchableOpacity>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 99999,
    minHeight: 56,
  },
  iconContainer: {
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    fontFamily: 'Prompt-Medium',
    fontSize: 15,
    lineHeight: 22,
    color: '#FFFFFF',
  },
  closeButton: {
    marginLeft: 12,
    justifyContent: 'center',
    alignItems: 'center',
    width: 28,
    height: 28,
  },
})
