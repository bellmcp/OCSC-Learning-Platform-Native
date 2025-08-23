import React, { useRef } from 'react'
import { Alert, StyleSheet } from 'react-native'
import WebView from 'react-native-webview'

import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { useThemeColor } from '@/hooks/useThemeColor'
import { TestWelcomeCard } from './TestWelcomeCard'

import { ClassroomContent } from './types'

interface ContentViewProps {
  selectedContent: ClassroomContent | null
  courseName: string
  onTestStart: (contentId: number) => void
  onContentLoadStart: () => void
  onOpenTest: () => void
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
  onOpenTest,
}: ContentViewProps) {
  const iconColor = useThemeColor({}, 'icon')
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
      <TestWelcomeCard
        selectedContent={selectedContent}
        courseName={courseName}
        onOpenTest={onOpenTest}
      />
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
})
