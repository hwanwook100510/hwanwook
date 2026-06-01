import { useState } from 'react'
import type { FormEvent } from 'react'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { Link, Navigate, useLocation } from 'react-router-dom'
import AuthButton from '../components/AuthButton'
import SectionHeader from '../components/SectionHeader'
import { useAuth } from '../contexts/useAuth'
import { db } from '../firebase'
import { useStudentProfile } from '../hooks/useStudentProfile'
import type { StudentProfile } from '../types'

const emptyForm = {
  grade: '1',
  classNumber: '1',
  number: '',
  name: '',
}

function Register() {
  const { user, isAdmin, loading } = useAuth()
  const location = useLocation()
  const { profile, loading: profileLoading } = useStudentProfile()
  const [form, setForm] = useState(emptyForm)
  const [message, setMessage] = useState('')
  const state = location.state as { from?: { pathname?: string } } | null
  const redirectTo = state?.from?.pathname === '/register' ? '/' : state?.from?.pathname ?? '/'

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!user?.email) {
      setMessage('로그인 정보를 확인할 수 없습니다.')
      return
    }

    const profile: StudentProfile = {
      email: user.email,
      name: form.name.trim(),
      grade: form.grade,
      classNumber: form.classNumber.trim(),
      number: form.number.trim(),
      createdAt: serverTimestamp() as unknown as StudentProfile['createdAt'],
    }

    if (!profile.name || profile.name.length > 20 || !/^\d{1,2}$/.test(profile.classNumber) || !/^\d{1,2}$/.test(profile.number)) {
      setMessage('이름은 1~20자, 반과 번호는 1~2자리 숫자로 입력해주세요.')
      return
    }

    if (db) {
      try {
        await setDoc(doc(db, 'studentProfiles', user.email), profile)
        setMessage('회원가입 정보가 저장되었습니다. 이제 서비스를 사용할 수 있습니다.')
      } catch {
        setMessage('회원가입 정보 저장에 실패했습니다. 잠시 후 다시 시도해주세요.')
      }
      return
    }

    setMessage('DB에 연결할 수 없어 회원가입 정보를 저장하지 못했습니다.')
  }

  if (isAdmin) {
    return <Navigate to="/admin" replace />
  }

  if (loading) {
    return <section className="page-section"><div className="auth-card"><p>로그인 상태를 확인하고 있습니다.</p></div></section>
  }

  if (!user) {
    return (
      <section className="page-section auth-page">
        <SectionHeader
          eyebrow="Student Registration"
          title="회원가입이 필요합니다"
          description="학생회 웹사이트의 기능을 사용하려면 먼저 학교 Google 계정으로 로그인하고 학생 정보를 등록해야 합니다."
        />
        <div className="auth-card">
          <h3>학교 계정으로 시작하기</h3>
          <p>@dimigo.hs.kr 계정으로 로그인한 뒤 회원가입 정보를 입력할 수 있습니다.</p>
          <AuthButton />
        </div>
      </section>
    )
  }

  if (profileLoading) {
    return <section className="page-section"><div className="auth-card"><p>학생 정보를 확인하고 있습니다.</p></div></section>
  }

  if (profile) {
    return <Navigate to="/mypage" replace />
  }

  return (
    <section className="page-section">
      <SectionHeader
        eyebrow="Student Registration"
        title="회원가입"
        description="동아리 지원과 평가 참여에 사용할 학생 정보를 등록합니다."
      />
      <div className="two-column">
        <form className="form-card" onSubmit={handleSubmit}>
          <h3>학생 정보 입력</h3>
          <label>
            <span>학년</span>
            <select required value={form.grade} onChange={(event) => setForm({ ...form, grade: event.target.value })}>
              <option value="1">1학년</option>
              <option value="2">2학년</option>
              <option value="3">3학년</option>
            </select>
          </label>
          <label><span>반</span><input required inputMode="numeric" pattern="[0-9]{1,2}" maxLength={2} value={form.classNumber} onChange={(event) => setForm({ ...form, classNumber: event.target.value.replace(/\D/g, '') })} /></label>
          <label><span>번호</span><input required inputMode="numeric" pattern="[0-9]{1,2}" maxLength={2} value={form.number} onChange={(event) => setForm({ ...form, number: event.target.value.replace(/\D/g, '') })} /></label>
          <label><span>이름</span><input required maxLength={20} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
          <button className="primary-button" type="submit">
            회원가입 정보 저장
          </button>
          {message && <p className="success-message">{message}</p>}
          {message && <Link className="secondary-button" to={redirectTo}>계속하기</Link>}
        </form>
        <div className="panel-card">
          <h3>내 정보</h3>
          <p>회원가입 정보는 최초 등록 후 마이페이지에서 수정할 수 있습니다.</p>
        </div>
      </div>
    </section>
  )
}

export default Register
