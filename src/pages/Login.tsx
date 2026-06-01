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
            description="학생 기능은 한국디지털미디어고등학교 Google 계정으로, 관리자 기능은 등록된 관리자 Google 계정으로 사용할 수 있습니다."
      />
      <div className="auth-card">
        <h3>학교 계정으로 로그인</h3>
        <p>학생은 @dimigo.hs.kr 계정으로, 관리자는 등록된 Google 계정으로 로그인해주세요.</p>
        <AuthButton />
      </div>
    </section>
  )
}

export default Login
