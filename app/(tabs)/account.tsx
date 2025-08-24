import { Image } from 'expo-image'
import { router } from 'expo-router'
import React, { useContext, useRef, useState } from 'react'
import {
  Alert,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
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
  name: 'วุฒิภัทร คำนวนสินธุ์',
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
  const [citizenId, setCitizenId] = useState('')
  const [password, setPassword] = useState('')
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

  // Login Form Component
  const LoginForm = () => (
    <ThemedView style={styles.loginContainer}>
      {/* Header */}
      <ThemedView style={styles.loginHeader}>
        <ThemedText type='title' style={styles.loginHeaderTitle}>
          เข้าสู่ระบบ
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.loginCard}>
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
              placeholder='กรอกเลขประจำตัวประชาชน'
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

        {/* Forgot Password */}
        <TouchableOpacity style={styles.forgotPassword}>
          <ThemedText style={styles.forgotPasswordText}>ลืมรหัสผ่าน</ThemedText>
        </TouchableOpacity>

        {/* Login Button */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: tintColor, marginTop: 16 },
          ]}
          onPress={handleLogin}
        >
          <IconSymbol name='arrow.right.square' size={20} color='white' />
          <ThemedText style={styles.actionButtonText}>เข้าสู่ระบบ</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.secondaryButton,
            { marginTop: 16, marginBottom: 32 },
          ]}
          onPress={handleLogin}
        >
          <Image
            source={require('@/assets/images/thaid_logo.jpg')}
            style={styles.thaidLogo}
            contentFit='contain'
          />
          <ThemedText style={[styles.actionButtonText, { color: tintColor }]}>
            เข้าสู่ระบบด้วยแอปพลิเคชัน ThaiD
          </ThemedText>
        </TouchableOpacity>

        {/* Divider */}
        <ThemedView style={styles.divider} />

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
        <LoginForm />
        <StatusBarGradient />
      </ThemedView>
    )
  }

  // If logged in, show account profile
  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <ScrollView ref={scrollViewRef} style={styles.scrollContainer}>
        {/* Header Section */}
        <ThemedView style={styles.header}>
          <ThemedView style={styles.avatarContainer}>
            <Image
              source={{ uri: mockUser.avatar }}
              style={styles.avatar}
              contentFit='cover'
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
              <ThemedText style={styles.notificationBadgeText}>3</ThemedText>
            </ThemedView>
          </TouchableOpacity>

          <ThemedView style={styles.userInfo}>
            <ThemedText type='title' style={styles.userName}>
              {mockUser.name}
            </ThemedText>
            <ThemedText style={[styles.userRole, { color: tintColor }]}>
              1909802321001
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
            <ThemedText style={styles.statLabel}>จำนวนเหรียญสะสม</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {/* Profile Details */}
        <ThemedView style={styles.detailsContainer}>
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

          {/* <ThemedView style={styles.detailItem}>
            <IconSymbol name='building.2' size={20} color={iconColor} />
            <ThemedView style={styles.detailContent}>
              <ThemedText style={styles.detailLabel}>หน่วยงาน</ThemedText>
              <ThemedText type='defaultSemiBold'>
                {mockUser.department}
              </ThemedText>
            </ThemedView>
          </ThemedView> */}
        </ThemedView>

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
    paddingTop: 100,
  },
  loginHeader: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    position: 'relative',
  },
  loginHeaderTitle: {
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 0,
  },
  loginCard: {
    width: '100%',
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
    borderColor: '#F0F0F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    alignSelf: 'flex-start',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#666',
    textDecorationLine: 'underline',
  },

  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#E0E0E0',
    marginBottom: 24,
  },
  registrationContainer: {
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
  // Existing account styles
  header: {
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
    borderWidth: 4,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
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
  thaidLogo: {
    width: 24,
    height: 24,
    marginRight: 8,
    borderRadius: 4,
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
})
