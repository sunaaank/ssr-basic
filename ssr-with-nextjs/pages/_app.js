import Link from "next/link";

function App({ Component, pageProps }) {
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

export default App;
