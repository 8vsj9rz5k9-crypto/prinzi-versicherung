import { Head, Html, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#376ff5" />
        <meta name="description" content="AI Insurance Agent workspace for customer, policy, claim, and conversation operations." />
      </Head>
      <body className="bg-slate-50 text-slate-900 antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
