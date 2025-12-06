import * as FileSystem from 'expo-file-system'
import * as MediaLibrary from 'expo-media-library'
import * as Print from 'expo-print'
import { router, useLocalSearchParams } from 'expo-router'
import * as Sharing from 'expo-sharing'
import React, { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
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
  const [loadingPrint, setLoadingPrint] = useState(false)

  // Redux state selectors
  const {
    isCourseCertificateInfoLoading,
    isCurriculumCertificateInfoLoading,
    courseCertificateInfo,
    curriculumCertificateInfo,
  } = useSelector((state: RootState) => state.me)

  // Determine which certificate info to use based on type
  const isLoading =
    type === 'course'
      ? isCourseCertificateInfoLoading
      : isCurriculumCertificateInfoLoading
  const certificateInfo =
    type === 'course' ? courseCertificateInfo : curriculumCertificateInfo

  // Load certificate info on mount
  useEffect(() => {
    if (id) {
      // Clear previous certificate info
      dispatch(meActions.clearCertificateInfo())

      if (type === 'course') {
        dispatch(meActions.loadCourseCertificateInfo(id))
      } else {
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
      type === 'course' ? certificateInfo?.course : certificateInfo?.curriculum
    const name = `${certificateInfo?.firstname || ''} ${
      certificateInfo?.lastname || ''
    }`
    const prefix =
      type === 'course' ? 'ประกาศนียบัตรรายวิชา' : 'ประกาศนียบัตรหลักสูตร'
    return `${prefix}${contentName}-${name}`
  }

  // Save as image
  const handleSaveAsImage = async () => {
    if (!certificateRef.current?.containerRef?.current) {
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถบันทึกรูปภาพได้')
      return
    }

    setLoadingImage(true)

    try {
      // Request media library permission
      const { status } = await MediaLibrary.requestPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert(
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

      Alert.alert('สำเร็จ', 'บันทึกประกาศนียบัตรเป็นไฟล์รูปภาพเรียบร้อยแล้ว', [
        { text: 'ตกลง' },
        {
          text: 'แชร์',
          onPress: async () => {
            if (await Sharing.isAvailableAsync()) {
              await Sharing.shareAsync(uri)
            }
          },
        },
      ])
    } catch (error) {
      console.error('Error saving image:', error)
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถบันทึกรูปภาพได้ กรุณาลองใหม่อีกครั้ง')
    } finally {
      setLoadingImage(false)
    }
  }

  // Save as PDF
  const handleSaveAsPDF = async () => {
    const html = certificateRef.current?.getPrintHTML()
    if (!html) {
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถสร้างไฟล์ PDF ได้')
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

      // Share or save the PDF
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/pdf',
          dialogTitle: 'บันทึกประกาศนียบัตร PDF',
          UTI: 'com.adobe.pdf',
        })
      } else {
        Alert.alert('สำเร็จ', 'บันทึกประกาศนียบัตรเป็นไฟล์ PDF เรียบร้อยแล้ว')
      }
    } catch (error) {
      console.error('Error saving PDF:', error)
      Alert.alert(
        'ข้อผิดพลาด',
        'ไม่สามารถสร้างไฟล์ PDF ได้ กรุณาลองใหม่อีกครั้ง'
      )
    } finally {
      setLoadingPDF(false)
    }
  }

  // Print
  const handlePrint = async () => {
    const html = certificateRef.current?.getPrintHTML()
    if (!html) {
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถพิมพ์ได้')
      return
    }

    setLoadingPrint(true)

    try {
      await Print.printAsync({
        html,
        width: 595,
        height: 842,
      })
    } catch (error) {
      console.error('Error printing:', error)
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถพิมพ์ได้ กรุณาลองใหม่อีกครั้ง')
    } finally {
      setLoadingPrint(false)
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
              พิมพ์ประกาศนียบัตร
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

  // Empty state
  if (!certificateInfo) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <ThemedView style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <IconSymbol name='chevron.left' size={24} color={iconColor} />
            </TouchableOpacity>
            <ThemedText type='title' style={styles.headerTitle}>
              พิมพ์ประกาศนียบัตร
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

  // Extract certificate data using correct API field names
  const contentName =
    type === 'course' ? certificateInfo.course : certificateInfo.curriculum

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      {/* Fixed Header */}
      <ThemedView style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <IconSymbol name='chevron.left' size={24} color={iconColor} />
          </TouchableOpacity>
          <ThemedText type='title' style={styles.headerTitle}>
            พิมพ์ประกาศนียบัตร
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
              {certificateInfo.title}
              {certificateInfo.firstname} {certificateInfo.lastname}
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.metadataItem}>
            <ThemedText style={styles.metadataLabel}>
              วันที่สำเร็จการศึกษา
            </ThemedText>
            <ThemedText type='defaultSemiBold' style={styles.metadataValue}>
              {formatThaiDateFull(certificateInfo.enddate)}
            </ThemedText>
          </ThemedView>

          <ThemedView style={[styles.metadataItem, { borderBottomWidth: 0 }]}>
            <ThemedText style={styles.metadataLabel}>หน่วยงานรับรอง</ThemedText>
            <ThemedText type='defaultSemiBold' style={styles.metadataValue}>
              {certificateInfo.platform || 'สำนักงาน ก.พ.'}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Certificate Renderer */}
        <ThemedView style={styles.certificateContainer}>
          <CertificateRenderer
            ref={certificateRef}
            title={certificateInfo.title}
            firstName={certificateInfo.firstname}
            lastName={certificateInfo.lastname}
            contentName={contentName || ''}
            hour={certificateInfo.hour}
            endDate={certificateInfo.enddate}
            isCurriculum={type === 'curriculum'}
            text1={certificateInfo.text1}
            text2={certificateInfo.text2}
            text3={certificateInfo.text3}
            text4={certificateInfo.text4}
            signature={certificateInfo.signature}
            signer={certificateInfo.signer}
            position1={certificateInfo.position1}
            position2={certificateInfo.position2}
            signatureUrl={certificateInfo.signatureUrl}
            coCert={certificateInfo.coCert}
            coLogo={certificateInfo.coLogo}
            coSigner={certificateInfo.coSigner}
            coSignatureUrl={certificateInfo.coSignatureUrl}
            coPosition1={certificateInfo.coPosition1}
            coPosition2={certificateInfo.coPosition2}
          />
        </ThemedView>

        {/* Action Buttons */}
        <ThemedView style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={handleSaveAsImage}
            disabled={loadingImage}
          >
            {loadingImage ? (
              <ActivityIndicator size='small' color={tintColor} />
            ) : (
              <IconSymbol name='photo' size={20} color={tintColor} />
            )}
            <ThemedText style={[styles.actionButtonText, { color: tintColor }]}>
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
            <ThemedText style={[styles.actionButtonText, { color: tintColor }]}>
              {loadingPDF ? 'กำลังบันทึก...' : 'บันทึกเป็นไฟล์ PDF'}
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>

      {/* Fixed Bottom Bar */}
      <View style={[styles.fixedButtonContainer, { backgroundColor }]}>
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: tintColor }]}
          onPress={handlePrint}
          disabled={loadingPrint}
        >
          {loadingPrint ? (
            <ActivityIndicator size='small' color='white' />
          ) : (
            <IconSymbol name='printer' size={20} color='white' />
          )}
          <ThemedText style={styles.primaryButtonText}>
            {loadingPrint ? 'กำลังเตรียมพิมพ์...' : 'สั่งพิมพ์'}
          </ThemedText>
        </TouchableOpacity>
      </View>

      <StatusBarGradient />
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
    paddingBottom: 120,
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
    paddingVertical: 11,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 0,
  },
  actionButtonText: {
    fontSize: 16,
    fontFamily: 'Prompt-Medium',
    marginLeft: 8,
    color: '#333',
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#183A7C',
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 40,
    borderTopWidth: 0.5,
    borderTopColor: '#F0F0F0',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 1,
  },
  primaryButtonText: {
    fontSize: 18,
    fontFamily: 'Prompt-SemiBold',
    marginLeft: 8,
    color: 'white',
  },
})
