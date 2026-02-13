// ============================================
// App - Route Configuration
// ============================================
// Uses React Router for navigation between screens

import { Routes, Route, Navigate } from 'react-router-dom'

// Screens
import { UploadScreen } from '@/features/upload'
import { AssignScreen, ResultsScreen } from '@/features/splitter'

function App() {
  return (
    <Routes>
      {/* Home - Upload/Start screen */}
      <Route path="/" element={<UploadScreen />} />
      
      {/* Split - Item assignment screen */}
      <Route path="/split" element={<AssignScreen />} />
      
      {/* Results - Final summary screen */}
      <Route path="/results" element={<ResultsScreen />} />
      
      {/* Fallback - Redirect unknown routes to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
