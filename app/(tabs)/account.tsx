import { Image } from 'expo-image'
import { router } from 'expo-router'
import React, { useContext, useRef, useState } from 'react'
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'

import StatusBarGradient from '@/components/StatusBarGradient'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { useThemeColor } from '@/hooks/useThemeColor'
import { LoginContext } from './_layout'

// Mock user data
const mockUser = {
  id: 'USR-2024-001',
  name: 'สมชาย รักเรียน',
  email: 'wutipat.k@ocsc.go.th',
  avatar: 'https://bellmcp.work/img/Profile.jpg',
  role: 'Senior Developer',
  department: 'Software Engineer',
  joinDate: 'มกราคม 2023',
  completedCourses: 12,
  totalHours: 48,
}

export default function AccountScreen() {
  const backgroundColor = useThemeColor({}, 'background')
  const tintColor = useThemeColor({}, 'tint')
  const iconColor = useThemeColor({}, 'icon')
  const scrollViewRef = useRef<ScrollView>(null)

  // Use shared login context instead of local state
  const { isLoggedIn, setIsLoggedIn } = useContext(LoginContext)

  // Local form state
  const [activeTab, setActiveTab] = useState(0) // 0 = ThaiD, 1 = Traditional
  const [citizenId, setCitizenId] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Reset scroll position when component mounts or becomes visible
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false })
    }, 100) // Small delay to ensure component is mounted

    return () => clearTimeout(timeout)
  }, [])

  const handleLogin = () => {
    // Bypass all validation - allow login with any input or empty fields
    setIsLoggedIn(true)
    setCitizenId('')
    setPassword('')
    setOtp('')
  }

  const handleLogout = () => {
    Alert.alert('ยืนยันการออกจากระบบ', 'คุณต้องการออกจากระบบหรือไม่?', [
      { text: 'ยกเลิก', style: 'cancel' },
      {
        text: 'ออกจากระบบ',
        style: 'destructive',
        onPress: () => setIsLoggedIn(false),
      },
    ])
  }

  const handlePrintCertificate = () => {
    router.push('/certificate')
  }

  // Login Form Component with Tabs
  const LoginForm = () => (
    <ThemedView style={styles.loginContainer}>
      {/* Header */}
      <ThemedView style={styles.header}>
        <ThemedText type='title' style={styles.headerTitle}>
          เข้าสู่ระบบ
        </ThemedText>
      </ThemedView>

      {/* Tab Navigation */}
      <ThemedView style={styles.tabSection}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,

              activeTab === 0 && {
                backgroundColor: tintColor,
                borderColor: tintColor,
                shadowColor: tintColor,
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 3,
              },
              { borderTopRightRadius: 0, borderBottomRightRadius: 0 },
            ]}
            onPress={() => setActiveTab(0)}
            activeOpacity={0.9}
          >
            <View style={styles.tabContent}>
              <Image
                source={require('@/assets/images/thaid_logo.jpg')}
                style={[
                  styles.tabIcon,
                  activeTab !== 0 && { opacity: 0.5 },
                  { borderRadius: 4 },
                ]}
                contentFit='contain'
              />
              <ThemedText
                style={[
                  styles.tabButtonText,
                  activeTab === 0 && {
                    color: '#FFFFFF',
                    fontWeight: '700',
                  },
                ]}
              >
                แอปพลิเคชัน ThaiD
              </ThemedText>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 1 && {
                backgroundColor: tintColor,
                borderColor: tintColor,
                shadowColor: tintColor,
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 3,
              },
              { borderTopLeftRadius: 0, borderBottomLeftRadius: 0 },
            ]}
            onPress={() => setActiveTab(1)}
            activeOpacity={0.8}
          >
            <View style={styles.tabContent}>
              <IconSymbol
                name='creditcard'
                size={16}
                color={activeTab === 1 ? '#FFFFFF' : '#666666'}
                style={styles.tabIcon}
              />
              <ThemedText
                style={[
                  styles.tabButtonText,
                  activeTab === 1 && {
                    color: '#FFFFFF',
                    fontWeight: '700',
                  },
                ]}
              >
                เลขประชาชน {'\n'}รหัสผ่าน และ OTP
              </ThemedText>
            </View>
          </TouchableOpacity>
        </View>
      </ThemedView>

      <ThemedView style={styles.loginCard}>
        {/* ThaiD Login Tab */}
        {activeTab === 0 && (
          <ThemedView style={styles.tabContent}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: tintColor, marginVertical: 48 },
              ]}
              onPress={handleLogin}
            >
              <Image
                source={require('@/assets/images/thaid_logo.jpg')}
                style={styles.thaidLogo}
                contentFit='contain'
              />
              <ThemedText style={styles.actionButtonText}>
                เข้าสู่ระบบด้วยแอปพลิเคชัน ThaiD
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        )}

        {/* Traditional Login Tab */}
        {activeTab === 1 && (
          <ThemedView style={styles.tabContent}>
            {/* Citizen ID Input */}
            <ThemedView style={styles.inputContainer}>
              <ThemedText style={styles.inputLabel}>
                เลขประจำตัวประชาชน{' '}
                <ThemedText style={styles.required}>*</ThemedText>
              </ThemedText>
              <ThemedView style={styles.inputWrapper}>
                <IconSymbol
                  name='person'
                  size={20}
                  color={iconColor}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  value={citizenId}
                  onChangeText={setCitizenId}
                  placeholder='0-0000-00000-00-0'
                  placeholderTextColor='#999'
                  keyboardType='numeric'
                  maxLength={13}
                />
              </ThemedView>
            </ThemedView>

            {/* Password Input */}
            <ThemedView style={styles.inputContainer}>
              <ThemedText style={styles.inputLabel}>
                รหัสผ่าน <ThemedText style={styles.required}>*</ThemedText>
              </ThemedText>
              <ThemedView style={styles.inputWrapper}>
                <IconSymbol
                  name='lock'
                  size={20}
                  color={iconColor}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  value={password}
                  onChangeText={setPassword}
                  placeholder='กรอกรหัสผ่าน'
                  placeholderTextColor='#999'
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.passwordToggle}
                >
                  <IconSymbol
                    name={showPassword ? 'eye.slash' : 'eye'}
                    size={20}
                    color={iconColor}
                  />
                </TouchableOpacity>
              </ThemedView>
            </ThemedView>

            {/* OTP Input */}
            <ThemedView style={styles.inputContainer}>
              <ThemedText style={styles.inputLabel}>
                OTP จากโมบายแอป JOB OCSC (6 หลัก){' '}
                <ThemedText style={styles.required}>*</ThemedText>
              </ThemedText>
              <ThemedView style={styles.inputWrapper}>
                <IconSymbol
                  name='key'
                  size={20}
                  color={iconColor}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  value={otp}
                  onChangeText={setOtp}
                  placeholder='0 0 0 0 0 0'
                  placeholderTextColor='#999'
                  keyboardType='numeric'
                  maxLength={6}
                />
              </ThemedView>
            </ThemedView>

            {/* Forgot Password */}
            <TouchableOpacity style={styles.forgotPassword}>
              <ThemedText
                style={[styles.forgotPasswordText, { color: tintColor }]}
              >
                ลืมรหัสผ่าน
              </ThemedText>
              <IconSymbol
                name='chevron.right'
                size={16}
                color={tintColor}
                style={styles.arrowIcon}
              />
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: '#ccc', width: '100%' },
              ]}
              onPress={handleLogin}
            >
              <ThemedText style={[styles.actionButtonText, { marginLeft: 0 }]}>
                เข้าสู่ระบบ
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        )}

        {/* Registration Link */}
        <ThemedView style={styles.registrationContainer}>
          <ThemedText style={styles.registrationText}>
            ยังไม่มีบัญชีใช่ไหม?
          </ThemedText>
          <TouchableOpacity style={styles.registrationLink}>
            <ThemedText
              style={[styles.registrationLinkText, { color: tintColor }]}
            >
              สมัครสมาชิก
            </ThemedText>
            <IconSymbol
              name='chevron.right'
              size={16}
              color={tintColor}
              style={styles.arrowIcon}
            />
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  )

  // If not logged in, show login form
  if (!isLoggedIn) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.loginScrollContent}
        >
          <LoginForm />
        </ScrollView>
        <StatusBarGradient />
      </ThemedView>
    )
  }

  // If logged in, show account profile
  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <ScrollView ref={scrollViewRef} style={styles.scrollContainer}>
        {/* Header Section */}
        <ThemedView style={styles.profileHeader}>
          <ThemedView style={styles.avatarContainer}>
            {/* <Image
              source={{ uri: mockUser.avatar }}
              style={styles.avatar}
              contentFit='cover'
            /> */}
            <IconSymbol
              name='person.circle.fill'
              size={64}
              color={tintColor}
              style={styles.avatar}
            />
          </ThemedView>

          {/* Notification Bell Icon */}
          <TouchableOpacity
            style={styles.notificationBell}
            onPress={() => router.push('/notifications' as any)}
          >
            <IconSymbol name='bell' size={24} color={iconColor} />
            {/* Notification Badge */}
            <ThemedView style={styles.notificationBadge}>
              <ThemedText style={styles.notificationBadgeText}>2</ThemedText>
            </ThemedView>
          </TouchableOpacity>

          <ThemedView style={styles.userInfo}>
            <ThemedText type='title' style={styles.userName}>
              {mockUser.name}
            </ThemedText>
            <ThemedText style={[styles.userRole, { color: tintColor }]}>
              1 2345 67890 12 3
            </ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Stats Section */}
        <ThemedView style={styles.statsContainer}>
          <ThemedView style={styles.statItem}>
            <IconSymbol name='book.closed' size={32} color={tintColor} />
            <ThemedText
              type='title'
              style={[styles.statNumber, { color: tintColor }]}
            >
              {mockUser.completedCourses}
            </ThemedText>
            <ThemedText style={styles.statLabel}>
              เนื้อหาที่เรียนจบแล้ว
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.statDivider} />

          <TouchableOpacity
            style={styles.statItem}
            onPress={() => router.push('/coins' as any)}
          >
            <IconSymbol name='star.circle' size={32} color={tintColor} />
            <ThemedText
              type='title'
              style={[styles.statNumber, { color: tintColor }]}
            >
              {mockUser.totalHours}
            </ThemedText>
            <ThemedText style={styles.statLabel}>คะแนนการเรียนรู้</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {/* Profile Details */}
        {/* <ThemedView style={styles.detailsContainer}>
          <ThemedText type='subtitle' style={styles.sectionTitle}>
            ข้อมูลส่วนตัว
          </ThemedText>

          <ThemedView style={styles.detailItem}>
            <IconSymbol name='calendar' size={20} color={iconColor} />
            <ThemedView style={styles.detailContent}>
              <ThemedText style={styles.detailLabel}>
                สมัครสมาชิกเมื่อ
              </ThemedText>
              <ThemedText type='defaultSemiBold'>
                {mockUser.joinDate}
              </ThemedText>
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.detailItem}>
            <IconSymbol name='envelope' size={20} color={iconColor} />
            <ThemedView style={styles.detailContent}>
              <ThemedText style={styles.detailLabel}>อีเมล</ThemedText>
              <ThemedText type='defaultSemiBold'>{mockUser.email}</ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView> */}

        {/* Action Buttons */}
        <ThemedView style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={handlePrintCertificate}
          >
            <IconSymbol name='printer' size={20} color={tintColor} />
            <ThemedText style={[styles.actionButtonText, { color: tintColor }]}>
              พิมพ์ประกาศนียบัตร ก.พ.
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
          >
            <IconSymbol name='doc.text' size={20} color={tintColor} />
            <ThemedText style={[styles.actionButtonText, { color: tintColor }]}>
              ประวัติการเรียน
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
          >
            <IconSymbol name='pencil' size={20} color={tintColor} />
            <ThemedText style={[styles.actionButtonText, { color: tintColor }]}>
              แก้ไขข้อมูลส่วนบุคคล
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => router.push('/change-password' as any)}
          >
            <IconSymbol name='lock' size={20} color={tintColor} />
            <ThemedText style={[styles.actionButtonText, { color: tintColor }]}>
              เปลี่ยนรหัสผ่าน
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: tintColor, marginTop: 16 },
            ]}
            onPress={handleLogout}
          >
            <IconSymbol name='arrow.right.square' size={20} color='white' />
            <ThemedText style={styles.actionButtonText}>ออกจากระบบ</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {/* Footer */}
        <ThemedView style={styles.footer}>
          <ThemedText
            style={
              (styles.footerText,
              { fontFamily: 'Prompt-SemiBold', fontSize: 13, marginBottom: 10 })
            }
          >
            สำนักงานคณะกรรมการข้าราชการพลเรือน (สำนักงาน ก.พ.)
          </ThemedText>
          <ThemedText style={styles.footerText}>
            47/111 หมู่ 4 ถนนติวานนท์ ตำบลตลาดขวัญ{'\n'}อำเภอเมือง
            จังหวัดนนทบุรี 11000
          </ThemedText>
          <ThemedText style={[styles.footerText, styles.footerHighlight]}>
            นโยบายและแนวปฏิบัติในการคุ้มครองข้อมูลส่วนบุคคล
          </ThemedText>
          <ThemedText style={styles.footerText}>
            Copyright © 2568 Office of the Civil Service Commission
          </ThemedText>
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
  scrollContainer: {
    flex: 1,
  },
  required: {
    color: '#ff4444',
  },
  // Login styles
  loginContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  loginScrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 80 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 0,
  },
  loginCard: {
    width: '100%',
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginTop: 0,
    backgroundColor: 'white',
  },

  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Prompt-SemiBold',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontFamily: 'Prompt-Regular',
  },
  passwordToggle: {
    padding: 4,
  },
  forgotPassword: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontFamily: 'Prompt-Regular',
    marginRight: 4,
  },

  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#E0E0E0',
    marginBottom: 24,
  },
  registrationContainer: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  registrationText: {
    fontSize: 14,
    color: '#666',
  },
  registrationLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  registrationLinkText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  arrowIcon: {
    marginLeft: 2,
  },
  // Tab styles
  tabSection: {},
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  tabButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    transform: [{ scale: 1 }],
  },

  tabIcon: {
    width: 24,
    height: 24,
    marginBottom: 6,
  },

  tabContent: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Prompt-Medium',
    color: '#666666',
    fontWeight: '600',
    textAlign: 'center',
  },

  // Existing account styles
  profileHeader: {
    alignItems: 'center',
    paddingTop: 100,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    marginBottom: 4,
    textAlign: 'center',
  },
  userRole: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  userDepartment: {
    fontSize: 16,
    opacity: 0.7,
  },
  idCard: {
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
  idHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  idTitle: {
    marginLeft: 8,
    fontSize: 16,
  },
  userId: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    letterSpacing: 1,
  },
  userEmail: {
    fontSize: 14,
    opacity: 0.7,
  },
  statsContainer: {
    flexDirection: 'row',
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
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E5E5',
    marginHorizontal: 20,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
  },
  detailsContainer: {
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
  sectionTitle: {
    marginBottom: 20,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailContent: {
    marginLeft: 16,
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 2,
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#183A7C',
  },
  actionButtonText: {
    fontSize: 15,
    fontFamily: 'Prompt-Medium',
    color: 'white',
    marginLeft: 8,
  },
  thaidLogo: {
    width: 24,
    height: 24,
    borderRadius: 4,
    marginRight: 6,
  },
  notificationBell: {
    position: 'absolute',
    top: 100,
    right: 30,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  notificationBadgeText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Prompt-SemiBold',
    lineHeight: 18,
  },
  loginNotificationBell: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  footerText: {
    fontSize: 12,
    lineHeight: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 14,
  },
  footerHighlight: {
    color: '#183A7C',
    fontWeight: 'bold',
  },
})
