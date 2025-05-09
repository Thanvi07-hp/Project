import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from "./components/ui/ThemeContext";

createRoot(document.getElementById('root')).render(
  // <StrictMode>
  //   <ThemeProvider>
  //   <AuthProvider>
  //     <App />
  //   </ThemeProvider>
  //   </AuthProvider>
  // </StrictMode>,
  <StrictMode>
    <ThemeProvider>
    
      <App />
   
    </ThemeProvider>
  </StrictMode>
)
