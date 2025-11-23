// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { SymbolViewProps, SymbolWeight } from 'expo-symbols'
import { ComponentProps } from 'react'
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native'

type IconMapping = Record<
  SymbolViewProps['name'],
  ComponentProps<typeof MaterialIcons>['name']
>
type IconSymbolName = keyof typeof MAPPING

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  // See MaterialIcons here: https://icons.expo.fyi
  // See SF Symbols in the SF Symbols app on Mac.
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'chevron.left': 'chevron-left',
  play: 'play-arrow',
  'play.fill': 'play-circle-filled',
  creditcard: 'credit-card',
  person: 'person',
  lock: 'lock',
  'eye.slash': 'visibility-off',
  eye: 'visibility',
  key: 'vpn-key',
  'person.circle.fill': 'account-circle',
  bell: 'notifications',
  'book.closed': 'book',
  'star.circle': 'stars',
  printer: 'print',
  'doc.text': 'description',
  pencil: 'edit',
  'arrow.right.square': 'exit-to-app',
  trash: 'delete',
  'checkmark.circle': 'check-circle',
  'star.circle.fill': 'stars',
  'person.circle': 'account-circle',
  target: 'track-changes',
  clock: 'access-time',
  'chart.bar': 'bar-chart',
  'info.circle': 'info',
  'arrow.right': 'arrow-forward',
  'arrow.left': 'arrow-back',
  paperclip: 'attach-file',
  paperplane: 'send',
  star: 'star',
  'person.3': 'groups',
  'person.2': 'group',
  photo: 'image',
  trophy: 'emoji-events',
  gear: 'settings',
  'play.circle': 'play-circle-filled',
} as IconMapping

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName
  size?: number
  color: string | OpaqueColorValue
  style?: StyleProp<TextStyle>
  weight?: SymbolWeight
}) {
  return (
    <MaterialIcons
      color={color}
      size={size}
      name={MAPPING[name]}
      style={style}
    />
  )
}
