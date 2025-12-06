import React from 'react'
import Feed from './Feed'
const Feeds = ({ posts }) => {
  const hasPosts = Array.isArray(posts) && posts.length > 0;
  return (
    <div className="feeds">
      {hasPosts ? (
        posts.map((singlePost) => (
          <Feed key={singlePost._id} post={singlePost} />
        ))
      ) : (
        <div className="empty-feed-message">
          <h3>No posts yet</h3>
          <p>Be the first to share something!</p>
        </div>
      )}
    </div>
  )
}

export default Feeds;