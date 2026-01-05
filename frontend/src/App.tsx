import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css'
import ChatPage from './ui/message'
import SignupPage from './ui/SignupPage';
import SigninPage from './ui/SigninPage';
import DashboardPage from './ui/DashboardPage';

function App() {
  return (
    <Router>
      
      <Routes>
        <Route path='*' element={<SignupPage /> }  />
        <Route path='/' element={<Navigate to="/signup" replace />} />
        <Route path='/signup' element={<SignupPage /> }  />
        <Route path='/login' element={<SigninPage /> } />
        <Route path='/dashboard' element={<DashboardPage />} />
        <Route path='/chat' element={<ChatPage />} />
      </Routes>
    </Router>
  )
}

export default App