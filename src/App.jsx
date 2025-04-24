import { useState, useEffect } from 'react'
import './App.css'
import Squares from './components/Squares/Squares';
import Lanyard from './components/Lanyard/Lanyard';
import logo from '/crypto2.png'

function App() {
  useEffect(() => {
    // Load the custom font
    const font = new FontFace('Archimoto', `url(/archimoto.otf)`);
    font.load().then(() => {
      document.fonts.add(font);
      document.body.classList.add('fonts-loaded');
    });
  }, []);
  
  return (
    <>
    <div className='h-screen w-screen fixed inset-0 overflow-hidden'>
      {/* Background layer with lower z-index */}
      <div className="absolute inset-0 z-0">
        <Squares
          speed={0.4}
          squareSize={40}
          direction='up' // up, down, left, right, diagonal
          borderColor='#4d4d4d'
          hoverFillColor='#222'
        />
      </div>
      
      {/* Logo in top left corner */}
      <div className="absolute top-6 left-8 z-30">
        <img src={logo} className="h-10 drop-shadow-[0px_0px_18px_rgba(148,194,255,1)]" alt="React logo" />
      </div>
      
      {/* Coming Soon text at top right */}
      <div className="absolute top-6 right-8 z-30">
        <p className="font-archimoto md:text-xl text-sm text-white tracking-wider drop-shadow-[0px_0px_18px_rgba(148,194,255,1)]">
          COMING SOON
        </p>
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
