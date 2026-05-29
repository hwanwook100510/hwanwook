import { useState } from 'react'
import type { FormEvent } from 'react'
import { doc, setDoc } from 'firebase/firestore'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'
import { clubs } from '../data/clubs'
import { db } from '../firebase'
import { useLocalStorage } from '../hooks/useLocalStorage'
import type { ClubApplication, StudentProfile } from '../types'

const emptyForm = { firstChoice: '', secondChoice: '', thirdChoice: '' }
const featuredClubs = clubs.slice(0, 6)
const clubActivities = ['전체 분야', ...Array.from(new Set(featuredClubs.map((club) => club.activity)))]

function Icon({ name }: { name: string }) { return <svg className="home-icon" aria-hidden="true"><use href={`/icons.svg#${name}`} /></svg> }

function ClubSupport() {
  const { user } = useAuth()
  const [profiles] = useLocalStorage<StudentProfile[]>('dimigo-student-profiles', [])
  const [pendingFirstChoice, setPendingFirstChoice] = useLocalStorage('dimigo-pending-first-choice', '')
  const [pendingSecondChoice, setPendingSecondChoice] = useLocalStorage('dimigo-pending-second-choice', '')
  const [pendingThirdChoice, setPendingThirdChoice] = useLocalStorage('dimigo-pending-third-choice', '')
  const [applications, setApplications] = useLocalStorage<ClubApplication[]>('dimigo-club-applications', [])
  const [form, setForm] = useState({ ...emptyForm, firstChoice: pendingFirstChoice, secondChoice: pendingSecondChoice, thirdChoice: pendingThirdChoice })
  const [message, setMessage] = useState('')
  const [activityFilter, setActivityFilter] = useState('전체 분야')
  const profile = profiles.find((item) => item.email === user?.email)
  const selected = [form.firstChoice, form.secondChoice, form.thirdChoice].filter(Boolean)
  const visibleClubs = activityFilter === '전체 분야' ? featuredClubs : featuredClubs.filter((club) => club.activity === activityFilter)

  const setChoice = (club: string) => {
    if (selected.includes(club)) { setMessage('이미 선택한 동아리입니다.'); return }
    if (!form.firstChoice) { setForm({ ...form, firstChoice: club }); setPendingFirstChoice(club); return }
    if (!form.secondChoice) { setForm({ ...form, secondChoice: club }); setPendingSecondChoice(club); return }
    if (!form.thirdChoice) { setForm({ ...form, thirdChoice: club }); setPendingThirdChoice(club) }
    else setMessage('최대 3개 동아리까지 선택할 수 있습니다.')
  }
  const removeChoice = (index: number) => {
    const next = [form.firstChoice, form.secondChoice, form.thirdChoice]
    next[index] = ''
    setForm({ firstChoice: next[0], secondChoice: next[1], thirdChoice: next[2] })
    setPendingFirstChoice(next[0]); setPendingSecondChoice(next[1]); setPendingThirdChoice(next[2])
  }
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!user?.email || !profile) { setMessage('회원가입 정보를 먼저 등록해주세요.'); return }
    if ([form.firstChoice, form.secondChoice, form.thirdChoice].some((club) => !club)) { setMessage('1순위, 2순위, 3순위 동아리를 모두 선택해주세요.'); return }
    const application = { id: Date.now(), email: user.email, name: profile.name, grade: profile.grade, classNumber: profile.classNumber, number: profile.number, ...form, createdAt: new Date().toISOString().slice(0, 10) }
    setApplications([application, ...applications.filter((item) => item.email !== user.email)])
    if (db) await setDoc(doc(db, 'clubApplications', user.email), application)
    setMessage('동아리 지원서가 저장되었습니다.')
  }

  return (
    <div className="design-page club-apply-design">
      <section className="design-hero compact"><div><h1>동아리 <span>지원</span></h1><p>다양한 동아리를 둘러보고 1지망, 2지망, 3지망을 선택해 보세요.</p><p>여러분의 열정이 특별한 활동으로 이어집니다.</p><Link className="design-primary" to="/clubs/list">지원하기</Link></div></section>
      <section className="design-wide step-card design-card"><h2>동아리 지원 절차</h2>{['동아리 탐색', '우선순위 선택', '지원서 작성', '제출 완료'].map((step, index) => <div key={step}><span><Icon name={['wifi','clipboard','pen','check'][index]} /></span><strong>{step}</strong><p>{['관심 있는 동아리를 확인하세요.', '1지망, 2지망, 3지망을 선택합니다.', '선택한 동아리의 지원서를 작성합니다.', '최종 제출 후 결과를 기다려주세요.'][index]}</p></div>)}</section>
      <section className="design-wide club-layout">
        <div>
          <article className="design-card club-list-card"><div className="design-title"><h2>모집 중인 동아리 <span>{visibleClubs.length}</span></h2><div><select aria-label="동아리 분야" value={activityFilter} onChange={(event) => setActivityFilter(event.target.value)}>{clubActivities.map((activity) => <option key={activity}>{activity}</option>)}</select><span className="select-pill">모집 중</span></div></div><div className="club-card-grid">{visibleClubs.map((club, index) => <article className="club-apply-card" key={club.name}><div className="club-thumb">{club.name.slice(0, 2)}</div><div><h3>{club.name}</h3><b>{club.activity}</b><p>{club.activity} 활동을 함께합니다.</p><small>모집 {15 + index * 2}명</small></div><button type="button" onClick={() => setChoice(club.name)}>지망에 추가 +</button></article>)}</div></article>
          <article className="design-card apply-info"><h2>지원 안내</h2>{['지원 기간 2025.05.20 ~ 05.27', '면접 여부 일부 동아리 면접 진행', '결과 발표 2025.05.31', '유의사항 1지망 기준 검토 후 최종 선발'].map((item) => <p key={item}><Icon name="check" />{item}</p>)}</article>
        </div>
        <form className="apply-side" onSubmit={handleSubmit}><article className="design-card priority-card"><div className="design-title"><h2>지원 우선순위</h2><button className="reset-button" type="button" onClick={() => { setForm(emptyForm); setPendingFirstChoice(''); setPendingSecondChoice(''); setPendingThirdChoice('') }}>초기화</button></div><p>최대 3개 동아리를 선택할 수 있습니다.</p>{[form.firstChoice, form.secondChoice, form.thirdChoice].map((club, index) => <div className="priority-row" key={index}><b>{index + 1}</b><strong>{index + 1}지망</strong><span>{club || '동아리에서 선택하세요.'}</span>{club && <button type="button" onClick={() => removeChoice(index)}>×</button>}</div>)}<p className="notice-text">순위는 제출 전까지 자유롭게 변경할 수 있습니다.</p></article><article className="design-card submit-card"><h2>모든 우선순위를 확인하셨나요?</h2><p>최종 제출 후에는 수정이 불가능합니다.</p>{!profile && <Link className="home-outline-button wide" to="/register">회원가입 하러 가기</Link>}<button className="design-primary" type="submit">최종 제출하기</button>{message && <p className="success-message">{message}</p>}</article></form>
      </section>
    </div>
  )
}

export default ClubSupport
