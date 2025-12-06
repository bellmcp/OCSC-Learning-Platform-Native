import { Asset } from 'expo-asset'
import * as FileSystem from 'expo-file-system'
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { ActivityIndicator, Dimensions, StyleSheet, View } from 'react-native'
import { WebView } from 'react-native-webview'

// Local certificate assets
const CERT_ASSETS_REQUIRE = {
  background: require('@/assets/images/cert-background.svg'),
  logo: require('@/assets/images/cert-logo.png'),
  logoPictogram: require('@/assets/images/cert-logo-pictogram.png'),
  garuda: require('@/assets/images/cert-garuda.png'),
  signatureNull: require('@/assets/images/cert-signature-null.png'),
  signatureBoonpluk: require('@/assets/images/cert-signature-boonpluk.png'),
  signatureSima: require('@/assets/images/cert-signature-sima.png'),
  signaturePreecha: require('@/assets/images/cert-signature-preecha.png'),
  signatureBenjawan: require('@/assets/images/cert-signature-benjawan.png'),
  signatureNontikorn: require('@/assets/images/cert-signature-nontikorn.png'),
  signatureWisut: require('@/assets/images/cert-signature-wisut.png'),
  signatureMetinee: require('@/assets/images/cert-signature-metinee.png'),
  signaturePatcharapakorn: require('@/assets/images/cert-signature-patcharapakorn.png'),
  signaturePiyawat: require('@/assets/images/cert-signature-piyawat.png'),
}

// Signature mapping (same as desktop)
const SIGNATURE_ASSETS: Record<number, any> = {
  1: CERT_ASSETS_REQUIRE.signatureBoonpluk,
  2: CERT_ASSETS_REQUIRE.signatureSima,
  3: CERT_ASSETS_REQUIRE.signaturePreecha,
  4: CERT_ASSETS_REQUIRE.signatureBenjawan,
  5: CERT_ASSETS_REQUIRE.signatureNontikorn,
  6: CERT_ASSETS_REQUIRE.signatureWisut,
  7: CERT_ASSETS_REQUIRE.signatureMetinee,
  8: CERT_ASSETS_REQUIRE.signaturePatcharapakorn,
  9: CERT_ASSETS_REQUIRE.signaturePiyawat,
}

interface CertificateAssets {
  background: string
  logo: string
  logoPictogram: string
  garuda: string
  signatureNull: string
  signature: string
}

// Convert local asset to base64 data URL
async function assetToBase64(
  asset: any,
  mimeType: string = 'image/png'
): Promise<string> {
  try {
    const [loadedAsset] = await Asset.loadAsync(asset)
    if (!loadedAsset.localUri) {
      console.warn('Asset localUri not available')
      return ''
    }
    const base64 = await FileSystem.readAsStringAsync(loadedAsset.localUri, {
      encoding: FileSystem.EncodingType.Base64,
    })
    return `data:${mimeType};base64,${base64}`
  } catch (error) {
    console.error('Error converting asset to base64:', error)
    return ''
  }
}

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
    return `${day} ${month} พ.ศ. ${year}`
  } catch (e) {
    return dateString
  }
}

export interface CertificateRendererProps {
  // Certificate info from API
  title?: string
  firstName?: string
  lastName?: string
  contentName: string
  hour?: number
  endDate: string
  isCurriculum?: boolean
  // Template info from API
  text1?: string
  text2?: string
  text3?: string
  text4?: string
  signature?: number
  signer?: string
  position1?: string
  position2?: string
  signatureUrl?: string
  // Co-certificate info
  coCert?: boolean
  coLogo?: string
  coSigner?: string
  coSignatureUrl?: string
  coPosition1?: string
  coPosition2?: string
}

export interface CertificateRendererRef {
  getHTML: () => string | null
  getPrintHTML: () => string | null
  containerRef: React.RefObject<View | null>
}

const CertificateRenderer = forwardRef<
  CertificateRendererRef,
  CertificateRendererProps
>(
  (
    {
      title = '',
      firstName = '',
      lastName = '',
      contentName,
      hour,
      endDate,
      isCurriculum = false,
      text1 = 'สำนักงาน ก.พ.',
      text2 = '',
      text3 = 'ขอมอบประกาศนียบัตรนี้เพื่อแสดงว่า',
      text4 = 'ได้สำเร็จการศึกษาตามหลักเกณฑ์ที่กำหนด',
      signature,
      signer,
      position1,
      position2,
      signatureUrl,
      coCert = false,
      coLogo,
      coSigner,
      coSignatureUrl,
      coPosition1,
      coPosition2,
    },
    ref
  ) => {
    const webViewRef = useRef<WebView>(null)
    const containerRef = useRef<View>(null)
    const [assets, setAssets] = useState<CertificateAssets | null>(null)
    const [loading, setLoading] = useState(true)
    const [certificateHTML, setCertificateHTML] = useState<string | null>(null)
    const [printHTML, setPrintHTML] = useState<string | null>(null)

    const screenWidth = Dimensions.get('window').width
    const certificateWidth = screenWidth - 40 // 20px margin on each side
    const certificateHeight = certificateWidth * 1.414 // A4 ratio

    // Load and convert assets to base64
    useEffect(() => {
      const loadAssets = async () => {
        try {
          // Get the signature asset based on signature number
          const signatureAsset = signature
            ? SIGNATURE_ASSETS[signature]
            : CERT_ASSETS_REQUIRE.signatureNull
          const signatureToLoad =
            signatureAsset || CERT_ASSETS_REQUIRE.signatureNull

          // Load all assets in parallel
          const [
            backgroundBase64,
            logoBase64,
            logoPictogramBase64,
            garudaBase64,
            signatureNullBase64,
            signatureBase64,
          ] = await Promise.all([
            assetToBase64(CERT_ASSETS_REQUIRE.background, 'image/svg+xml'),
            assetToBase64(CERT_ASSETS_REQUIRE.logo, 'image/png'),
            assetToBase64(CERT_ASSETS_REQUIRE.logoPictogram, 'image/png'),
            assetToBase64(CERT_ASSETS_REQUIRE.garuda, 'image/png'),
            assetToBase64(CERT_ASSETS_REQUIRE.signatureNull, 'image/png'),
            assetToBase64(signatureToLoad, 'image/png'),
          ])

          setAssets({
            background: backgroundBase64,
            logo: logoBase64,
            logoPictogram: logoPictogramBase64,
            garuda: garudaBase64,
            signatureNull: signatureNullBase64,
            signature: signatureBase64,
          })
        } catch (error) {
          console.error('Error loading certificate assets:', error)
        } finally {
          setLoading(false)
        }
      }

      loadAssets()
    }, [signature])

    // Generate HTML when assets are ready
    useEffect(() => {
      if (!assets) return

      const sigUrl = signatureUrl || assets.signature
      const formattedDate = formatThaiDate(endDate)

      // Generate HTML for standard certificate (for display)
      const standardHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link href="https://fonts.googleapis.com/css2?family=Athiti:wght@400;500;600&family=Prompt:wght@400;500;600&display=swap" rel="stylesheet">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Athiti', sans-serif; -webkit-user-select: none; user-select: none; }
            .container {
              width: 100%;
              min-height: ${certificateHeight}px;
              background: url('${assets.background}');
              background-size: cover;
              background-position: center;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 20px;
            }
            .content { display: flex; flex-direction: column; align-items: center; padding: 0 20px 30px; }
            .garuda { width: 80px; height: auto; margin-bottom: 12px; }
            .logo { width: 90px; height: auto; margin-bottom: 12px; }
            .text1 { font-size: 16px; color: #414042; text-align: center; margin-bottom: ${
              text2 ? '5px' : '3px'
            }; line-height: 1.1; }
            .text2 { font-size: 14px; color: #414042; text-align: center; }
            .text3 { font-size: 12px; color: #414042; text-align: center; margin-bottom: 3px; }
            .divider { width: 80%; height: 1px; background-color: #BCBEC0; margin-bottom: 20px; }
            .name { font-family: 'Prompt', sans-serif; font-size: 18px; font-weight: 500; color: #EFAA1F; text-align: center; margin-bottom: 16px; line-height: 1; }
            .text4 { font-size: 11px; color: #414042; text-align: center; margin-bottom: 16px; }
            .course-name { font-size: 14px; color: #414042; text-align: center; margin-bottom: 16px; line-height: 1.2; font-weight: 500; }
            .hours { font-size: 11px; color: #414042; text-align: center; }
            .date { font-size: 11px; color: #414042; text-align: center; margin-bottom: 12px; }
            .signature-img { width: 90px; height: auto; margin-bottom: 5px; }
            .signer-info { font-size: 9px; color: #414042; text-align: center; line-height: 1.2; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="content">
              <img class="garuda" src="${assets.garuda}" alt="Garuda" />
              <img class="logo" src="${assets.logo}" alt="OCSC Logo" />
              <div class="text1">${text1}${
        text2 ? `<br/><span class="text2">${text2}</span>` : ''
      }</div>
              <div class="text3">${text3}</div>
              <div class="divider"></div>
              <div class="name">${title}${firstName} ${lastName}</div>
              <div class="text4">${text4}</div>
              <div class="course-name">${
                isCurriculum ? 'หลักสูตร' : 'วิชา'
              } ${contentName}</div>
              <div class="hours">(รวมระยะเวลาทั้งสิ้น ${
                hour || '-'
              } ชั่วโมง)</div>
              <div class="date">ให้ไว้ ณ วันที่ ${formattedDate}</div>
              <img class="signature-img" src="${sigUrl}" alt="Signature" />
              <div class="signer-info">${signer || ''}${
        position1 ? `<br/>${position1}` : ''
      }${position2 ? `<br/>${position2}` : ''}</div>
            </div>
          </div>
        </body>
        </html>
      `

      // Generate HTML for co-certificate (for display)
      const coHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link href="https://fonts.googleapis.com/css2?family=Athiti:wght@400;500;600&family=Prompt:wght@400;500;600&display=swap" rel="stylesheet">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Athiti', sans-serif; -webkit-user-select: none; user-select: none; }
            .container {
              width: 100%;
              min-height: ${certificateHeight}px;
              background: url('${assets.background}');
              background-size: cover;
              background-position: center;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 20px;
            }
            .content { display: flex; flex-direction: column; align-items: center; padding: 5px 20px 40px; }
            .logos { display: flex; align-items: flex-end; justify-content: center; gap: 20px; margin-bottom: 10px; }
            .logo-pictogram { width: 70px; height: auto; }
            .co-logo { width: 55px; height: auto; }
            .text1 { font-size: 15px; color: #414042; text-align: center; margin-bottom: ${
              text2 ? '12px' : '5px'
            }; line-height: 1.2; }
            .co-text { font-size: 12px; line-height: 20px; }
            .text2 { font-size: 15px; }
            .text3 { font-size: 12px; color: #414042; text-align: center; margin-bottom: 3px; }
            .divider { width: 80%; height: 1px; background-color: #BCBEC0; margin-bottom: 20px; }
            .name { font-family: 'Prompt', sans-serif; font-size: 18px; font-weight: 500; color: #EFAA1F; text-align: center; margin-bottom: 18px; line-height: 1; }
            .text4 { font-size: 11px; color: #414042; text-align: center; margin-bottom: 18px; }
            .course-name { font-size: ${
              contentName.length >= 42 ? '12px' : '14px'
            }; color: #414042; text-align: center; margin-bottom: 18px; line-height: 1.2; font-weight: 500; }
            .hours { font-size: 11px; color: #414042; text-align: center; }
            .date { font-size: 11px; color: #414042; text-align: center; margin-bottom: 10px; }
            .signatures { display: flex; justify-content: center; gap: 20px; }
            .signature-block { display: flex; flex-direction: column; align-items: center; }
            .signature-img { width: auto; height: 20px; margin-bottom: 5px; }
            .signer-info { font-size: 8px; color: #414042; text-align: center; line-height: 1.2; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="content">
              <div class="logos">
                <img class="logo-pictogram" src="${
                  assets.logoPictogram
                }" alt="OCSC Logo" />
                ${
                  coLogo
                    ? `<img class="co-logo" src="${coLogo}" alt="Co Logo" />`
                    : ''
                }
              </div>
              <div class="text1">${text1}${
        text2
          ? `<br/><span class="co-text">ร่วมกับ</span><br/><span class="text2">${text2}</span>`
          : ''
      }</div>
              <div class="text3">${text3}</div>
              <div class="divider"></div>
              <div class="name">${title}${firstName} ${lastName}</div>
              <div class="text4">${text4}</div>
              <div class="course-name">${
                isCurriculum ? 'หลักสูตร' : 'วิชา'
              } ${contentName}</div>
              <div class="hours">(รวมระยะเวลาทั้งสิ้น ${
                hour || '-'
              } ชั่วโมง)</div>
              <div class="date">ให้ไว้ ณ วันที่ ${formattedDate}</div>
              <div class="signatures">
                ${
                  signatureUrl || signer
                    ? `<div class="signature-block"><img class="signature-img" src="${sigUrl}" alt="Signature" /><div class="signer-info">${
                        signer || ''
                      }${position1 ? `<br/>${position1}` : ''}${
                        position2 ? `<br/>${position2}` : ''
                      }</div></div>`
                    : ''
                }
                ${
                  coSignatureUrl || coSigner
                    ? `<div class="signature-block"><img class="signature-img" src="${
                        coSignatureUrl || assets.signatureNull
                      }" alt="Co Signature" /><div class="signer-info">${
                        coSigner || ''
                      }${coPosition1 ? `<br/>${coPosition1}` : ''}${
                        coPosition2 ? `<br/>${coPosition2}` : ''
                      }</div></div>`
                    : ''
                }
              </div>
            </div>
          </div>
        </body>
        </html>
      `

      // Generate print HTML (A4 size for PDF/Print)
      const printStandardHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <link href="https://fonts.googleapis.com/css2?family=Athiti:wght@400;500;600&family=Prompt:wght@400;500;600&display=swap" rel="stylesheet">
          <style>
            @page { size: A4 portrait; margin: 0; }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Athiti', sans-serif; }
            .container {
              width: 210mm;
              height: 297mm;
              background: url('${assets.background}');
              background-size: cover;
              background-position: center;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 0 50px 70px;
            }
            .garuda { width: 160px; height: auto; margin-bottom: 25px; }
            .logo { width: 180px; height: auto; margin-bottom: 25px; }
            .text1 { font-size: 30px; color: #414042; text-align: center; margin-bottom: ${
              text2 ? '10px' : '5px'
            }; line-height: 1.1; }
            .text2 { font-size: 26px; }
            .text3 { font-size: 22px; color: #414042; text-align: center; margin-bottom: 6px; }
            .divider { width: 470px; height: 1px; background-color: #BCBEC0; margin-bottom: 50px; }
            .name { font-family: 'Prompt', sans-serif; font-size: 37px; font-weight: 500; color: #EFAA1F; text-align: center; margin-bottom: 40px; line-height: 1; }
            .text4 { font-size: 20px; color: #414042; text-align: center; margin-bottom: 38px; }
            .course-name { font-size: 28px; color: #414042; text-align: center; margin-bottom: 38px; line-height: 1.2; }
            .hours { font-size: 20px; color: #414042; text-align: center; }
            .date { font-size: 20px; color: #414042; text-align: center; margin-bottom: 25px; }
            .signature-img { width: 180px; height: auto; margin-bottom: 10px; }
            .signer-info { font-size: 15px; color: #414042; text-align: center; line-height: 1.2; }
          </style>
        </head>
        <body>
          <div class="container">
            <img class="garuda" src="${assets.garuda}" alt="Garuda" />
            <img class="logo" src="${assets.logo}" alt="OCSC Logo" />
            <div class="text1">${text1}${
        text2 ? `<br/><span class="text2">${text2}</span>` : ''
      }</div>
            <div class="text3">${text3}</div>
            <div class="divider"></div>
            <div class="name">${title}${firstName} ${lastName}</div>
            <div class="text4">${text4}</div>
            <div class="course-name">${
              isCurriculum ? 'หลักสูตร' : 'วิชา'
            } ${contentName}</div>
            <div class="hours">(รวมระยะเวลาทั้งสิ้น ${
              hour || '-'
            } ชั่วโมง)</div>
            <div class="date">ให้ไว้ ณ วันที่ ${formattedDate}</div>
            <img class="signature-img" src="${sigUrl}" alt="Signature" />
            <div class="signer-info">${signer || ''}${
        position1 ? `<br/>${position1}` : ''
      }${position2 ? `<br/>${position2}` : ''}</div>
          </div>
        </body>
        </html>
      `

      const printCoHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <link href="https://fonts.googleapis.com/css2?family=Athiti:wght@400;500;600&family=Prompt:wght@400;500;600&display=swap" rel="stylesheet">
          <style>
            @page { size: A4 portrait; margin: 0; }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Athiti', sans-serif; }
            .container {
              width: 210mm;
              height: 297mm;
              background: url('${assets.background}');
              background-size: cover;
              background-position: center;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 10px 50px 100px;
            }
            .logos { display: flex; align-items: flex-end; justify-content: center; gap: 16px; margin-bottom: 10px; }
            .logo-pictogram { height: 150px; width: auto; }
            .co-logo { height: 115px; width: auto; margin-bottom: -3px; }
            .text1 { font-size: 30px; color: #414042; text-align: center; margin-bottom: ${
              text2 ? '25px' : '15px'
            }; line-height: 1.2; }
            .co-text { font-size: 22px; line-height: 40px; }
            .text3 { font-size: 22px; color: #414042; text-align: center; margin-bottom: 6px; }
            .divider { width: 470px; height: 1px; background-color: #BCBEC0; margin-bottom: 45px; }
            .name { font-family: 'Prompt', sans-serif; font-size: 37px; font-weight: 500; color: #EFAA1F; text-align: center; margin-bottom: 40px; line-height: 1; }
            .text4 { font-size: 20px; color: #414042; text-align: center; margin-bottom: 38px; }
            .course-name { font-size: ${
              contentName.length >= 42 ? '25px' : '28px'
            }; color: #414042; text-align: center; margin-bottom: 38px; line-height: 1.2; }
            .hours { font-size: 20px; color: #414042; text-align: center; }
            .date { font-size: 20px; color: #414042; text-align: center; margin-bottom: 25px; }
            .signatures { display: flex; justify-content: center; gap: 16px; margin-bottom: 10px; }
            .signature-block { display: flex; flex-direction: column; align-items: center; justify-content: center; }
            .signature-img { height: 40px; width: auto; margin-bottom: 10px; }
            .signer-info { font-size: 15px; color: #414042; text-align: center; line-height: 1.2; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logos">
              <img class="logo-pictogram" src="${
                assets.logoPictogram
              }" alt="OCSC Logo" />
              ${
                coLogo
                  ? `<img class="co-logo" src="${coLogo}" alt="Co Logo" />`
                  : ''
              }
            </div>
            <div class="text1">${text1}${
        text2 ? `<br/><span class="co-text">ร่วมกับ</span><br/>${text2}` : ''
      }</div>
            <div class="text3">${text3}</div>
            <div class="divider"></div>
            <div class="name">${title}${firstName} ${lastName}</div>
            <div class="text4">${text4}</div>
            <div class="course-name">${
              isCurriculum ? 'หลักสูตร' : 'วิชา'
            } ${contentName}</div>
            <div class="hours">(รวมระยะเวลาทั้งสิ้น ${
              hour || '-'
            } ชั่วโมง)</div>
            <div class="date">ให้ไว้ ณ วันที่ ${formattedDate}</div>
            <div class="signatures">
              ${
                signatureUrl || signer
                  ? `<div class="signature-block"><img class="signature-img" src="${sigUrl}" alt="Signature" /><div class="signer-info">${
                      signer || ''
                    }${position1 ? `<br/>${position1}` : ''}${
                      position2 ? `<br/>${position2}` : ''
                    }</div></div>`
                  : ''
              }
              ${
                coSignatureUrl || coSigner
                  ? `<div class="signature-block"><img class="signature-img" src="${
                      coSignatureUrl || assets.signatureNull
                    }" alt="Co Signature" /><div class="signer-info">${
                      coSigner || ''
                    }${coPosition1 ? `<br/>${coPosition1}` : ''}${
                      coPosition2 ? `<br/>${coPosition2}` : ''
                    }</div></div>`
                  : ''
              }
            </div>
          </div>
        </body>
        </html>
      `

      setCertificateHTML(coCert ? coHTML : standardHTML)
      setPrintHTML(coCert ? printCoHTML : printStandardHTML)
    }, [
      assets,
      title,
      firstName,
      lastName,
      contentName,
      hour,
      endDate,
      isCurriculum,
      text1,
      text2,
      text3,
      text4,
      signer,
      position1,
      position2,
      signatureUrl,
      coCert,
      coLogo,
      coSigner,
      coSignatureUrl,
      coPosition1,
      coPosition2,
      certificateHeight,
    ])

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      getHTML: () => certificateHTML,
      getPrintHTML: () => printHTML,
      containerRef,
    }))

    if (loading || !assets || !certificateHTML) {
      return (
        <View
          style={[
            styles.container,
            styles.loadingContainer,
            { height: certificateHeight },
          ]}
        >
          <ActivityIndicator size='large' color='#183A7C' />
        </View>
      )
    }

    return (
      <View
        ref={containerRef}
        style={[styles.container, { height: certificateHeight }]}
        collapsable={false}
      >
        <WebView
          ref={webViewRef}
          source={{ html: certificateHTML }}
          style={styles.webview}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          scalesPageToFit={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          originWhitelist={['*']}
          allowFileAccess={true}
        />
      </View>
    )
  }
)

CertificateRenderer.displayName = 'CertificateRenderer'

export default CertificateRenderer

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
