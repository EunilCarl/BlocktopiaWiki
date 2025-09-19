import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html className="dark"> {/* <- default dark mode */}
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
