import { useEffect, useLayoutEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import { adminRoute } from './config'
import Admin from './pages/Admin'
import ClubDashboard from './pages/ClubDashboard'
import ClubList from './pages/ClubList'
import ClubQuestions from './pages/ClubQuestions'
import ClubSelect from './pages/ClubSelect'
import ClubSupport from './pages/ClubSupport'
import Evaluation from './pages/Evaluation'
import Home from './pages/Home'
import Login from './pages/Login'
import Members from './pages/Members'
import MyPage from './pages/MyPage'
import PolicyProgress from './pages/PolicyProgress'
import Register from './pages/Register'
import Suggestions from './pages/Suggestions'
import Vote from './pages/Vote'

function scrollToTop() {
  window.scrollTo(0, 0)
}

function resizeTextarea(textarea: HTMLTextAreaElement) {
  textarea.style.height = 'auto'
  textarea.style.height = `${textarea.scrollHeight}px`
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

  useEffect(() => {
    const resizeTarget = (event: Event) => {
      if (event.target instanceof HTMLTextAreaElement) {
        resizeTextarea(event.target)
      }
    }

    const resizeAll = () => {
      document.querySelectorAll('textarea').forEach((textarea) => resizeTextarea(textarea))
    }
    const observer = new MutationObserver(resizeAll)

    resizeAll()
    requestAnimationFrame(resizeAll)
    observer.observe(document.body, { childList: true, subtree: true })
    document.addEventListener('input', resizeTarget)
    window.addEventListener('resize', resizeAll)

    return () => {
      observer.disconnect()
      document.removeEventListener('input', resizeTarget)
      window.removeEventListener('resize', resizeAll)
    }
  }, [pathname])

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/members" element={<Members />} />
        <Route path="/login" element={<Login />} />
        <Route path="/mypage" element={<ProtectedRoute><MyPage /></ProtectedRoute>} />
        <Route path="/admin" element={<Navigate to="/" replace />} />
        {adminRoute && <Route path={adminRoute} element={<ProtectedRoute requireAdmin><Admin /></ProtectedRoute>} />}
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default App
