import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
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

function App() {
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
          <Route path="/register" element={<ProtectedRoute><Register /></ProtectedRoute>} />
          <Route path="/evaluation" element={<ProtectedRoute><Evaluation /></ProtectedRoute>} />
          <Route path="/clubs" element={<ProtectedRoute><ClubSupport /></ProtectedRoute>} />
          <Route path="/clubs/list" element={<ProtectedRoute><ClubList /></ProtectedRoute>} />
          <Route path="/clubs/select/:priority" element={<ProtectedRoute><ClubSelect /></ProtectedRoute>} />
          <Route path="/clubs/questions/:clubName" element={<ProtectedRoute><ClubQuestions /></ProtectedRoute>} />
          <Route path="/suggestions" element={<ProtectedRoute><Suggestions /></ProtectedRoute>} />
          <Route path="/progress" element={<PolicyProgress />} />
        </Routes>
      </Suspense>
    </Layout>
  )
}

export default App
