import { useEffect, useState } from "react";

function App({ userAgent }) {
  // const [isIE, setIsIE] = useState(false);
  // const [isChrome, SetIsChrome] = useState(false);
  console.log("_app userAgent:", userAgent);

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
      <h1>HOME</h1>
    </div>
  );
}

App.getInitialProps = async ({ req }) => {
  const userAgent = req ? req.headers["user-agent"] : navigator.userAgent;
  return { userAgent };
};

export default App;
