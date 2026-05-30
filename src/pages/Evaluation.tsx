import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { initialEvaluation } from '../data/mockData'
import { useLocalStorage } from '../hooks/useLocalStorage'
import type { EvaluationResult } from '../types'

const labels: Record<keyof EvaluationResult, string> = { promise: '정책 및 공약 이행', communication: '소통 및 의견 반영', event: '행사 및 프로그램', reflection: '학생복지 및 지원' }
const scoreItems = [
  { category: '정책', label: '정책 및 공약 이행', score: 0.0 },
  { category: '소통', label: '소통 및 의견 반영', score: 0.0 },
  { category: '행사', label: '행사 및 프로그램', score: 0.0 },
  { category: '운영', label: '학생복지 및 지원', score: 0.0 },
  { category: '운영', label: '학생회 운영', score: 0.0 },
]

function Stars({ score }: { score: number }) {
  return <span className="stars">{'★★★★★'.split('').map((star, index) => <i key={index} style={{ '--fill': `${Math.max(0, Math.min(1, score - index)) * 100}%` } as React.CSSProperties}>{star}</i>)}</span>
}

function Evaluation() {
  const [result, setResult] = useLocalStorage<EvaluationResult>('dimigo-evaluation', initialEvaluation)
  const [vote, setVote] = useState({ promise: 100, communication: 100, event: 100, reflection: 100 })
  const [message, setMessage] = useState('')
  const average = 0.0

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setResult({ promise: Math.round((result.promise + vote.promise) / 2), communication: Math.round((result.communication + vote.communication) / 2), event: Math.round((result.event + vote.event) / 2), reflection: Math.round((result.reflection + vote.reflection) / 2) })
    setMessage('평가가 반영되었습니다.')
  }

  return (
    <div className="design-page">
      <section className="design-hero compact"><div><small>홈 &gt; 학생회 평가</small><h1>학생회 평가</h1><p>학생회의 활동과 정책을 투명하게 평가하고, 더 나은 학생회를 함께 만들어갑니다.</p><a className="design-primary" href="#evaluation-form">평가 참여하기</a></div></section>
      <section className="design-wide stat-grid four"><article><b>전체 평가 참여자</b><strong>0명</strong><span>지난 달 대비 0%</span></article><article><b>평균 만족도</b><strong>0 / 5.0</strong><Stars score={0} /></article><article><b>평가 완료 정책</b><strong>0건</strong><span>전체 정책의 0%</span></article><article><b>의견 및 제안</b><strong>0건</strong><span>지난 달 대비 0%</span></article></section>
      <section className="design-wide satisfaction-card design-card">
        <h2>종합 만족도</h2><div className="satisfaction-layout"><div className="score-circle"><strong style={{ '--score': `${average * 20}%` } as React.CSSProperties}><span>{average.toFixed(1)}</span></strong><Stars score={average} /></div><div className="score-list">{scoreItems.map((item) => <div key={item.label}><span>{item.label}</span><i><b style={{ width: `${item.score * 20}%` }} /></i><strong>{item.score.toFixed(1)} / 5.0</strong></div>)}</div><div className="distribution"><h3>만족도 분포</h3>{[0, 0, 0, 0, 0].map((v, i) => <p key={i}><span>{['매우 만족', '만족', '보통', '불만족', '매우 불만족'][i]}</span><i><b style={{ width: `${v}%` }} /></i><strong>{v}%</strong></p>)}</div></div>
      </section>
      <section className="design-wide policy-eval"><div className="design-title"><h2>정책별 평가</h2><Link to="/progress">전체 보기</Link></div><div className="design-card table-card">{[0, 1, 2, 3, 4].map((item) => <article className="table-empty-row" key={item} aria-hidden="true" />)}</div></section>
      <section className="design-wide eval-bottom"><div className="design-card"><div className="design-title"><h2>최근 평가 의견</h2><Link to="/suggestions">전체 보기</Link></div>{[0, 1, 2].map((item) => <p className="side-empty-row" key={item} aria-hidden="true" />)}</div><form id="evaluation-form" className="design-card eval-form" onSubmit={handleSubmit}><h2>평가 참여 안내</h2>{(Object.keys(labels) as Array<keyof EvaluationResult>).map((key) => <label key={key}><span>{labels[key]}</span><input type="range" min="0" max="100" value={vote[key]} style={{ '--value': `${vote[key]}%` } as React.CSSProperties} onChange={(event) => setVote({ ...vote, [key]: Number(event.target.value) })} /></label>)}<button className="design-primary" type="submit">평가 참여하기</button>{message && <p className="success-message">{message}</p>}</form></section>
    </div>
  )
}

export default Evaluation
