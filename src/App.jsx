import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Squares from './components/Squares/Squares';
import Lanyard from './components/Lanyard/Lanyard';

function App() {
  return (
    <>
    <div className='h-screen w-screen fixed inset-0 overflow-hidden'>
      {/* Background layer with lower z-index */}
      <div className="absolute inset-0 z-0">
        <Squares
          speed={0.25}
          squareSize={40}
          direction='up' // up, down, left, right, diagonal
          borderColor='#fff'
          hoverFillColor='#222'
        />
      </div>
      
      {/* Foreground layer with higher z-index */}
      <div className="absolute inset-0 z-20 flex items-center justify-center">
        <Lanyard position={[5, 0, 15]} gravity={[0, -40, 0]} />
      </div>
    </div>
    </>
  )
}

export default App
