import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import axios from 'axios';
import { IoBookmark, IoBookmarkOutline } from "react-icons/io5";


const BookmarkPost = ({post}) => {
    const { user } = useSelector((state) => state.auth);
    const token = user?.token;

    // Check if the current post ID exists in the user's bookmarks list from Redux
    const [isBookmarked, setIsBookmarked] = useState(
        user?.bookmarks?.includes(post?._id) || false
    );

    // If Redux updates (e.g. user bookmarks another post elsewhere), sync this action
    // so you can see the effect on whatever page you are on
    useEffect(() => {
        if (user?.bookmarks && post?._id) {
            setIsBookmarked(user.bookmarks.includes(post._id));
        }
    }, [user, post]);

    const toggleBookmark = async (e) => {
        e.preventDefault();
        const previousState = isBookmarked;
        setIsBookmarked(!previousState);

        try {
            const response = await axios.patch(
                `${import.meta.env.VITE_API_URL}/posts/${post?._id}/bookmark`,
                {},
                { 
                    withCredentials: true, 
                    headers: { Authorization: `Bearer ${token}` } 
                }
            );

            // Backend returns the updated ARRAY of bookmarks.
            // We verify if our ID is in there.
            const updatedBookmarks = response.data;
            if (Array.isArray(updatedBookmarks)) {
                setIsBookmarked(updatedBookmarks.includes(post?._id));
            }

        } catch (error) {
            console.error("Bookmark action failed:", error);
            // Revert UI if server fails
            setIsBookmarked(previousState);
        }
    };


    return (
        <button className="post-card-footer-bookmark" onClick={toggleBookmark}>
            {isBookmarked ? <IoBookmark /> : <IoBookmarkOutline />}
        </button>
    )
}

export default BookmarkPost