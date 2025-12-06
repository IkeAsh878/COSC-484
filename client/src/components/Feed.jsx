import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import ProfilePhoto from './ProfilePhoto';
import TimeAgo from 'react-timeago';
import { Link, useLocation } from 'react-router-dom';
import { BiSolidCommentDetail } from "react-icons/bi";
import { IoShareSocial, IoEllipsisHorizontal } from "react-icons/io5";
import LikePost from './LikePost';
import TrimParagraph from '../helpers/TrimParagraph';
import BookmarkPost from './BookmarkPost';

const API_URL = 'http://localhost:5000/api'

const Feed = ({ post }) => {
    const { _id, body, image, createdAt, comments, creator } = post || {};
    // If user was populated correctly, use their data. 
    // Otherwise, use placeholders.
    const postAuthor = creator || { username: "Unknown User", profilePic: null, _id: "" };
    const { user: currentUser } = useSelector((state) => state.auth);
    const location = useLocation();

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = (e) => {
        e.preventDefault(); // Prevent clicking the link behind the button
        setIsMenuOpen(!isMenuOpen);
    };

    // const handleDelete = () => console.log("Delete clicked");
    // const handleEdit = () => console.log("Edit clicked");

    return (
        <article className="post-card">

            {/* --- HEADER --- */}
            <header className="post-card-header">
                <Link to={`/users/${postAuthor._id}`} className='post-card-author-info'>
                    <ProfilePhoto image={postAuthor.profilePic} />
                    <div className="author-details">
                        <h4>{postAuthor.username}</h4>
                        <span className="timestamp"><TimeAgo date={createdAt} /></span>
                    </div>
                </Link>

                {/* Show Menu ONLY if: Current User is the Post Author */}
                {/* {currentUser?.id === postAuthor._id && (
                    <div className="post-options">
                        <button onClick={toggleMenu} className="options-btn">
                            <IoEllipsisHorizontal />
                        </button>

                        {isMenuOpen && (
                            <div className="options-dropdown">
                                <button onClick={handleEdit}>Edit</button>
                                <button onClick={handleDelete} className="delete-btn">Delete</button>
                            </div>
                        )}
                    </div>
                )} */}
            </header>

            {/* --- BODY --- */}
            <Link to={`/posts/${_id}`} className='post-card-content'>
                <div className="post-card-text">
                    <TrimParagraph text={body} maxLength={120} />
                </div>

                {image && (
                    <div className="post-card-media">
                        <img src={image} alt="Post content" loading="lazy" />
                    </div>
                )}
            </Link>

            {/* --- FOOTER --- */}
            <footer className="post-card-footer">
                <div className="interaction-buttons">
                    <LikePost post={post} />

                    <Link to={`/posts/${_id}`} className="post-card-action-btn">
                        <BiSolidCommentDetail />
                        {comments?.length > 0 && <small>{comments.length}</small>}
                    </Link>

                    <button className="post-card-action-btn">
                        <IoShareSocial />
                    </button>
                </div>

                <div className="post-card-bookmark-section">
                    <BookmarkPost post={post} />
                </div>
            </footer>
        </article>
    )
}

export default Feed