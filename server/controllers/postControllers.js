const HttpError = require("../models/errorModel");
const Post = require("../models/postModel");
const User = require("../models/userModel");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");
const cloudinary = require("../utils/cloudinary");

// --------- Post Creation ----------
// POST: api/posts
// Protected

const createPost = async (req, res, next) => {
  try {
    const { body } = req.body;

    if (!body || body.trim().length === 0) {
      return next(new HttpError("Post content cannot be empty", 422));
    }

    let secureCloudinaryUrl = "";

    // if user include image in their post
    if (req.files && req.files.image) {
      const { image } = req.files;
      // Check file size (1MB limit)
      if (image.size > 1000000) {
        return next(new HttpError("File size too large (Max 1MB)", 422));
      }

      // Generate unique image filename
      const fileExt = image.name.split(".").pop();
      const uniqueFileName = `${uuidv4()}.${fileExt}`;
      const uploadPath = path.join(__dirname, "..", "uploads", uniqueFileName);

      // Move file to local 'uploads' folder
      await image.mv(uploadPath);

      try {
        // Upload to Cloudinary
        const cloudResponse = await cloudinary.uploader.upload(uploadPath, {
          resource_type: "image",
        });

        if (!cloudResponse.secure_url) {
          throw new Error("Cloudinary upload failed");
        }

        secureCloudinaryUrl = cloudResponse.secure_url;
        // Delete the local file to save server space
        fs.unlink(uploadPath, (err) => {
          if (err) {
            console.error("Failed to clear local file", err);
          }
        });
      } catch (uploadError) {
        return next(new HttpError(uploadError, 500));
      }
    }
    const newPost = await Post.create({
      creator: req.user.id,
      body: body,
      image: secureCloudinaryUrl,
    });

    if (newPost) {
      const currentUser = await User.findById(req.user.id);
      if (currentUser) {
        currentUser.posts.push(newPost._id);
        await currentUser.save();
      }
    }

    const populatedPost = await newPost.populate(
      "creator",
      "username profilePic school"
    );
    res.status(201).json(populatedPost);
  } catch (error) {
    return next(new HttpError("Post creation failed.", 500));
  }
};

// --------- Fecth post ----------
// get single post
// GET: api/posts/:id
// Protected

const fetchPost = async (req, res, next) => {
  try {
    const { id: postId } = req.params;

    const postItem = await Post.findById(postId)
      .populate("creator", "username profilePic school")
      .populate({
        path: "comments",
        select: "body creator createdAt", // Only get what we need
        options: { sort: { createdAt: -1 } },
      })
      .lean();

    // If ID is valid format but post doesn't exist, return error
    if (!postItem) {
      return next(new HttpError("Post not found", 404));
    }
    res.status(200).json(postItem);
  } catch (err) {
    return next(new HttpError("Could not fetch post details.", 500));
  }
};

// --------- Fetch feed ----------
// get all posts
// GET: api/posts
// Protected

const fetchFeed = async (req, res, next) => {
  try {
    const feed = await Post.find()
      .sort({ createdAt: -1 })
      .populate("creator", "username profilePic school")
      .lean();
    res.status(200).json(feed);
  } catch (error) {
    return next(new HttpError("Fetching posts failed, please try again.", 500));
  }
};

// --------- Post Update ----------
// Only edit the text body of the post not the picture
// PATCH: api/posts/:id
// Protected

const updatePost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const { body } = req.body;

    // fetch post form db
    const post = await Post.findById(postId);
    // check if the updated is the creator
    if (post?.creator != req.user.id) {
      return next(
        new HttpError(
          "You can edit this post because you are not the owner",
          403
        )
      );
    }
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { body },
      { new: true }
    );
    res.json(updatedPost).status(200);
  } catch (error) {
    return next(new HttpError(error));
  }
};

// --------- Post Delete ----------
// DELETE: api/posts/:id
// Protected

const deletePost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    // fetch post form db
    const post = await Post.findById(postId);
    // check if the updated is the creator
    if (post?.creator != req.user.id) {
      return next(
        new HttpError(
          "You can edit this post because you are not the owner",
          403
        )
      );
    }
    const deletedPost = await Post.findByIdAndDelete(postId);
    // Delete posts from user's posts array
    await User.findByIdAndUpdate(deletedPost?.creator, {
      $pull: { posts: deletedPost?._id },
    });
    res.json(deletedPost).status(200);
  } catch (error) {
    return next(new HttpError(error));
  }
};

// --------- Following Posts ----------
// Able to get the post of whom we are following
// GET: api/posts/following
// Protected

const getFollowingPosts = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const posts = await Post.find({ creator: { $in: user?.following } });
    res.json(posts);
  } catch (error) {
    return next(new HttpError(error));
  }
};

// --------- Like post ----------
// PATCH: api/posts/:id/like
// Protected

const toggleLikeStatus = async (req, res, next) => {
  try {
    const { id: postId } = req.params;
    const currentUserId = req.user.id;

    // Find the post first to check its current state
    const targetPost = await Post.findById(postId);

    if (!targetPost) {
      return next(new HttpError("Post not found", 404));
    }

    // Check if user already liked it
    const isLiked = targetPost.likes.includes(currentUserId);

    const updateOperator = isLiked
      ? { $pull: { likes: currentUserId } }
      : { $push: { likes: currentUserId } };

    const updatedPost = await Post.findByIdAndUpdate(postId, updateOperator, {
      new: true,
    }).populate("creator", "username profilePic school");
    res.status(200).json(updatedPost);
  } catch (error) {
    return next(new HttpError("Could not update like status.", 500));
  }
};

// --------- Get users posts ----------
// Retrieve posts of the specific user
// GET: api/users/:id/posts
// Protected

const getUserPosts = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const posts = await User.findById(userId).populate({
      path: "posts",
      options: { sort: { createdAt: -1 } },
    });
    res.json(posts);
  } catch (error) {
    return next(new HttpError(error));
  }
};

// --------- Bookmark posts ----------
// PATCH: api/posts/:id/bookmark
// Protected

const toggleBookmark = async (req, res, next) => {
  try {
    const { id: postId } = req.params;
    const userId = req.user.id;

    // Fetch the user to check current bookmark status
    const currentUser = await User.findById(userId);

    if (!currentUser) {
      return next(new HttpError("User not found", 404));
    }
    // check if post already in the bookmark list
    //  if not delete, else add to bookmark list
    const isAlreadyBookmarked = currentUser.bookmarks.includes(postId);

    const updateQuery = isAlreadyBookmarked
      ? { $pull: { bookmarks: postId } }
      : { $push: { bookmarks: postId } };

    const updatedUser = await User.findByIdAndUpdate(userId, updateQuery, {
      new: true,
    });

    res.status(200).json(updatedUser.bookmarks);
  } catch (error) {
    return next(new HttpError(error));
  }
};

// --------- Get bookmarked posts ----------
// GET: api/users/bookmarks
// Protected

const fetchBookmarkedPosts = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const userWithBookmarks = await User.findById(userId)
      .select("bookmarks")
      .populate({
        path: "bookmarks",

        options: { sort: { createdAt: -1 } },
        populate: { path: "creator", select: "username profilePic" },
      });

    if (!userWithBookmarks) {
      return next(new HttpError("User not found.", 404));
    }
    
    res.status(200).json(userWithBookmarks.bookmarks);
  } catch (error) {
    return next(new HttpError(error));
  }
};

module.exports = {
  createPost,
  updatePost,
  deletePost,
  fetchPost,
  fetchFeed,
  getUserPosts,
  fetchBookmarkedPosts,
  toggleBookmark,
  getFollowingPosts,
  toggleLikeStatus,
};
