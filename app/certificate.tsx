import * as FileSystem from 'expo-file-system'
import * as MediaLibrary from 'expo-media-library'
import * as Print from 'expo-print'
import { router, useLocalSearchParams } from 'expo-router'
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

import CertificateRenderer, {
  CertificateRendererRef,
} from '@/components/CertificateRenderer'
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

export default function CertificateScreen() {
  const { id, type } = useLocalSearchParams<{ id: string; type: string }>()
  const backgroundColor = useThemeColor({}, 'background')
  const tintColor = useThemeColor({}, 'tint')
  const iconColor = useThemeColor({}, 'icon')

  const dispatch = useDispatch<AppDispatch>()
  const certificateRef = useRef<CertificateRendererRef>(null)

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
  const {
    isCourseCertificatesLoading,
    isCurriculumCertificatesLoading,
    isCourseCertificateInfoLoading,
    isCurriculumCertificateInfoLoading,
    courseCertificates,
    curriculumCertificates,
    courseCertificateInfo,
    curriculumCertificateInfo,
  } = useSelector((state: RootState) => state.me)

  // Get the current certificate from the list (contains user info: firstname, lastname, enddate)
  const currentCertificate =
    type === 'course'
      ? courseCertificates.find((c: any) => c.id === parseInt(id || '0'))
      : curriculumCertificates.find((c: any) => c.id === parseInt(id || '0'))

  // Get the certificate template info (contains print info: text1-4, signature)
  const certificateTemplateInfo =
    type === 'course' ? courseCertificateInfo : curriculumCertificateInfo

  // Determine loading state
  const isLoading =
    type === 'course'
      ? isCourseCertificatesLoading || isCourseCertificateInfoLoading
      : isCurriculumCertificatesLoading || isCurriculumCertificateInfoLoading

  // Load certificate list and info on mount
  useEffect(() => {
    if (id) {
      // Clear previous certificate info
      dispatch(meActions.clearCertificateInfo())

      if (type === 'course') {
        // Load list if not already loaded
        if (courseCertificates.length === 0) {
          dispatch(meActions.loadCourseCertificates())
        }
        dispatch(meActions.loadCourseCertificateInfo(id))
      } else {
        // Load list if not already loaded
        if (curriculumCertificates.length === 0) {
          dispatch(meActions.loadCurriculumCertificates())
        }
        dispatch(meActions.loadCurriculumCertificateInfo(id))
      }
    }
  }, [dispatch, id, type])

  const handleBack = () => {
    router.back()
  }

  // Get certificate filename
  const getFileName = () => {
    const contentName =
      type === 'course'
        ? currentCertificate?.course
        : currentCertificate?.curriculum
    const name = `${currentCertificate?.firstname || ''} ${
      currentCertificate?.lastname || ''
    }`
    const prefix =
      type === 'course' ? 'ประกาศนียบัตรรายวิชา' : 'ประกาศนียบัตรหลักสูตร'
    return `${prefix}${contentName}-${name}`
  }

  // Save as image
  const handleSaveAsImage = async () => {
    if (!certificateRef.current?.containerRef?.current) {
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
          'กรุณาอนุญาตให้แอปเข้าถึงคลังรูปภาพเพื่อบันทึกประกาศนียบัตร'
        )
        setLoadingImage(false)
        return
      }

      // Capture the view as image
      const uri = await captureRef(certificateRef.current.containerRef, {
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
          'บันทึกประกาศนียบัตรเป็นไฟล์รูปภาพเรียบร้อยแล้ว',
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
    const html = certificateRef.current?.getPrintHTML()
    if (!html) {
      showModal('ข้อผิดพลาด', 'ไม่สามารถสร้างไฟล์ PDF ได้')
      return
    }

    setLoadingPDF(true)

    try {
      // Generate PDF from HTML
      const { uri } = await Print.printToFileAsync({
        html,
        width: 595, // A4 width in points (72 dpi)
        height: 842, // A4 height in points (72 dpi)
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
          'บันทึกประกาศนียบัตรเป็นไฟล์ PDF เรียบร้อยแล้ว',
          'success'
        )
      )

      // Share the PDF
      if (await Sharing.isAvailableAsync()) {
        setTimeout(async () => {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'application/pdf',
            dialogTitle: 'บันทึกประกาศนียบัตร PDF',
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
  if (isLoading) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <ThemedView style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <IconSymbol name='chevron.left' size={24} color={iconColor} />
            </TouchableOpacity>
            <ThemedText type='title' style={styles.headerTitle}>
              ประกาศนียบัตร
            </ThemedText>
            <View style={styles.backButton} />
          </View>
        </ThemedView>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color={tintColor} />
          <ThemedText style={styles.loadingText}>
            กำลังโหลดข้อมูลประกาศนียบัตร...
          </ThemedText>
        </View>
        <StatusBarGradient />
      </ThemedView>
    )
  }

  // Empty state - need both certificate data and template info
  if (!currentCertificate || !certificateTemplateInfo) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <ThemedView style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <IconSymbol name='chevron.left' size={24} color={iconColor} />
            </TouchableOpacity>
            <ThemedText type='title' style={styles.headerTitle}>
              ประกาศนียบัตร
            </ThemedText>
            <View style={styles.backButton} />
          </View>
        </ThemedView>
        <View style={styles.loadingContainer}>
          <IconSymbol name='tray' size={54} color='#9CA3AF' />
          <ThemedText style={styles.loadingText}>
            ไม่พบข้อมูลประกาศนียบัตร
          </ThemedText>
        </View>
        <StatusBarGradient />
      </ThemedView>
    )
  }

  // Extract certificate data
  // User info from certificate list: title, firstname, lastname, enddate, hour, course/curriculum, platform
  // Template info from certificate info API: text1-4, signature, signer, position, coCert, etc.
  const contentName =
    type === 'course'
      ? currentCertificate.course
      : currentCertificate.curriculum

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      {/* Fixed Header */}
      <ThemedView style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <IconSymbol name='chevron.left' size={24} color={iconColor} />
          </TouchableOpacity>
          <ThemedText type='title' style={styles.headerTitle}>
            ประกาศนียบัตร
          </ThemedText>
          <View style={styles.backButton} />
        </View>
      </ThemedView>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Section */}
        <ThemedView style={styles.titleContainer}>
          <ThemedText type='title' style={styles.titleText}>
            {type === 'course' ? 'วิชา' : 'หลักสูตร'} {contentName}
          </ThemedText>
        </ThemedView>

        {/* Certificate Metadata */}
        <ThemedView style={styles.metadataContainer}>
          <ThemedView style={styles.metadataItem}>
            <ThemedText style={styles.metadataLabel}>
              ผู้สำเร็จการศึกษา
            </ThemedText>
            <ThemedText type='defaultSemiBold' style={styles.metadataValue}>
              {currentCertificate.title}
              {currentCertificate.firstname} {currentCertificate.lastname}
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.metadataItem}>
            <ThemedText style={styles.metadataLabel}>
              วันที่สำเร็จการศึกษา
            </ThemedText>
            <ThemedText type='defaultSemiBold' style={styles.metadataValue}>
              {formatThaiDateFull(currentCertificate.enddate)}
            </ThemedText>
          </ThemedView>

          <ThemedView style={[styles.metadataItem, { borderBottomWidth: 0 }]}>
            <ThemedText style={styles.metadataLabel}>หน่วยงานรับรอง</ThemedText>
            <ThemedText type='defaultSemiBold' style={styles.metadataValue}>
              {currentCertificate.platform || 'สำนักงาน ก.พ.'}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Certificate Renderer */}
        <ThemedView style={styles.certificateContainer}>
          <CertificateRenderer
            ref={certificateRef}
            // User info from certificate list
            title={currentCertificate.title}
            firstName={currentCertificate.firstname}
            lastName={currentCertificate.lastname}
            contentName={contentName || ''}
            hour={currentCertificate.hour}
            endDate={currentCertificate.enddate}
            isCurriculum={type === 'curriculum'}
            // Template info from certificate info API
            text1={certificateTemplateInfo.text1}
            text2={certificateTemplateInfo.text2}
            text3={certificateTemplateInfo.text3}
            text4={certificateTemplateInfo.text4}
            signature={certificateTemplateInfo.signature}
            signer={certificateTemplateInfo.signer}
            position1={certificateTemplateInfo.position1}
            position2={certificateTemplateInfo.position2}
            signatureUrl={certificateTemplateInfo.signatureUrl}
            coCert={certificateTemplateInfo.coCert}
            coLogo={certificateTemplateInfo.coLogo}
            coSigner={certificateTemplateInfo.coSigner}
            coSignatureUrl={certificateTemplateInfo.coSignatureUrl}
            coPosition1={certificateTemplateInfo.coPosition1}
            coPosition2={certificateTemplateInfo.coPosition2}
          />
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
    fontSize: 20,
    fontFamily: 'Prompt-SemiBold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Prompt-Regular',
    opacity: 0.6,
  },
  titleContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  titleText: {
    fontSize: 22,
    fontFamily: 'Prompt-SemiBold',
    color: '#183A7C',
    lineHeight: 30,
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
    flex: 1,
    textAlign: 'right',
  },
  certificateContainer: {
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
