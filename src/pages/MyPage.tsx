import { Navigate, Link } from 'react-router-dom'
import SectionHeader from '../components/SectionHeader'
import { useAuth } from '../contexts/useAuth'
import { useStudentProfile } from '../hooks/useStudentProfile'

function MyPage() {
  const { user, isAdmin, logout } = useAuth()
  const { profile, loading } = useStudentProfile()

  if (loading) {
    return <section className="page-section"><div className="auth-card"><p>학생 정보를 확인하고 있습니다.</p></div></section>
  }

  if (!isAdmin && !profile) {
    return <Navigate to="/register" replace />
  }

  return (
    <section className="page-section">
      <SectionHeader
        eyebrow="My Page"
          title="마이페이지"
          description="내 계정 정보를 확인하고 로그아웃할 수 있습니다."
        />
      <div className="two-column">
        <div className="form-card">
          <h3>계정 설정</h3>
          <p>{isAdmin ? '관리자 계정으로 로그인되어 있습니다.' : '회원가입 이후 학생 정보는 본인이 직접 수정할 수 없습니다.'}</p>
          {!isAdmin && <p>학번이나 이름이 잘못 등록된 경우 관리자에게 수정 요청을 해주세요.</p>}
          {isAdmin && <Link className="secondary-button" to="/admin">관리자 페이지로 이동</Link>}
          <button className="primary-button" type="button" onClick={logout}>로그아웃</button>
        </div>
        <div className="panel-card">
          <h3>{isAdmin ? '현재 계정 정보' : '현재 등록 정보'}</h3>
          <div className="student-summary large">
            <span>{profile?.email ?? user?.email}</span>
            <strong>{profile ? `${profile.grade}학년 ${profile.classNumber}반 ${profile.number}번 · ${profile.name}` : user?.displayName ?? '관리자 계정'}</strong>
          </div>
          <p>{profile ? '이 정보는 동아리 지원서와 관리자 페이지의 학생 정보 표시에도 사용됩니다.' : '관리자 계정은 학생 회원가입 정보 없이도 관리자 기능을 사용할 수 있습니다.'}</p>
        </div>
      </div>
    </section>
  )
}

export default MyPage
