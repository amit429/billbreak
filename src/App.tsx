// ============================================
// App - Screen Router
// ============================================
// Routes between screens based on current bill status

import { useBill } from '@/context/bill'
import { BillStatus } from '@/types'

// Screens
import { UploadScreen } from '@/features/upload'
import { AssignScreen, ResultsScreen } from '@/features/splitter'

function App() {
  const { state } = useBill()

  // Route based on current status
  switch (state.currentStatus) {
    case BillStatus.UPLOAD:
      return <UploadScreen />

    case BillStatus.ASSIGN:
      return <AssignScreen />

    case BillStatus.RESULTS:
      return <ResultsScreen />

    default:
      return <UploadScreen />
  }
}

export default App
