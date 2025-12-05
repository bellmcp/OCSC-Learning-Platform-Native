import { Image } from 'expo-image'
import { router } from 'expo-router'
import React from 'react'
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'

import StatusBarGradient from '@/components/StatusBarGradient'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { useThemeColor } from '@/hooks/useThemeColor'

// Certificate data
const certificateData = {
  studentName: 'นายสมชาย รักเรียน',
  completionDate: '13 ธันวาคม 2566',
  certifyingAgency: 'สำนักงาน ก.พ.',
  curriculumTitle: 'หลักสูตร ผู้นำทีมที่มีประสิทธิภาพ',
  curriculumCode: '002M',
  totalHours: '45 ชั่วโมง',
}

export default function CertificateScreen() {
  const backgroundColor = useThemeColor({}, 'background')
  const tintColor = useThemeColor({}, 'tint')
  const iconColor = useThemeColor({}, 'icon')

  const handleBack = () => {
    router.back()
  }

  const handleSaveAsImage = () => {
    Alert.alert(
      'บันทึกเป็นไฟล์รูปภาพ',
      'คุณต้องการบันทึกประกาศนียบัตรเป็นไฟล์รูปภาพหรือไม่?',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'บันทึก',
          onPress: () => {
            Alert.alert(
              'สำเร็จ',
              'บันทึกประกาศนียบัตรเป็นไฟล์รูปภาพเรียบร้อยแล้ว'
            )
          },
        },
      ]
    )
  }

  const handleSaveAsPDF = () => {
    Alert.alert(
      'บันทึกเป็นไฟล์ PDF',
      'คุณต้องการบันทึกประกาศนียบัตรเป็นไฟล์ PDF หรือไม่?',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'บันทึก',
          onPress: () => {
            Alert.alert(
              'สำเร็จ',
              'บันทึกประกาศนียบัตรเป็นไฟล์ PDF เรียบร้อยแล้ว'
            )
          },
        },
      ]
    )
  }

  const handlePrint = () => {
    Alert.alert('สั่งพิมพ์', 'คุณต้องการพิมพ์ประกาศนียบัตรนี้หรือไม่?', [
      { text: 'ยกเลิก', style: 'cancel' },
      {
        text: 'พิมพ์',
        onPress: () => {
          Alert.alert('สำเร็จ', 'กำลังพิมพ์ประกาศนียบัตร...')
        },
      },
    ])
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
        {/* Curriculum Title Section */}
        <ThemedView style={styles.curriculumContainer}>
          <ThemedText type='title' style={styles.curriculumTitle}>
            {certificateData.curriculumTitle}
          </ThemedText>
          <ThemedView style={styles.curriculumDetails}>
            <ThemedText style={styles.curriculumCode}>
              {certificateData.curriculumCode}
            </ThemedText>
            <ThemedText style={[styles.curriculumHours, { color: '#10B981' }]}>
              ผ่านเกณฑ์แล้ว
            </ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Certificate Metadata */}
        <ThemedView style={styles.metadataContainer}>
          <ThemedView style={styles.metadataItem}>
            <ThemedText style={styles.metadataLabel}>
              ผู้สำเร็จการศึกษา
            </ThemedText>
            <ThemedText type='defaultSemiBold' style={styles.metadataValue}>
              {certificateData.studentName}
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.metadataItem}>
            <ThemedText style={styles.metadataLabel}>
              วันที่สำเร็จการศึกษา
            </ThemedText>
            <ThemedText type='defaultSemiBold' style={styles.metadataValue}>
              {certificateData.completionDate}
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.metadataItem}>
            <ThemedText style={styles.metadataLabel}>หน่วยงานรับรอง</ThemedText>
            <ThemedText type='defaultSemiBold' style={styles.metadataValue}>
              {certificateData.certifyingAgency}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Certificate Image */}
        <ThemedView style={styles.certificateContainer}>
          <Image
            source={require('@/assets/images/ประกาศนียบัตรหลักสูตรผู้นำทีมที่มีประสิทธิภาพ-สมชาย รักเรียน (1).png')}
            style={styles.certificateImage}
            contentFit='contain'
            resizeMode='contain'
          />
        </ThemedView>

        {/* Action Buttons */}
        <ThemedView style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={handleSaveAsImage}
          >
            <IconSymbol name='photo' size={20} color={tintColor} />
            <ThemedText style={[styles.actionButtonText, { color: tintColor }]}>
              บันทึกเป็นไฟล์รูปภาพ
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={handleSaveAsPDF}
          >
            <IconSymbol name='arrow.down.circle' size={20} color={tintColor} />
            <ThemedText style={[styles.actionButtonText, { color: tintColor }]}>
              บันทึกเป็นไฟล์ PDF
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>

      {/* Fixed Bottom Bar */}
      <View style={[styles.fixedButtonContainer, { backgroundColor }]}>
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: tintColor }]}
          onPress={handlePrint}
        >
          <IconSymbol name='printer' size={20} color='white' />
          <ThemedText style={styles.primaryButtonText}>สั่งพิมพ์</ThemedText>
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
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
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
  curriculumContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  curriculumTitle: {
    fontSize: 20,
    fontFamily: 'Prompt-SemiBold',
    marginBottom: 0,
    textAlign: 'left',
    color: '#183A7C',
    lineHeight: 28,
  },
  curriculumDetails: {
    alignItems: 'flex-start',
    gap: 8,
  },
  curriculumCode: {
    fontSize: 16,
    fontFamily: 'Prompt-SemiBold',
    color: '#666',
  },
  curriculumHours: {
    fontSize: 14,
    color: '#888',
    fontFamily: 'Prompt-SemiBold',
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
    alignItems: 'center',
  },
  certificateImage: {
    width: '100%',
    height: 500,
    borderRadius: 8,
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
