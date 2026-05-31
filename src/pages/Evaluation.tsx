import { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'
import { initialEvaluation } from '../data/mockData'
import { db } from '../firebase'
import type { EvaluationResult } from '../types'

const labels: Record<keyof EvaluationResult, string> = { promise: '정책 및 공약 이행', communication: '소통 및 의견 반영', event: '행사 및 프로그램', reflection: '학생복지 및 지원' }
function Stars({ score }: { score: number }) {
  return <span className="stars">{'★★★★★'.split('').map((star, index) => <i key={index} style={{ '--fill': `${Math.max(0, Math.min(1, score - index)) * 100}%` } as React.CSSProperties}>{star}</i>)}</span>
}

function Evaluation() {
  const { isAdmin } = useAuth()
  const [summaryResult, setSummaryResult] = useState<EvaluationResult>(initialEvaluation)
  const source = [{ ...summaryResult }]
  const averagedResult = (Object.keys(labels) as Array<keyof EvaluationResult>).reduce((acc, key) => ({ ...acc, [key]: Math.round(source.reduce((sum, item) => sum + item[key], 0) / source.length) }), {} as EvaluationResult)
  const average = (Object.keys(labels) as Array<keyof EvaluationResult>).reduce((sum, key) => sum + averagedResult[key], 0) / 4 / 20
  const scoreItems = (Object.keys(labels) as Array<keyof EvaluationResult>).map((key) => ({ category: '평가', label: labels[key], score: averagedResult[key] / 20 }))

  useEffect(() => {
    if (!db) return

    async function loadEvaluationData() {
      const summarySnapshot = await getDoc(doc(db!, 'publicStats', 'evaluationSummary'))

      if (summarySnapshot.exists()) {
        setSummaryResult(summarySnapshot.data() as EvaluationResult)
      }

    }

    void loadEvaluationData()
  }, [])

  return (
    <div className="design-page">
      <section className="design-hero compact"><div><small>홈 &gt; 학생회 평가</small><h1>학생회 평가</h1><p>학생회의 활동과 정책을 투명하게 평가하고, 더 나은 학생회를 함께 만들어갑니다.</p><a className="design-primary" href="#evaluation-form">평가 참여하기</a></div></section>
      <section className="design-wide stat-grid four"><article><b>평가 제출</b><strong>중단</strong><span>현재 제출 불가</span></article><article><b>평균 만족도</b><strong>{average.toFixed(1)} / 5.0</strong><Stars score={average} /></article><article><b>평가 완료 정책</b><strong>0건</strong><span>전체 정책의 0%</span></article><article><b>의견 및 제안</b><strong>0건</strong><span>지난 달 대비 0%</span></article></section>
      <section className="design-wide satisfaction-card design-card">
        <h2>종합 만족도</h2><div className="satisfaction-layout"><div className="score-circle"><strong style={{ '--score': `${average * 20}%` } as React.CSSProperties}><span>{average.toFixed(1)}</span></strong><Stars score={average} /></div><div className="score-list">{scoreItems.map((item) => <div key={item.label}><span>{item.label}</span><i><b style={{ width: `${item.score * 20}%` }} /></i><strong>{item.score.toFixed(1)} / 5.0</strong></div>)}</div><div className="distribution"><h3>만족도 분포</h3>{[0, 0, 0, 0, 0].map((v, i) => <p key={i}><span>{['매우 만족', '만족', '보통', '불만족', '매우 불만족'][i]}</span><i><b style={{ width: `${v}%` }} /></i><strong>{v}%</strong></p>)}</div></div>
      </section>
      <section className="design-wide policy-eval"><div className="design-title"><h2>정책별 평가</h2><Link to="/progress">전체 보기</Link></div><div className="design-card table-card">{[0, 1, 2, 3, 4].map((item) => <article className="table-empty-row" key={item} aria-hidden="true" />)}</div></section>
      {isAdmin && <section className="design-wide design-card"><h2>관리자 안내</h2><p>기존 평가 응답은 관리자 페이지에서만 확인할 수 있습니다.</p></section>}
      <section className="design-wide eval-bottom"><div className="design-card"><div className="design-title"><h2>최근 평가 의견</h2><Link to="/suggestions">전체 보기</Link></div>{[0, 1, 2].map((item) => <p className="side-empty-row" key={item} aria-hidden="true" />)}</div><article id="evaluation-form" className="design-card eval-form"><h2>평가 참여 안내</h2><p>현재 학생회 평가는 제출할 수 없습니다.</p><button className="design-primary" type="button" disabled>평가 제출 중단</button></article></section>
    </div>
  )
}

export default Evaluation
