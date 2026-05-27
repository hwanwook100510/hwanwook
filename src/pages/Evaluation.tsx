import { useState } from 'react'
import type { FormEvent } from 'react'
import ProgressBar from '../components/ProgressBar'
import SectionHeader from '../components/SectionHeader'
import { initialEvaluation } from '../data/mockData'
import { useLocalStorage } from '../hooks/useLocalStorage'
import type { EvaluationResult } from '../types'

const labels: Record<keyof EvaluationResult, string> = {
  promise: '공약 이행도',
  communication: '소통 만족도',
  event: '행사 운영 만족도',
  reflection: '학생 의견 반영도',
}

const defaultVote: EvaluationResult = {
  promise: 80,
  communication: 80,
  event: 80,
  reflection: 80,
}

function Evaluation() {
  const [result, setResult] = useLocalStorage<EvaluationResult>('dimigo-evaluation', initialEvaluation)
  const [vote, setVote] = useState(defaultVote)
  const [message, setMessage] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setResult({
      promise: Math.round((result.promise + vote.promise) / 2),
      communication: Math.round((result.communication + vote.communication) / 2),
      event: Math.round((result.event + vote.event) / 2),
      reflection: Math.round((result.reflection + vote.reflection) / 2),
    })
    setMessage('평가가 반영되었습니다. 소중한 의견은 다음 운영 회의에 참고하겠습니다.')
  }

  return (
    <section className="page-section">
      <SectionHeader
        eyebrow="Evaluation"
        title="학생회 평가제"
        description="학생들이 학생자치회 활동을 주기적으로 평가하고, 결과를 운영 개선에 반영하는 제도입니다."
      />
      <div className="two-column">
        <div className="panel-card">
          <h3>현재 평가 결과</h3>
          <p>학생들이 남긴 평가를 항목별 평균 점수로 확인합니다. 제출된 평가는 이 브라우저에 저장됩니다.</p>
          <div className="stack">
            {(Object.keys(labels) as Array<keyof EvaluationResult>).map((key) => (
              <ProgressBar key={key} label={labels[key]} value={result[key]} />
            ))}
          </div>
        </div>
        <form className="form-card" onSubmit={handleSubmit}>
          <h3>평가 참여</h3>
          {(Object.keys(labels) as Array<keyof EvaluationResult>).map((key) => (
            <label key={key}>
              <span>{labels[key]}</span>
              <input
                type="range"
                min="0"
                max="100"
                value={vote[key]}
                onChange={(event) => setVote({ ...vote, [key]: Number(event.target.value) })}
              />
              <strong>{vote[key]}점</strong>
            </label>
          ))}
          <button className="primary-button" type="submit">평가 저장</button>
          {message && <p className="success-message">{message}</p>}
        </form>
      </div>
    </section>
  )
}

export default Evaluation
