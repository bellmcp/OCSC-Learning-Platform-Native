import * as FileSystem from 'expo-file-system'
import * as MediaLibrary from 'expo-media-library'
import * as Print from 'expo-print'
import { router } from 'expo-router'
import * as Sharing from 'expo-sharing'
import React, { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import { captureRef } from 'react-native-view-shot'
import { useDispatch, useSelector } from 'react-redux'

import ScoreRenderer, { ScoreRendererRef } from '@/components/ScoreRenderer'
import StatusBarGradient from '@/components/StatusBarGradient'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { useThemeColor } from '@/hooks/useThemeColor'
import * as meActions from '@/modules/me/actions'
import * as uiActions from '@/modules/ui/actions'
import type { AppDispatch, RootState } from '@/store/types'

// Helper to format date in Thai Buddhist calendar (full format)
const formatThaiDateFull = (dateString: string | null | undefined) => {
  if (!dateString) return '-'
  try {
    const date = new Date(dateString)
    const thaiMonths = [
      'มกราคม',
      'กุมภาพันธ์',
      'มีนาคม',
      'เมษายน',
      'พฤษภาคม',
      'มิถุนายน',
      'กรกฎาคม',
      'สิงหาคม',
      'กันยายน',
      'ตุลาคม',
      'พฤศจิกายน',
      'ธันวาคม',
    ]
    const day = date.getDate()
    const month = thaiMonths[date.getMonth()]
    const year = date.getFullYear() + 543
    return `${day} ${month} ${year}`
  } catch (e) {
    return dateString
  }
}

export default function OrientationScoreScreen() {
  const backgroundColor = useThemeColor({}, 'background')
  const tintColor = useThemeColor({}, 'tint')
  const iconColor = useThemeColor({}, 'icon')

  const dispatch = useDispatch<AppDispatch>()
  const scoreRef = useRef<ScoreRendererRef>(null)

  const [loadingImage, setLoadingImage] = useState(false)
  const [loadingPDF, setLoadingPDF] = useState(false)

  // Modal state (for errors only)
  const [modalVisible, setModalVisible] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [modalMessage, setModalMessage] = useState('')

  const showModal = (title: string, message: string) => {
    setModalTitle(title)
    setModalMessage(message)
    setModalVisible(true)
  }

  const handleModalClose = () => {
    setModalVisible(false)
  }

  // Redux state selectors
  const { isOrientationScoreLoading, orientationScore } = useSelector(
    (state: RootState) => state.me
  )

  // Load orientation score on mount
  useEffect(() => {
    dispatch(meActions.loadOrientationScore())
  }, [dispatch])

  const handleBack = () => {
    router.back()
  }

  // Get file name
  const getFileName = () => {
    const name = `${orientationScore?.firstName || ''} ${
      orientationScore?.lastName || ''
    }`
    return `ผลการเรียนรู้ด้วยตนเอง-หลักสูตรฝึกอบรมข้าราชการบรรจุใหม่-${name}`
  }

  // Save as image
  const handleSaveAsImage = async () => {
    if (!scoreRef.current?.containerRef?.current) {
      showModal('ข้อผิดพลาด', 'ไม่สามารถบันทึกรูปภาพได้')
      return
    }

    setLoadingImage(true)

    try {
      // Request media library permission
      const { status } = await MediaLibrary.requestPermissionsAsync()
      if (status !== 'granted') {
        showModal(
          'ต้องการสิทธิ์',
          'กรุณาอนุญาตให้แอปเข้าถึงคลังรูปภาพเพื่อบันทึกผลการเรียนรู้'
        )
        setLoadingImage(false)
        return
      }

      // Capture the view as image
      const uri = await captureRef(scoreRef.current.containerRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      })

      // Save directly to media library from captured URI
      const asset = await MediaLibrary.createAssetAsync(uri)

      // Try to create album, ignore error if it fails
      try {
        await MediaLibrary.createAlbumAsync('OCSC Certificates', asset, false)
      } catch {
        // Album creation might fail if album exists, that's ok
      }

      // Show success snackbar
      dispatch(
        uiActions.setFlashMessage(
          'บันทึกผลการเรียนรู้เป็นไฟล์รูปภาพเรียบร้อยแล้ว',
          'success'
        )
      )

      // Optionally share
      if (await Sharing.isAvailableAsync()) {
        setTimeout(async () => {
          await Sharing.shareAsync(uri)
        }, 500)
      }
    } catch (error) {
      console.error('Error saving image:', error)
      showModal('ข้อผิดพลาด', 'ไม่สามารถบันทึกรูปภาพได้ กรุณาลองใหม่อีกครั้ง')
    } finally {
      setLoadingImage(false)
    }
  }

  // Save as PDF
  const handleSaveAsPDF = async () => {
    const html = scoreRef.current?.getPrintHTML()
    if (!html) {
      showModal('ข้อผิดพลาด', 'ไม่สามารถสร้างไฟล์ PDF ได้')
      return
    }

    setLoadingPDF(true)

    try {
      // Generate PDF from HTML
      const { uri } = await Print.printToFileAsync({
        html,
        width: 595,
        height: 842,
      })

      // Move to documents directory with proper name
      const fileName = `${getFileName()}.pdf`
      const fileUri = `${FileSystem.documentDirectory}${fileName}`

      await FileSystem.moveAsync({
        from: uri,
        to: fileUri,
      })

      // Show success snackbar
      dispatch(
        uiActions.setFlashMessage(
          'บันทึกผลการเรียนรู้เป็นไฟล์ PDF เรียบร้อยแล้ว',
          'success'
        )
      )

      // Share the PDF
      if (await Sharing.isAvailableAsync()) {
        setTimeout(async () => {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'application/pdf',
            dialogTitle: 'บันทึกผลการเรียนรู้ PDF',
            UTI: 'com.adobe.pdf',
          })
        }, 500)
      }
    } catch (error) {
      console.error('Error saving PDF:', error)
      showModal('ข้อผิดพลาด', 'ไม่สามารถสร้างไฟล์ PDF ได้ กรุณาลองใหม่อีกครั้ง')
    } finally {
      setLoadingPDF(false)
    }
  }

  // Loading state
  if (isOrientationScoreLoading) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <ThemedView style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <IconSymbol name='chevron.left' size={24} color={iconColor} />
            </TouchableOpacity>
            <ThemedText type='title' style={styles.headerTitle}>
              ผลการเรียนรู้ด้วยตนเอง
            </ThemedText>
            <View style={styles.backButton} />
          </View>
        </ThemedView>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color={tintColor} />
          <ThemedText style={styles.loadingText}>
            กำลังโหลดข้อมูลผลการเรียนรู้...
          </ThemedText>
        </View>
        <StatusBarGradient />
      </ThemedView>
    )
  }

  // Empty state
  if (!orientationScore) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <ThemedView style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <IconSymbol name='chevron.left' size={24} color={iconColor} />
            </TouchableOpacity>
            <ThemedText type='title' style={styles.headerTitle}>
              ผลการเรียนรู้ด้วยตนเอง
            </ThemedText>
            <View style={styles.backButton} />
          </View>
        </ThemedView>
        <View style={styles.loadingContainer}>
          <IconSymbol name='tray' size={54} color='#9CA3AF' />
          <ThemedText style={styles.emptyTitle}>ไม่พบข้อมูล</ThemedText>
          <ThemedText style={styles.emptyText}>
            ยังเรียนไม่จบหลักสูตร{'\n'}
            ระบบจะออกใบคะแนนฯ ให้เมื่อท่านเรียนจบหลักสูตร{'\n'}
            และได้ประกาศนียบัตรหลักสูตรแล้ว
          </ThemedText>
        </View>
        <StatusBarGradient />
      </ThemedView>
    )
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      {/* Fixed Header */}
      <ThemedView style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <IconSymbol name='chevron.left' size={24} color={iconColor} />
          </TouchableOpacity>
          <ThemedText type='title' style={styles.headerTitle}>
            ผลการเรียนรู้ด้วยตนเอง
          </ThemedText>
          <View style={styles.backButton} />
        </View>
      </ThemedView>

      {/* Scrollable Content*/}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Section */}
        <ThemedView style={styles.titleContainer}>
          <ThemedText type='title' style={styles.titleText}>
            ผลการเรียนรู้ด้วยตนเอง{'\n'}หลักสูตรฝึกอบรมข้าราชการบรรจุใหม่
          </ThemedText>
        </ThemedView>

        {/* Metadata */}
        <ThemedView style={styles.metadataContainer}>
          <ThemedView style={styles.metadataItem}>
            <ThemedText style={styles.metadataLabel}>ชื่อ - สกุล</ThemedText>
            <ThemedText type='defaultSemiBold' style={styles.metadataValue}>
              {orientationScore.title}
              {orientationScore.firstName} {orientationScore.lastName}
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.metadataItem}>
            <ThemedText style={styles.metadataLabel}>ตำแหน่ง</ThemedText>
            <ThemedText type='defaultSemiBold' style={styles.metadataValue}>
              {orientationScore.jobTitle} {orientationScore.jobLevel}
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.metadataItem}>
            <ThemedText style={styles.metadataLabel}>หน่วยงาน</ThemedText>
            <ThemedText type='defaultSemiBold' style={styles.metadataValue}>
              {orientationScore.department} {orientationScore.ministry}
            </ThemedText>
          </ThemedView>

          <ThemedView style={[styles.metadataItem, { borderBottomWidth: 0 }]}>
            <ThemedText style={styles.metadataLabel}>
              วันที่จบหลักสูตร
            </ThemedText>
            <ThemedText type='defaultSemiBold' style={styles.metadataValue}>
              {formatThaiDateFull(orientationScore.date)}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Score Renderer */}
        <ThemedView style={styles.scoreContainer}>
          <ScoreRenderer ref={scoreRef} {...orientationScore} />
        </ThemedView>

        {/* Action Buttons */}
        <ThemedView style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: tintColor }]}
            onPress={handleSaveAsImage}
            disabled={loadingImage}
          >
            {loadingImage ? (
              <ActivityIndicator size='small' color='white' />
            ) : (
              <IconSymbol name='photo' size={20} color='white' />
            )}
            <ThemedText style={styles.actionButtonText}>
              {loadingImage ? 'กำลังบันทึก...' : 'บันทึกเป็นไฟล์รูปภาพ'}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={handleSaveAsPDF}
            disabled={loadingPDF}
          >
            {loadingPDF ? (
              <ActivityIndicator size='small' color={tintColor} />
            ) : (
              <IconSymbol
                name='arrow.down.circle'
                size={20}
                color={tintColor}
              />
            )}
            <ThemedText
              style={[styles.secondaryButtonText, { color: tintColor }]}
            >
              {loadingPDF ? 'กำลังบันทึก...' : 'บันทึกเป็นไฟล์ PDF'}
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>

      <StatusBarGradient />

      {/* Custom Modal (for errors) */}
      <Modal
        visible={modalVisible}
        transparent
        animationType='fade'
        onRequestClose={handleModalClose}
      >
        <TouchableWithoutFeedback onPress={handleModalClose}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContainer}>
                <ThemedText style={styles.modalTitle}>{modalTitle}</ThemedText>
                <ThemedText style={styles.modalMessage}>
                  {modalMessage}
                </ThemedText>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={handleModalClose}
                >
                  <ThemedText style={styles.modalButtonText}>ตกลง</ThemedText>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 40,
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
    fontSize: 18,
    fontFamily: 'Prompt-SemiBold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Prompt-Regular',
    opacity: 0.6,
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 18,
    fontFamily: 'Prompt-SemiBold',
    color: '#6B7280',
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: 'Prompt-Regular',
    opacity: 0.6,
    textAlign: 'center',
    lineHeight: 22,
  },
  titleContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  titleText: {
    fontSize: 20,
    fontFamily: 'Prompt-SemiBold',
    color: '#183A7C',
    lineHeight: 28,
  },
  metadataContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  metadataItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  metadataLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  metadataValue: {
    fontSize: 14,
    color: '#333',
    flex: 1.5,
    textAlign: 'right',
  },
  scoreContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  actionsContainer: {
    marginHorizontal: 20,
    marginBottom: 40,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  actionButtonText: {
    fontSize: 16,
    fontFamily: 'Prompt-SemiBold',
    marginLeft: 8,
    color: 'white',
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#183A7C',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontFamily: 'Prompt-SemiBold',
    marginLeft: 8,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    maxWidth: 400,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Prompt-SemiBold',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    fontFamily: 'Prompt-Regular',
    color: '#4B5563',
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#183A7C',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontFamily: 'Prompt-SemiBold',
    color: 'white',
  },
})
