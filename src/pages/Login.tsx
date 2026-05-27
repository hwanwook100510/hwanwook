import { Navigate, useLocation } from 'react-router-dom'
import AuthButton from '../components/AuthButton'
import SectionHeader from '../components/SectionHeader'
import { useAuth } from '../contexts/useAuth'

type LocationState = {
  from?: {
    pathname?: string
  }
}

function Login() {
  const { user } = useAuth()
  const location = useLocation()
  const state = location.state as LocationState | null
  const redirectTo = state?.from?.pathname ?? '/'

  if (user) {
    return <Navigate to={redirectTo} replace />
  }

  return (
    <section className="page-section auth-page">
      <SectionHeader
        eyebrow="Dimigo Account"
        title="로그인이 필요한 기능입니다"
        description="정책 제안, 동아리 지원, 평가제 참여는 한국디지털미디어고등학교 Google 계정으로 로그인한 뒤 사용할 수 있습니다."
      />
      <div className="auth-card">
        <h3>학교 계정으로 로그인</h3>
        <p>@dimigo.hs.kr 계정만 접근할 수 있습니다.</p>
        <AuthButton />
      </div>
    </section>
  )
}

export default Login
