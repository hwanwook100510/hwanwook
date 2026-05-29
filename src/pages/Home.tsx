import { Link } from 'react-router-dom'

const policyPlaceholders = Array.from({ length: 4 }, (_, index) => index)

function Home() {
  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero-copy">
          <h1>함께 만드는<br />더 나은 <span>디미고</span></h1>
          <p>여러분의 목소리가 학교를 변화시킵니다.</p>
          <p>소통하고, 제안하고, 함께 성장하는 디미고 학생회가 되겠습니다.</p>
          <Link className="home-outline-button" to="/members">자세히 보기</Link>
        </div>
      </section>

      <section className="home-top-grid" aria-label="주요 안내">
        <article className="home-promise-card">
          <span>우리의 약속</span>
          <strong>홍보 · 소통 · 변화</strong>
          <p>학생 한 사람, 한 사람의 목소리를 존중하며 더 나은 학교를 만들어갑니다.</p>
          <Link to="/members">학생회 소개 바로가기</Link>
        </article>

        <article className="home-card vote-card">
          <div className="home-card-head">
            <h2>오늘의 투표</h2>
            <Link to="/vote">더보기</Link>
          </div>
          <div className="vote-empty-box" aria-hidden="true" />
          <Link className="home-solid-button" to="/vote">투표하러 가기</Link>
        </article>
      </section>

      <section className="home-lower-grid">
        <article className="home-card schedule-card-home featured-schedule-card">
          <div className="home-card-head">
            <h2>다가오는 일정</h2>
          </div>
          <ul>
            <li>
              <time><strong>15</strong><span>6월</span></time>
              <div>
                <b>중요 일정</b>
                <strong>학생회 투표일</strong>
                <small>6월 15일 월요일 7교시</small>
              </div>
            </li>
          </ul>
        </article>
      </section>

      <section className="home-section">
        <div className="home-section-head">
          <h2>주요 공약</h2>
          <Link to="/progress">자세히 보기</Link>
        </div>
        <div className="policy-grid">
          {policyPlaceholders.map((placeholder) => (
            <article className="policy-card policy-card-empty" key={placeholder} aria-hidden="true" />
          ))}
        </div>
      </section>

    </div>
  )
}

export default Home
