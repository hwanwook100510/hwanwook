import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { initialEvaluation, progressItems } from '../data/mockData'
import { useLocalStorage } from '../hooks/useLocalStorage'
import type { EvaluationResult } from '../types'

const labels: Record<keyof EvaluationResult, string> = { promise: '정책 및 공약 이행', communication: '소통 및 의견 반영', event: '행사 및 프로그램', reflection: '학생복지 및 지원' }
const scoreItems = [
  { category: '정책', label: '정책 및 공약 이행', score: 4.3 },
  { category: '소통', label: '소통 및 의견 반영', score: 4.1 },
  { category: '행사', label: '행사 및 프로그램', score: 4.2 },
  { category: '운영', label: '학생복지 및 지원', score: 4.3 },
  { category: '운영', label: '학생회 운영', score: 4.2 },
]
const tabs = ['전체', '정책', '행사', '소통', '운영']

function Stars({ score }: { score: number }) {
  return <span className="stars">{'★★★★★'.split('').map((star, index) => <i key={index} className={index < Math.round(score) ? 'on' : ''}>{star}</i>)}</span>
}

function Evaluation() {
  const [result, setResult] = useLocalStorage<EvaluationResult>('dimigo-evaluation', initialEvaluation)
  const [vote, setVote] = useState({ promise: 80, communication: 80, event: 80, reflection: 80 })
  const [message, setMessage] = useState('')
  const [tab, setTab] = useState('전체')
  const average = 4.2
  const visibleScores = tab === '전체' ? scoreItems : scoreItems.filter((item) => item.category === tab)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setResult({ promise: Math.round((result.promise + vote.promise) / 2), communication: Math.round((result.communication + vote.communication) / 2), event: Math.round((result.event + vote.event) / 2), reflection: Math.round((result.reflection + vote.reflection) / 2) })
    setMessage('평가가 반영되었습니다.')
  }

  return (
    <div className="design-page">
      <section className="design-hero compact"><div><small>홈 &gt; 학생회 평가</small><h1>학생회 평가</h1><p>학생회의 활동과 정책을 투명하게 평가하고, 더 나은 학생회를 함께 만들어갑니다.</p><a className="design-primary" href="#evaluation-form">평가 참여하기</a></div></section>
      <section className="design-wide stat-grid four"><article><b>전체 평가 참여자</b><strong>1,248명</strong><span>지난 달 대비 ↑ 12%</span></article><article><b>평균 만족도</b><strong>{average} / 5.0</strong><Stars score={average} /></article><article><b>평가 완료 정책</b><strong>23건</strong><span>전체 정책의 82%</span></article><article><b>의견 및 제안</b><strong>356건</strong><span>지난 달 대비 ↑ 18%</span></article></section>
      <section className="design-wide tab-row">{tabs.map((item) => <button className={tab === item ? 'active' : ''} key={item} type="button" onClick={() => setTab(item)}>{item}</button>)}<span className="select-pill">2025년 2학기</span></section>
      <section className="design-wide satisfaction-card design-card">
        <h2>{tab === '전체' ? '종합 만족도' : `${tab} 만족도`}</h2><div className="satisfaction-layout"><div className="score-circle"><strong>{average}</strong><span>/ 5.0</span><Stars score={average} /><small>지난 학기 대비 ↑ 0.3</small></div><div className="score-list">{visibleScores.map((item) => <div key={item.label}><span>{item.label}</span><i><b style={{ width: `${item.score * 20}%` }} /></i><strong>{item.score} / 5.0</strong></div>)}</div><div className="distribution"><h3>만족도 분포</h3>{[42, 41, 12, 4, 1].map((v, i) => <p key={i}><span>{['매우 만족', '만족', '보통', '불만족', '매우 불만족'][i]}</span><i><b style={{ width: `${v}%` }} /></i><strong>{v}%</strong></p>)}</div></div>
      </section>
      <section className="design-wide policy-eval"><div className="design-title"><h2>정책별 평가</h2><Link to="/progress">전체 보기</Link></div><div className="design-card table-card">{progressItems.slice(0, 5).map((item, i) => <article key={item.id}><span className="round-icon"><svg className="home-icon"><use href={`/icons.svg#${['book','bus','trash','wifi','check'][i]}`} /></svg></span><div><strong>{item.title}</strong><small>{item.department}</small></div><Stars score={i === 4 ? 0 : 4.5} /><b>이행률 <i><em style={{ width: `${[80,60,100,45,20][i]}%` }} /></i></b><Link to="/progress">상세 보기</Link></article>)}</div></section>
      <section className="design-wide eval-bottom"><div className="design-card"><div className="design-title"><h2>최근 평가 의견</h2><Link to="/suggestions">전체 보기</Link></div>{['통학버스 증편 정말 필요했는데, 시간대가 잘 조정되어서 좋아요!', '스터디 공간이 깔끔해져서 공부하기 좋은 환경이 되었어요.', '와이파이 속도가 개선되었지만 일부 지역은 아직 느려요.'].map((item) => <p key={item}>{item}<span>정책 평가</span></p>)}</div><form id="evaluation-form" className="design-card eval-form" onSubmit={handleSubmit}><h2>평가 참여 안내</h2>{(Object.keys(labels) as Array<keyof EvaluationResult>).map((key) => <label key={key}><span>{labels[key]}</span><input type="range" min="0" max="100" value={vote[key]} onChange={(event) => setVote({ ...vote, [key]: Number(event.target.value) })} /></label>)}<button className="design-primary" type="submit">평가 참여하기</button>{message && <p className="success-message">{message}</p>}</form></section>
    </div>
  )
}

export default Evaluation
