import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { ActivityIndicator, Dimensions, StyleSheet, View } from 'react-native'
import { WebView } from 'react-native-webview'

// Format date in Thai Buddhist calendar
const formatThaiDate = (dateString: string) => {
  if (!dateString) return '-'
  try {
    const date = new Date(dateString)
    const thaiMonths = [
      'มกราคม',
      'กุมภาพันธ์',
      'มีนาคม',
      'เมษายน',
      'พฤษภาคม',
      'มิถุนายน',
      'กรกฎาคม',
      'สิงหาคม',
      'กันยายน',
      'ตุลาคม',
      'พฤศจิกายน',
      'ธันวาคม',
    ]
    const day = date.getDate()
    const month = thaiMonths[date.getMonth()]
    const year = date.getFullYear() + 543
    return `${day} ${month} ${year}`
  } catch (e) {
    return dateString
  }
}

export interface ScoreRendererProps {
  id?: string
  title?: string
  firstName?: string
  lastName?: string
  jobTitle?: string
  jobLevel?: string
  department?: string
  ministry?: string
  date?: string
  pass?: boolean
  s1?: [number, number, number]
  s2?: [number, number, number]
  s3?: [number, number, number]
  s4?: [number, number, number]
  s5?: [number, number, number]
  s6?: [number, number, number]
  s7?: [number, number, number]
  s8?: [number, number, number]
  s9?: [number, number, number]
  s10?: [number, number, number]
  s11?: [number, number, number]
  s12?: [number, number, number]
  s13?: [number, number, number]
}

export interface ScoreRendererRef {
  getHTML: () => string | null
  getPrintHTML: () => string | null
  containerRef: React.RefObject<View | null>
}

const ScoreRenderer = forwardRef<ScoreRendererRef, ScoreRendererProps>(
  (props, ref) => {
    const {
      id = '',
      title = '',
      firstName = '',
      lastName = '',
      jobTitle = '',
      jobLevel = '',
      department = '',
      ministry = '',
      date = '',
      pass = false,
      s1,
      s2,
      s3,
      s4,
      s5,
      s6,
      s7,
      s8,
      s9,
      s10,
      s11,
      s12,
      s13,
    } = props

    const webViewRef = useRef<WebView>(null)
    const containerRef = useRef<View>(null)
    const [html, setHtml] = useState<string | null>(null)
    const [printHTML, setPrintHTML] = useState<string | null>(null)

    const screenWidth = Dimensions.get('window').width
    const contentWidth = screenWidth - 40
    // A4 dimensions: 210mm x 297mm (ratio ~1.414)
    const contentHeight = contentWidth * 1.3 // Slightly less than A4 ratio to fit content better

    // Get minimum score (60%)
    const getMinimumScore = (value: number) => Math.floor(value * 0.6)

    // Get pass status color
    const getPassColor = (score: number, total: number): 'green' | 'red' => {
      return score >= getMinimumScore(total) ? 'green' : 'red'
    }

    // Calculate total score
    const getTotalItem = () => {
      let sum = 0
      const scores = [s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13]
      scores.forEach((s) => {
        if (s && s[0]) sum += s[0]
      })
      return sum
    }

    // Generate table row HTML - matching desktop ScoreTableRow exactly
    const generateTableRow = (
      rowTitle: string,
      value?: [number, number, number],
      isHeader?: boolean
    ) => {
      const cellStyle =
        'font-size: 13px; border-bottom: 1px solid #000; border-right: 1px solid #000; padding: 6px;'
      const lastCellStyle =
        'font-size: 13px; border-bottom: 1px solid #000; padding: 6px;'

      if (isHeader) {
        return `
          <tr style="font-size: 13px; font-weight: bold;">
            <td style="text-align: left; ${cellStyle}">${rowTitle}</td>
            <td style="${cellStyle}">จำนวนข้อ</td>
            <td style="${cellStyle}">60%</td>
            <td style="${cellStyle}">คะแนน Pre-test</td>
            <td style="${lastCellStyle}">คะแนน Post-test</td>
          </tr>
        `
      }

      if (!value) {
        // Section header row (bold, no values)
        return `
          <tr style="font-size: 13px; font-weight: bold;">
            <td style="text-align: left; ${cellStyle}">${rowTitle}</td>
            <td style="${cellStyle}"></td>
            <td style="${cellStyle}"></td>
            <td style="${cellStyle}"></td>
            <td style="${lastCellStyle}"></td>
          </tr>
        `
      }

      const [total, preTest, postTest] = value
      const minimum = getMinimumScore(total)
      const preTestColor = getPassColor(preTest, total)
      const postTestColor = getPassColor(postTest, total)

      return `
        <tr style="font-size: 13px;">
          <td style="text-align: left; ${cellStyle}">${rowTitle}</td>
          <td style="${cellStyle}">${total}</td>
          <td style="${cellStyle}">${minimum}</td>
          <td style="${cellStyle} color: ${preTestColor};">${preTest}</td>
          <td style="${lastCellStyle} color: ${postTestColor};">${postTest}</td>
        </tr>
      `
    }

    useEffect(() => {
      const formattedDate = formatThaiDate(date)
      const passStatus = pass
        ? '<span style="color: green;">ผ่าน</span>'
        : '<span style="color: red;">ไม่ผ่าน</span>'

      const tableRows = `
        ${generateTableRow(
          'หมวดที่ 1: ปลูกฝังปรัชญาการเป็นข้าราชการที่ดี',
          undefined,
          true
        )}
        ${generateTableRow('ชุดวิชาที่ 1: การเป็นข้าราชการ', s1)}
        ${generateTableRow('ชุดวิชาที่ 2: การเรียนรู้ตามรอยพระยุคลบาท', s2)}
        ${generateTableRow('หมวดที่ 2: ระบบราชการและการบริหารภาครัฐแนวใหม่')}
        ${generateTableRow('ชุดวิชาที่ 1: ระบบราชการไทย', s3)}
        ${generateTableRow('ชุดวิชาที่ 2: การบริหารงานภาครัฐแนวใหม่', s4)}
        ${generateTableRow('ชุดวิชาที่ 3: การบริหารกิจการบ้านเมืองที่ดี', s5)}
        ${generateTableRow('หมวดที่ 3: ความรู้พื้นฐานสำหรับข้าราชการ')}
        ${generateTableRow('ชุดวิชาที่ 1: วินัยและจรรยาข้าราชการ', s6)}
        ${generateTableRow('ชุดวิชาที่ 2: ระเบียบแบบแผนของทางราชการ', s7)}
        ${generateTableRow('ชุดวิชาที่ 3: กฎหมายพื้นฐานสำหรับข้าราชการ', s8)}
        ${generateTableRow('หมวดที่ 4: เสริมสร้างสมรรถนะหลักและทักษะที่จำเป็น')}
        ${generateTableRow('ชุดวิชาที่ 1: การพัฒนาการคิด', s9)}
        ${generateTableRow('ชุดวิชาที่ 2: การสื่อสารที่มีประสิทธิภาพ', s10)}
        ${generateTableRow('ชุดวิชาที่ 3: มนุษยสัมพันธ์ในการทำงาน', s11)}
        ${generateTableRow(
          'ชุดวิชาที่ 4: สมรรถนะหลักสำหรับข้าราชการพลเรือน',
          s12
        )}
        ${generateTableRow(
          'ชุดวิชาที่ 5: การวางแผนปฏิบัติงานโครงการ และการดำเนินการตามแผน',
          s13
        )}
      `

      // Match desktop exactly - use same structure and styling
      const displayHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta name="viewport" content="width=794, initial-scale=${
            contentWidth / 794
          }, maximum-scale=${contentWidth / 794}, user-scalable=no">
          <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap" rel="stylesheet">
          <style>
            * { 
              margin: 0; 
              padding: 0; 
              box-sizing: border-box; 
              font-family: 'Sarabun', sans-serif;
              font-size: 13px !important;
            }
            body { 
              font-family: 'Sarabun', sans-serif; 
              font-size: 13px !important;
              background: #fff; 
              width: 794px;
              padding: 20px 12px;
            }
            .container {
              width: 97%;
              margin: 0 auto;
            }
            .title {
              font-size: 15px !important;
              font-weight: bold;
              text-align: center;
              margin-top: 20px;
              margin-bottom: 10px;
            }
            .divider {
              border: none;
              height: 1px;
              width: 100%;
              background-color: #BCBEC0;
              margin: 5px 0;
            }
            .info-row-container {
              display: flex;
              justify-content: space-between;
            }
            .info-row {
              font-size: 13px !important;
              margin-top: 10px;
              margin-bottom: 10px;
              flex-shrink: 0;
            }
            .info-row b {
              font-size: 13px !important;
              margin-right: 20px;
            }
            .info-row-single {
              font-size: 13px !important;
              margin-bottom: 10px;
            }
            .info-row-single b {
              font-size: 13px !important;
              margin-right: 25px;
            }
            .date-row {
              font-size: 13px !important;
              text-align: right;
              margin-bottom: 10px;
            }
            .date-row b {
              font-size: 13px !important;
            }
            .divider-bottom {
              border: none;
              height: 1px;
              width: 100%;
              background-color: #BCBEC0;
              margin: 10px 0 20px;
            }
            table {
              width: 100%;
              border: 1px solid #000;
              font-family: 'Sarabun', sans-serif;
              font-size: 13px !important;
              text-align: center;
              border-spacing: 0;
              border-collapse: collapse;
            }
            table tr {
              font-size: 13px !important;
            }
            table td {
              font-size: 13px !important;
              padding: 6px;
            }
            table b {
              font-size: 13px !important;
            }
            .footer {
              font-size: 13px !important;
              margin-top: 20px;
              margin-bottom: 5px;
            }
            .footer b {
              font-size: 13px !important;
            }
            .note {
              font-size: 13px !important;
              margin-top: 5px;
            }
            b {
              font-size: 13px !important;
            }
            span {
              font-size: 13px !important;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="title">ผลการเรียนรู้ด้วยตนเอง หลักสูตรฝึกอบรมข้าราชการบรรจุใหม่ (e-Learning)</div>
            <hr class="divider" />
            <div class="info-row-container">
              <div class="info-row"><b>ชื่อ - สกุล</b> : ${title}${firstName} ${lastName}</div>
              <div class="info-row"><b>เลขประจำตัวประชาชน</b> : ${id}</div>
            </div>
            <div class="info-row-single"><b>ตำแหน่ง</b> : ${jobTitle} ${jobLevel}</div>
            <div class="info-row-single"><b>หน่วยงาน</b> : ${department} ${ministry}</div>
            <div class="date-row"><b>วันที่จบหลักสูตร</b> : ${formattedDate}</div>
            <hr class="divider-bottom" />
            <table>
              ${tableRows}
              <tr style="font-size: 13px;">
                <td style="font-size: 13px; padding: 6px; border-bottom: 1px solid #000; border-right: 1px solid #000;">-รวม-</td>
                <td style="font-size: 13px; padding: 6px; border-bottom: 1px solid #000; border-right: 1px solid #000;">${getTotalItem()}</td>
                <td style="font-size: 13px; padding: 6px; border-bottom: 1px solid #000;"></td>
                <td style="font-size: 13px; padding: 6px; border-bottom: 1px solid #000;"></td>
                <td style="font-size: 13px; padding: 6px; border-bottom: 1px solid #000;"></td>
              </tr>
              <tr style="font-size: 13px;">
                <td colspan="3" style="font-size: 13px; padding: 6px; border-right: 1px solid #000;">สรุปผลการเรียนรู้</td>
                <td colspan="2" style="font-size: 13px; padding: 6px;">${passStatus}</td>
              </tr>
            </table>
            <div class="footer"><b>ผู้บันทึกคะแนน</b> : สำนักงาน ก.พ.</div>
            <div class="note">* หมายเหตุ : คะแนน Post-test ที่ผู้เรียนทำได้ในแต่ละวิชา จะต้องไม่ต่ำกว่า 60% ของคะแนนเต็มในวิชานั้น</div>
          </div>
        </body>
        </html>
      `

      // Print HTML with A4 dimensions
      const printHTMLContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap" rel="stylesheet">
          <style>
            @page { size: A4 portrait; margin: 0; }
            * { 
              margin: 0; 
              padding: 0; 
              box-sizing: border-box; 
              font-family: 'Sarabun', sans-serif;
              font-size: 13px !important;
            }
            body { 
              font-family: 'Sarabun', sans-serif; 
              font-size: 13px !important;
              background: #fff; 
              width: 210mm;
              min-height: 297mm;
              padding: 50px 30px;
            }
            .container {
              width: 97%;
              margin: 0 auto;
            }
            .title {
              font-size: 15px !important;
              font-weight: bold;
              text-align: center;
              margin-top: 50px;
              margin-bottom: 10px;
            }
            .divider {
              border: none;
              height: 1px;
              width: 100%;
              background-color: #BCBEC0;
              margin: 5px 0;
            }
            .info-row-container {
              font-size: 13px !important;
              display: flex;
              justify-content: space-between;
            }
            .info-row {
              font-size: 13px !important;
              margin-top: 10px;
              margin-bottom: 10px;
              flex-shrink: 0;
            }
            .info-row b {
              font-size: 13px !important;
              margin-right: 20px;
            }
            .info-row-single {
              font-size: 13px !important;
              margin-bottom: 10px;
            }
            .info-row-single b {
              font-size: 13px !important;
              margin-right: 25px;
            }
            .date-row {
              font-size: 13px !important;
              text-align: right;
              margin-bottom: 10px;
            }
            .date-row b {
              font-size: 13px !important;
            }
            .divider-bottom {
              border: none;
              height: 1px;
              width: 100%;
              background-color: #BCBEC0;
              margin: 10px 0 20px;
            }
            table {
              width: 100%;
              border: 1px solid #000;
              font-family: 'Sarabun', sans-serif;
              font-size: 13px !important;
              text-align: center;
              border-spacing: 0;
              border-collapse: collapse;
            }
            table tr {
              font-size: 13px !important;
            }
            table td {
              font-size: 13px !important;
              padding: 6px;
            }
            table b {
              font-size: 13px !important;
            }
            .footer {
              font-size: 13px !important;
              margin-top: 20px;
              margin-bottom: 5px;
            }
            .footer b {
              font-size: 13px !important;
            }
            .note {
              font-size: 13px !important;
              margin-top: 5px;
            }
            b {
              font-size: 13px !important;
            }
            span {
              font-size: 13px !important;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="title">ผลการเรียนรู้ด้วยตนเอง หลักสูตรฝึกอบรมข้าราชการบรรจุใหม่ (e-Learning)</div>
            <hr class="divider" />
            <div class="info-row-container">
              <div class="info-row"><b>ชื่อ - สกุล</b> : ${title}${firstName} ${lastName}</div>
              <div class="info-row"><b>เลขประจำตัวประชาชน</b> : ${id}</div>
            </div>
            <div class="info-row-single"><b>ตำแหน่ง</b> : ${jobTitle} ${jobLevel}</div>
            <div class="info-row-single"><b>หน่วยงาน</b> : ${department} ${ministry}</div>
            <div class="date-row"><b>วันที่จบหลักสูตร</b> : ${formattedDate}</div>
            <hr class="divider-bottom" />
            <table>
              ${tableRows}
              <tr style="font-size: 13px;">
                <td style="font-size: 13px; padding: 6px; border-bottom: 1px solid #000; border-right: 1px solid #000;">-รวม-</td>
                <td style="font-size: 13px; padding: 6px; border-bottom: 1px solid #000; border-right: 1px solid #000;">${getTotalItem()}</td>
                <td style="font-size: 13px; padding: 6px; border-bottom: 1px solid #000;"></td>
                <td style="font-size: 13px; padding: 6px; border-bottom: 1px solid #000;"></td>
                <td style="font-size: 13px; padding: 6px; border-bottom: 1px solid #000;"></td>
              </tr>
              <tr style="font-size: 13px;">
                <td colspan="3" style="font-size: 13px; padding: 6px; border-right: 1px solid #000;">สรุปผลการเรียนรู้</td>
                <td colspan="2" style="font-size: 13px; padding: 6px;">${passStatus}</td>
              </tr>
            </table>
            <div class="footer"><b>ผู้บันทึกคะแนน</b> : สำนักงาน ก.พ.</div>
            <div class="note">* หมายเหตุ : คะแนน Post-test ที่ผู้เรียนทำได้ในแต่ละวิชา จะต้องไม่ต่ำกว่า 60% ของคะแนนเต็มในวิชานั้น</div>
          </div>
        </body>
        </html>
      `

      setHtml(displayHTML)
      setPrintHTML(printHTMLContent)
    }, [props])

    useImperativeHandle(ref, () => ({
      getHTML: () => html,
      getPrintHTML: () => printHTML,
      containerRef,
    }))

    if (!html) {
      return (
        <View
          style={[
            styles.container,
            styles.loadingContainer,
            { height: contentHeight },
          ]}
        >
          <ActivityIndicator size='large' color='#183A7C' />
        </View>
      )
    }

    return (
      <View
        ref={containerRef}
        style={[styles.container, { height: contentHeight }]}
        collapsable={false}
      >
        <WebView
          ref={webViewRef}
          source={{ html }}
          style={styles.webview}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          scalesPageToFit={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          originWhitelist={['*']}
          bounces={false}
          setBuiltInZoomControls={false}
          setDisplayZoomControls={false}
        />
      </View>
    )
  }
)

ScoreRenderer.displayName = 'ScoreRenderer'

export default ScoreRenderer

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
})
