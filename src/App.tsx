import { lazy, Suspense, useEffect, useLayoutEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

const Admin = lazy(() => import('./pages/Admin'))
const ClubDashboard = lazy(() => import('./pages/ClubDashboard'))
const ClubList = lazy(() => import('./pages/ClubList'))
const ClubQuestions = lazy(() => import('./pages/ClubQuestions'))
const ClubSelect = lazy(() => import('./pages/ClubSelect'))
const ClubSupport = lazy(() => import('./pages/ClubSupport'))
const Evaluation = lazy(() => import('./pages/Evaluation'))
const Home = lazy(() => import('./pages/Home'))
const Login = lazy(() => import('./pages/Login'))
const Members = lazy(() => import('./pages/Members'))
const MyPage = lazy(() => import('./pages/MyPage'))
const PolicyProgress = lazy(() => import('./pages/PolicyProgress'))
const Register = lazy(() => import('./pages/Register'))
const Suggestions = lazy(() => import('./pages/Suggestions'))
const Vote = lazy(() => import('./pages/Vote'))

function scrollToTop() {
  window.scrollTo(0, 0)
}

function App() {
  const { pathname } = useLocation()

  useLayoutEffect(() => {
    scrollToTop()
  }, [pathname])

  useEffect(() => {
    const scrollBeforeNavigation = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

      const target = event.target instanceof Element ? event.target.closest('a') : null
      if (!(target instanceof HTMLAnchorElement) || target.target || target.hasAttribute('download')) return

      const url = new URL(target.href, window.location.href)
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return

      scrollToTop()
    }

    document.addEventListener('click', scrollBeforeNavigation, true)

    return () => {
      document.removeEventListener('click', scrollBeforeNavigation, true)
    }
  }, [])

  return (
    <Layout>
      <Suspense fallback={<div className="auth-card route-loading"><p>페이지를 불러오고 있습니다.</p></div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/members" element={<Members />} />
          <Route path="/login" element={<Login />} />
          <Route path="/mypage" element={<ProtectedRoute><MyPage /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
          <Route path="/club-dashboard" element={<ProtectedRoute><ClubDashboard /></ProtectedRoute>} />
          <Route path="/register" element={<Register />} />
          <Route path="/evaluation" element={<Evaluation />} />
          <Route path="/vote" element={<Vote />} />
          <Route path="/clubs" element={<ClubSupport />} />
          <Route path="/clubs/list" element={<ClubList />} />
          <Route path="/clubs/select/:priority" element={<ClubSelect />} />
          <Route path="/clubs/questions/:clubName" element={<ClubQuestions />} />
          <Route path="/suggestions" element={<Suggestions />} />
          <Route path="/progress" element={<PolicyProgress />} />
        </Routes>
      </Suspense>
    </Layout>
  )
}

export default App
