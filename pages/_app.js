import React from 'react';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <style jsx global>{`
        body { margin: 0; padding: 0; background-color: #f8fafc; font-family: system-ui, sans-serif; }
        * { box-sizing: border-box; }
        .container { max-width: 1000px; margin: 0 auto; padding: 40px 20px; }
      `}</style>
      <Component {...pageProps} />
    </>
  );
}
export default MyApp;