import { useEffect, useState } from 'react'
import { collection, doc, getDocs, serverTimestamp, setDoc } from 'firebase/firestore'
import { useAuth } from '../contexts/useAuth'
import { useStudentProfile } from '../hooks/useStudentProfile'
import { db } from '../firebase'
import type { PolicySuggestion, PolicySuggestionAuthor } from '../types'

const categories = ['학습 환경', '시설', '급식', '복지', '행사', '동아리', '기타']
const guides = ['문제를 구체적으로 작성해요', '해결 방안을 제시해요', '기대 효과를 적어주세요', '존중하는 표현을 사용해요']
const emptyForm = { title: '', category: categories[0], content: '', effect: '', isAnonymous: false }

function Icon({ name }: { name: string }) { return <svg className="home-icon" aria-hidden="true"><use href={`/icons.svg#${name}`} /></svg> }

function formatDate(value: PolicySuggestion['createdAt']) {
  if (typeof value === 'string') return value

  return typeof value.toDate === 'function' ? value.toDate().toISOString().slice(0, 10) : '방금'
}

function Suggestions() {
  const { user, isAdmin, loginWithGoogle } = useAuth()
  const { profile } = useStudentProfile()
  const [visibleSuggestions, setVisibleSuggestions] = useState<PolicySuggestion[]>([])
  const [suggestionAuthors, setSuggestionAuthors] = useState<PolicySuggestionAuthor[]>([])
  const [form, setForm] = useState(emptyForm)
  const [message, setMessage] = useState('')
  const [dbError, setDbError] = useState(db ? '' : 'DB에 연결할 수 없어 정책 제안을 불러올 수 없습니다.')

  useEffect(() => {
    if (!db) {
      return
    }

    async function loadSuggestions() {
      try {
        const [suggestionSnapshot, authorSnapshot] = await Promise.all([
          getDocs(collection(db!, 'policySuggestions')),
          isAdmin ? getDocs(collection(db!, 'policySuggestionAuthors')) : Promise.resolve(null),
        ])
        setVisibleSuggestions(suggestionSnapshot.docs.map((item) => item.data() as PolicySuggestion))
        setSuggestionAuthors(authorSnapshot?.docs.map((item) => item.data() as PolicySuggestionAuthor) ?? [])
      } catch {
        setDbError('DB 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.')
      }
    }

    void loadSuggestions()
  }, [isAdmin])

  const submitSuggestion = async () => {
    if (!db) { setMessage('DB에 연결할 수 없어 정책 제안을 제출할 수 없습니다.'); return }
    if (!user) { setMessage('로그인 후 정책 제안을 제출할 수 있습니다.'); return }
    if (isAdmin) { setMessage('관리자는 정책 제안을 제출할 수 없습니다. 관리자 페이지에서 조회만 가능합니다.'); return }

    const title = form.title.trim()
    const content = form.content.trim()
    const effect = form.effect.trim()

    if (!title || !content || !effect) {
      setMessage('제목, 내용, 기대 효과를 모두 입력해주세요.')
      return
    }

    const suggestionRef = doc(collection(db, 'policySuggestions'))
    const suggestion: PolicySuggestion = {
      id: suggestionRef.id,
      title,
      category: form.category,
      content,
      effect,
      isAnonymous: form.isAnonymous,
      createdAt: serverTimestamp() as unknown as PolicySuggestion['createdAt'],
    }
    const author: PolicySuggestionAuthor = {
      suggestionId: suggestionRef.id,
      authorEmail: user.email ?? '',
      authorName: profile?.name || user.displayName || '학생',
    }

    try {
      await Promise.all([
        setDoc(suggestionRef, suggestion),
        setDoc(doc(db, 'policySuggestionAuthors', suggestionRef.id), author),
      ])
      setVisibleSuggestions([{ ...suggestion, createdAt: '방금' }, ...visibleSuggestions])
      setForm(emptyForm)
      setMessage('정책 제안을 제출했습니다.')
    } catch {
      setMessage('정책 제안 저장에 실패했습니다. 잠시 후 다시 시도해주세요.')
    }
  }

  return (
    <div className="design-page suggestion-design">
      <section className="design-hero compact"><div><h1>정책 <span>제안</span></h1><p>학교 생활을 더 좋게 만들 수 있는 아이디어를 자유롭게 제안해주세요.</p><p>여러분의 제안이 더 나은 학교를 만드는 첫걸음이 됩니다.</p><a className="home-outline-button" href="#suggestion-guide">제안 가이드 보기</a></div></section>
      {dbError && <section className="design-wide"><p className="success-message">{dbError}</p></section>}
      <section className="design-wide suggestion-layout">
        <div>
          <article id="suggestion-form" className="design-card suggestion-form">
            <h2><Icon name="pen" />정책 제안 작성</h2>
            {message && <p className="success-message">{message}</p>}
            {!user ? <><p>로그인 후 정책 제안을 제출할 수 있습니다.</p><button className="design-primary" type="button" onClick={loginWithGoogle}>Google로 로그인</button></> : isAdmin ? <p>관리자는 정책 제안을 제출할 수 없습니다. 관리자 페이지에서 조회만 가능합니다.</p> : <><label><span>제목</span><input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label><label><span>분야</span><select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label><label><span>내용</span><textarea rows={5} value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} /></label><label><span>기대 효과</span><textarea rows={3} value={form.effect} onChange={(event) => setForm({ ...form, effect: event.target.value })} /></label><label className="select-pill"><input type="checkbox" checked={form.isAnonymous} onChange={(event) => setForm({ ...form, isAnonymous: event.target.checked })} /> 공개 목록에서 익명 표시</label><button className="design-primary" type="button" onClick={submitSuggestion}>정책 제안 제출</button></>}
          </article>
          <article className="design-card recent-table" id="recent-suggestions"><div className="design-title"><h2>최근 제안</h2><a href="#recent-suggestions">전체 보기</a></div><table><tbody>{visibleSuggestions.length === 0 ? <tr><td>등록된 정책 제안이 없습니다.</td></tr> : visibleSuggestions.map((item) => { const author = suggestionAuthors.find((authorItem) => authorItem.suggestionId === item.id); return <tr key={item.id}><td>{item.category}</td><td>{item.title}</td><td>{isAdmin ? author?.authorName ?? '작성자 미상' : item.isAnonymous ? '익명' : '학생'}</td><td>{formatDate(item.createdAt)}</td></tr> })}</tbody></table></article>
        </div>
        <aside><article className="design-card guide-card" id="suggestion-guide"><h2>제안 가이드</h2>{guides.map((item, index) => <p key={item}><span>{index + 1}</span><strong>{item}</strong><small>학생회가 빠르게 이해할 수 있도록 작성해주세요.</small></p>)}</article><article className="design-card popular-card" id="popular-suggestions"><div className="design-title"><h2>분야</h2><a href="#suggestion-form">제안하기</a></div><div className="chip-row">{categories.map((category) => <span className="select-pill" key={category}>{category}</span>)}</div></article></aside>
      </section>
    </div>
  )
}

export default Suggestions
