import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'
import { useStudentProfile } from '../hooks/useStudentProfile'
import { isAdminEmail } from '../utils/permissions'

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const { profile, loading: profileLoading } = useStudentProfile()
  const location = useLocation()

  if (loading) {
    return <div className="auth-card"><p>로그인 상태를 확인하고 있습니다.</p></div>
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (!isAdminEmail(user.email) && profileLoading) {
    return <div className="auth-card"><p>학생 정보를 확인하고 있습니다.</p></div>
  }

  if (!isAdminEmail(user.email) && !profile && location.pathname !== '/register') {
    return <Navigate to="/register" replace state={{ from: location }} />
  }

  return children
}

export default ProtectedRoute
