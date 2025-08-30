import { Image } from 'expo-image'
import { router } from 'expo-router'
import React, { useState } from 'react'
import {
  Alert,
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

// Mock certificate data
const mockCertificate = {
  id: 'CERT-2024-001',
  name: 'สมชาย รักเรียน',
  citizenId: '1909802321001',
  position: 'นักพัฒนาซอฟต์แวร์',
  department: 'สำนักงานคณะกรรมการข้าราชการพลเรือน',
  issueDate: '15 มกราคม 2025',
  expiryDate: '15 มกราคม 2028',
  certificateType: 'ประกาศนียบัตร ก.พ.',
  status: 'active',
}

export default function CertificateScreen() {
  const backgroundColor = useThemeColor({}, 'background')
  const tintColor = useThemeColor({}, 'tint')
  const iconColor = useThemeColor({}, 'icon')
  const [selectedCertificate, setSelectedCertificate] =
    useState(mockCertificate)

  const handlePrint = () => {
    Alert.alert(
      'พิมพ์ประกาศนียบัตร',
      'คุณต้องการพิมพ์ประกาศนียบัตรนี้หรือไม่?',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'พิมพ์',
          onPress: () => {
            // Here you would implement actual printing logic
            Alert.alert('สำเร็จ', 'กำลังพิมพ์ประกาศนียบัตร...')
          },
        },
      ]
    )
  }

  const handleDownload = () => {
    Alert.alert(
      'ดาวน์โหลดประกาศนียบัตร',
      'คุณต้องการดาวน์โหลดประกาศนียบัตรในรูปแบบ PDF หรือไม่?',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'ดาวน์โหลด PDF',
          onPress: () => {
            // Here you would implement actual download logic
            Alert.alert('สำเร็จ', 'กำลังดาวน์โหลดประกาศนียบัตร...')
          },
        },
      ]
    )
  }

  const handleBack = () => {
    router.back()
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
        {/* Certificate Preview */}
        <ThemedView style={styles.certificateContainer}>
          <ThemedView style={styles.certificateHeader}>
            <Image
              source={require('@/assets/images/logo192.png')}
              style={styles.logo}
              contentFit='contain'
            />
            <ThemedText type='title' style={styles.certificateTitle}>
              ประกาศนียบัตร
            </ThemedText>
            <ThemedText style={styles.certificateSubtitle}>
              สำนักงานคณะกรรมการข้าราชการพลเรือน
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.certificateContent}>
            <ThemedView style={styles.certificateInfo}>
              <ThemedText style={styles.certificateNumber}>
                เลขที่: {selectedCertificate.id}
              </ThemedText>

              <ThemedView style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>ชื่อ-นามสกุล:</ThemedText>
                <ThemedText type='defaultSemiBold' style={styles.infoValue}>
                  {selectedCertificate.name}
                </ThemedText>
              </ThemedView>

              <ThemedView style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>
                  เลขประจำตัวประชาชน:
                </ThemedText>
                <ThemedText type='defaultSemiBold' style={styles.infoValue}>
                  {selectedCertificate.citizenId}
                </ThemedText>
              </ThemedView>

              <ThemedView style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>ตำแหน่ง:</ThemedText>
                <ThemedText type='defaultSemiBold' style={styles.infoValue}>
                  {selectedCertificate.position}
                </ThemedText>
              </ThemedView>

              <ThemedView style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>หน่วยงาน:</ThemedText>
                <ThemedText type='defaultSemiBold' style={styles.infoValue}>
                  {selectedCertificate.department}
                </ThemedText>
              </ThemedView>

              <ThemedView style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>วันที่ออก:</ThemedText>
                <ThemedText type='defaultSemiBold' style={styles.infoValue}>
                  {selectedCertificate.issueDate}
                </ThemedText>
              </ThemedView>

              <ThemedView style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>วันหมดอายุ:</ThemedText>
                <ThemedText type='defaultSemiBold' style={styles.infoValue}>
                  {selectedCertificate.expiryDate}
                </ThemedText>
              </ThemedView>
            </ThemedView>

            <ThemedView style={styles.certificateFooter}>
              <ThemedText style={styles.footerText}>
                ประกาศนียบัตรนี้เป็นเอกสารสำคัญ กรุณาเก็บรักษาไว้อย่างดี
              </ThemedText>
              <ThemedText style={styles.footerText}>
                หากสูญหายหรือเสียหาย กรุณาติดต่อหน่วยงานที่เกี่ยวข้อง
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        {/* Action Buttons */}
        <ThemedView style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: tintColor }]}
            onPress={handlePrint}
          >
            <IconSymbol name='printer' size={20} color='white' />
            <ThemedText style={styles.actionButtonText}>
              พิมพ์ประกาศนียบัตร
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={handleDownload}
          >
            <IconSymbol name='arrow.down.circle' size={20} color={tintColor} />
            <ThemedText style={[styles.actionButtonText, { color: tintColor }]}>
              ดาวน์โหลด PDF
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
          >
            <IconSymbol
              name='square.and.arrow.up'
              size={20}
              color={tintColor}
            />
            <ThemedText style={[styles.actionButtonText, { color: tintColor }]}>
              แชร์ประกาศนียบัตร
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {/* Certificate History */}
        <ThemedView style={styles.historyContainer}>
          <ThemedText type='subtitle' style={styles.sectionTitle}>
            ประวัติประกาศนียบัตร
          </ThemedText>

          <ThemedView style={styles.historyItem}>
            <IconSymbol name='doc.text' size={20} color={iconColor} />
            <ThemedView style={styles.historyContent}>
              <ThemedText type='defaultSemiBold'>ประกาศนียบัตร ก.พ.</ThemedText>
              <ThemedText style={styles.historyDate}>
                ออกเมื่อ 15 มกราคม 2025
              </ThemedText>
              <ThemedText style={styles.historyStatus}>
                สถานะ: ใช้งานได้
              </ThemedText>
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.historyItem}>
            <IconSymbol name='clock' size={20} color={iconColor} />
            <ThemedView style={styles.historyContent}>
              <ThemedText type='defaultSemiBold'>
                ประกาศนียบัตร ก.พ. (เก่า)
              </ThemedText>
              <ThemedText style={styles.historyDate}>
                ออกเมื่อ 15 มกราคม 2022
              </ThemedText>
              <ThemedText style={styles.historyStatus}>
                สถานะ: หมดอายุ
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </ScrollView>
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
    paddingTop: 20, // Add space below fixed header
  },
  header: {
    paddingTop: 80,
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
    fontWeight: 'bold',
  },
  certificateContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  certificateHeader: {
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 16,
    borderRadius: 8,
  },
  certificateTitle: {
    fontSize: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  certificateSubtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  certificateContent: {
    gap: 20,
  },
  certificateInfo: {
    gap: 16,
  },
  certificateNumber: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLabel: {
    fontSize: 16,
    opacity: 0.7,
    flex: 1,
  },
  infoValue: {
    fontSize: 16,
    flex: 2,
    textAlign: 'right',
  },
  certificateFooter: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 8,
  },
  footerText: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  actionsContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
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
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#183A7C',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    color: 'white',
  },
  historyContainer: {
    marginHorizontal: 20,
    marginBottom: 40,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    marginBottom: 20,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  historyContent: {
    marginLeft: 16,
    flex: 1,
  },
  historyDate: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  historyStatus: {
    fontSize: 14,
    opacity: 0.8,
    marginTop: 2,
    fontStyle: 'italic',
  },
})
