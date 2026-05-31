import { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { useAuth } from '../contexts/useAuth'
import { initialSuggestions } from '../data/mockData'
import { db } from '../firebase'
import type { PolicySuggestion, PolicySuggestionAuthor } from '../types'

const categories = ['학습 환경', '시설', '급식', '복지', '행사', '동아리', '기타']
const guides = ['문제를 구체적으로 작성해요', '해결 방안을 제시해요', '기대 효과를 적어주세요', '존중하는 표현을 사용해요']

function Icon({ name }: { name: string }) { return <svg className="home-icon" aria-hidden="true"><use href={`/icons.svg#${name}`} /></svg> }

function formatDate(value: PolicySuggestion['createdAt']) {
  if (typeof value === 'string') return value

  return typeof value.toDate === 'function' ? value.toDate().toISOString().slice(0, 10) : '방금'
}

function Suggestions() {
  const { isAdmin } = useAuth()
  const [visibleSuggestions, setVisibleSuggestions] = useState<PolicySuggestion[]>(initialSuggestions)
  const [suggestionAuthors, setSuggestionAuthors] = useState<PolicySuggestionAuthor[]>([])

  useEffect(() => {
    if (!db) {
      return
    }

    async function loadSuggestions() {
      const [suggestionSnapshot, authorSnapshot] = await Promise.all([
        getDocs(collection(db!, 'policySuggestions')),
        isAdmin ? getDocs(collection(db!, 'policySuggestionAuthors')) : Promise.resolve(null),
      ])
      setVisibleSuggestions(suggestionSnapshot.docs.map((item) => item.data() as PolicySuggestion))
      setSuggestionAuthors(authorSnapshot?.docs.map((item) => item.data() as PolicySuggestionAuthor) ?? [])
    }

    void loadSuggestions()
  }, [isAdmin])

  return (
    <div className="design-page suggestion-design">
      <section className="design-hero compact"><div><h1>정책 <span>제안</span></h1><p>학교 생활을 더 좋게 만들 수 있는 아이디어를 자유롭게 제안해주세요.</p><p>여러분의 제안이 더 나은 학교를 만드는 첫걸음이 됩니다.</p><a className="home-outline-button" href="#suggestion-guide">제안 가이드 보기</a></div></section>
      <section className="design-wide stat-grid four"><article><Icon name="clipboard" /><b>총 제안 수</b><strong>0건</strong><span>전체 누적 제안</span></article><article><Icon name="folder" /><b>이번 달 제안</b><strong>0건</strong><span>5월 기준</span></article><article><Icon name="check" /><b>반영된 정책</b><strong>0건</strong><span>실제 정책으로 반영</span></article><article><Icon name="users" /><b>참여 학생</b><strong>0명</strong><span>제안에 참여한 학생</span></article></section>
      <section className="design-wide suggestion-layout">
        <div>
          <article id="suggestion-form" className="design-card suggestion-form">
            <h2><Icon name="pen" />정책 제안 작성</h2>
            <p>현재 정책 제안은 제출할 수 없습니다.</p>
            <div className="chip-row">{categories.map((category) => <span className="select-pill" key={category}>{category}</span>)}</div>
            <button className="design-primary" type="button" disabled>정책 제안 제출 중단</button>
          </article>
          <article className="design-card recent-table" id="recent-suggestions"><div className="design-title"><h2>최근 제안</h2><a href="#recent-suggestions">전체 보기</a></div><table><tbody>{visibleSuggestions.map((item) => { const author = suggestionAuthors.find((authorItem) => authorItem.suggestionId === item.id); return <tr key={item.id}><td>{item.category}</td><td>{item.title}</td><td>{item.isAnonymous && !isAdmin ? '익명' : author?.authorName ?? '작성자 미상'}</td><td>{formatDate(item.createdAt)}</td></tr> })}</tbody></table></article>
        </div>
        <aside><article className="design-card guide-card" id="suggestion-guide"><h2>제안 가이드</h2>{guides.map((item, index) => <p key={item}><span>{index + 1}</span><strong>{item}</strong><small>학생회가 빠르게 이해할 수 있도록 작성해주세요.</small></p>)}</article><article className="design-card popular-card" id="popular-suggestions"><div className="design-title"><h2>인기 제안</h2><a href="#popular-suggestions">전체 보기</a></div>{[0, 1, 2].map((item) => <p className="side-empty-row" key={item} aria-hidden="true" />)}</article></aside>
      </section>
    </div>
  )
}

export default Suggestions
