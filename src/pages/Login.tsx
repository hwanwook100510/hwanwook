import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import type { FormEvent } from 'react'
import AuthButton from '../components/AuthButton'
import SectionHeader from '../components/SectionHeader'
import { useAuth } from '../contexts/useAuth'

type LocationState = {
  from?: {
    pathname?: string
  }
}

function Login() {
  const { user, adminCodeAccepted, verifyAdminCode } = useAuth()
  const [securityCode, setSecurityCode] = useState('')
  const [codeMessage, setCodeMessage] = useState('')
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as LocationState | null
  const redirectTo = state?.from?.pathname ?? '/'

  const submitSecurityCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (await verifyAdminCode(securityCode)) {
      setCodeMessage('관리자 보안코드가 확인되었습니다. 관리자 페이지로 이동합니다.')
      setSecurityCode('')
      navigate('/admin', { replace: true })
    } else {
      setCodeMessage('')
    }
  }

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
        <p>학생 기능은 @dimigo.hs.kr 계정으로 로그인하고, 관리자는 보안코드로 접속할 수 있습니다.</p>
        <form className="security-code-form" onSubmit={submitSecurityCode}>
          <label className="form-group">
            <span>관리자 보안코드</span>
            <input
              type="password"
              autoComplete="one-time-code"
              value={securityCode}
              onChange={(event) => setSecurityCode(event.target.value)}
              placeholder="보안코드 입력"
            />
          </label>
          <button className="secondary-button" type="submit">보안코드 확인</button>
        </form>
        {(adminCodeAccepted || codeMessage) && <p className="success-message">{codeMessage || '관리자 보안코드가 확인되었습니다.'}</p>}
        <AuthButton />
      </div>
    </section>
  )
}

export default Login
