import './App.css'
import Home from './pages/Home'
import InvestmentsPage from './pages/Investments'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/investments" element={<InvestmentsPage />} />
        <Route path="*" element={<div>Not Found</div>} />
      </Routes>
    </Router>
  )
}

function HomePage() {
  return (
    <Home />
  )
}

export default App
