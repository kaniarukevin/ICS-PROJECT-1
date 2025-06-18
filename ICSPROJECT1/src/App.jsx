import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Approuter from './Approuter'
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className='App'>
        <Approuter />
      </div>
    </>
  )
}

export default App
