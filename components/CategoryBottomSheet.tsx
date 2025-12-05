import { useThemeColor } from '@/hooks/useThemeColor'
import categoryColor from '@/utils/categoryColor'
import React, { useEffect, useState } from 'react'
import {
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import { ThemedText } from './ThemedText'
import { ThemedView } from './ThemedView'

interface Category {
  id: number
  courseCategory: string
}

interface CategoryBottomSheetProps {
  visible: boolean
  onClose: () => void
  categories: Category[]
  selectedCategoryId: number
  onSelectCategory: (categoryId: number) => void
}

export function CategoryBottomSheet({
  visible,
  onClose,
  categories,
  selectedCategoryId,
  onSelectCategory,
}: CategoryBottomSheetProps) {
  const tintColor = useThemeColor({}, 'tint')
  const borderColor = useThemeColor(
    { light: '#E5E7EB', dark: '#374151' },
    'border'
  )

  const [overlayOpacity] = useState(new Animated.Value(0))
  const [slideAnim] = useState(new Animated.Value(300))

  // Animate in when visible
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [visible])

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose()
    })
  }

  const handleSelectCategory = (categoryId: number) => {
    onSelectCategory(categoryId)
    handleClose()
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType='none'
      onRequestClose={handleClose}
    >
      <Animated.View
        style={[
          styles.bottomSheetOverlay,
          {
            opacity: overlayOpacity,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.bottomSheetBackdrop}
          activeOpacity={1}
          onPress={handleClose}
        />
        <Animated.View
          style={[
            styles.bottomSheetContainer,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Handle Bar */}
          <ThemedView style={styles.bottomSheetHandle} />

          {/* Header */}
          <View style={styles.header}>
            <ThemedText style={styles.headerTitle}>หมวดหมู่</ThemedText>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <ThemedText
                style={[styles.closeButtonText, { color: tintColor }]}
              >
                ปิด
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Category List */}
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            <ThemedView style={styles.bottomSheetContent}>
              {/* All Categories Option */}
              <TouchableOpacity
                style={[
                  styles.categoryItem,
                  selectedCategoryId === 0 && styles.categoryItemSelected,
                  { borderBottomColor: borderColor },
                ]}
                onPress={() => handleSelectCategory(0)}
              >
                <View style={styles.categoryContent}>
                  <View style={styles.categoryLeft}>
                    <View style={styles.dotsContainer}>
                      {categories.slice(0, 5).map((cat) => (
                        <View
                          key={cat.id}
                          style={[
                            styles.colorDot,
                            { backgroundColor: categoryColor(cat.id) },
                          ]}
                        />
                      ))}
                    </View>
                    <ThemedText style={styles.categoryText}>ทั้งหมด</ThemedText>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Individual Categories */}
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryItem,
                    selectedCategoryId === category.id &&
                      styles.categoryItemSelected,
                    { borderBottomColor: borderColor },
                  ]}
                  onPress={() => handleSelectCategory(category.id)}
                >
                  <View style={styles.categoryContent}>
                    <View style={styles.categoryLeft}>
                      <View
                        style={[
                          styles.colorIndicator,
                          { backgroundColor: categoryColor(category.id) },
                        ]}
                      />
                      <ThemedText style={styles.categoryText}>
                        {category.courseCategory}
                      </ThemedText>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ThemedView>
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  bottomSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheetBackdrop: {
    flex: 1,
  },
  bottomSheetContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34, // Safe area for iOS
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 10,
    maxHeight: '80%',
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Prompt-SemiBold',
    color: '#374151',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 16,
    fontFamily: 'Prompt-Medium',
  },
  scrollView: {
    maxHeight: 500,
  },
  bottomSheetContent: {
    paddingTop: 8,
  },
  categoryItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  categoryItemSelected: {
    backgroundColor: 'rgba(24, 58, 124, 0.05)',
  },
  categoryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  colorIndicator: {
    width: 8,
    height: 8,
    borderRadius: 6,
    marginRight: 12,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  categoryText: {
    fontSize: 16,
    fontFamily: 'Prompt-Regular',
    color: '#374151',
    flex: 1,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Prompt-Bold',
  },
})
