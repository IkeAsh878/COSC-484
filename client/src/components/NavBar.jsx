import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/brainwave_logo.svg';
import { IoSearch } from "react-icons/io5";
import ProfilePhoto from './ProfilePhoto';
import { useDispatch, useSelector } from 'react-redux';
import { logout, reset } from '../store/authSlice';


const NavBar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const {user} = useSelector((state) => state.auth);

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate('/');
  };

  const onLogin = () => {
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className='nav-logo'>
          {/* Add image to link so that user return to home when click */}
          <img src={logo} alt="Logo" />
        </Link>
        <form className = "navbar-search" action="">
          <input type="search" placeholder='Search..' />
          <button type='submit'><IoSearch /></button>
        </form>
        <div className="navbar-right">
          {/* Show pfp when user is login */}
          {user && (
            <Link to={`/user/${user.id}`} className='navbar_profile'>
              <ProfilePhoto image={user.profilePic || 'NO IMAGE'} />
            </Link>
          )}
          {user ? (
            // If user exists, show Logout Button
            <button onClick={onLogout} className="logout-btn">Logout</button>
          ) : (
            // If no user, show Login Link
            <button onClick={onLogin} className="login-btn">Login</button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default NavBar