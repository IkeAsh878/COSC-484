import React from 'react';
import { useEffect } from 'react';
import { logout, reset } from '../store/authSlice';
import { jwtDecode } from 'jwt-decode';
import { useDispatch, useSelector } from 'react-redux';


const useAuthMonitor = () => {
    const dispatch = useDispatch();
    const {user} = useSelector((state) => state.auth);

    // Limit time the user AFK
    // Change this to allow user to afk longer
    const IDLE_LIMIT = 15*60*1000;

    useEffect(() => {
        if(!user || !user.token) {
            return;
        }
        let idleTimer;
        // logout function
        const performLogout = (reason) => {
            alert(reason);
            dispatch(logout());
            dispatch(reset());
        }
        // check token expiration
        const checkTokenExpire = () => {
            try {
                const decoded = jwtDecode(user.token);
                // convert to token expiration to milliseconds
                const expirationTime = decoded.exp * 1000;
                if(Date.now() >= expirationTime) {
                    performLogout("Session expired.");
                }
            } catch (error) {
                performLogout("Invalid session");
            }
        }

        // check token time on load
        checkTokenExpire();

        // check token every minite
        const tokenDuration = setInterval(checkTokenExpire, 60 * 1000);

        // Idel timer
        const resetIdleTimer = () => {
            if (idleTimer) {
                clearTimeout(idleTimer);
            }
            idleTimer = setTimeout(() => {
                performLogout("Session expired due to inactivity.")
            }, IDLE_LIMIT);
        };

        // Listen to user interation with the website
        window.addEventListener('mousemove', resetIdleTimer);
        window.addEventListener('keydown', resetIdleTimer);
        window.addEventListener('click', resetIdleTimer);

        resetIdleTimer();

        return () => {
            clearInterval(tokenDuration);
            if (idleTimer) {
                clearTimeout(idleTimer);
            }
            window.removeEventListener('mousemove', resetIdleTimer);
            window.removeEventListener('keydown', resetIdleTimer);
            window.removeEventListener('click', resetIdleTimer);
        };

    }, [user, dispatch]);
};

export default useAuthMonitor