import { router } from 'expo-router'
import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import { useSelector } from 'react-redux'

import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { useThemeColor } from '@/hooks/useThemeColor'
import { RootState } from '@/store/types'
import axios from '@/utils/axiosConfig'

// Type for reward point item from API
interface RewardPoint {
  id: number
  userId: string
  transaction: string
  point: number
  createDate: string
  createDatePrint: string
}

export default function CoinsScreen() {
  const backgroundColor = useThemeColor({}, 'background')
  const tintColor = useThemeColor({}, 'tint')
  const iconColor = useThemeColor({}, 'icon')

  // Get user from Redux store
  const { items: user } = useSelector((state: RootState) => state.user)

  // Local state for reward points
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [rewardPoints, setRewardPoints] = useState<RewardPoint[]>([])
  const [error, setError] = useState<string | null>(null)

  // Calculate total accumulated points
  const totalPoints = rewardPoints.reduce((sum, item) => sum + item.point, 0)

  // Fetch reward points from API
  const fetchRewardPoints = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }
      setError(null)

      const response = await axios.get('/RewardPoints')
      setRewardPoints(response.data || [])
    } catch (err: any) {
      console.error('[Coins] Error fetching reward points:', err)
      setError(err.message || 'ไม่สามารถโหลดข้อมูลได้')
      setRewardPoints([])
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  // Fetch data on mount
  useEffect(() => {
    fetchRewardPoints()
  }, [])

  const handleBack = () => {
    router.back()
  }

  const handleRefresh = () => {
    fetchRewardPoints(true)
  }

  // Get icon based on point value (positive = earned, negative = spent)
  const getPointIcon = (point: number) => {
    return point >= 0 ? 'star.circle.fill' : 'minus.circle.fill'
  }

  const getPointColor = (point: number) => {
    return point >= 0 ? tintColor : '#FF6B6B'
  }

  const getPointPrefix = (point: number) => {
    return point >= 0 ? '+' : ''
  }

  // Format user ID with spaces (e.g., "1234567890123" -> "1 2345 67890 12 3")
  const formatUserId = (id: string) => {
    if (!id) return ''
    // Format: X XXXX XXXXX XX X
    const digits = id.replace(/\D/g, '')
    if (digits.length === 13) {
      return `${digits[0]} ${digits.slice(1, 5)} ${digits.slice(
        5,
        10
      )} ${digits.slice(10, 12)} ${digits[12]}`
    }
    return id
  }

  // Get user display name
  const getUserName = () => {
    if (!user) return 'ผู้ใช้งาน'
    if (user.title && user.firstName && user.lastName) {
      return `${user.title}${user.firstName} ${user.lastName}`
    }
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`
    }
    return user.firstName || 'ผู้ใช้งาน'
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
            คะแนนการเรียนรู้
          </ThemedText>
          <View style={styles.backButton} />
        </View>
      </ThemedView>

      {/* Loading State */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color={tintColor} />
          <ThemedText style={styles.loadingText}>กำลังโหลดข้อมูล...</ThemedText>
        </View>
      ) : error ? (
        /* Error State */
        <View style={styles.errorContainer}>
          <IconSymbol
            name='exclamationmark.triangle'
            size={48}
            color='#FF6B6B'
          />
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: tintColor }]}
            onPress={() => fetchRewardPoints()}
          >
            <ThemedText style={styles.retryButtonText}>ลองอีกครั้ง</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        /* Scrollable Content */
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={tintColor}
            />
          }
        >
          {/* User Info Card */}
          {/* <ThemedView style={styles.userCard}>
            <IconSymbol
              name='person.circle.fill'
              size={64}
              color={tintColor}
              style={styles.userAvatar}
            />
            <ThemedView style={styles.userInfo}>
              <ThemedText type='subtitle' style={styles.userName}>
                {getUserName()}
              </ThemedText>
              <ThemedText style={styles.userSubtitle}>
                {formatUserId(user?.id || '')}
              </ThemedText>
            </ThemedView>
          </ThemedView> */}

          {/* Coin Balance Card */}
          <ThemedView style={styles.balanceCard}>
            <ThemedView style={styles.balanceHeader}>
              <ThemedText style={styles.balanceLabel}>
                คะแนนการเรียนรู้ของคุณ
              </ThemedText>
              {/* <IconSymbol name='star.circle.fill' size={32} color={tintColor} /> */}
            </ThemedView>
            <ThemedView style={styles.balanceAmount}>
              <IconSymbol
                name='star.circle.fill'
                size={48}
                color={tintColor}
                style={styles.coinIcon}
              />
              <ThemedText type='title' style={styles.coinNumber}>
                {totalPoints.toLocaleString()}
              </ThemedText>
            </ThemedView>
          </ThemedView>

          {/* Coin History Section */}
          <ThemedView style={styles.historySection}>
            <ThemedView style={styles.sectionHeader}>
              <ThemedText type='subtitle' style={styles.sectionTitle}>
                ประวัติการได้รับคะแนน
              </ThemedText>
              <ThemedText style={styles.sectionSubtitle}>
                {rewardPoints.length > 0
                  ? `ทั้งหมด ${rewardPoints.length} รายการ`
                  : 'ยังไม่มีประวัติการได้รับคะแนน'}
              </ThemedText>
            </ThemedView>

            {rewardPoints.length === 0 ? (
              <ThemedView style={styles.emptyState}>
                <IconSymbol name='star.slash' size={48} color='#999' />
                <ThemedText style={styles.emptyText}>
                  ยังไม่มีประวัติการได้รับคะแนน
                </ThemedText>
              </ThemedView>
            ) : (
              rewardPoints.map((item) => (
                <ThemedView key={item.id} style={styles.historyItem}>
                  <ThemedView
                    style={[
                      styles.historyIcon,
                      {
                        backgroundColor:
                          item.point >= 0
                            ? 'rgba(24, 58, 124, 0.1)'
                            : 'rgba(255, 107, 107, 0.1)',
                      },
                    ]}
                  >
                    <IconSymbol
                      name={getPointIcon(item.point)}
                      size={24}
                      color={getPointColor(item.point)}
                    />
                  </ThemedView>

                  <ThemedView style={styles.historyContent}>
                    <ThemedText style={styles.historyDescription}>
                      {item.transaction}
                    </ThemedText>
                    <ThemedView style={styles.historyMeta}>
                      <ThemedText style={styles.historyDate}>
                        {item.createDatePrint}
                      </ThemedText>
                    </ThemedView>
                  </ThemedView>

                  <ThemedView style={styles.historyAmount}>
                    <ThemedText
                      style={[
                        styles.amountText,
                        { color: getPointColor(item.point) },
                      ]}
                    >
                      {getPointPrefix(item.point)}
                      {item.point.toLocaleString()}
                    </ThemedText>
                    <ThemedText style={styles.amountUnit}>คะแนน</ThemedText>
                  </ThemedView>
                </ThemedView>
              ))
            )}
          </ThemedView>

          {/* Info Section */}
          {/* <ThemedView style={styles.infoSection}>
            <ThemedText type='subtitle' style={styles.infoTitle}>
              วิธีรับคะแนน
            </ThemedText>
            <ThemedView style={styles.infoItems}>
              <ThemedView style={styles.infoItem}>
                <IconSymbol
                  name='checkmark.circle.fill'
                  size={20}
                  color='#2e7d32'
                />
                <ThemedText style={styles.infoText}>
                  เรียนจบหลักสูตรหรือบทเรียน
                </ThemedText>
              </ThemedView>
              <ThemedView style={styles.infoItem}>
                <IconSymbol
                  name='checkmark.circle.fill'
                  size={20}
                  color='#2e7d32'
                />
                <ThemedText style={styles.infoText}>
                  ทำแบบทดสอบผ่านเกณฑ์ที่กำหนด
                </ThemedText>
              </ThemedView>
              <ThemedView style={styles.infoItem}>
                <IconSymbol
                  name='checkmark.circle.fill'
                  size={20}
                  color='#2e7d32'
                />
                <ThemedText style={styles.infoText}>
                  เข้าร่วมกิจกรรมพิเศษ
                </ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView> */}
        </ScrollView>
      )}
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
    paddingBottom: 20,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 70 : 40,
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
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Prompt-Regular',
    color: '#666',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontFamily: 'Prompt-SemiBold',
    color: 'white',
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
    elevation: 1,
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
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 1,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 18,
    color: '#333',
    lineHeight: 24,
    fontFamily: 'Prompt-SemiBold',
  },
  balanceAmount: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  coinIcon: {
    marginRight: 12,
  },
  coinNumber: {
    fontSize: 48,
    color: '#333',
    fontFamily: 'Prompt-SemiBold',
    marginRight: 8,
    lineHeight: 72,
  },
  historySection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    marginTop: 12,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Prompt-Regular',
    color: '#999',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  historyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(24, 58, 124, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
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
    fontFamily: 'Prompt-SemiBold',
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
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
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
