import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { loginUser, registerUser, reset } from '../store/authSlice';

// Import icons to use
import { IoMail, IoLockClosed, IoPerson, IoSchool, IoPersonCircle } from "react-icons/io5";

const LoginSignup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // check if the web is logged in
  const isRegisterMode = location.pathname === '/register';
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    school: ''
  });

  const { fullName, username, email, password, confirmPassword, school } = formData;
  const { user, isLoading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    if (error) {
      alert(error);
      dispatch(reset());
    }

    if (user) {
      navigate('/');
    }
  }, [user, error, navigate, dispatch]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser({ email, password }));
  }

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    // Check password consistency before send to backend
    if (password !== confirmPassword) {
      alert("Password do not match");
      return;
    }

    dispatch(registerUser({ fullName, username, email, password, confirmPassword, school }));
  }

  const goToRegister = (e) => {
    e.preventDefault();
    navigate('/register');
  };

  const goToLogin = (e) => {
    e.preventDefault();
    navigate('/login');
  }

  return (
    <div className={`wrapper ${isRegisterMode ? 'active' : ''}`}>
      {/* Login Form */}
      <div className="form-box login">
        <h2>Login</h2>
        <form onSubmit={handleLoginSubmit}>

          {/* Email */}
          <div className="input-box">
            <span className="icon"><IoMail /></span>
            <input type="email" name="email" placeholder="Email" value={email} onChange={onChange} required />
          </div>

          {/* Password */}
          <div className="input-box">
            <span className="icon"><IoLockClosed /></span>
            <input type="password" name="password" placeholder="Password" value={password} onChange={onChange} required />
          </div>
          <button type="submit" className="btn sbt-btn" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
          <div className="login-register">
            <p>Don't have an account? <a href="#" className="register-link" onClick={goToRegister}> Register</a></p>
          </div>
        </form>
      </div>

      {/* Signup Form */}
      <div className="form-box signup">
        <h2>Sign Up</h2>
        <form onSubmit={handleRegisterSubmit}>

          {/* Full Name */}
          <div className="input-box">
            <span className="icon"><IoPerson /></span>
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={fullName}
              onChange={onChange}
              required
            />
          </div>

          {/* Username */}
          <div className="input-box">
            <span className="icon"><IoPersonCircle /></span>
            <input type="text" name="username" placeholder="Username" value={username} onChange={onChange} required />
          </div>

          {/* School */}
          <div className="input-box">
            <span className="icon"><IoSchool /></span>
            <input
              type="text"
              name="school"
              placeholder="School"
              value={school}
              onChange={onChange}
              required
            />
          </div>

          {/* Email */}
          <div className="input-box">
            <span className="icon"><IoMail /></span>
            <input type="email" name="email" placeholder="Email" value={email} onChange={onChange} required />
          </div>

          {/* Password */}
          <div className="input-box">
            <span className="icon"><IoLockClosed /></span>
            <input type="password" name="password" placeholder="Password" value={password} onChange={onChange} required />
          </div>

          {/* Confirm Password */}
          <div className="input-box">
            <span className="icon"><IoLockClosed /></span>
            <input type="password" name="confirmPassword" placeholder="Re-Type Your Password" value={confirmPassword} onChange={onChange} required />
          </div>

          <button type="submit" className="btn sbt-btn" disabled={isLoading}>
            {isLoading ? 'Registering...' : 'Register'}
          </button>

          <div className="login-register">
            <p>Already have an account? <a href="#" className="login-link" onClick={goToLogin}> Login</a></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginSignup