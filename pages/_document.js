import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html className="dark">
      <Head>
        <link
          rel="preload"
          as="image"
          href="/logo-v1.webp"
          type="image/webp"
        />

        <link
          rel="preload"
          href="/fonts/yourfont.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />

      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
