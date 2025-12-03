import React from 'react'
import NavBar from './components/NavBar'
import SideBar from './components/SideBar'
import Widgets from './components/Widgets'
import { Outlet } from 'react-router-dom'

const RootLayout = () => {
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