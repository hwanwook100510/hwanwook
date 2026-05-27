import { Link } from 'react-router-dom'
import SectionHeader from '../components/SectionHeader'
import { notices, progressItems, schedules, summary } from '../data/mockData'

const quickLinks = [
  { to: '/progress', title: '공약 진행 현황', description: '공약과 학생 제안의 상태를 투명하게 확인합니다.', meta: '실시간 공개', note: '회의 후 업데이트' },
  { to: '/suggestions', title: '정책 제안하기', description: '학교생활 개선 아이디어를 학생회에 전달합니다.', meta: '학생 의견 접수', note: '익숙한 불편부터' },
  { to: '/clubs', title: '동아리 지원', description: '지원 기간, 방법, 제출 서류를 한눈에 확인합니다.', meta: '모집 일정 안내', note: '지원 전 체크' },
]

const completedCount = progressItems.filter((item) => item.status === '완료').length
const runningCount = progressItems.filter((item) => item.status === '실행 중' || item.status === '허가').length
const reviewCount = progressItems.length - completedCount - runningCount

function Home() {
  return (
    <>
      <section className="hero-section">
        <div className="hero-copy">
          <span className="eyebrow">DIMIGO Student Council</span>
          <h1>학생의 목소리를 학교의 변화로 연결합니다.</h1>
          <p>
            한국디지털미디어고등학교 학생자치회는 공약 이행, 정책 제안, 동아리 활동 지원을 투명하게 공개하며 학생 중심의 학교 문화를 만들어갑니다.
          </p>
          <div className="hero-actions">
            <Link className="primary-button" to="/suggestions">정책 제안하기</Link>
            <Link className="secondary-button" to="/progress">진행 현황 보기</Link>
          </div>
          <div className="hero-trust" aria-label="학생회 운영 특징">
            <span>월간 공개</span>
            <span>담당 부서 명시</span>
            <span>진행 단계 추적</span>
          </div>
          <aside className="hero-note" aria-label="이번 주 운영 메모">
            <strong>이번 주 집중</strong>
            <p>5월 접수 의견 중 급식, 동아리 공간, 공지 누락 안건을 먼저 검토합니다.</p>
          </aside>
        </div>
        <div className="hero-panel">
          <span className="eyebrow">Council Dashboard</span>
          <strong>2026 학생자치회 운영 원칙</strong>
          <ul>
            <li>월간 회의록과 공약 현황 공개</li>
            <li>학생 제안 접수 및 검토 결과 안내</li>
            <li>동아리와 학급 의견을 반영한 행사 운영</li>
          </ul>
          <div className="hero-metric">
            <span>이번 달 학생 의견 반영 안건</span>
            <strong>12건</strong>
          </div>
        </div>
      </section>

      <section className="summary-grid">
        <article className="summary-card">
          <span>관리 중인 공약</span>
          <strong>{summary.pledgeCount}개</strong>
          <p>공약별 현재 단계를 공개합니다.</p>
        </article>
        <article className="summary-card">
          <span>진행 중인 정책</span>
          <strong>{summary.activePolicies}건</strong>
          <p>부서별 담당자가 최신 현황을 업데이트합니다.</p>
        </article>
        <article className="summary-card">
          <span>접수된 제안</span>
          <strong>{summary.suggestions}건</strong>
          <p>정책 제안 페이지를 통해 접수된 의견을 검토합니다.</p>
        </article>
      </section>

      <section className="status-board" aria-label="공약 처리 상태 요약">
        <article>
          <span>완료</span>
          <strong>{completedCount}</strong>
          <p>실행이 끝난 공약</p>
        </article>
        <article>
          <span>실행/허가</span>
          <strong>{runningCount}</strong>
          <p>바로 움직이는 안건</p>
        </article>
        <article>
          <span>검토 중</span>
          <strong>{reviewCount}</strong>
          <p>논의와 구체화 단계</p>
        </article>
      </section>

      <section className="content-section">
        <SectionHeader title="학생회 소식" description="회의록, 모집, 설문 등 지금 확인해야 할 학생자치회 공지를 모았습니다." />
        <div className="notice-grid">
          {notices.map((notice) => (
            <article className="notice-item" key={notice.id}>
              <div>
                <span>{notice.category}</span>
                <small>{notice.date}</small>
              </div>
              <h3>{notice.title}</h3>
              <p>{notice.summary}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="content-section">
        <SectionHeader title="핵심 메뉴" description="학생들이 가장 자주 찾는 기능을 빠르게 이동할 수 있도록 구성했습니다." />
        <div className="card-grid three">
          {quickLinks.map((link) => (
            <Link className="link-card" to={link.to} key={link.to}>
              <span className="link-meta">{link.meta}</span>
              <h3>{link.title}</h3>
              <p>{link.description}</p>
              <small>{link.note}</small>
              <span className="link-action">바로가기</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="content-section muted-section">
        <SectionHeader title="이번 달 운영 현황" description="진행 중인 정책과 주요 일정을 함께 확인할 수 있습니다." />
        <div className="split-list">
          <div className="compact-list">
            {progressItems.slice(0, 3).map((item) => (
              <article key={item.id}>
                <span>{item.type}</span>
                <strong>{item.title}</strong>
                <small>{item.department} · {item.updatedAt}</small>
              </article>
            ))}
          </div>
          <div className="schedule-list">
            {schedules.map((schedule) => (
              <article key={schedule.id}>
                <time>{schedule.date}</time>
                <div>
                  <strong>{schedule.title}</strong>
                  <small>{schedule.target}</small>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export default Home
