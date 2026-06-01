import { useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthButton from './AuthButton'
import { useAuth } from '../contexts/useAuth'
import { useStudentProfile } from '../hooks/useStudentProfile'

function AdminCodeForm() {
  const { verifyAdminCode, error } = useAuth()
  const [securityCode, setSecurityCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  const submitSecurityCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      if (await verifyAdminCode(securityCode)) {
        setSecurityCode('')
        navigate('/admin', { replace: true })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="security-code-form" onSubmit={submitSecurityCode}>
      <label className="form-group">
        <span>관리자 보안코드</span>
        <input type="password" autoComplete="one-time-code" value={securityCode} onChange={(event) => setSecurityCode(event.target.value)} placeholder="보안코드 입력" />
      </label>
      <button className="secondary-button" type="submit" disabled={isSubmitting}>{isSubmitting ? '확인 중...' : '보안코드로 관리자 접속'}</button>
      {error && <p className="auth-error-message">{error}</p>}
    </form>
  )
}

function ProtectedRoute({ children, requireAdmin = false }: { children: ReactNode, requireAdmin?: boolean }) {
  const { user, isAdmin, loading } = useAuth()
  const { profile, loading: profileLoading } = useStudentProfile()
  const location = useLocation()

  if (loading) {
    return <div className="auth-card"><p>로그인 상태를 확인하고 있습니다.</p></div>
  }

  if (requireAdmin && (!user || !isAdmin)) {
    return <section className="page-section auth-page"><div className="auth-card"><h3>관리자 보안코드가 필요합니다</h3><p>보안코드를 입력하면 관리자 페이지와 관리 기능을 사용할 수 있습니다.</p><AdminCodeForm /></div></section>
  }

  if (!user) {
    return <section className="page-section auth-page"><div className="auth-card"><h3>로그인이 필요한 기능입니다</h3><p>학생 기능은 로그인 후 사용할 수 있습니다. 관리자는 보안코드로 접속할 수 있습니다.</p><AdminCodeForm /><AuthButton /></div></section>
  }

  if (!isAdmin && profileLoading) {
    return <div className="auth-card"><p>학생 정보를 확인하고 있습니다.</p></div>
  }

  if (!isAdmin && !profile && location.pathname !== '/register') {
    return <section className="page-section auth-page"><div className="auth-card"><h3>회원가입 정보가 필요합니다</h3><p>개인정보를 사용하는 기능은 학생 정보를 먼저 등록해야 합니다.</p><Link className="primary-button" to="/register" state={{ from: location }}>회원가입 정보 등록</Link></div></section>
  }

  return children
}

export default ProtectedRoute
