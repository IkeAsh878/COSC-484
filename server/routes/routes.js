const router = require("express").Router();

// -------------------------------------------------------------------------------------------

// User Controllers
const {registerUser, loginUser, getUser, getUsers, editUser, 
    followUnfollowUser, changeUserPfp} = require ("../controllers/userControllers");

// Post controllers
const {createPost, updatePost, deletePost, getPost, 
    getPosts, getUserPosts, getUserBookmarks, createBookmark, 
    getFollowingPosts, likeDislikePost} = require("../controllers/postControllers");

// Comment controllers
const {createComment, getComment, deleteComment} = require("../controllers/commentControllers");

// Message controllers
const {createMessage, getMessages, getConversations} = require("../controllers/messageControllers");

// Authorization middleware
const authMiddleware = require("../middleware/authMiddleware");

// ------------------------------------------------------------------------------------------
// User routes
router.post("/users/register", registerUser);
router.post("/users/login", loginUser);
router.get("/users/bookmarks", authMiddleware, getUserBookmarks);
router.get("/users/:id", authMiddleware, getUser);
router.get("/users", authMiddleware, getUsers);
router.patch("/users/:id", authMiddleware, editUser);
router.get("/users/:id/follow-unfollow", authMiddleware, followUnfollowUser);
router.post("/users/avatar",  authMiddleware, changeUserPfp);
router.get("/users/:id/posts", authMiddleware, getUserPosts);

// ------------------------------------------------------------------------------------------
// Post routes
router.post("/posts", authMiddleware, createPost);
// order matter since getFollowing can be misintepreted 
// the following endpoint as id endpoint for getPost
// so we put in before getPost
router.get("/posts/following", authMiddleware, getFollowingPosts);
router.get("/posts/:id", authMiddleware, getPost);
router.get("/posts", authMiddleware, getPosts);
router.patch("/posts/:id", authMiddleware, updatePost);
router.delete("/posts/:id", authMiddleware, deletePost);
router.get("/posts/:id/like", authMiddleware, likeDislikePost);
router.get("/posts/:id/bookmark", authMiddleware, createBookmark);

// -------------------------------------------------------------------------------------------
// Comment routes
router.post("/comments/:postId", authMiddleware, createComment);
router.get("/comments/:postId", authMiddleware, getComment);
router.delete("/comments/:commentId", authMiddleware, deleteComment);

// -------------------------------------------------------------------------------------------
// Message routes
router.post("/messages/:receiverId", authMiddleware, createMessage);
router.get("/messages/:receiverId", authMiddleware, getMessages);
router.get("/conversations", authMiddleware, getConversations);


module.exports = router;