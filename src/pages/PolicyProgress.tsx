import { useState } from 'react'
import { Link } from 'react-router-dom'
import { progressItems } from '../data/mockData'

const steps = ['선거 중', '검토', '준비', '실행', '완료']
const filters = ['전체', '진행 중', '완료'] as const

function Icon({ name }: { name: string }) { return <svg className="home-icon" aria-hidden="true"><use href={`/icons.svg#${name}`} /></svg> }

function getProgressStage() {
  return '선거 중'
}

function getStepIndex() {
  return steps.indexOf(getProgressStage())
}

function PolicyProgress() {
  const [filter, setFilter] = useState<(typeof filters)[number]>('전체')
  const filteredItems = progressItems.filter(() => {
    const stage = getProgressStage()

    if (filter === '전체') return true
    if (filter === '진행 중') return stage !== '완료'
    if (filter === '완료') return stage === '완료'
    return false
  })

  return (
    <div className="design-page progress-design">
      <section className="design-hero compact"><div><h1>공약 진행 현황</h1><p>우리의 약속, 여러분과 함께 만들어갑니다.</p><p>학생회의 공약 이행 과정을 투명하게 공개합니다.</p></div></section>
      <section className="design-wide progress-layout">
        <div>
          <section className="stat-grid four"><article><Icon name="clipboard" /><b>전체 공약</b><strong>10개</strong><span>전체 공약 수</span></article><article><Icon name="flag" /><b>진행 중</b><strong>10개</strong><span>진행 중인 공약</span></article><article><Icon name="check" /><b>완료</b><strong>0개</strong><span>완료된 공약</span></article><article><Icon name="users" /><b>학생 의견 반영</b><strong>5개</strong></article></section>
          <div className="tab-row">{filters.map((item) => <button className={filter === item ? 'active' : ''} key={item} type="button" onClick={() => setFilter(item)}>{item}</button>)}</div>
          <article className="design-card pledge-table"><h2>주요 공약 진행 현황</h2>{filteredItems.map((item, index) => <div className="pledge-row" key={item.id}><span className="round-icon"><Icon name={['book','vote','wifi','users','check'][index % 5]} /></span><div><strong>{item.title}</strong><p>{item.department}</p></div><div className="step-line">{steps.map((step, stepIndex) => <span className={stepIndex <= getStepIndex() ? 'on' : ''} key={step}>{step}</span>)}</div><time>최근 업데이트<br />{item.updatedAt}</time></div>)}{filteredItems.length === 0 && <p className="empty-message">해당 상태의 공약이 없습니다.</p>}</article>
        </div>
        <aside><article className="design-card update-card"><div className="design-title"><h2>이번 달 업데이트</h2><Link to="/progress">전체 보기</Link></div>{[0, 1, 2].map((item) => <p className="side-empty-row" key={item} aria-hidden="true" />)}</article><article className="design-card opinion-card"><div className="design-title"><h2>학생 의견 반영 현황</h2><Link to="/suggestions">전체 보기</Link></div>{[0, 1, 2].map((item) => <p className="side-empty-row" key={item} aria-hidden="true" />)}</article></aside>
      </section>
      <section className="design-wide bottom-panels"><article className="design-card completed-card"><div className="design-title"><h2>완료된 공약</h2><Link to="/progress">전체 보기</Link></div>{[0, 1, 2].map((item) => <p className="side-empty-row" key={item} aria-hidden="true" />)}</article><article className="design-card schedule-strip"><div className="design-title"><h2>앞으로의 일정</h2><Link to="/progress">전체 일정 보기</Link></div>{[0, 1, 2, 3, 4].map((item) => <div className="schedule-empty-box" key={item} aria-hidden="true" />)}</article></section>
    </div>
  )
}

export default PolicyProgress
