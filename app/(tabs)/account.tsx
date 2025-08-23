import { Image } from 'expo-image'
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { useThemeColor } from '@/hooks/useThemeColor'

// Mock user data
const mockUser = {
  id: 'USR-2024-001',
  name: 'วุฒิภัทร คำนวนสินธุ์',
  email: 'wutipat.k@ocsc.go.th',
  avatar: 'https://bellmcp.work/img/Profile.jpg',
  role: 'Senior Developer',
  department: 'Software Engineer',
  joinDate: 'January 2023',
  completedCourses: 12,
  totalHours: 48,
}

export default function AccountScreen() {
  const backgroundColor = useThemeColor({}, 'background')
  const tintColor = useThemeColor({}, 'tint')
  const iconColor = useThemeColor({}, 'icon')

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      {/* Header Section */}
      <ThemedView style={styles.header}>
        <ThemedView style={styles.avatarContainer}>
          <Image
            source={{ uri: mockUser.avatar }}
            style={styles.avatar}
            contentFit='cover'
          />
        </ThemedView>

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
            หลักสูตรที่เรียนจบแล้ว
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.statDivider} />

        <ThemedView style={styles.statItem}>
          <IconSymbol name='star.circle' size={32} color={tintColor} />
          <ThemedText
            type='title'
            style={[styles.statNumber, { color: tintColor }]}
          >
            {mockUser.totalHours}
          </ThemedText>
          <ThemedText style={styles.statLabel}>จำนวนเหรียญสะสม</ThemedText>
        </ThemedView>
      </ThemedView>

      {/* Profile Details */}
      <ThemedView style={styles.detailsContainer}>
        <ThemedText type='subtitle' style={styles.sectionTitle}>
          ข้อมูลส่วนตัว
        </ThemedText>

        <ThemedView style={styles.detailItem}>
          <IconSymbol name='calendar' size={20} color={iconColor} />
          <ThemedView style={styles.detailContent}>
            <ThemedText style={styles.detailLabel}>สมัครสมาชิกเมื่อ</ThemedText>
            <ThemedText type='defaultSemiBold'>{mockUser.joinDate}</ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.detailItem}>
          <IconSymbol name='envelope' size={20} color={iconColor} />
          <ThemedView style={styles.detailContent}>
            <ThemedText style={styles.detailLabel}>อีเมล</ThemedText>
            <ThemedText type='defaultSemiBold'>{mockUser.email}</ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.detailItem}>
          <IconSymbol name='building.2' size={20} color={iconColor} />
          <ThemedView style={styles.detailContent}>
            <ThemedText style={styles.detailLabel}>หน่วยงาน</ThemedText>
            <ThemedText type='defaultSemiBold'>
              {mockUser.department}
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      {/* Action Buttons */}
      <ThemedView style={styles.actionsContainer}>
        <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]}>
          <IconSymbol name='printer' size={20} color={tintColor} />
          <ThemedText style={[styles.actionButtonText, { color: tintColor }]}>
            พิมพ์ประกาศนียบัตร ก.พ.
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]}>
          <IconSymbol name='doc.text' size={20} color={tintColor} />
          <ThemedText style={[styles.actionButtonText, { color: tintColor }]}>
            ประวัติการเรียน
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]}>
          <IconSymbol name='pencil' size={20} color={tintColor} />
          <ThemedText style={[styles.actionButtonText, { color: tintColor }]}>
            แก้ไขข้อมูลส่วนบุคคล
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]}>
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
        >
          <IconSymbol name='arrow.right.square' size={20} color='white' />
          <ThemedText style={styles.actionButtonText}>ออกจากระบบ</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
    borderColor: '#0a7ea4',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    color: 'white',
  },
})
