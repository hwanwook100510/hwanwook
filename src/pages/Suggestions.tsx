import { useState } from 'react'
import type { FormEvent } from 'react'
import SectionHeader from '../components/SectionHeader'
import { initialSuggestions } from '../data/mockData'
import { useLocalStorage } from '../hooks/useLocalStorage'
import type { PolicySuggestion } from '../types'

const emptySuggestion = {
  title: '',
  category: '학교생활',
  content: '',
  effect: '',
}

function Suggestions() {
  const [suggestions, setSuggestions] = useLocalStorage<PolicySuggestion[]>('dimigo-policy-suggestions', initialSuggestions)
  const [form, setForm] = useState(emptySuggestion)
  const [message, setMessage] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextSuggestion = {
      title: form.title.trim(),
      category: form.category,
      content: form.content.trim(),
      effect: form.effect.trim(),
    }

    if (!nextSuggestion.title || !nextSuggestion.content || !nextSuggestion.effect) {
      setMessage('제목, 내용, 기대 효과를 모두 입력해주세요.')
      return
    }

    setSuggestions([
      { id: Date.now(), ...nextSuggestion, createdAt: new Date().toISOString().slice(0, 10) },
      ...suggestions,
    ])
    setForm(emptySuggestion)
    setMessage('정책 제안이 접수되었습니다. 검토 후 진행 현황에 반영됩니다.')
  }

  return (
    <section className="page-section">
      <SectionHeader
        eyebrow="Policy Suggestion"
        title="학생 정책 제안"
        description="학교생활 개선 아이디어를 학생회에 제안하고, 제출된 의견을 카드 목록으로 확인합니다."
      />
      <div className="two-column wide-left">
        <form className="form-card" onSubmit={handleSubmit}>
          <h3>정책 제안 폼</h3>
          <label><span>제안 제목</span><input required maxLength={80} placeholder="예: 학생회 공지 통합 캘린더" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
          <label>
            <span>제안 분야</span>
            <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
              <option>학교생활</option>
              <option>시설</option>
              <option>동아리</option>
              <option>행사</option>
              <option>소통</option>
            </select>
          </label>
          <label><span>제안 내용</span><textarea required rows={6} maxLength={1200} placeholder="불편한 점과 개선 방향을 구체적으로 적어주세요." value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} /></label>
          <label><span>기대 효과</span><textarea required rows={4} maxLength={800} placeholder="이 제안이 학생들에게 어떤 도움이 되는지 적어주세요." value={form.effect} onChange={(event) => setForm({ ...form, effect: event.target.value })} /></label>
          <button className="primary-button" type="submit">제안 제출</button>
          {message && <p className="success-message">{message}</p>}
        </form>
        <div className="suggestion-list">
          {suggestions.map((suggestion) => (
            <article className="suggestion-card" key={suggestion.id}>
              <div>
                <span>{suggestion.category}</span>
                <small>{suggestion.createdAt}</small>
              </div>
              <h3>{suggestion.title}</h3>
              <p>{suggestion.content}</p>
              <strong>기대 효과</strong>
              <p>{suggestion.effect}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Suggestions
