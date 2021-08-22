import Router from "next/router";
import { callApi } from "../src/api.js";

Page2.getInitialProps = async ({ query }) => {
  throw new Error("exception in getInitialProps");
  const text = query.text || "none";
  const data = await callApi();
  return { text, data };
};

export default function Page2({ text, data }) {
  return (
    <div>
      <p>this is home page2</p>
      <p>{`text: ${text}`}</p>
      <p>{`data is ${data}`}</p>
      <button onClick={() => Router.push("/page1")}>page1로 이동</button>
    </div>
  );
}
