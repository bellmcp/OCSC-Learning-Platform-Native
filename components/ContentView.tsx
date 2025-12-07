import React, { useRef } from 'react'
import { Alert, Image, Platform, StyleSheet } from 'react-native'
import WebView from 'react-native-webview'

import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { useThemeColor } from '@/hooks/useThemeColor'
import { EvaluationWelcomeCard } from './EvaluationWelcomeCard'
import { TestWelcomeCard } from './TestWelcomeCard'

import { ClassroomContent } from './types'

// Import hero image for welcome screen
const HeroImage = require('@/assets/images/hero-learn.png')

interface ContentViewProps {
  selectedContent: ClassroomContent | null
  courseName: string
  courseRegistrationId?: number
  onTestStart: (contentId: number) => void
  onContentLoadStart?: () => void
  onOpenTest: () => void
  onOpenEvaluation: () => void
}

const convertToEmbedUrl = (url: string): string => {
  let videoId = ''

  if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1].split('?')[0]
  } else if (url.includes('youtube.com/watch?v=')) {
    videoId = url.split('v=')[1].split('&')[0]
  } else if (url.includes('youtube.com/embed/')) {
    // Normalize any existing embed URL by stripping params and rebuilding
    const parts = url.split('youtube.com/embed/')
    const idAndParams = parts[1] || ''
    videoId = idAndParams.split('?')[0]
  }

  if (videoId) {
    // Avoid autoplay to prevent iOS WKWebView configuration error 153
    const params = [
      'playsinline=1',
      'rel=0',
      'modestbranding=1',
      'controls=1',
      'fs=1',
      'iv_load_policy=3',
      'enablejsapi=1',
      // Provide a stable origin to satisfy YouTube iframe security checks
      'origin=https://www.youtube.com',
    ]
    return `https://www.youtube.com/embed/${videoId}?${params.join('&')}`
  }

  return url
}

const extractYouTubeId = (url: string | null | undefined): string | null => {
  if (!url) return null
  if (url.includes('youtu.be/')) {
    return url.split('youtu.be/')[1].split('?')[0]
  }
  if (url.includes('youtube.com/watch?v=')) {
    return url.split('v=')[1].split('&')[0]
  }
  if (url.includes('youtube.com/embed/')) {
    const parts = url.split('youtube.com/embed/')
    const idAndParams = parts[1] || ''
    return idAndParams.split('?')[0]
  }
  return null
}

const buildYouTubeIframeHtml = (videoId: string): string => {
  // Full-bleed responsive iframe using youtube-nocookie and proper origin/jsapi
  const origin = 'https://www.youtube-nocookie.com'
  const src = `https://www.youtube-nocookie.com/embed/${videoId}?playsinline=1&rel=0&modestbranding=1&controls=1&fs=1&enablejsapi=1&autoplay=1&mute=0&origin=${encodeURIComponent(
    origin
  )}`
  return `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="initial-scale=1, maximum-scale=1" />
    <style>
      html, body { margin: 0; padding: 0; background-color: transparent; }
      .container { position: absolute; inset: 0; }
      iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0; }
    </style>
  </head>
  <body>
    <div class="container">
      <iframe
        src="${src}"
        title="YouTube video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerpolicy="origin-when-cross-origin"
        sandbox="allow-scripts allow-same-origin allow-presentation allow-forms allow-pointer-lock allow-popups"
        allowfullscreen
      ></iframe>
    </div>
  </body>
  </html>`
}

export function ContentView({
  selectedContent,
  courseName,
  courseRegistrationId,
  onTestStart,
  onContentLoadStart,
  onOpenTest,
  onOpenEvaluation,
}: ContentViewProps) {
  const iconColor = useThemeColor({}, 'icon')
  const webViewRef = useRef<WebView>(null)

  if (!selectedContent) {
    return (
      <ThemedView style={styles.welcomeContainer}>
        <Image
          source={HeroImage}
          style={styles.welcomeImage}
          resizeMode='contain'
        />
        <ThemedText style={styles.welcomeTitle}>ยินดีต้อนรับ</ThemedText>
        <ThemedText style={styles.welcomeSubtitle}>
          โปรดเลือกเนื้อหาที่ต้องการเรียนจากสารบัญ
        </ThemedText>
        <IconSymbol
          name='arrow.down'
          size={24}
          color='#9CA3AF'
          style={styles.welcomeArrow}
        />
      </ThemedView>
    )
  }

  // Render test welcome screen for test content type
  if (selectedContent.type === 't') {
    // testId comes from contentView - backend randomly selects one of testId1/2/3
    // Do NOT fallback to testId1/2/3 on frontend as that would bypass the random selection
    const testId = selectedContent.testId

    return (
      <TestWelcomeCard
        selectedContent={selectedContent}
        courseName={courseName}
        courseRegistrationId={courseRegistrationId}
        contentViewId={selectedContent.contentViewId}
        testId={testId}
        onOpenTest={onOpenTest}
      />
    )
  }

  // Render evaluation welcome screen for evaluation content type
  if (selectedContent.type === 'e') {
    return (
      <EvaluationWelcomeCard
        selectedContent={selectedContent}
        courseName={courseName}
        onOpenEvaluation={onOpenEvaluation}
      />
    )
  }

  const getContentUrl = () => {
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
    (selectedContent.type === 'c' &&
      (selectedContent.content1?.includes('youtube') ||
        selectedContent.content2?.includes('youtube'))) ||
    selectedContent.content1?.includes('youtu.be') ||
    selectedContent.content2?.includes('youtu.be')

  if (isVideoContent) {
    const possibleUrl =
      selectedContent.content1 || selectedContent.content2 || null
    const youtubeId = extractYouTubeId(possibleUrl)
    if (!youtubeId) {
      return (
        <ThemedView style={styles.defaultContent}>
          <IconSymbol
            name='exclamationmark.triangle'
            size={60}
            color={iconColor}
          />
          <ThemedText style={styles.defaultContentText}>
            เนื้อหาวิดีโอไม่ถูกต้อง
          </ThemedText>
        </ThemedView>
      )
    }
    const html = buildYouTubeIframeHtml(youtubeId)
    return (
      <ThemedView style={styles.videoContainer}>
        <WebView
          ref={webViewRef}
          originWhitelist={['*']}
          source={{ html, baseUrl: 'https://www.youtube-nocookie.com' }}
          style={styles.videoWebView}
          allowsFullscreenVideo={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          mediaPlaybackRequiresUserAction={false}
          allowsInlineMediaPlayback={true}
          mixedContentMode='always'
          userAgent={
            Platform.OS === 'ios'
              ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
              : 'Mozilla/5.0 (Linux; Android 13; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36'
          }
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
      mediaPlaybackRequiresUserAction={Platform.OS === 'ios'}
      allowsInlineMediaPlayback={true}
      onLoadStart={onContentLoadStart}
      onError={() => {
        Alert.alert('ข้อผิดพลาด', 'ไม่สามารถโหลดเนื้อหาได้')
      }}
    />
  )
}

const styles = StyleSheet.create({
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    paddingTop: 40,
  },
  welcomeImage: {
    width: '100%',
    height: 200,
    marginBottom: 12,
  },
  welcomeTitle: {
    lineHeight: 48,
    fontSize: 24,
    fontFamily: 'Prompt-SemiBold',
    color: '#1F2937',
    marginBottom: 0,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    fontFamily: 'Prompt-Regular',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  welcomeArrow: {
    marginTop: 8,
  },
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
