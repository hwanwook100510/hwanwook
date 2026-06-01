import { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'
import { db } from '../firebase'
import { useStudentProfile } from '../hooks/useStudentProfile'
import { adminRoute } from '../config'
import AuthButton from './AuthButton'

const navigation = [
  { to: '/', label: '홈' },
  { to: '/members', label: '학생회 소개' },
  { to: '/evaluation', label: '학생회 평가' },
  { to: '/suggestions', label: '정책 제안' },
  { to: '/vote', label: '투표' },
  { to: '/progress', label: '공약 진행 현황' },
]

const showClubDashboardNav = false

type LayoutProps = {
  children: React.ReactNode
}

function Layout({ children }: LayoutProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { user, isAdmin } = useAuth()
  const { profile } = useStudentProfile()
  const [remoteClubPermission, setRemoteClubPermission] = useState<{ email: string, hasPermission: boolean } | null>(null)
  const userEmail = user?.email
  const hasRemoteClubPermission = Boolean(userEmail && remoteClubPermission?.email === userEmail && remoteClubPermission.hasPermission)
  const hasClubPermission = hasRemoteClubPermission

  useEffect(() => {
    if (!db || typeof userEmail !== 'string') {
      return
    }

    async function loadPermission() {
      if (!db || typeof userEmail !== 'string') return

      try {
        const snapshot = await getDoc(doc(db, 'clubRoleAssignments', userEmail))

        setRemoteClubPermission({
          email: userEmail,
          hasPermission: snapshot.exists(),
        })
      } catch {
        setRemoteClubPermission(null)
      }
    }

    void loadPermission()
  }, [userEmail])

  const baseNavigation = navigation.filter((item) => item.to !== '/register' || (user && !isAdmin && !profile))
  const extraNavigation = [
    ...(showClubDashboardNav && hasClubPermission ? [{ to: '/club-dashboard', label: '동아리 관리' }] : []),
    ...(isAdmin && adminRoute ? [{ to: adminRoute, label: '관리자' }] : []),
  ]
  const visibleNavigation = [...baseNavigation, ...extraNavigation]

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">본문 바로가기</a>
      <header className="topbar">
        <NavLink to="/" className="brand" onClick={() => setIsOpen(false)}>
          <span className="brand-mark">
            <img src="/dimigo-logo.jpg" alt="디미고 로고" />
          </span>
          <span>
            <strong>DIMIGO</strong>
            <small>학생회</small>
          </span>
        </NavLink>
        <button className="menu-button" type="button" aria-controls="primary-navigation" aria-expanded={isOpen} onClick={() => setIsOpen((open) => !open)}>
          {isOpen ? '닫기' : '메뉴'}
        </button>
        <nav id="primary-navigation" className={`nav ${isOpen ? 'open' : ''}`} aria-label="주요 메뉴">
          {visibleNavigation.map((item) => (
            <NavLink key={item.to} to={item.to} onClick={() => setIsOpen(false)}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="topbar-actions">
          <span className="topbar-divider" aria-hidden="true">|</span>
          <AuthButton />
        </div>
      </header>
      <main id="main-content">{children}</main>
      <footer className="footer">
        <strong>한국디지털미디어고등학교 학생자치회</strong>
        <span>투명한 운영, 빠른 소통, 신뢰받는 학생 대표 기구</span>
      </footer>
    </div>
  )
}

export default Layout
