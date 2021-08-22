import { useEffect, useState } from "react";
import Link from "next/link";

function App({ Component, pageProps, userAgent }) {
  // const [isIE, setIsIE] = useState(false);
  // const [isChrome, SetIsChrome] = useState(false);

  // useEffect(() => {
  //   const IE = navigator.userAgent.match(/MSIE|rv:|IEMobile/i);
  //   const Chrome = navigator.userAgent.match(/Chrome/i);
  //   setIsIE(Boolean(IE));
  //   SetIsChrome(Boolean(Chrome));
  // }, []);

  // console.log("isIE", isIE); // output: false
  // console.log("isChrome", isChrome); // output: true

  return (
    <div>
      <Link href="/page1">
        <a>page1</a>
      </Link>
      <Link href="/page2">
        <a>page2</a>
      </Link>
      <h1>HOME</h1>
      <Component {...pageProps} />
    </div>
  );
}

// App.getInitialProps = async ({ req }) => {
//   const userAgent = req ? req.headers["user-agent"] : navigator.userAgent;
//   return { userAgent };
// };

export default App;
