// Category color mapping matching desktop version
export default function categoryColor(id: number): string {
  switch (id) {
    case 1:
      return '#9C27B0' // purple[500]
    case 2:
      return '#3F51B5' // indigo[500]
    case 3:
      return '#E91E63' // pink[500]
    case 4:
      return '#FF9800' // orange[500]
    case 5:
      return '#4CAF50' // green[500]
    case 6:
      return '#2196F3' // blue[500]
    case 7:
      return '#795548' // brown[500]
    default:
      return '#9E9E9E' // grey[500]
  }
}
