import { Navigate } from 'react-router-dom'
import SectionHeader from '../components/SectionHeader'
import { useAuth } from '../contexts/useAuth'
import { useStudentProfile } from '../hooks/useStudentProfile'
import { isAdminEmail } from '../utils/permissions'

function MyPage() {
  const { user } = useAuth()
  const { profile, loading } = useStudentProfile()

  if (isAdminEmail(user?.email)) {
    return <Navigate to="/admin" replace />
  }

  if (loading) {
    return <section className="page-section"><div className="auth-card"><p>학생 정보를 확인하고 있습니다.</p></div></section>
  }

  if (!profile) {
    return <Navigate to="/register" replace />
  }

  return (
    <section className="page-section">
      <SectionHeader
        eyebrow="My Page"
        title="마이페이지"
        description="회원가입한 학생 정보를 확인합니다. 정보 수정은 관리자에게 요청해주세요."
      />
      <div className="two-column">
        <div className="form-card"><h3>정보 수정 안내</h3><p>회원가입 이후 학생 정보는 본인이 직접 수정할 수 없습니다.</p><p>학번이나 이름이 잘못 등록된 경우 관리자에게 수정 요청을 해주세요.</p></div>
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
