import { router } from 'expo-router'
import React, { useCallback, useEffect, useMemo } from 'react'
import {
  ActivityIndicator,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native'
import RenderHtml, { defaultSystemFonts } from 'react-native-render-html'
import { useDispatch, useSelector } from 'react-redux'

import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { useThemeColor } from '@/hooks/useThemeColor'
import * as otpActions from '@/modules/otp/actions'
import type { AppDispatch, RootState } from '@/store/types'

// Custom fonts for RenderHtml
const systemFonts = [
  ...defaultSystemFonts,
  'Prompt-Regular',
  'Prompt-Medium',
  'Prompt-SemiBold',
  'Prompt-Bold',
]

export default function OTPScreen() {
  const dispatch = useDispatch<AppDispatch>()
  const backgroundColor = useThemeColor({}, 'background')
  const iconColor = useThemeColor({}, 'icon')
  const tintColor = useThemeColor({}, 'tint')
  const { width } = useWindowDimensions()

  const { isLoading, data } = useSelector((state: RootState) => state.otp)

  useEffect(() => {
    dispatch(otpActions.loadOTPData())
  }, [dispatch])

  const handleGoBack = () => {
    router.back()
  }

  // Handle link press - open in WebView instead of Safari
  const handleLinkPress = useCallback((_: any, href: string) => {
    if (href) {
      router.push({
        pathname: '/portal-webview',
        params: {
          url: href,
          title: 'วิธีตั้งค่า OTP',
        },
      })
    }
  }, [])

  // RenderHtml renderers props
  const renderersProps = useMemo(
    () => ({
      a: {
        onPress: handleLinkPress,
      },
    }),
    [handleLinkPress]
  )

  // RenderHtml tags styles
  const tagsStyles = useMemo(
    () => ({
      body: {
        fontFamily: 'Prompt-Regular',
        fontSize: 16,
        color: '#374151',
        lineHeight: 26,
      },
      p: {
        fontFamily: 'Prompt-Regular',
        marginVertical: 8,
        lineHeight: 26,
      },
      li: {
        fontFamily: 'Prompt-Regular',
        marginBottom: 8,
      },
      ul: {
        paddingLeft: 16,
      },
      ol: {
        paddingLeft: 16,
      },
      strong: {
        fontFamily: 'Prompt-SemiBold',
      },
      b: {
        fontFamily: 'Prompt-SemiBold',
      },
      a: {
        fontFamily: 'Prompt-Regular',
        color: '#2563EB',
        textDecorationLine: 'underline' as const,
      },
    }),
    []
  )

  // Loading state
  if (isLoading) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <ThemedView style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
              <IconSymbol name='chevron.left' size={24} color={iconColor} />
            </TouchableOpacity>
            <ThemedText type='title' style={styles.headerTitle}>
              ตั้งค่า OTP
            </ThemedText>
            <View style={styles.backButton} />
          </View>
        </ThemedView>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color={tintColor} />
          <ThemedText style={styles.loadingText}>
            กำลังโหลดข้อมูล OTP...
          </ThemedText>
        </View>
      </ThemedView>
    )
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <ThemedView style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <IconSymbol name='chevron.left' size={24} color={iconColor} />
          </TouchableOpacity>
          <ThemedText type='title' style={styles.headerTitle}>
            ตั้งค่า OTP
          </ThemedText>
          <View style={styles.backButton} />
        </View>
      </ThemedView>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Section */}
        {data?.info && (
          <ThemedView style={styles.infoSection}>
            <RenderHtml
              contentWidth={width - 80}
              source={{ html: data.info }}
              systemFonts={systemFonts}
              tagsStyles={tagsStyles}
              renderersProps={renderersProps}
            />
          </ThemedView>
        )}

        {/* QR Code Section */}
        {data?.qr && (
          <ThemedView style={styles.qrSection}>
            <ThemedText style={styles.qrTitle}>
              สแกน QR Code เพื่อตั้งค่า OTP
            </ThemedText>
            <View style={styles.qrContainer}>
              <Image
                source={{ uri: data.qr }}
                style={styles.qrImage}
                resizeMode='contain'
              />
            </View>
            <ThemedText style={styles.qrHint}>
              ใช้แอปพลิเคชัน Google Authenticator หรือแอปที่รองรับ OTP ในการสแกน
              QR Code
            </ThemedText>
          </ThemedView>
        )}

        {/* No Data State */}
        {!data?.info && !data?.qr && !isLoading && (
          <ThemedView style={styles.emptySection}>
            <IconSymbol
              name='exclamationmark.circle'
              size={48}
              color='#9CA3AF'
            />
            <ThemedText style={styles.emptyText}>
              ไม่สามารถโหลดข้อมูล OTP ได้
            </ThemedText>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: tintColor }]}
              onPress={() => dispatch(otpActions.loadOTPData())}
            >
              <ThemedText style={styles.retryButtonText}>ลองใหม่</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        )}
      </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Prompt-Regular',
    color: '#6B7280',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  infoSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 0,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  qrSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 0,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  qrTitle: {
    fontSize: 18,
    fontFamily: 'Prompt-SemiBold',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  qrContainer: {
    width: 250,
    height: 250,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 20,
  },
  qrImage: {
    width: '100%',
    height: '100%',
  },
  qrHint: {
    fontSize: 14,
    fontFamily: 'Prompt-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  emptySection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 0,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Prompt-Regular',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontFamily: 'Prompt-SemiBold',
    color: 'white',
  },
})
