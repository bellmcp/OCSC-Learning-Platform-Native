import { Image } from 'expo-image'
import { router } from 'expo-router'
import React from 'react'
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { useThemeColor } from '@/hooks/useThemeColor'

// Mock coin data
const mockCoinData = {
  totalCoins: 48,
  username: 'วุฒิภัทร คำนวนสินธุ์',
  avatar: 'https://bellmcp.work/img/Profile.jpg',
  coinHistory: [
    {
      id: '1',
      type: 'earned',
      amount: 5,
      description: 'เรียนจบหลักสูตร "การพัฒนาระบบสารสนเทศ"',
      courseName: 'การพัฒนาระบบสารสนเทศ',
      date: '15 ธันวาคม 2024',
      time: '14:30',
    },
    {
      id: '2',
      type: 'earned',
      amount: 3,
      description: 'ทำแบบทดสอบผ่านเกณฑ์ 80%',
      courseName: 'การจัดการโครงการ',
      date: '12 ธันวาคม 2024',
      time: '10:15',
    },
    {
      id: '3',
      type: 'earned',
      amount: 2,
      description: 'เรียนจบบทเรียน "การวางแผนกลยุทธ์"',
      courseName: 'การวางแผนกลยุทธ์',
      date: '10 ธันวาคม 2024',
      time: '16:45',
    },
    {
      id: '4',
      type: 'earned',
      amount: 4,
      description: 'เรียนจบหลักสูตร "การบริหารทรัพยากรมนุษย์"',
      courseName: 'การบริหารทรัพยากรมนุษย์',
      date: '8 ธันวาคม 2024',
      time: '11:20',
    },
    {
      id: '5',
      type: 'earned',
      amount: 3,
      description: 'ทำแบบทดสอบผ่านเกณฑ์ 90%',
      courseName: 'การสื่อสารในองค์กร',
      date: '5 ธันวาคม 2024',
      time: '13:10',
    },
    {
      id: '6',
      type: 'earned',
      amount: 2,
      description: 'เรียนจบบทเรียน "การทำงานเป็นทีม"',
      courseName: 'การทำงานเป็นทีม',
      date: '3 ธันวาคม 2024',
      time: '15:30',
    },
  ],
}

export default function CoinsScreen() {
  const backgroundColor = useThemeColor({}, 'background')
  const tintColor = useThemeColor({}, 'tint')
  const iconColor = useThemeColor({}, 'icon')

  const handleBack = () => {
    router.back()
  }

  const getCoinIcon = (type: string) => {
    return type === 'earned' ? '🪙' : '💸'
  }

  const getCoinColor = (type: string) => {
    return type === 'earned' ? '#FFD700' : '#FF6B6B'
  }

  const getCoinPrefix = (type: string) => {
    return type === 'earned' ? '+' : '-'
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <ScrollView style={styles.scrollContainer}>
        {/* Header */}
        <ThemedView style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <IconSymbol name='chevron.left' size={24} color={iconColor} />
          </TouchableOpacity>
          <ThemedText type='title' style={styles.headerTitle}>
            เหรียญสะสม
          </ThemedText>
          <ThemedView style={styles.placeholder} />
        </ThemedView>

        {/* User Info Card */}
        <ThemedView style={styles.userCard}>
          <Image
            source={{ uri: mockCoinData.avatar }}
            style={styles.userAvatar}
            contentFit='cover'
          />
          <ThemedView style={styles.userInfo}>
            <ThemedText type='subtitle' style={styles.userName}>
              {mockCoinData.username}
            </ThemedText>
            <ThemedText style={styles.userSubtitle}>
              สมาชิก OCSC Learning Platform
            </ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Coin Balance Card */}
        <ThemedView style={styles.balanceCard}>
          <ThemedView style={styles.balanceHeader}>
            <ThemedText style={styles.balanceLabel}>
              เหรียญสะสมทั้งหมด
            </ThemedText>
            <IconSymbol name='star.circle.fill' size={32} color='#FFD700' />
          </ThemedView>
          <ThemedView style={styles.balanceAmount}>
            <ThemedText style={styles.coinIcon}>🪙</ThemedText>
            <ThemedText type='title' style={styles.coinNumber}>
              {mockCoinData.totalCoins}
            </ThemedText>
            <ThemedText style={styles.coinUnit}>เหรียญ</ThemedText>
          </ThemedView>
          <ThemedView style={styles.balanceStats}>
            <ThemedView style={styles.statItem}>
              <ThemedText style={styles.statNumber}>
                {mockCoinData.coinHistory.length}
              </ThemedText>
              <ThemedText style={styles.statLabel}>ครั้งที่ได้รับ</ThemedText>
            </ThemedView>
            <ThemedView style={styles.statDivider} />
            <ThemedView style={styles.statItem}>
              <ThemedText style={styles.statNumber}>
                {Math.round(
                  mockCoinData.totalCoins / mockCoinData.coinHistory.length
                )}
              </ThemedText>
              <ThemedText style={styles.statLabel}>เฉลี่ยต่อครั้ง</ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        {/* Coin History Section */}
        <ThemedView style={styles.historySection}>
          <ThemedView style={styles.sectionHeader}>
            <ThemedText type='subtitle' style={styles.sectionTitle}>
              ประวัติการได้รับเหรียญ
            </ThemedText>
            <ThemedText style={styles.sectionSubtitle}>
              ดูประวัติการได้รับเหรียญจากการเรียน
            </ThemedText>
          </ThemedView>

          {mockCoinData.coinHistory.map((item) => (
            <ThemedView key={item.id} style={styles.historyItem}>
              <ThemedView style={styles.historyIcon}>
                <ThemedText style={styles.historyCoinIcon}>
                  {getCoinIcon(item.type)}
                </ThemedText>
              </ThemedView>

              <ThemedView style={styles.historyContent}>
                <ThemedText style={styles.historyDescription}>
                  {item.description}
                </ThemedText>
                <ThemedText style={styles.historyCourse}>
                  {item.courseName}
                </ThemedText>
                <ThemedView style={styles.historyMeta}>
                  <ThemedText style={styles.historyDate}>
                    {item.date} • {item.time}
                  </ThemedText>
                </ThemedView>
              </ThemedView>

              <ThemedView style={styles.historyAmount}>
                <ThemedText
                  style={[
                    styles.amountText,
                    { color: getCoinColor(item.type) },
                  ]}
                >
                  {getCoinPrefix(item.type)}
                  {item.amount}
                </ThemedText>
                <ThemedText style={styles.amountUnit}>เหรียญ</ThemedText>
              </ThemedView>
            </ThemedView>
          ))}
        </ThemedView>

        {/* Info Section */}
        <ThemedView style={styles.infoSection}>
          <ThemedText type='subtitle' style={styles.infoTitle}>
            วิธีรับเหรียญ
          </ThemedText>
          <ThemedView style={styles.infoItems}>
            <ThemedView style={styles.infoItem}>
              <IconSymbol
                name='checkmark.circle.fill'
                size={20}
                color='#10B981'
              />
              <ThemedText style={styles.infoText}>
                เรียนจบหลักสูตรหรือบทเรียน
              </ThemedText>
            </ThemedView>
            <ThemedView style={styles.infoItem}>
              <IconSymbol
                name='checkmark.circle.fill'
                size={20}
                color='#10B981'
              />
              <ThemedText style={styles.infoText}>
                ทำแบบทดสอบผ่านเกณฑ์ที่กำหนด
              </ThemedText>
            </ThemedView>
            <ThemedView style={styles.infoItem}>
              <IconSymbol
                name='checkmark.circle.fill'
                size={20}
                color='#10B981'
              />
              <ThemedText style={styles.infoText}>
                เข้าร่วมกิจกรรมพิเศษ
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </ScrollView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    textAlign: 'center',
    flex: 1,
  },
  placeholder: {
    width: 40,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    marginBottom: 4,
  },
  userSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  balanceCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 24,
    borderRadius: 20,
    backgroundColor: 'linear-gradient(135deg, #FFD700, #FFA500)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#8B4513',
    fontFamily: 'Prompt-SemiBold',
  },
  balanceAmount: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  coinIcon: {
    fontSize: 48,
    marginRight: 12,
  },
  coinNumber: {
    fontSize: 48,
    color: '#8B4513',
    fontFamily: 'Prompt-Bold',
    marginRight: 8,
  },
  coinUnit: {
    fontSize: 20,
    color: '#8B4513',
    fontFamily: 'Prompt-Medium',
  },
  balanceStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontFamily: 'Prompt-Bold',
    color: '#8B4513',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#8B4513',
    opacity: 0.8,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(139, 69, 19, 0.3)',
  },
  historySection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  historyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  historyCoinIcon: {
    fontSize: 24,
  },
  historyContent: {
    flex: 1,
    marginRight: 16,
  },
  historyDescription: {
    fontSize: 16,
    fontFamily: 'Prompt-SemiBold',
    marginBottom: 4,
  },
  historyCourse: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  historyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyDate: {
    fontSize: 12,
    opacity: 0.6,
  },
  historyAmount: {
    alignItems: 'center',
  },
  amountText: {
    fontSize: 18,
    fontFamily: 'Prompt-Bold',
    marginBottom: 2,
  },
  amountUnit: {
    fontSize: 12,
    opacity: 0.6,
  },
  infoSection: {
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
  infoTitle: {
    marginBottom: 16,
  },
  infoItems: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    marginLeft: 12,
    fontSize: 16,
  },
})
