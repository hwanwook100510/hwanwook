import type { ReactNode } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import AuthButton from './AuthButton'
import { useAuth } from '../contexts/useAuth'
import { useStudentProfile } from '../hooks/useStudentProfile'

function ProtectedRoute({ children, requireAdmin = false }: { children: ReactNode, requireAdmin?: boolean }) {
  const { user, isAdmin, loading } = useAuth()
  const { profile, loading: profileLoading } = useStudentProfile()
  const location = useLocation()

  if (loading) {
    return <div className="auth-card"><p>로그인 상태를 확인하고 있습니다.</p></div>
  }

  if (requireAdmin && (!user || !isAdmin)) {
    return <Navigate to="/" replace />
  }

  if (!user) {
    return <section className="page-section auth-page"><div className="auth-card"><h3>로그인이 필요한 기능입니다</h3><p>이 기능은 로그인 후 사용할 수 있습니다.</p><AuthButton /></div></section>
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
