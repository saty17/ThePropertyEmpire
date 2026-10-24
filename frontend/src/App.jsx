import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './components/DashboardLayout'
import Login from './pages/Login'
import Signup from './pages/Signup'
import VerifyOtp from './pages/VerifyOtp'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import RegistrationSuccess from './pages/RegistrationSuccess'
import Home from './pages/dashboard/Home'
import Profile from './pages/dashboard/Profile'
import MyDirect from './pages/dashboard/MyDirect'
import MyTeam from './pages/dashboard/MyTeam'
import GenerationTree from './pages/dashboard/GenerationTree'
import LevelInfo from './pages/dashboard/LevelInfo'
import ReferAndEarn from './pages/dashboard/ReferAndEarn'

function AppRoutes() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/registration-success" element={<RegistrationSuccess />} />

      <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<Home />} />
        <Route path="profile" element={<Profile />} />
        <Route path="network/my-direct" element={<MyDirect />} />
        <Route path="network/my-team" element={<MyTeam />} />
        <Route path="network/generation-tree" element={<GenerationTree />} />
        <Route path="network/level-info" element={<LevelInfo />} />
        <Route path="refer" element={<ReferAndEarn />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>

      <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
    </Routes>
  )
}

export default function App() {
  return <AppRoutes />
}
