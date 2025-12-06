import React, { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import CreatePost from '../components/CreatePost';
import Feeds from '../components/Feeds';
import axios from 'axios';

const Home = () => {
  const [feed, setFeed] = useState([]); // posts->feeds
  const [isFeedLoading, setIsFeedLoading] = useState(false);
  const [postError, setPostError] = useState("");
  const { user } = useSelector((state) => state.auth);
  const token = user?.token;

  const BASE_URL = import.meta.env.VITE_API_URL;

  // Get Authorization
  const getAuthConfig = useCallback(() => ({
    withCredentials: true,
    headers: { Authorization: `Bearer ${token}` }
  }), [token]);

  const fetchPosts = useCallback(async () => {
    // stop when there is no token
    if (!token) {
      return;
    }

    setIsFeedLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/posts`, getAuthConfig());
      setFeed(response.data);
    } catch (err) {
      console.error("Error fetching feed:", err);
    } finally {
      setIsFeedLoading(false);
    }
  }, [token, BASE_URL, getAuthConfig]);

  const handleCreatePost = async(postData) => {
    setPostError("");
    try {
      const response = await axios.post(`${BASE_URL}/posts`, postData, getAuthConfig());

      const newPost = response.data;
      setFeed(prevFeed => [newPost, ...prevFeed]);

    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to create post.";
      setPostError(errorMessage);
    }
  }

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts])

  return (
    <section className="main-body">
      <CreatePost onCreatePost={handleCreatePost} error={postError} />
      {isFeedLoading ? (
        // Loading the feed
        <div style={{ textAlign: 'center', padding: '20px' }}>Loading...</div>
      ) : (
        <Feeds posts={feed} onSetPosts={setFeed} />
      )}
    </section>
  )
}

export default Home