import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Home from "./Home";
import About from "./About";
import Icon from "./icon.png";

const Container = styled.div`
  background-color: #aaaaaa;
  border: 1px solid blue;
`;

export default function App({ pageProp }) {
  const [page, setPage] = useState(pageProp);
  useEffect(() => {
    // SPA를 직접 구현하기 위함. 브라우저에서 뒤로가기 버튼을 클릭하면 onpopstate 함수가 호출됨.
    window.onpopstate = event => {
      setPage(event.state);
    };
  }, []);

  // 특정 페이지로 이동하는 버튼의 이벤트 처리 함수.
  function onChangePage(e) {
    const newPage = e.target.dataset.page;
    // pushState 메서드를 통해 브라우저에게 주소가 변경되었음을 알림
    window.history.pushState(newPage, "", `/${newPage}`);
    setPage(newPage);
  }

  // page 상태값에 따라 렌더링할 페이지의 컴포넌트가 결정됨.
  const PageComponent = page === "home" ? Home : About;

  return (
    <Container>
      <img src={Icon} />
      <button data-page="home" onClick={onChangePage}>
        Home
      </button>
      <button data-page="about" onClick={onChangePage}>
        About
      </button>
      <PageComponent />
    </Container>
  );
}
