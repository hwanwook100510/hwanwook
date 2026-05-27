import { useState } from 'react'
import type { FormEvent } from 'react'
import { doc, setDoc } from 'firebase/firestore'
import { Navigate } from 'react-router-dom'
import SectionHeader from '../components/SectionHeader'
import { useAuth } from '../contexts/useAuth'
import { db } from '../firebase'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useStudentProfile } from '../hooks/useStudentProfile'
import type { StudentProfile } from '../types'
import { isAdminEmail } from '../utils/permissions'

function MyPage() {
  const { user } = useAuth()
  const { profile, loading } = useStudentProfile()
  const [profiles, setProfiles] = useLocalStorage<StudentProfile[]>('dimigo-student-profiles', [])

  if (isAdminEmail(user?.email)) {
    return <Navigate to="/admin" replace />
  }

  if (loading) {
    return <section className="page-section"><div className="auth-card"><p>학생 정보를 확인하고 있습니다.</p></div></section>
  }

  if (!profile) {
    return <Navigate to="/register" replace />
  }

  return <MyPageForm profile={profile} profiles={profiles} setProfiles={setProfiles} userEmail={user?.email ?? ''} />
}

type MyPageFormProps = {
  profile: StudentProfile
  profiles: StudentProfile[]
  setProfiles: (profiles: StudentProfile[]) => void
  userEmail: string
}

function MyPageForm({ profile, profiles, setProfiles, userEmail }: MyPageFormProps) {
  const [form, setForm] = useState({
    grade: profile.grade,
    classNumber: profile.classNumber,
    number: profile.number,
    name: profile.name,
  })
  const [message, setMessage] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!userEmail) {
      setMessage('로그인 정보를 확인할 수 없습니다.')
      return
    }

    const nextProfile: StudentProfile = {
      email: userEmail,
      name: form.name.trim(),
      grade: form.grade,
      classNumber: form.classNumber.trim(),
      number: form.number.trim(),
      createdAt: profile.createdAt,
    }

    setProfiles([nextProfile, ...profiles.filter((item) => item.email !== userEmail)])

    if (db) {
      await setDoc(doc(db, 'studentProfiles', userEmail), nextProfile, { merge: true })
    }

    setMessage('내 정보가 저장되었습니다.')
  }

  return (
    <section className="page-section">
      <SectionHeader
        eyebrow="My Page"
        title="마이페이지"
        description="동아리 지원과 평가 참여에 사용하는 학번과 이름을 수정할 수 있습니다."
      />
      <div className="two-column">
        <form className="form-card" onSubmit={handleSubmit}>
          <h3>내 정보 수정</h3>
          <label>
            <span>학년</span>
            <select required value={form.grade} onChange={(event) => setForm({ ...form, grade: event.target.value })}>
              <option value="1">1학년</option>
              <option value="2">2학년</option>
              <option value="3">3학년</option>
            </select>
          </label>
          <label><span>반</span><input required inputMode="numeric" maxLength={2} value={form.classNumber} onChange={(event) => setForm({ ...form, classNumber: event.target.value })} /></label>
          <label><span>번호</span><input required inputMode="numeric" maxLength={2} value={form.number} onChange={(event) => setForm({ ...form, number: event.target.value })} /></label>
          <label><span>이름</span><input required maxLength={20} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
          <button className="primary-button" type="submit">내 정보 저장</button>
          {message && <p className="success-message">{message}</p>}
        </form>
        <div className="panel-card">
          <h3>현재 등록 정보</h3>
          <div className="student-summary large">
            <span>{profile.email}</span>
            <strong>{profile.grade}학년 {profile.classNumber}반 {profile.number}번 · {profile.name}</strong>
          </div>
          <p>이 정보는 동아리 지원서와 관리자 페이지의 학생 정보 표시에도 사용됩니다.</p>
        </div>
      </div>
    </section>
  )
}

export default MyPage
