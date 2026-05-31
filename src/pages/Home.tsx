import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'

const featuredScheduleDate = new Date(2026, 5, 15)
const policies = [
  { title: '프로젝트실 신청 절차 단순화', description: '예약과 승인 절차를 줄여 필요한 공간을 빠르게 이용할 수 있게 합니다.', icon: 'folder', url: 'https://hwanwook-election-pledge.vercel.app/pledge.html?id=project-room' },
  { title: '투명한 학생회', description: '회의 내용과 예산 사용 내역을 더 명확하게 공유합니다.', icon: 'users', url: 'https://hwanwook-election-pledge.vercel.app/pledge.html?id=transparent-council' },
  { title: '학생 정책 제안제', description: '학생이 직접 제안한 정책을 검토하고 실행까지 연결합니다.', icon: 'pen', url: 'https://hwanwook-election-pledge.vercel.app/pledge.html?id=policy-proposal' },
  { title: 'e-스포츠 대회 개최', description: '모두가 즐길 수 있는 교내 e-스포츠 행사를 운영합니다.', icon: 'gamepad', url: 'https://hwanwook-election-pledge.vercel.app/pledge.html?id=esports' },
  { title: '대회 연계 프로그램', description: '교내외 대회 참여를 지원하는 연계 프로그램을 마련합니다.', icon: 'trophy', url: 'https://hwanwook-election-pledge.vercel.app/pledge.html?id=competition-program' },
  { title: '사복귀가 시행', description: '학생 편의를 고려한 사복귀가 운영 방안을 추진합니다.', icon: 'shirt', url: 'https://hwanwook-election-pledge.vercel.app/pledge.html?id=casual-leave' },
]

function getDdayLabel(date: Date) {
  const today = new Date()
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diffDays = Math.ceil((targetDate.getTime() - todayDate.getTime()) / 86400000)

  if (diffDays === 0) return 'D-Day'
  if (diffDays > 0) return `D-${diffDays}`
  return `D+${Math.abs(diffDays)}`
}

function Icon({ name }: { name: string }) {
  return <svg className="home-icon" aria-hidden="true"><use href={`/icons.svg#${name}`} /></svg>
}

function Home() {
  const policyCarouselRef = useRef<HTMLDivElement>(null)
  const [ddayLabel, setDdayLabel] = useState(() => getDdayLabel(featuredScheduleDate))
  const [orderedPolicies, setOrderedPolicies] = useState(policies)
  const [policyStep, setPolicyStep] = useState(0)
  const [isPolicySliding, setIsPolicySliding] = useState(false)

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setDdayLabel(getDdayLabel(featuredScheduleDate))
    }, 1000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [])

  useEffect(() => {
    const carousel = policyCarouselRef.current
    if (!carousel) return

    const updatePolicyStep = () => {
      const visibleCount = window.matchMedia('(max-width: 900px)').matches ? 1 : window.matchMedia('(max-width: 1100px)').matches ? 2 : 4
      const gap = 24
      const cardWidth = (carousel.clientWidth - gap * (visibleCount - 1)) / visibleCount
      setPolicyStep(cardWidth + gap)
    }

    updatePolicyStep()

    const resizeObserver = new ResizeObserver(updatePolicyStep)
    resizeObserver.observe(carousel)
    window.addEventListener('resize', updatePolicyStep)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', updatePolicyStep)
    }
  }, [])

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setIsPolicySliding(true)
    }, 4500)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [])

  useEffect(() => {
    if (!isPolicySliding) return

    const timeoutId = window.setTimeout(() => {
      setOrderedPolicies(([first, ...rest]) => [...rest, first])
      setIsPolicySliding(false)
    }, 520)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [isPolicySliding])

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
            <h2><Icon name="calendar" />다가오는 일정</h2>
          </div>
          <ul>
            <li>
              <time><em>{ddayLabel}</em><strong>15</strong><span>6월</span></time>
              <div>
                <b>중요 일정</b>
                <strong>학생회장선거</strong>
                <small><Icon name="calendar" />6월 15일 월요일 7교시</small>
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
        <div className="policy-carousel" ref={policyCarouselRef}>
          <div className={`policy-grid ${isPolicySliding ? 'sliding' : ''}`} style={{ '--policy-step': `${policyStep}px` } as CSSProperties & { '--policy-step': string }}>
            {orderedPolicies.slice(0, 5).map((policy) => (
              <article className="policy-card" key={policy.title}>
                <span className="policy-icon"><Icon name={policy.icon} /></span>
                <h3>{policy.title}</h3>
                <p>{policy.description}</p>
                <a href={policy.url} target="_blank" rel="noreferrer">자세히 보기</a>
              </article>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}

export default Home
