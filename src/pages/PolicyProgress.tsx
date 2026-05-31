import { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { Link } from 'react-router-dom'
import { progressItems } from '../data/mockData'
import { db } from '../firebase'
import type { PledgeProgress } from '../types'

const filters = ['전체', '진행중', '완료'] as const

function Icon({ name }: { name: string }) { return <svg className="home-icon" aria-hidden="true"><use href={`/icons.svg#${name}`} /></svg> }

function formatDate(value: PledgeProgress['updatedAt']) {
  if (typeof value === 'string') return value

  return typeof value.toDate === 'function' ? value.toDate().toISOString().slice(0, 10) : '방금'
}

function fromMockProgress(): PledgeProgress[] {
  return progressItems.map((item) => ({
    id: String(item.id),
    title: item.title,
    description: item.department,
    status: item.status === '완료' ? '완료' : item.status === '실행 중' ? '진행중' : '예정',
    progress: item.status === '완료' ? 100 : item.status === '실행 중' ? 60 : 20,
    updatedAt: item.updatedAt,
  }))
}

function PolicyProgress() {
  const [filter, setFilter] = useState<(typeof filters)[number]>('전체')
  const [items, setItems] = useState<PledgeProgress[]>(fromMockProgress())

  useEffect(() => {
    if (!db) return

    async function loadPledges() {
      const snapshot = await getDocs(collection(db!, 'pledgeProgress'))

      if (!snapshot.empty) {
        setItems(snapshot.docs.map((item) => item.data() as PledgeProgress))
      }
    }

    void loadPledges()
  }, [])

  const filteredItems = items.filter((item) => {
    const stage = item.status

    if (filter === '전체') return true
    if (filter === '진행중') return stage === '진행중'
    if (filter === '완료') return stage === '완료'
    return false
  })
  const completedCount = items.filter((item) => item.status === '완료').length
  const activeCount = items.filter((item) => item.status === '진행중').length

  return (
    <div className="design-page progress-design">
      <section className="design-hero compact"><div><h1>공약 진행 현황</h1><p>우리의 약속, 여러분과 함께 만들어갑니다.</p><p>학생회의 공약 이행 과정을 투명하게 공개합니다.</p></div></section>
      <section className="design-wide progress-layout">
        <div>
          <section className="stat-grid four"><article><Icon name="clipboard" /><b>전체 공약</b><strong>{items.length}개</strong><span>전체 공약 수</span></article><article><Icon name="flag" /><b>진행 중</b><strong>{activeCount}개</strong><span>진행 중인 공약</span></article><article><Icon name="check" /><b>완료</b><strong>{completedCount}개</strong><span>완료된 공약</span></article><article><Icon name="users" /><b>평균 진행률</b><strong>{items.length ? Math.round(items.reduce((sum, item) => sum + item.progress, 0) / items.length) : 0}%</strong></article></section>
          <div className="tab-row">{filters.map((item) => <button className={filter === item ? 'active' : ''} key={item} type="button" onClick={() => setFilter(item)}>{item}</button>)}</div>
          <article className="design-card pledge-table"><h2>주요 공약 진행 현황</h2>{filteredItems.map((item, index) => <div className="pledge-row" key={item.id}><span className="round-icon"><Icon name={['book','vote','wifi','users','check'][index % 5]} /></span><div><strong>{item.title}</strong><p>{item.description}</p></div><div className="step-line"><span className="on">{item.status}</span><span className="on">{item.progress}%</span></div><time>최근 업데이트<br />{formatDate(item.updatedAt)}</time></div>)}{filteredItems.length === 0 && <p className="empty-message">해당 상태의 공약이 없습니다.</p>}</article>
        </div>
        <aside><article className="design-card opinion-card"><div className="design-title"><h2>학생 의견 반영 현황</h2><Link to="/suggestions">전체 보기</Link></div>{[0, 1, 2, 3].map((item) => <p className="side-empty-row" key={item} aria-hidden="true" />)}</article><article className="design-card completed-card"><div className="design-title"><h2>완료된 공약</h2><Link to="/progress">전체 보기</Link></div>{[0, 1, 2, 3].map((item) => <p className="side-empty-row" key={item} aria-hidden="true" />)}</article><article className="design-card completed-card"><div className="design-title"><h2>앞으로의 일정</h2><Link to="/progress">전체 일정 보기</Link></div>{[0, 1, 2, 3].map((item) => <p className="side-empty-row" key={item} aria-hidden="true" />)}</article></aside>
      </section>
    </div>
  )
}

export default PolicyProgress
