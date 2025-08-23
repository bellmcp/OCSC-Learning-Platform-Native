import { Image } from 'expo-image'
import { useRef, useState } from 'react'
import {
  Dimensions,
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { useThemeColor } from '@/hooks/useThemeColor'

const { width: screenWidth } = Dimensions.get('window')

// Mock data for carousels
const bannerData = [
  {
    id: '1',
    image:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop',
    title: 'รู้รัก กบข. และอีกรัปประโยชน์สำหรับข้าราชการ',
    subtitle: 'ความรู้พื้นฐานเกี่ยวกับกองทุนบำเหน็จบำนาญข้าราชการ',
  },
  {
    id: '2',
    image:
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=400&fit=crop',
    title: 'ฝึกอบรม ข้าราชการบรรจุใหม่',
    subtitle: 'หลักสูตรพัฒนาสำหรับข้าราชการที่เพิ่งเข้าร่วมงาน',
  },
  {
    id: '3',
    image:
      'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=400&fit=crop',
    title: 'การพัฒนาขีดความสามารถ',
    subtitle: 'หลักสูตรพัฒนาทักษะและความสามารถของบุคลากร',
  },
]

const coursesData = [
  {
    id: 'DS26',
    title: 'AI Basic',
    description:
      'ในอีรส่่งรันขิง คพะคำสองพัฒนะ AI และ AI นั้นมีบทบาทไหนทำนำฟ้าลังข้างม AI ดวย หลแกป้ในทำอยำสมัฟไตไอ AI หำกชลกกก',
    image:
      'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=300&h=200&fit=crop',
    category: 'AI',
    level: 'ทักษะดีดัล',
    badge: 'Microsoft',
  },
  {
    id: 'DS27',
    title: 'AI Skills for All',
    description:
      'หลักสูตรเทคโนโลยี AI สำหรับการพัฒนาศักยภาพของ AI และเพื่อเป็นพื้นฐานไปสู่เยติม้านำหำป้หำเกเก',
    image:
      'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=300&h=200&fit=crop',
    category: 'AI',
    level: 'ทักษะดีดัล',
    badge: 'Microsoft',
  },
  {
    id: 'KD56',
    title: 'ความรู้เกี่ยวกับการบูมเทพะ',
    description:
      'วิชาวำส้านีกับการเก้าลกการทำยสกทำนด์ ก็วิปยำก้ปรดับลง ช้านั้งดังรูป',
    image:
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop',
    category: 'ทักษะการแก้ปัญหา',
    level: 'ทักษะขั้นกลาง',
    badge: 'กรอบผลลัพธ์การปฏิรังม',
  },
  {
    id: 'KD59',
    title: 'ความรู้เกี่ยวกับการเดินเนิน',
    description:
      'วิชาเคลำส้านทำเย้ลดลำกส์ ระบบยำย ผายำยำดื้อ ช่วยไป รายยำสี ขสำเสำกำร',
    image:
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=300&h=200&fit=crop',
    category: 'ทักษะการเดินทาง',
    level: 'ทักษะสำหรับส่วนรวม',
    badge: 'การพัฒนาองค์กร',
  },
]

const recommendedData = [
  {
    id: 'DS01',
    title: 'Data Visualization',
    description: 'วิชาป่วยการส่ายทำลองการกำ Data Visualization ได้',
    image:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop',
    lessons: 2,
    badge: 'ทักษะดีดัล',
  },
  {
    id: 'DS02',
    title: 'Data Visualization 2',
    description:
      'เพิ่นความสากอย่ามใจ Data Visualization Essential และก็เพิ่นแส่งการสอยสืน',
    image:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=200&fit=crop',
    lessons: 2,
    badge: 'ทักษะดีดัล',
  },
  {
    id: 'DS03',
    title: 'ความมันคงปลอดภัยสื่อ',
    description: 'เพิ่นชำนาบลนะการคพำนการไลคนใน ส้าที่เข้าไหศไสานั่งสั่ง',
    image:
      'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=300&h=200&fit=crop',
    lessons: 3,
    badge: 'ทักษะดีดัล',
  },
  {
    id: 'DS04',
    title: 'Digital Code of Merit',
    description:
      'เพื่อให้เข้าใจความนำยำมอมองลายงำนสิน การป่ลพคำสำยคำนังขำงบอุ้ม Data',
    image:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=200&fit=crop',
    lessons: 1,
    badge: 'ทักษะดีดัล',
  },
]

const curriculumData = [
  {
    id: '00M',
    title: 'ฝึกอบรมข้าราชการบรรจุใหม่',
    description: 'ในหลักสูตรนี้จะในส่งกระทรวง',
    image:
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=300&h=200&fit=crop',
    type: 'หลักสูตร',
  },
  {
    id: 'MPM',
    title: 'การบริหารจัดการทรัพยากรแนวใหม่',
    description: 'ในหลักสูตรนี้จะในส่งกระทรวง',
    image:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop',
    type: 'mini MPM',
  },
  {
    id: 'MBA',
    title: 'การบริหารจัดการธุรกิจแนวใหม่',
    description: 'ในหลักสูตรนี้จะในส่งกระทรวง',
    image:
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=300&h=200&fit=crop',
    type: 'mini MBA',
  },
]

export default function HomeScreen() {
  const backgroundColor = useThemeColor({}, 'background')
  const tintColor = useThemeColor({}, 'tint')
  const iconColor = useThemeColor({}, 'icon')

  const [currentBannerIndex, setCurrentBannerIndex] = useState(0)
  const bannerFlatListRef = useRef<FlatList>(null)

  const handleBannerScroll = (event: any) => {
    const slideWidth = screenWidth - 24 // Match the snapToInterval
    const contentOffsetX = event.nativeEvent.contentOffset.x
    const index = Math.round(contentOffsetX / slideWidth)
    const clampedIndex = Math.max(0, Math.min(index, bannerData.length - 1))
    setCurrentBannerIndex(clampedIndex)
  }

  const renderBannerItem = ({ item }: { item: (typeof bannerData)[0] }) => (
    <ThemedView style={styles.bannerItem}>
      <Image
        source={{ uri: item.image }}
        style={styles.bannerImage}
        contentFit='cover'
      />
      <ThemedView style={styles.bannerOverlay}>
        <ThemedText
          type='subtitle'
          style={styles.bannerTitle}
          numberOfLines={2}
        >
          {item.title}
        </ThemedText>
        <ThemedText style={styles.bannerSubtitle} numberOfLines={2}>
          {item.subtitle}
        </ThemedText>
      </ThemedView>
    </ThemedView>
  )

  const renderCourseItem = ({ item }: { item: (typeof coursesData)[0] }) => (
    <TouchableOpacity style={styles.courseCard}>
      <Image
        source={{ uri: item.image }}
        style={styles.courseImage}
        contentFit='cover'
      />
      <ThemedView style={styles.courseContent}>
        {/* <ThemedView style={styles.courseBadge}>
          <ThemedText style={styles.courseBadgeText}>{item.badge}</ThemedText>
        </ThemedView> */}
        <ThemedText
          type='defaultSemiBold'
          style={styles.courseTitle}
          numberOfLines={1}
        >
          {item.title}
        </ThemedText>
        <ThemedText style={styles.courseId}>{item.id}</ThemedText>
        <ThemedText style={styles.courseDescription} numberOfLines={3}>
          {item.description}
        </ThemedText>
        <ThemedView style={styles.courseFooter}>
          <ThemedText style={styles.courseLevel}>● {item.level}</ThemedText>
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
  )

  const renderRecommendedItem = ({
    item,
  }: {
    item: (typeof recommendedData)[0]
  }) => (
    <TouchableOpacity style={styles.recommendedCard}>
      <Image
        source={{ uri: item.image }}
        style={styles.recommendedImage}
        contentFit='cover'
      />
      <ThemedView style={styles.recommendedContent}>
        <ThemedText
          type='defaultSemiBold'
          style={styles.recommendedTitle}
          numberOfLines={1}
        >
          {item.title}
        </ThemedText>
        <ThemedText style={styles.recommendedId}>{item.id}</ThemedText>
        <ThemedText style={styles.recommendedDescription} numberOfLines={2}>
          {item.description}
        </ThemedText>
        <ThemedView style={styles.recommendedFooter}>
          <ThemedText style={styles.recommendedLessons}>
            {item.lessons} เพิ่นลากรางทดลอบซิ้น Visualization
          </ThemedText>
          <ThemedText style={styles.recommendedBadge}>
            ● {item.badge}
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
  )

  const renderCurriculumItem = ({
    item,
  }: {
    item: (typeof curriculumData)[0]
  }) => (
    <TouchableOpacity style={styles.curriculumCard}>
      <Image
        source={{ uri: item.image }}
        style={styles.curriculumImage}
        contentFit='cover'
      />
      <ThemedView style={styles.curriculumContent}>
        <ThemedText
          type='defaultSemiBold'
          style={styles.curriculumTitle}
          numberOfLines={2}
        >
          {item.title}
        </ThemedText>
        <ThemedText style={styles.curriculumId}>{item.id}</ThemedText>
        <ThemedText style={styles.curriculumDescription} numberOfLines={1}>
          {item.description}
        </ThemedText>
        <ThemedView style={styles.curriculumFooter}>
          <ThemedText style={styles.curriculumType}>{item.type}</ThemedText>
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
  )

  return (
    <ScrollView
      style={[styles.container, { backgroundColor }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <ThemedView style={styles.header}>
        <ThemedText type='title' style={styles.headerTitle}>
          หน้าหลัก
        </ThemedText>
      </ThemedView>

      {/* Banner Carousel */}
      <ThemedView style={styles.section}>
        <FlatList
          ref={bannerFlatListRef}
          data={bannerData}
          renderItem={renderBannerItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled={true}
          snapToInterval={screenWidth - 24}
          snapToAlignment='center'
          decelerationRate='fast'
          bounces={false}
          onMomentumScrollEnd={handleBannerScroll}
          onScrollEndDrag={handleBannerScroll}
          contentContainerStyle={styles.carouselContainer}
          getItemLayout={(data, index) => ({
            length: screenWidth - 24,
            offset: (screenWidth - 24) * index,
            index,
          })}
        />
        <ThemedView style={styles.dotsContainer}>
          {bannerData.map((_, index) => (
            <ThemedView
              key={index}
              style={[
                styles.dot,
                index === currentBannerIndex && styles.activeDot,
              ]}
            />
          ))}
        </ThemedView>
      </ThemedView>

      {/* Courses Section */}
      <ThemedView style={styles.section}>
        <ThemedView style={styles.sectionHeader}>
          <ThemedText type='subtitle' style={styles.sectionTitle}>
            รายการแนะนำ
          </ThemedText>
          <TouchableOpacity style={styles.seeAllButton}>
            <ThemedText style={[styles.seeAllText, { color: tintColor }]}>
              ดูทั้งหมด
            </ThemedText>
            <IconSymbol
              name='chevron.right'
              size={18}
              color={tintColor}
              style={styles.seeAllIcon}
            />
          </TouchableOpacity>
        </ThemedView>
        <FlatList
          data={coursesData}
          renderItem={renderCourseItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContainer}
        />
      </ThemedView>

      {/* Recommended Section */}
      <ThemedView style={styles.section}>
        <ThemedView style={styles.sectionHeader}>
          <ThemedText type='subtitle' style={styles.sectionTitle}>
            รายวิชา
          </ThemedText>
          <TouchableOpacity style={styles.seeAllButton}>
            <ThemedText style={[styles.seeAllText, { color: tintColor }]}>
              ดูทั้งหมด
            </ThemedText>
            <IconSymbol
              name='chevron.right'
              size={18}
              color={tintColor}
              style={styles.seeAllIcon}
            />
          </TouchableOpacity>
        </ThemedView>
        <FlatList
          data={recommendedData}
          renderItem={renderRecommendedItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContainer}
        />
      </ThemedView>

      {/* Curriculum Section */}
      <ThemedView style={styles.section}>
        <ThemedView style={styles.sectionHeader}>
          <ThemedText type='subtitle' style={styles.sectionTitle}>
            หลักสูตร
          </ThemedText>
          <TouchableOpacity style={styles.seeAllButton}>
            <ThemedText style={[styles.seeAllText, { color: tintColor }]}>
              ดูทั้งหมด
            </ThemedText>
            <IconSymbol
              name='chevron.right'
              size={18}
              color={tintColor}
              style={styles.seeAllIcon}
            />
          </TouchableOpacity>
        </ThemedView>
        <FlatList
          data={curriculumData}
          renderItem={renderCurriculumItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContainer}
        />
      </ThemedView>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 0,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllIcon: {
    marginTop: 1,
  },
  carouselContainer: {
    paddingLeft: 20,
  },

  // Banner styles
  bannerItem: {
    width: screenWidth - 40,
    height: 200,
    marginRight: 16,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 16,
  },
  bannerTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bannerSubtitle: {
    color: 'white',
    fontSize: 14,
    opacity: 0.9,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
  },
  activeDot: {
    backgroundColor: '#0a7ea4',
  },

  // Course card styles
  courseCard: {
    width: 280,
    marginRight: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    overflow: 'hidden',
  },
  courseImage: {
    width: '100%',
    height: 140,
  },
  courseContent: {
    padding: 16,
    flex: 1,
  },
  courseBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  courseBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  courseId: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  courseDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#374151',
    marginBottom: 12,
    flex: 1,
  },
  courseFooter: {
    marginTop: 'auto',
  },
  courseLevel: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },

  // Recommended card styles
  recommendedCard: {
    width: 240,
    marginRight: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    overflow: 'hidden',
  },
  recommendedImage: {
    width: '100%',
    height: 120,
  },
  recommendedContent: {
    padding: 16,
    flex: 1,
  },
  recommendedTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  recommendedId: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  recommendedDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#374151',
    marginBottom: 12,
    flex: 1,
  },
  recommendedFooter: {
    marginTop: 'auto',
  },
  recommendedLessons: {
    fontSize: 12,
    color: '#374151',
    marginBottom: 4,
  },
  recommendedBadge: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },

  // Curriculum card styles
  curriculumCard: {
    width: 260,
    marginRight: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    overflow: 'hidden',
  },
  curriculumImage: {
    width: '100%',
    height: 130,
  },
  curriculumContent: {
    padding: 16,
    flex: 1,
  },
  curriculumTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    lineHeight: 22,
  },
  curriculumId: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  curriculumDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#374151',
    marginBottom: 12,
    flex: 1,
  },
  curriculumFooter: {
    marginTop: 'auto',
  },
  curriculumType: {
    fontSize: 12,
    color: '#7C3AED',
    fontWeight: '600',
  },
})
