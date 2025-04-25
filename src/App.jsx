import { useState, useEffect } from 'react'
import './App.css'
import Squares from './components/Squares/Squares';
import Lanyard from './components/Lanyard/Lanyard';
import logo from '/crypto2.png'
// Import GitHub logo
import githubLogo from '/github.png' // Make sure to add this file to your public folder
import { Analytics } from "@vercel/analytics/react"


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
    <Analytics />
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
        <img src={logo} className="h-10 drop-shadow-[0px_0px_18px_rgba(148,194,255,1)]" alt="Crypto Darth logo" />
      </div>
      
      {/* GitHub logo in top right corner */}
      <div className="absolute top-6 right-8 z-30">
        <a href="https://github.com/Crypto-Darth" target="_blank" rel="noopener noreferrer">
          <img 
            src={githubLogo} 
            className="h-8 w-8 drop-shadow-[0px_0px_18px_rgba(148,194,255,1)] hover:opacity-80 transition-opacity" 
            alt="GitHub" 
          />
        </a>
      </div>
      
      {/* Coming Soon text at bottom center */}
      <div className="absolute bottom-8 left-0 right-0 z-30 flex justify-center">
        <p className="font-archimoto md:text-2xl text-lg text-white tracking-wider drop-shadow-[0px_0px_18px_rgba(148,194,255,1)]">
          COMING SOON
        </p>
      </div>
      
      {/* Foreground layer with higher z-index */}
      <div className="absolute inset-0 z-20 flex items-center justify-center">
        <Lanyard position={[5, 0, 15]} gravity={[0, -40, 0]} transparent={true} />
      </div>
    </div>
    </>
  )
}

export default App
