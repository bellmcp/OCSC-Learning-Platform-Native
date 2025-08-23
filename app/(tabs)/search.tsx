import { useState } from 'react'
import {
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native'

import CourseItem, { type Course } from '@/components/CourseItem'
import CurriculumItem, { type Curriculum } from '@/components/CurriculumItem'
import StatusBarGradient from '@/components/StatusBarGradient'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { useThemeColor } from '@/hooks/useThemeColor'

// Mock data for courses
const mockCourses: Course[] = [
  {
    id: 'DS26',
    title: 'AI Basic',
    description:
      'ในโลกส่องรันขิง คนเราเคยพัฒนะ AI และ AI นั้นมีบทบาทไหนทำนำยำลังข้างม AI ดวย หลักแกนป้ในทำอยำสมัยไตไอ AI หำกชลกกก',
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
    title: 'ความรู้เกี่ยวกับการบริหารเทะ',
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
  {
    id: 'DS01',
    title: 'Data Visualization',
    description: 'วิชาป่วยการส่ายทำลองการกำ Data Visualization ได้',
    image:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop',
    category: 'Data Science',
    level: 'ทักษะดีดัล',
    badge: 'ทักษะดีดัล',
  },
  {
    id: 'DS02',
    title: 'Data Analysis Foundation',
    description:
      'เพิ่นความสากอย่ามใจ Data Analysis Essential และก็เพิ่นแส่งการสอยสืน',
    image:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=200&fit=crop',
    category: 'Data Science',
    level: 'ทักษะขั้นต้น',
    badge: 'ทักษะดีดัล',
  },
  {
    id: 'CS101',
    title: 'Programming Fundamentals',
    description: 'หลักสูตรพื้นฐานการเขียนโปรแกรมสำหรับผู้เริ่มต้น',
    image:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=200&fit=crop',
    category: 'Programming',
    level: 'ทักษะขั้นต้น',
    badge: 'ทักษะดีดัล',
  },
  {
    id: 'SEC01',
    title: 'ความมันคงปลอดภัยสื่อ',
    description: 'เพิ่นชำนาบลนะการคพำนการไลคนใน ส้าที่เข้าไหศไสานั่งสั่ง',
    image:
      'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=300&h=200&fit=crop',
    category: 'Security',
    level: 'ทักษะขั้นกลาง',
    badge: 'ทักษะดีดัล',
  },
]

// Mock data for curriculums
const mockCurriculums: Curriculum[] = [
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
    description: 'หลักสูตรการบริหารทรัพยากรบุคคลแนวใหม่',
    image:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop',
    type: 'mini MPM',
  },
  {
    id: 'MBA',
    title: 'การบริหารจัดการธุรกิจแนวใหม่',
    description: 'หลักสูตรการบริหารธุรกิจสำหรับผู้บริหาร',
    image:
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=300&h=200&fit=crop',
    type: 'mini MBA',
  },
  {
    id: 'LEAD01',
    title: 'การพัฒนาภาวะผู้นำ',
    description: 'หลักสูตรพัฒนาทักษะความเป็นผู้นำในองค์กร',
    image:
      'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=300&h=200&fit=crop',
    type: 'หลักสูตร',
  },
  {
    id: 'INNO01',
    title: 'นวัตกรรมและความคิดสร้างสรรค์',
    description: 'พัฒนาทักษะการคิดเชิงนวัตกรรม',
    image:
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300&h=200&fit=crop',
    type: 'หลักสูตร',
  },
  {
    id: 'COMM01',
    title: 'การสื่อสารเชิงกลยุทธ์',
    description: 'ทักษะการสื่อสารที่มีประสิทธิภาพ',
    image:
      'https://images.unsplash.com/photo-1559523161-0fc0d8b38a7a?w=300&h=200&fit=crop',
    type: 'หลักสูตร',
  },
]

export default function SearchScreen() {
  const backgroundColor = useThemeColor({}, 'background')
  const tintColor = useThemeColor({}, 'tint')
  const iconColor = useThemeColor({}, 'icon')

  const [searchQuery, setSearchQuery] = useState('')
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [filteredCurriculums, setFilteredCurriculums] = useState<Curriculum[]>(
    []
  )

  // Search functionality
  const handleSearch = (query: string) => {
    setSearchQuery(query)

    if (query.trim() === '') {
      setFilteredCourses([])
      setFilteredCurriculums([])
      return
    }

    const searchLower = query.toLowerCase()

    // Filter courses
    const coursesResults = mockCourses.filter(
      (course) =>
        course.title.toLowerCase().includes(searchLower) ||
        course.description.toLowerCase().includes(searchLower) ||
        course.id.toLowerCase().includes(searchLower) ||
        course.category.toLowerCase().includes(searchLower)
    )

    // Filter curriculums
    const curriculumsResults = mockCurriculums.filter(
      (curriculum) =>
        curriculum.title.toLowerCase().includes(searchLower) ||
        curriculum.description.toLowerCase().includes(searchLower) ||
        curriculum.id.toLowerCase().includes(searchLower) ||
        curriculum.type.toLowerCase().includes(searchLower)
    )

    setFilteredCourses(coursesResults)
    setFilteredCurriculums(curriculumsResults)
  }

  const renderCourseItem = ({ item }: { item: Course }) => (
    <CourseItem
      item={item}
      onPress={(course) => console.log('Course selected:', course)}
    />
  )

  const renderCurriculumItem = ({ item }: { item: Curriculum }) => (
    <CurriculumItem
      item={item}
      onPress={(curriculum) => console.log('Curriculum selected:', curriculum)}
    />
  )

  const hasResults =
    filteredCourses.length > 0 || filteredCurriculums.length > 0
  const showNoResults = searchQuery.trim() !== '' && !hasResults

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <ThemedView style={styles.header}>
        <ThemedText type='title' style={styles.headerTitle}>
          ค้นหา
        </ThemedText>
      </ThemedView>

      {/* Search Input */}
      <ThemedView style={styles.searchContainer}>
        <ThemedView style={styles.searchInputContainer}>
          <IconSymbol name='magnifyingglass' size={20} color={iconColor} />
          <TextInput
            style={[styles.searchInput, { color: iconColor }]}
            placeholder='ค้นหาหลักสูตรหรือรายวิชา...'
            placeholderTextColor={iconColor + '80'}
            value={searchQuery}
            onChangeText={handleSearch}
            autoCapitalize='none'
            autoCorrect={false}
            returnKeyType='search'
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <IconSymbol
                name='xmark.circle.fill'
                size={20}
                color={iconColor}
              />
            </TouchableOpacity>
          )}
        </ThemedView>
      </ThemedView>

      {/* Search Results */}
      <ScrollView
        style={styles.resultsContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps='handled'
      >
        {/* Show welcome message when no search */}
        {searchQuery.trim() === '' && (
          <ThemedView style={styles.welcomeContainer}>
            <IconSymbol
              name='magnifyingglass.circle'
              size={80}
              color={iconColor + '60'}
            />
            <ThemedText
              type='subtitle'
              style={[styles.welcomeTitle, { color: '#000000' }]}
            >
              ค้นหาหลักสูตรและรายวิชา
            </ThemedText>
            <ThemedText
              style={[styles.welcomeDescription, { color: iconColor }]}
            >
              พิมพ์คำค้นหาในช่องด้านบน
            </ThemedText>
            <ThemedText
              style={[styles.welcomeDescription, { color: iconColor }]}
            >
              เพื่อค้นหาหลักสูตรหรือรายวิชาที่คุณสนใจ
            </ThemedText>
          </ThemedView>
        )}

        {/* No Results */}
        {showNoResults && (
          <ThemedView style={styles.noResultsContainer}>
            <IconSymbol
              name='exclamationmark.circle'
              size={80}
              color={iconColor + '60'}
            />
            <ThemedText
              type='subtitle'
              style={[styles.noResultsTitle, { color: '#000000' }]}
            >
              ไม่พบผลการค้นหา
            </ThemedText>
            <ThemedText
              style={[styles.noResultsDescription, { color: iconColor }]}
            >
              ลองค้นหาด้วยคำค้นหาอื่น
            </ThemedText>
            <ThemedText
              style={[styles.noResultsDescription, { color: iconColor }]}
            >
              หรือตรวจสอบการสะกดคำ
            </ThemedText>
          </ThemedView>
        )}

        {/* Courses Results */}
        {filteredCourses.length > 0 && (
          <ThemedView style={styles.sectionContainer}>
            <ThemedView style={styles.sectionHeader}>
              <ThemedText type='subtitle' style={styles.sectionTitle}>
                รายวิชา
              </ThemedText>
              <ThemedText style={styles.resultsCount}>
                ผลลัพธ์ {filteredCourses.length} รายการ
              </ThemedText>
            </ThemedView>
            <FlatList
              data={filteredCourses}
              renderItem={renderCourseItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          </ThemedView>
        )}

        {/* Curriculums Results */}
        {filteredCurriculums.length > 0 && (
          <ThemedView style={styles.sectionContainer}>
            <ThemedView style={styles.sectionHeader}>
              <ThemedText type='subtitle' style={styles.sectionTitle}>
                หลักสูตร
              </ThemedText>
              <ThemedText style={styles.resultsCount}>
                ผลลัพธ์ {filteredCurriculums.length} รายการ
              </ThemedText>
            </ThemedView>
            <FlatList
              data={filteredCurriculums}
              renderItem={renderCurriculumItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          </ThemedView>
        )}
      </ScrollView>
      <StatusBarGradient />
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 2,
    fontFamily: 'Prompt-Regular',
  },
  resultsContainer: {
    flex: 1,
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  welcomeTitle: {
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  welcomeDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  noResultsTitle: {
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  noResultsDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  sectionContainer: {
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
  resultsCount: {
    fontSize: 16,
    fontFamily: 'Prompt-Regular',
    color: '#666666',
  },
  horizontalList: {
    paddingLeft: 20,
  },
})
