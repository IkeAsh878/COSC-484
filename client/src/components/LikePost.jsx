import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { IoThumbsUpOutline, IoThumbsUp } from "react-icons/io5";
import axios from 'axios';

const LikePost = ({post}) => {

    const [currentPost, setCurrentPost] = useState(post);
    const { user } = useSelector((state) => state.auth);
    const userId = user?.id;
    const token = user?.token;

    const isLiked = currentPost?.likes?.includes(userId);
    const likeCount = currentPost?.likes?.length || 0;

    // If the prop 'post' changes, update local state
    useEffect(() => {
        setCurrentPost(post);
    }, [post]);

    const toggleLike = async (e) => {
        e.preventDefault();
        
        const previousState = { ...currentPost }; // Save backup in case of error
        
        // Manually update local state
        let updatedLikes;
        if (isLiked) {
            updatedLikes = currentPost.likes.filter(id => id !== userId); // Remove ID
        } else {
            updatedLikes = [...currentPost.likes, userId]; // Add ID
        }
        
        setCurrentPost(prev => ({ ...prev, likes: updatedLikes }));

        try {
            const response = await axios.patch(
                `${import.meta.env.VITE_API_URL}/posts/${post._id}/like`,
                {}, 
                { withCredentials: true, headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data) {
                setCurrentPost(response.data);
            }

        } catch (error) {
            console.error("Like failed:", error);
            setCurrentPost(previousState);
        }
    }

    return (
        <button 
            className={`post-card-action-btn like-btn ${isLiked ? 'active' : ''}`} 
            onClick={toggleLike}
            style={{ cursor: 'pointer', color: isLiked ? '#212529' : 'inherit' }}
        >
            {isLiked ? <IoThumbsUp /> : <IoThumbsUpOutline />}
            <small>{likeCount > 0 ? likeCount : ''}</small>
        </button>
    )
}

export default LikePost;