import { useState } from 'react'
import type { FormEvent } from 'react'
import { doc, setDoc } from 'firebase/firestore'
import { Link } from 'react-router-dom'
import SectionHeader from '../components/SectionHeader'
import { useAuth } from '../contexts/useAuth'
import { db } from '../firebase'
import { useLocalStorage } from '../hooks/useLocalStorage'
import type { ClubApplication, StudentProfile } from '../types'

const emptyForm = {
  firstChoice: '',
  secondChoice: '',
  thirdChoice: '',
}

function ClubSupport() {
  const { user } = useAuth()
  const [profiles] = useLocalStorage<StudentProfile[]>('dimigo-student-profiles', [])
  const [pendingFirstChoice, setPendingFirstChoice] = useLocalStorage('dimigo-pending-first-choice', '')
  const [pendingSecondChoice, setPendingSecondChoice] = useLocalStorage('dimigo-pending-second-choice', '')
  const [pendingThirdChoice, setPendingThirdChoice] = useLocalStorage('dimigo-pending-third-choice', '')
  const [applications, setApplications] = useLocalStorage<ClubApplication[]>('dimigo-club-applications', [])
  const [form, setForm] = useState({
    ...emptyForm,
    firstChoice: pendingFirstChoice,
    secondChoice: pendingSecondChoice,
    thirdChoice: pendingThirdChoice,
  })
  const [message, setMessage] = useState('')
  const profile = profiles.find((item) => item.email === user?.email)
  const myApplication = applications.find((item) => item.email === user?.email)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!user?.email || !profile) {
      setMessage('회원가입 정보를 먼저 등록해주세요.')
      return
    }

    const selectedClubs = [form.firstChoice, form.secondChoice, form.thirdChoice]

    if (selectedClubs.some((club) => !club)) {
      setMessage('1순위, 2순위, 3순위 동아리를 모두 선택해주세요.')
      return
    }

    if (new Set(selectedClubs).size !== selectedClubs.length) {
      setMessage('1순위, 2순위, 3순위 동아리는 서로 다르게 선택해주세요.')
      return
    }

    const application = {
      id: Date.now(),
      email: user.email,
      name: profile.name,
      grade: profile.grade,
      classNumber: profile.classNumber,
      number: profile.number,
      ...form,
      createdAt: new Date().toISOString().slice(0, 10),
    }

    setApplications([application, ...applications.filter((item) => item.email !== user.email)])

    if (db) {
      await setDoc(doc(db, 'clubApplications', user.email), application)
    }

    setForm(emptyForm)
    setPendingFirstChoice('')
    setPendingSecondChoice('')
    setPendingThirdChoice('')
    setMessage('동아리 지원서가 저장되었습니다. 지원 순위를 다시 확인해주세요.')
  }

  return (
    <section className="page-section">
      <SectionHeader
        eyebrow="Club Support"
        title="동아리 지원 안내"
        description="동아리 지원 절차와 제출 서류를 확인하고 예시 신청서를 작성할 수 있습니다."
      />
      <div className="info-grid">
        <article><span>지원 기간</span><strong>2026.05.20 - 2026.05.31</strong></article>
        <article><span>지원 방법</span><strong>온라인 신청서 작성 후 담당 부서 확인</strong></article>
        <article><span>제출 서류</span><strong>지원서, 활동 계획서, 개인정보 동의 확인</strong></article>
        <article><span>유의사항</span><strong>중복 지원 가능 여부는 각 동아리 공지를 따릅니다.</strong></article>
      </div>
      <div className="two-column">
        {!profile ? (
          <div className="form-card">
            <h3>회원가입이 필요합니다</h3>
            <p>동아리 지원 전에 학년, 반, 번호, 이름을 먼저 등록해주세요.</p>
            <Link className="primary-button" to="/register">회원가입 하러 가기</Link>
          </div>
        ) : (
        <form className="form-card" onSubmit={handleSubmit}>
          <h3>동아리 지원서 작성</h3>
          <div className="student-summary">
            <span>지원자</span>
            <strong>{profile.grade}학년 {profile.classNumber}반 {profile.number}번 · {profile.name}</strong>
          </div>
          <div className="choice-selector">
            <span>1순위 동아리</span>
            <strong>{form.firstChoice || '아직 선택하지 않았습니다'}</strong>
            <Link className="secondary-button" to="/clubs/select/first">1순위 선택하기</Link>
          </div>
          <div className="choice-selector">
            <span>2순위 동아리</span>
            <strong>{form.secondChoice || '아직 선택하지 않았습니다'}</strong>
            <Link className="secondary-button" to="/clubs/select/second">2순위 선택하기</Link>
          </div>
          <div className="choice-selector">
            <span>3순위 동아리</span>
            <strong>{form.thirdChoice || '아직 선택하지 않았습니다'}</strong>
            <Link className="secondary-button" to="/clubs/select/third">3순위 선택하기</Link>
          </div>
          <button className="primary-button" type="submit">지원서 저장</button>
          {message && <p className="success-message">{message}</p>}
        </form>
        )}
        <div className="panel-card">
          <h3>동아리 둘러보기</h3>
          <p>전체 동아리 사진과 활동 분야는 별도 소개 페이지에서 확인할 수 있습니다.</p>
          <Link className="secondary-button" to="/clubs/list">동아리 소개 보러가기</Link>
          <h3>내 지원서</h3>
          {!myApplication ? <p>아직 저장된 지원서가 없습니다.</p> : (
            <article className="mini-card" key={myApplication.id}>
              <strong>{myApplication.name}</strong>
              <span>{myApplication.grade}학년 {myApplication.classNumber}반 {myApplication.number}번 · {myApplication.createdAt}</span>
              <ol className="choice-list">
                <li>1순위: {myApplication.firstChoice}</li>
                <li>2순위: {myApplication.secondChoice}</li>
                <li>3순위: {myApplication.thirdChoice}</li>
              </ol>
            </article>
          )}
          <h3>전체 지원 현황</h3>
          {applications.length === 0 ? <p>아직 저장된 지원서가 없습니다.</p> : applications.map((item) => (
            <article className="mini-card" key={item.id}>
              <strong>{item.name}</strong>
              <span>{item.grade}학년 {item.classNumber}반 {item.number}번 · {item.createdAt}</span>
              <ol className="choice-list">
                <li>1순위: {item.firstChoice}</li>
                <li>2순위: {item.secondChoice}</li>
                <li>3순위: {item.thirdChoice}</li>
              </ol>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ClubSupport
