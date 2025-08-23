import React, { useRef } from 'react'
import { Alert, StyleSheet, TouchableOpacity } from 'react-native'
import WebView from 'react-native-webview'

import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { useThemeColor } from '@/hooks/useThemeColor'

import { ClassroomContent } from './types'

interface ContentViewProps {
  selectedContent: ClassroomContent | null
  courseName: string
  onTestStart: (contentId: number) => void
  onContentLoadStart: () => void
}

const convertToEmbedUrl = (url: string): string => {
  let videoId = ''

  if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1].split('?')[0]
  } else if (url.includes('youtube.com/watch?v=')) {
    videoId = url.split('v=')[1].split('&')[0]
  } else if (url.includes('youtube.com/embed/')) {
    if (url.includes('autoplay=1')) {
      return url
    }
    const separator = url.includes('?') ? '&' : '?'
    return `${url}${separator}autoplay=1&playsinline=1&rel=0&modestbranding=1`
  }

  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0&modestbranding=1&controls=1&showinfo=0&fs=1&iv_load_policy=3`
  }

  return url
}

export function ContentView({
  selectedContent,
  courseName,
  onTestStart,
  onContentLoadStart,
}: ContentViewProps) {
  const iconColor = useThemeColor({}, 'icon')
  const tintColor = useThemeColor({}, 'tint')
  const webViewRef = useRef<WebView>(null)

  if (!selectedContent) {
    return (
      <ThemedView style={styles.defaultContent}>
        <IconSymbol name='book.closed' size={60} color={iconColor} />
        <ThemedText style={styles.defaultContentText}>
          เลือกเนื้อหาที่ต้องการเรียน
        </ThemedText>
      </ThemedView>
    )
  }

  // Render test welcome screen for test content type
  if (selectedContent.type === 't') {
    return (
      <ThemedView style={styles.testWelcomeContainer}>
        {/* Test Details */}
        <ThemedView style={styles.testDetailsSection}>
          <ThemedText style={styles.testSubject}>
            {selectedContent.name} รายวิชา {courseName}
          </ThemedText>
          <ThemedText style={styles.testInfo}>
            <ThemedText style={styles.testInfoBold}>คำชี้แจง </ThemedText>
            จงเลือกคำตอบที่ถูกที่สุดเพียงข้อเดียว
          </ThemedText>
          <ThemedText style={styles.testInfo}>
            <ThemedText style={styles.testInfoBold}>เกณฑ์ผ่าน </ThemedText>0
            คะแนน
          </ThemedText>
          <ThemedText style={styles.testInfo}>
            <ThemedText style={styles.testInfoBold}>
              เวลาที่ใช้ทำแบบทดสอบ{' '}
            </ThemedText>
            {selectedContent.minutes || 45} นาที
          </ThemedText>
          <ThemedText style={styles.testInfo}>
            <ThemedText style={styles.testInfoBold}>
              ทำแบบทดสอบได้ไม่เกิน{' '}
            </ThemedText>
            10 ครั้ง
          </ThemedText>
        </ThemedView>

        {/* Current Status */}
        <ThemedView style={styles.testStatusSection}>
          <ThemedText style={styles.testStatusText}>
            ทำแบบทดสอบแล้ว {selectedContent.testTries || 0} จาก 10 ครั้ง
          </ThemedText>
          <ThemedText style={styles.testStatusText}>
            คะแนนสูงสุดที่ทำได้ {selectedContent.testScore || 0} เต็ม 20 คะแนน
          </ThemedText>
        </ThemedView>

        {/* Important Notes */}
        <ThemedText style={styles.testWarningText}>
          โปรดส่งแบบทดสอบก่อนออกจากห้องสอบ
        </ThemedText>
        <ThemedText style={styles.testWarningText}>
          คำตอบของคุณจะถูกบันทึกโดยอัตโนมัติเมื่อหมดเวลา
        </ThemedText>

        {/* Action Button */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: tintColor, marginTop: 16 },
          ]}
          onPress={() => {
            Alert.alert(
              'เริ่มทำแบบทดสอบ',
              'คุณต้องการเริ่มทำแบบทดสอบหรือไม่?\n\nเมื่อเริ่มแล้ว เวลาจะเริ่มนับทันที',
              [
                { text: 'ยกเลิก', style: 'cancel' },
                {
                  text: 'เริ่มทำ',
                  onPress: () => {
                    onTestStart(selectedContent.id)
                  },
                },
              ]
            )
          }}
        >
          <IconSymbol name='play.circle.fill' size={20} color='white' />
          <ThemedText style={styles.actionButtonText}>
            เริ่มทำแบบทดสอบ
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    )
  }

  const getContentUrl = () => {
    if (selectedContent.type === 'e') {
      return 'https://docs.google.com/forms/d/e/1FAIpQLSdMockEval/viewform'
    }

    const rawUrl = selectedContent.content1 || selectedContent.content2
    if (
      rawUrl &&
      (rawUrl.includes('youtube.com') || rawUrl.includes('youtu.be'))
    ) {
      return convertToEmbedUrl(rawUrl)
    }

    return rawUrl || null
  }

  const contentUrl = getContentUrl()

  if (!contentUrl) {
    return (
      <ThemedView style={styles.defaultContent}>
        <IconSymbol
          name='exclamationmark.triangle'
          size={60}
          color={iconColor}
        />
        <ThemedText style={styles.defaultContentText}>
          เนื้อหานี้ยังไม่พร้อมใช้งาน
        </ThemedText>
      </ThemedView>
    )
  }

  const isVideoContent =
    selectedContent.type === 'c' &&
    (selectedContent.content1?.includes('youtube') ||
      selectedContent.content2?.includes('youtube'))

  if (isVideoContent) {
    return (
      <ThemedView style={styles.videoContainer}>
        <WebView
          ref={webViewRef}
          source={{ uri: contentUrl }}
          style={styles.videoWebView}
          allowsFullscreenVideo={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          mediaPlaybackRequiresUserAction={false}
          allowsInlineMediaPlayback={true}
          scalesPageToFit={false}
          bounces={false}
          scrollEnabled={false}
          onLoadStart={onContentLoadStart}
          onError={() => {
            Alert.alert('ข้อผิดพลาด', 'ไม่สามารถโหลดเนื้อหาได้')
          }}
        />
      </ThemedView>
    )
  }

  return (
    <WebView
      ref={webViewRef}
      source={{ uri: contentUrl }}
      style={styles.webView}
      allowsFullscreenVideo={true}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      startInLoadingState={true}
      mediaPlaybackRequiresUserAction={false}
      allowsInlineMediaPlayback={true}
      onLoadStart={onContentLoadStart}
      onError={() => {
        Alert.alert('ข้อผิดพลาด', 'ไม่สามารถโหลดเนื้อหาได้')
      }}
    />
  )
}

const styles = StyleSheet.create({
  defaultContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  defaultContentText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  videoContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  videoWebView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  webView: {
    flex: 1,
  },
  testWelcomeContainer: {
    flex: 1,
    padding: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
  },
  testDetailsSection: {
    marginBottom: 20,
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
  },
  testSubject: {
    fontSize: 16,
    fontFamily: 'Prompt-SemiBold',
    color: '#1F2937',
    marginBottom: 12,
  },
  testInfo: {
    fontSize: 15,
    fontFamily: 'Prompt-Regular',
    color: '#6B7280',
    marginBottom: 4,
  },
  testInfoBold: {
    fontSize: 15,
    fontFamily: 'Prompt-Medium',
    color: '#6B7280',
    paddingRight: 4,
  },
  testStatusSection: {
    marginBottom: 20,
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
  },
  testStatusText: {
    fontSize: 16,
    fontFamily: 'Prompt-Medium',
    color: '#1F2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  testWarningText: {
    fontSize: 15,
    fontFamily: 'Prompt-Regular',
    color: '#D14343',
    textAlign: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    color: 'white',
  },
})
