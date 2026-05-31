import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import SectionHeader from '../components/SectionHeader'
import { useAuth } from '../contexts/useAuth'
import { useClientState } from '../hooks/useClientState'

const commonQuestions = [
  '이 동아리에 지원한 이유를 구체적으로 작성해주세요.',
  '동아리 활동에서 본인이 기여할 수 있는 점을 작성해주세요.',
  '활동 경험이나 관심 분야가 있다면 작성해주세요.',
]

type ClubQuestionAnswer = {
  id: number
  email: string
  club: string
  answers: string[]
  createdAt: string
}

function ClubQuestions() {
  const { clubName = '' } = useParams()
  const { user } = useAuth()
  const [answers, setAnswers] = useClientState<ClubQuestionAnswer[]>([])
  const savedAnswer = answers.find((answer) => answer.email === user?.email && answer.club === clubName)
  const [form, setForm] = useState(savedAnswer?.answers ?? ['', '', ''])
  const [message, setMessage] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!user?.email) {
      setMessage('로그인 정보를 확인할 수 없습니다.')
      return
    }

    const answer: ClubQuestionAnswer = {
      id: savedAnswer?.id ?? Date.now(),
      email: user.email,
      club: clubName,
      answers: form.map((answer) => answer.trim()),
      createdAt: savedAnswer?.createdAt ?? new Date().toISOString().slice(0, 10),
    }

    setAnswers([answer, ...answers.filter((item) => !(item.email === user.email && item.club === clubName))])
    setMessage('동아리 질문 답변이 저장되었습니다. 지원 페이지로 돌아가 2순위와 3순위를 선택해주세요.')
  }

  return (
    <section className="page-section">
      <SectionHeader
        eyebrow="Club Questions"
        title={`${clubName} 지원 질문`}
        description="1순위 동아리 관리자가 만든 질문에 답변한 뒤 지원 페이지로 돌아가 지원서를 마무리하세요."
      />
      <div className="two-column wide-left">
        <form className="form-card" onSubmit={handleSubmit}>
          <h3>{clubName} 질문 답변</h3>
          {commonQuestions.map((question, index) => (
            <label key={question}>
              <span>{question}</span>
              <textarea
                required
                rows={4}
                maxLength={1000}
                value={form[index] ?? ''}
                onChange={(event) => setForm(form.map((answer, answerIndex) => answerIndex === index ? event.target.value : answer))}
              />
            </label>
          ))}
          <button className="primary-button" type="submit">질문 답변 저장</button>
          {message && <p className="success-message">{message}</p>}
        </form>
        <div className="panel-card">
          <h3>다음 단계</h3>
          <p>질문 답변을 저장한 뒤 지원 페이지에서 2순위, 3순위 동아리를 선택하고 최종 지원서를 저장하세요.</p>
          <Link className="primary-button" to="/clubs">지원 페이지로 돌아가기</Link>
        </div>
      </div>
    </section>
  )
}

export default ClubQuestions
