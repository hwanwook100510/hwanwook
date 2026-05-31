import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { collection, doc, getDocs, setDoc } from 'firebase/firestore'
import { useAuth } from '../contexts/useAuth'
import { initialSuggestions } from '../data/mockData'
import { db } from '../firebase'
import { useStudentProfile } from '../hooks/useStudentProfile'
import type { PolicySuggestion, PolicySuggestionAuthor } from '../types'
import { isAdminEmail } from '../utils/permissions'

const emptySuggestion = { title: '', category: '시설', target: '전체 학생', content: '', effect: '', anonymous: false }
const categories = ['학습 환경', '시설', '급식', '복지', '행사', '동아리', '기타']
const guides = ['문제를 구체적으로 작성해요', '해결 방안을 제시해요', '기대 효과를 적어주세요', '존중하는 표현을 사용해요']

function Icon({ name }: { name: string }) { return <svg className="home-icon" aria-hidden="true"><use href={`/icons.svg#${name}`} /></svg> }

function Suggestions() {
  const { user } = useAuth()
  const { profile } = useStudentProfile()
  const [visibleSuggestions, setVisibleSuggestions] = useState<PolicySuggestion[]>(initialSuggestions)
  const [suggestionAuthors, setSuggestionAuthors] = useState<PolicySuggestionAuthor[]>([])
  const [form, setForm] = useState(emptySuggestion)
  const [message, setMessage] = useState('')
  const isAdmin = isAdminEmail(user?.email)

  useEffect(() => {
    if (!db) {
      return
    }

    async function loadSuggestions() {
      const [suggestionSnapshot, authorSnapshot] = await Promise.all([
        getDocs(collection(db!, 'policySuggestions')),
        isAdmin ? getDocs(collection(db!, 'policySuggestionAuthors')) : Promise.resolve(null),
      ])
      setVisibleSuggestions(suggestionSnapshot.docs.map((item) => item.data() as PolicySuggestion).sort((a, b) => b.id - a.id))
      setSuggestionAuthors(authorSnapshot?.docs.map((item) => item.data() as PolicySuggestionAuthor) ?? [])
    }

    void loadSuggestions()
  }, [isAdmin])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!form.title.trim() || !form.content.trim() || !form.effect.trim()) { setMessage('제목, 내용, 기대 효과를 모두 입력해주세요.'); return }
    if (!user?.email || !profile) { setMessage('회원가입 정보를 확인할 수 없습니다.'); return }
    const suggestion = { id: Date.now(), title: form.title.trim(), category: form.category, content: form.content.trim(), effect: form.effect.trim(), createdAt: new Date().toISOString().slice(0, 10), isAnonymous: form.anonymous }
    const author = { suggestionId: suggestion.id, authorEmail: user.email, authorName: profile.name }
    setVisibleSuggestions([suggestion, ...visibleSuggestions])
    if (db) {
      void setDoc(doc(db, 'policySuggestions', String(suggestion.id)), suggestion)
      void setDoc(doc(db, 'policySuggestionAuthors', String(suggestion.id)), author)
    }
    setForm(emptySuggestion)
    setMessage('정책 제안이 접수되었습니다.')
  }

  return (
    <div className="design-page suggestion-design">
      <section className="design-hero compact"><div><h1>정책 <span>제안</span></h1><p>학교 생활을 더 좋게 만들 수 있는 아이디어를 자유롭게 제안해주세요.</p><p>여러분의 제안이 더 나은 학교를 만드는 첫걸음이 됩니다.</p><a className="home-outline-button" href="#suggestion-guide">제안 가이드 보기</a></div></section>
      <section className="design-wide stat-grid four"><article><Icon name="clipboard" /><b>총 제안 수</b><strong>0건</strong><span>전체 누적 제안</span></article><article><Icon name="folder" /><b>이번 달 제안</b><strong>0건</strong><span>5월 기준</span></article><article><Icon name="check" /><b>반영된 정책</b><strong>0건</strong><span>실제 정책으로 반영</span></article><article><Icon name="users" /><b>참여 학생</b><strong>0명</strong><span>제안에 참여한 학생</span></article></section>
      <section className="design-wide suggestion-layout">
        <div>
          <form id="suggestion-form" className="design-card suggestion-form" onSubmit={handleSubmit}>
            <h2><Icon name="pen" />정책 제안 작성</h2>
            <div className="form-grid"><label>제안 제목 *<input value={form.title} maxLength={80} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="제안 제목을 입력해주세요." /></label><div><b>카테고리 선택 *</b><div className="chip-row">{categories.map((category) => <button type="button" className={form.category === category ? 'active' : ''} key={category} onClick={() => setForm({ ...form, category })}>{category}</button>)}</div></div><div><b>제안 대상 *</b><div className="chip-row">{['전체 학생', '특정 학년', '기숙사', '동아리', '기타'].map((target) => <button type="button" className={form.target === target ? 'active' : ''} key={target} onClick={() => setForm({ ...form, target })}>{target}</button>)}</div></div><label><span>익명으로 표시</span><input type="checkbox" checked={form.anonymous} onChange={(event) => setForm({ ...form, anonymous: event.target.checked })} /></label><label>상세 내용 *<textarea maxLength={1000} value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} placeholder="제안하고자 하는 내용과 현재의 문제점을 자세히 작성해주세요." /></label><label>기대 효과 *<textarea maxLength={500} value={form.effect} onChange={(event) => setForm({ ...form, effect: event.target.value })} placeholder="해당 제안이 실현되었을 때 기대되는 효과를 작성해주세요." /></label></div>
            <button className="design-primary" type="submit">정책 제안하기</button>{message && <p className="success-message">{message}</p>}
          </form>
          <article className="design-card recent-table" id="recent-suggestions"><div className="design-title"><h2>최근 제안</h2><a href="#recent-suggestions">전체 보기</a></div><table><tbody>{visibleSuggestions.map((item) => { const author = suggestionAuthors.find((authorItem) => authorItem.suggestionId === item.id); return <tr key={item.id}><td>{item.category}</td><td>{item.title}</td><td>{item.isAnonymous && !isAdmin ? '익명' : author?.authorName ?? '작성자 미상'}</td><td>{item.createdAt}</td></tr> })}</tbody></table></article>
        </div>
        <aside><article className="design-card guide-card" id="suggestion-guide"><h2>제안 가이드</h2>{guides.map((item, index) => <p key={item}><span>{index + 1}</span><strong>{item}</strong><small>학생회가 빠르게 이해할 수 있도록 작성해주세요.</small></p>)}</article><article className="design-card popular-card" id="popular-suggestions"><div className="design-title"><h2>인기 제안</h2><a href="#popular-suggestions">전체 보기</a></div>{[0, 1, 2].map((item) => <p className="side-empty-row" key={item} aria-hidden="true" />)}</article></aside>
      </section>
    </div>
  )
}

export default Suggestions
