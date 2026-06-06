import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './App.css'
import { ReactLenis } from '@studio-freight/react-lenis'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* This wrapper gives the entire page the smooth-scroll physics */}
    <ReactLenis root options={{ lerp: 0.1, duration: 1.5, smoothWheel: true }}>
      <App />
    </ReactLenis>
  </React.StrictMode>,
)