import React from 'react'
import Document, { Html, Head, Main, NextScript } from 'next/document'
import createEmotionServer from '@emotion/server/types/create-instance'
import createCache from '@emotion/cache'

export default class MyDocument extends Document {
    render() {
        return (
            <Html lang="en">
                <Head>
                    <meta charSet="utf-8" />
                    <link
                        rel="stylesheet"
                        href="http://font.googleapis.com/css?family=Roboto:300,400,500,700"
                    />
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        )
    }
}

MyDocument.getInitialProps = async (ctx) => {
    const originalRenderPage = ctx.renderPage
    const cache = createCache({})
    const { extractCritical } = createEmotionServer(cache)
    ctx.renderPage = () =>
        originalRenderPage({
            // eslint-disable-next-line react/display-name
            enhanceApp: (App) => (props) =>
                <App emotionCache={cache} {...props} />,
        })

    const initialProps = await Document.getInitialProps(ctx)
    const { html, head, errorHtml, chunks } = initialProps
    const emotionStyles = extractCritical(html)
    const emotionStyleTags = emotionStyles.map((styles) => (
        <style
            data-emotion-css={`${styles.key} ${styles.ids.join(' ')}`}
            key={styles.key}
            dangerouslySetInnerHTML={{ __html: styles.styles }}
        />
    ))

    return {
        ...initialProps,
        styles: [
            ...React.Children.toArray(initialProps.styles),
            ...emotionStyleTags,
        ],
    }
}
