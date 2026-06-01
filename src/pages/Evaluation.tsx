import { useEffect, useState } from 'react'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'
import { useStudentProfile } from '../hooks/useStudentProfile'
import { db } from '../firebase'
import type { EvaluationResponse, EvaluationResult } from '../types'

const labels: Record<keyof EvaluationResult, string> = { promise: '공약', communication: '소통', event: '행사', reflection: '복지' }
const scoreOptions = [1, 2, 3, 4, 5]
const emptyScores: EvaluationResult = { promise: 5, communication: 5, event: 5, reflection: 5 }

function Stars({ score }: { score: number }) {
  return <span className="stars">{'★★★★★'.split('').map((star, index) => <i key={index} style={{ '--fill': `${Math.max(0, Math.min(1, score - index)) * 100}%` } as React.CSSProperties}>{star}</i>)}</span>
}

function ScoreBar({ label, value, onChange }: { label: string, value: number, onChange: (value: number) => void }) {
  return (
    <fieldset className="score-segment-field">
      <legend>{label}</legend>
      <div className="score-segment-bar" role="radiogroup" aria-label={`${label} 점수`}>
        {scoreOptions.map((score) => (
          <button
            aria-checked={value === score}
            className={value >= score ? 'active' : ''}
            key={score}
            role="radio"
            type="button"
            onClick={() => onChange(score)}
          >
            {score}
          </button>
        ))}
      </div>
      <small>{value}점 선택</small>
    </fieldset>
  )
}

function Evaluation() {
  const { user, isAdmin, loginWithGoogle } = useAuth()
  const { profile, loading: profileLoading } = useStudentProfile()
  const [summaryResult, setSummaryResult] = useState<EvaluationResult>({ promise: 0, communication: 0, event: 0, reflection: 0 })
  const [responseCount, setResponseCount] = useState(0)
  const [scores, setScores] = useState<EvaluationResult>(emptyScores)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [message, setMessage] = useState('')
  const [dbError, setDbError] = useState(db ? '' : 'DB에 연결할 수 없어 평가 현황을 불러올 수 없습니다.')

  const average = (Object.keys(labels) as Array<keyof EvaluationResult>).reduce((sum, key) => sum + summaryResult[key], 0) / 4
  const safeAverage = Number.isFinite(average) ? average : 0
  const scoreItems = (Object.keys(labels) as Array<keyof EvaluationResult>).map((key) => ({ key, label: labels[key], score: summaryResult[key] || 0 }))

  useEffect(() => {
    if (!db) {
      return
    }

    async function loadEvaluationData() {
      try {
        const summarySnapshot = await getDoc(doc(db!, 'publicStats', 'evaluationSummary'))

        if (summarySnapshot.exists()) {
          const data = summarySnapshot.data() as EvaluationResult & { count?: number }
          setSummaryResult({ promise: data.promise ?? 0, communication: data.communication ?? 0, event: data.event ?? 0, reflection: data.reflection ?? 0 })
          setResponseCount(data.count ?? 0)
        }

        if (user?.email) {
          const responseSnapshot = await getDoc(doc(db!, 'evaluationResponses', user.email))
          setHasSubmitted(responseSnapshot.exists())
        }
      } catch {
        setDbError('DB 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.')
      }
    }

    void loadEvaluationData()
  }, [user?.email])

  const submitEvaluation = async () => {
    if (!db) { setMessage('DB에 연결할 수 없어 평가를 제출할 수 없습니다.'); return }
    if (!user) { setMessage('로그인 후 평가를 제출할 수 있습니다.'); return }
    if (profileLoading) { setMessage('학생 정보를 확인하는 중입니다. 잠시 후 다시 시도해주세요.'); return }
    if (!profile) { setMessage('회원가입 정보를 먼저 등록해주세요.'); return }
    if (isAdmin) { setMessage('관리자는 평가를 제출할 수 없습니다. 관리자 페이지에서 응답을 확인해주세요.'); return }
    if (hasSubmitted) { setMessage('이미 평가를 제출했습니다. 학생회 평가는 한 번만 제출할 수 있습니다.'); return }

    const values = Object.values(scores)
    if (values.some((value) => !Number.isInteger(value) || value < 1 || value > 5)) {
      setMessage('모든 항목은 1~5 사이 정수로 선택해주세요.')
      return
    }

    const response: EvaluationResponse = {
      ...scores,
      email: user.email ?? '',
      name: profile.name,
      createdAt: serverTimestamp() as unknown as EvaluationResponse['createdAt'],
    }

    try {
      await setDoc(doc(db, 'evaluationResponses', user.email ?? ''), response)
      setHasSubmitted(true)
      setMessage('학생회 평가를 제출했습니다.')
    } catch {
      setMessage('평가 저장에 실패했습니다. 잠시 후 다시 시도해주세요.')
    }
  }

  return (
    <div className="design-page">
      <section className="design-hero compact"><div><small>홈 &gt; 학생회 평가</small><h1>학생회 평가</h1><p>학생회의 활동과 정책을 투명하게 평가하고, 더 나은 학생회를 함께 만들어갑니다.</p><a className="design-primary" href="#evaluation-form">평가 참여하기</a></div></section>
      {dbError && <section className="design-wide"><p className="success-message">{dbError}</p></section>}
      <section className="design-wide stat-grid four"><article><b>평가 제출</b><strong>{hasSubmitted ? '완료' : '가능'}</strong><span>학생 1인 1회</span></article><article><b>평균 만족도</b><strong>{safeAverage.toFixed(2)} / 5.00</strong><Stars score={safeAverage} /></article><article><b>응답 수</b><strong>{responseCount}명</strong><span>누적 제출</span></article><article><b>입력 방식</b><strong>1~5점</strong><span>정수 선택만 허용</span></article></section>
      <section className="design-wide satisfaction-card design-card">
        <h2>종합 만족도</h2><div className="satisfaction-layout"><div className="score-circle"><strong style={{ '--score': `${safeAverage * 20}%` } as React.CSSProperties}><span>{safeAverage.toFixed(2)}</span></strong><Stars score={safeAverage} /></div><div className="score-list">{scoreItems.map((item) => <div key={item.key}><span>{item.label}</span><i><b style={{ width: `${item.score * 20}%` }} /></i><strong>{item.score.toFixed(2)} / 5.00</strong></div>)}</div><div className="distribution"><h3>평가 기준</h3>{scoreOptions.map((value) => <p key={value}><span>{value}점</span><i><b style={{ width: `${value * 20}%` }} /></i><strong>{value}</strong></p>)}</div></div>
      </section>
      <section className="design-wide policy-eval"><div className="design-title"><h2>정책별 평가</h2><Link to="/progress">전체 보기</Link></div><div className="design-card table-card">{scoreItems.map((item) => <article className="admin-row" key={item.key}><strong>{item.label}</strong><span>{item.score.toFixed(2)} / 5.00</span></article>)}</div></section>
      <section className="design-wide eval-bottom"><div className="design-card"><div className="design-title"><h2>평가 안내</h2><Link to="/suggestions">정책 제안하기</Link></div><p>제출된 평가는 관리자만 원본을 확인하고, 공개 페이지에는 집계된 평균만 표시됩니다.</p></div><article id="evaluation-form" className="design-card eval-form"><h2>평가 참여</h2>{message && <p className="success-message">{message}</p>}{!user ? <><p>로그인 후 평가를 제출할 수 있습니다.</p><button className="design-primary" type="button" onClick={loginWithGoogle}>Google로 로그인</button></> : isAdmin ? <p>관리자는 평가를 제출할 수 없습니다. 관리자 페이지에서 조회만 가능합니다.</p> : !profile ? <><p>학생 정보 등록 후 평가를 제출할 수 있습니다.</p><Link className="design-primary" to="/register">회원가입 하러 가기</Link></> : hasSubmitted ? <p>이미 평가를 제출했습니다.</p> : <><div className="score-segment-list">{(Object.keys(labels) as Array<keyof EvaluationResult>).map((key) => <ScoreBar key={key} label={labels[key]} value={scores[key]} onChange={(value) => setScores({ ...scores, [key]: value })} />)}</div><button className="design-primary" type="button" onClick={submitEvaluation}>평가 제출</button></>}</article></section>
    </div>
  )
}

export default Evaluation
