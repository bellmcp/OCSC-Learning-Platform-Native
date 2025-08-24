import { router } from 'expo-router'
import React from 'react'
import {
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { useThemeColor } from '@/hooks/useThemeColor'

// Mock notifications data
const mockNotifications = [
  {
    id: '1',
    type: 'course',
    title: 'คอร์สใหม่: การพัฒนาระบบด้วย React Native',
    message: 'คอร์สใหม่พร้อมให้ลงทะเบียนแล้ว เริ่มเรียนได้ทันที',
    timestamp: '2 ชั่วโมงที่แล้ว',
    isRead: false,
    icon: 'book.closed',
  },
  {
    id: '2',
    type: 'achievement',
    title: 'ได้รับประกาศนียบัตร!',
    message: 'ยินดีด้วย! คุณได้เรียนจบคอร์ส "การเขียนโปรแกรมพื้นฐาน" แล้ว',
    timestamp: '1 วันที่แล้ว',
    isRead: false,
    icon: 'trophy',
  },
  {
    id: '3',
    type: 'reminder',
    title: 'เตือนความจำ: การสอบประเมินผล',
    message: 'การสอบประเมินผลคอร์ส "การจัดการฐานข้อมูล" จะเริ่มในอีก 3 วัน',
    timestamp: '2 วันที่แล้ว',
    isRead: true,
    icon: 'bell',
  },
  {
    id: '4',
    type: 'system',
    title: 'อัปเดตระบบ',
    message: 'ระบบจะปิดปรับปรุงในวันที่ 15 ธันวาคม 2567 เวลา 22:00-02:00 น.',
    timestamp: '3 วันที่แล้ว',
    isRead: true,
    icon: 'gear',
  },
  {
    id: '5',
    type: 'course',
    title: 'คอร์สที่ลงทะเบียนแล้วเริ่มแล้ว',
    message: 'คอร์ส "การออกแบบ UI/UX" เริ่มเรียนได้แล้ววันนี้',
    timestamp: '4 วันที่แล้ว',
    isRead: true,
    icon: 'play.circle',
  },
  {
    id: '6',
    type: 'achievement',
    title: 'เลื่อนระดับสำเร็จ!',
    message: 'ยินดีด้วย! คุณได้เลื่อนระดับเป็น "ผู้เรียนขั้นสูง" แล้ว',
    timestamp: '1 สัปดาห์ที่แล้ว',
    isRead: true,
    icon: 'star.circle',
  },
]

export default function NotificationsScreen() {
  const backgroundColor = useThemeColor({}, 'background')
  const tintColor = useThemeColor({}, 'tint')
  const iconColor = useThemeColor({}, 'icon')

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'course':
        return 'book.closed'
      case 'achievement':
        return 'trophy'
      case 'reminder':
        return 'bell'
      case 'system':
        return 'gear'
      default:
        return 'info.circle'
    }
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      {/* Fixed Header */}
      <ThemedView style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <IconSymbol name='chevron.left' size={24} color={iconColor} />
          </TouchableOpacity>
          <ThemedText type='title' style={styles.headerTitle}>
            การแจ้งเตือน
          </ThemedText>
          <TouchableOpacity style={styles.markAllRead}>
            <IconSymbol name='trash' size={24} color={iconColor} />
          </TouchableOpacity>
        </View>
      </ThemedView>

      {/* Notifications List */}
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {mockNotifications.map((notification) => (
          <TouchableOpacity
            key={notification.id}
            style={[
              styles.notificationItem,
              !notification.isRead && styles.unreadNotification,
            ]}
          >
            {/* Notification Icon */}
            <View style={styles.iconContainer}>
              <IconSymbol
                name={notification.icon as any}
                size={24}
                color={iconColor}
              />
            </View>

            {/* Notification Content */}
            <View style={styles.notificationContent}>
              <ThemedText
                type='defaultSemiBold'
                style={[
                  styles.notificationTitle,
                  !notification.isRead && styles.unreadTitle,
                ]}
              >
                {notification.title}
              </ThemedText>
              <ThemedText style={styles.notificationMessage}>
                {notification.message}
              </ThemedText>
              <ThemedText style={styles.notificationTimestamp}>
                {notification.timestamp}
              </ThemedText>
            </View>

            {/* Unread Indicator */}
            {!notification.isRead && (
              <ThemedView style={styles.unreadIndicator} />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Fixed Mark All Read Button */}
      <View style={[styles.fixedButtonContainer, { backgroundColor }]}>
        <TouchableOpacity
          style={[styles.markAllReadButton, { backgroundColor: tintColor }]}
        >
          <IconSymbol name='checkmark.circle' size={20} color='white' />
          <ThemedText style={styles.markAllReadButtonText}>
            อ่านทั้งหมด
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 70,
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
  markAllRead: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  markAllReadText: {
    fontSize: 14,
    fontWeight: '600',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginVertical: 8,
    backgroundColor: 'white',
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
  unreadNotification: {
    backgroundColor: '#F8F9FF',
    borderWidth: 1,
    borderColor: '#D6E3FF',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    marginBottom: 4,
    lineHeight: 22,
  },
  unreadTitle: {
    fontWeight: 'bold',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  notificationTimestamp: {
    fontSize: 12,
    color: '#999',
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF4444',
    marginLeft: 12,
    marginTop: 8,
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    borderTopWidth: 0.5,
    borderTopColor: '#F0F0F0',
  },
  markAllReadButton: {
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
    elevation: 5,
  },
  markAllReadButtonText: {
    fontSize: 18,
    fontFamily: 'Prompt-SemiBold',
    marginLeft: 8,
    color: 'white',
  },
})
