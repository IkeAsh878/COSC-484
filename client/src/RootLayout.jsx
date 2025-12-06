import React from 'react'
import NavBar from './components/NavBar'
import SideBar from './components/SideBar'
import Widgets from './components/Widgets'
import { Outlet, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import useAuthMonitor from './hooks/useAuthMonitor'


const RootLayout = () => {
  const {user} = useSelector(state => state.auth);
  useAuthMonitor();

  if (!user) {
    return <Navigate to='/login' replace />
  }
  return (
    <>
        <NavBar />
        <main className='main'>
            <div className="container main-container">
                <SideBar />
                <Outlet /> 
                <Widgets />
            </div>
        </main>
    
    </>
  )
}

export default RootLayout