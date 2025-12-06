import * as uiActions from '@/modules/ui/actions'
import type { RootState } from '@/store/types'
import {
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import RenderHtml from 'react-native-render-html'
import { useDispatch, useSelector } from 'react-redux'

import { useWindowDimensions } from 'react-native'
import { ThemedText } from './ThemedText'

/**
 * Global Modal Component - Displays important messages like registration condition errors
 * Matches desktop's GlobalModal behavior
 */
export default function GlobalModal() {
  const dispatch = useDispatch()
  const { width } = useWindowDimensions()
  const { isGlobalModalOpen, globalModalTitle, globalModalMessage } =
    useSelector((state: RootState) => state.ui)

  const handleClose = () => {
    dispatch(uiActions.clearGlobalModal())
  }

  if (!isGlobalModalOpen) {
    return null
  }

  // Check if message contains HTML
  const hasHtml = /<[^>]+>/.test(globalModalMessage || '')

  return (
    <Modal
      visible={isGlobalModalOpen}
      transparent
      animationType='fade'
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              {/* Title */}
              {globalModalTitle && (
                <ThemedText style={styles.title}>{globalModalTitle}</ThemedText>
              )}

              {/* Message */}
              {hasHtml ? (
                <View style={styles.htmlContainer}>
                  <RenderHtml
                    contentWidth={width - 100}
                    source={{ html: globalModalMessage || '' }}
                    baseStyle={styles.messageHtml}
                    tagsStyles={{
                      p: { marginVertical: 4 },
                      li: { marginBottom: 4 },
                    }}
                  />
                </View>
              ) : (
                <ThemedText style={styles.message}>
                  {globalModalMessage}
                </ThemedText>
              )}

              {/* Close Button */}
              <TouchableOpacity style={styles.button} onPress={handleClose}>
                <ThemedText style={styles.buttonText}>ตกลง</ThemedText>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    maxWidth: 400,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Prompt-SemiBold',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    fontFamily: 'Prompt-Regular',
    color: '#4B5563',
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  htmlContainer: {
    marginBottom: 24,
  },
  messageHtml: {
    fontSize: 16,
    fontFamily: 'Prompt-Regular',
    color: '#4B5563',
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#183A7C',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Prompt-SemiBold',
    color: 'white',
  },
})
