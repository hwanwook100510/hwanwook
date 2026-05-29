import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'
import { isAdminEmail } from '../utils/permissions'

function AuthButton() {
  const { user, loading, error, loginWithGoogle, logout } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleLogin = async () => {
    setIsSubmitting(true)

    try {
      await loginWithGoogle()
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return <span className="auth-loading">로그인 확인 중</span>
  }

  if (user) {
    const isAdmin = isAdminEmail(user.email)

    return (
      <div className="auth-profile">
        <Link className="auth-avatar-link" to={isAdmin ? '/admin' : '/mypage'} aria-label="내 정보 보기">
          {user.photoURL ? <img src={user.photoURL} alt="프로필" /> : <span>{user.displayName?.slice(0, 1) ?? '나'}</span>}
        </Link>
        <div>
          <strong>{user.displayName}</strong>
          <small>{user.email}</small>
        </div>
        {!isAdmin && <Link className="profile-link" to="/mypage">마이페이지</Link>}
        <button type="button" onClick={logout}>로그아웃</button>
      </div>
    )
  }

  return (
    <div className="auth-actions">
      <button className="google-button" type="button" onClick={handleLogin} disabled={isSubmitting}>
        {isSubmitting ? '로그인 중...' : 'Google 로그인'}
      </button>
      {error && <p>{error}</p>}
    </div>
  )
}

export default AuthButton
