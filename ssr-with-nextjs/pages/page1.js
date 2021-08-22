import Head from "next/head";
import Link from "next/link";
import { add } from "../src/util.js";
import Icon from "../public/static/icon.png";

function Page1() {
  return (
    <div>
      <Link href="/page2">
        <a>page2로 이동</a>
      </Link>
      <p>This is home page</p>
      <p>{`10 + 20 = ${add(10, 20)}`}</p>
      <img src={Icon} />
      <Head>
        <title>page1</title>
      </Head>
      <Head>
        <meta name="description" content="hello world" />
      </Head>
      <style jsx>{`
        p {
          color: blue;
          font-size: 18pt;
        }
      `}</style>
    </div>
  );
}

export default Page1;
