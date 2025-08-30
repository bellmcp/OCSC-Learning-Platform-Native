import { router } from 'expo-router'
import React from 'react'
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'

import StatusBarGradient from '@/components/StatusBarGradient'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { useThemeColor } from '@/hooks/useThemeColor'

// Mock certificate data based on the screenshot
const mockCourseCertificates = [
  {
    id: '002M',
    name: 'ผู้นำทีมที่มีประสิทธิภาพ',
    type: 'หลักสูตร',
    status: 'ผ่านเกณฑ์แล้ว',
    completionDate: '13 ร.ค. 2566',
    enrollmentPeriod: '1 ม.ค. 2564 ถึง 13 ร.ค. 2566',
  },
]

const mockSubjectCertificates = [
  {
    id: 'DS26',
    name: 'AI Basic',
    type: 'รายวิชา',
    status: 'ผ่านเกณฑ์แล้ว',
    completionDate: '30 พ.ค. 2568',
    enrollmentPeriod: '1 ม.ค. 2564 ถึง 30 พ.ค. 2568',
  },
  {
    id: 'KD09',
    name: 'คดีปกครองและวิธีพิจารณาคดีปกครอง',
    type: 'รายวิชา',
    status: 'ผ่านเกณฑ์แล้ว',
    completionDate: '19 ส.ค. 2568',
    enrollmentPeriod: '19 ส.ค. 2568 ถึง 19 ส.ค. 2568',
  },
]

export default function CertificateListScreen() {
  const backgroundColor = useThemeColor({}, 'background')
  const tintColor = useThemeColor({}, 'tint')
  const iconColor = useThemeColor({}, 'icon')

  const handleBack = () => {
    router.back()
  }

  const handlePrintCertificate = (certificate: any) => {
    router.push('/certificate' as any)
  }

  const renderCertificateItem = (
    certificate: any,
    index: number,
    isLast: boolean
  ) => (
    <ThemedView
      key={certificate.id}
      style={[styles.certificateCard, isLast && styles.lastItem]}
    >
      {/* Main content area */}
      <ThemedView style={styles.mainContent}>
        <ThemedView style={styles.certificateContent}>
          <ThemedView style={styles.contentHeader}>
            <ThemedView style={styles.titleSection}>
              <ThemedText
                type='defaultSemiBold'
                style={styles.certificateTitle}
                numberOfLines={1}
              >
                {certificate.name}
              </ThemedText>
              <ThemedText style={styles.certificateCode} numberOfLines={1}>
                {certificate.type} {certificate.id}
              </ThemedText>
              <ThemedText
                style={[styles.certificateStatus, { color: '#10B981' }]}
                numberOfLines={1}
              >
                {certificate.status}
              </ThemedText>

              <ThemedView style={styles.dateInfo}>
                <ThemedText
                  style={[styles.dateLabel, { marginBottom: 4 }]}
                  numberOfLines={1}
                >
                  <ThemedText style={styles.dateLabelBold}>
                    สำเร็จการศึกษา{' '}
                  </ThemedText>
                  {certificate.completionDate}
                </ThemedText>
                <ThemedText style={styles.dateLabel} numberOfLines={1}>
                  <ThemedText style={styles.dateLabelBold}>
                    ระยะเวลาเข้าเรียน{' '}
                  </ThemedText>
                  {certificate.enrollmentPeriod}
                </ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      {/* Divider */}
      <ThemedView style={styles.divider} />

      {/* Button section */}
      <ThemedView style={styles.buttonSection}>
        <TouchableOpacity
          style={styles.printButton}
          onPress={() => handlePrintCertificate(certificate)}
        >
          <IconSymbol name='printer' size={16} color='#183A7C' />
          <ThemedText style={styles.printButtonText}>
            พิมพ์ประกาศนียบัตร
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  )

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
        {/* Info Card */}
        <ThemedView style={styles.infoCard}>
          <IconSymbol
            name='doc.text.fill'
            size={48}
            color={tintColor}
            style={styles.infoIcon}
          />
          <ThemedText type='subtitle' style={styles.infoTitle}>
            ประกาศนียบัตรของคุณ
          </ThemedText>
          <ThemedText style={styles.infoSubtitle}>
            ดูและจัดการประกาศนียบัตรทั้งหมดที่คุณได้รับจากการเรียนจบหลักสูตรและรายวิชาต่างๆ
          </ThemedText>
        </ThemedView>

        {/* Course Certificates Section */}
        <ThemedView style={styles.sectionContainer}>
          <ThemedText type='subtitle' style={styles.sectionTitle}>
            ประกาศนียบัตรหลักสูตร
          </ThemedText>

          {mockCourseCertificates.map((certificate, index) =>
            renderCertificateItem(
              certificate,
              index,
              index === mockCourseCertificates.length - 1
            )
          )}
        </ThemedView>

        {/* Subject Certificates Section */}
        <ThemedView style={styles.sectionContainer}>
          <ThemedText type='subtitle' style={styles.sectionTitle}>
            ประกาศนียบัตรรายวิชา
          </ThemedText>

          {mockSubjectCertificates.map((certificate, index) =>
            renderCertificateItem(
              certificate,
              index,
              index === mockSubjectCertificates.length - 1
            )
          )}
        </ThemedView>

        {/* Help Section */}
        <ThemedView style={styles.helpContainer}>
          <ThemedText type='subtitle' style={styles.helpTitle}>
            ต้องการความช่วยเหลือ?
          </ThemedText>
          <ThemedText style={styles.helpDescription}>
            หากคุณมีคำถามเกี่ยวกับประกาศนียบัตร{'\n'}
            กรุณาติดต่อเจ้าหน้าที่
          </ThemedText>
          <TouchableOpacity style={styles.helpButton}>
            <IconSymbol
              name='questionmark.circle'
              size={20}
              color={tintColor}
            />
            <ThemedText style={[styles.helpButtonText, { color: tintColor }]}>
              ติดต่อเจ้าหน้าที่
            </ThemedText>
          </TouchableOpacity>
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
    paddingTop: 20,
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
  infoCard: {
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 30,
    padding: 24,
    borderRadius: 16,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  infoIcon: {
    marginBottom: 16,
  },
  infoTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  infoSubtitle: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 20,
  },
  sectionContainer: {
    marginHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#183A7C',
  },
  certificateCard: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    overflow: 'hidden',
    marginBottom: 12,
  },
  lastItem: {
    marginBottom: 0,
  },
  mainContent: {
    flexDirection: 'row',
    minHeight: 140,
  },
  certificateContent: {
    padding: 16,
    flex: 1,
    justifyContent: 'center',
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleSection: {
    flex: 1,
    paddingRight: 12,
  },
  certificateTitle: {
    fontSize: 16,
    fontWeight: 'medium',
    marginBottom: 0,
  },
  certificateCode: {
    fontSize: 14,
    marginBottom: 4,
  },
  certificateStatus: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
    fontWeight: '600',
    fontFamily: 'Prompt-SemiBold',
  },
  dateInfo: {
    marginBottom: 0,
  },
  dateLabel: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  dateLabelBold: {
    fontSize: 12,
    fontFamily: 'Prompt-SemiBold',
    lineHeight: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
  },
  buttonSection: {
    padding: 12,
  },
  printButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: 'transparent',
    width: '100%',
  },
  printButtonText: {
    fontSize: 16,
    fontFamily: 'Prompt-Medium',
    color: '#183A7C',
    marginLeft: 8,
  },
  helpContainer: {
    marginHorizontal: 20,
    marginBottom: 40,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
  },
  helpTitle: {
    marginBottom: 8,
    color: '#183A7C',
  },
  helpDescription: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#183A7C',
  },
  helpButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
})
