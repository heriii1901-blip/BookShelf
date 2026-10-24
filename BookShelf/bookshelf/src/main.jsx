import React from 'react'
import { createRoot } from 'react-dom/client'
import { Capacitor } from '@capacitor/core'
import { App as CapApp } from '@capacitor/app'
import App from './App'
import { runBack } from './utils'
import './index.css'

if (Capacitor.isNativePlatform()) {
  CapApp.addListener('backButton', () => {
    if (!runBack()) CapApp.exitApp()
  })
}

createRoot(document.getElementById('root')).render(<App />)
