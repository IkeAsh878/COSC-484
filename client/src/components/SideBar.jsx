import React from 'react'
import { NavLink } from 'react-router-dom';
import { IoHome, IoChatbubbles, IoPerson, IoHelpCircle, IoBookmark } from "react-icons/io5";

const SideBar = () => {
  return (
    <menu className='sidebar'>
      <NavLink to="/" className='sidebar-item'>
        <i className='sidebar-icon'><IoHome /></i>
        <p>Home</p>
      </NavLink>
      <NavLink to="users/:id" className={`sidebar-item ${({isActive}) => isActive ? "active" : ""}`}>
        <i className='sidebar-icon'><IoPerson /></i>
        <p>Profile</p>
      </NavLink>
      <NavLink to="messages/:receiverId" className={`sidebar-item ${({isActive}) => isActive ? "active" : ""}`}>
        <i className='sidebar-icon'><IoChatbubbles /></i>
        <p>Message</p>
      </NavLink>
      <NavLink to="/bookmarks" className={`sidebar-item ${({isActive}) => isActive ? "active" : ""}`}>
        <i className='sidebar-icon'><IoBookmark /></i>
        <p>Bookmarks</p>
      </NavLink>
      <NavLink to="/asdfasd" className={`sidebar-item ${({isActive}) => isActive ? "active" : ""}`}>
        <i className='sidebar-icon'><IoHelpCircle /></i>
        <p>Support</p>
      </NavLink>
    </menu>
  )
}

export default SideBar