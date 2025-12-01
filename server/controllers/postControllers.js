const HttpError = require("../models/errorModel");
const PostModel = require("../models/postModel");
const UserModel = require("../models/userModel");
const uuid = require("uuid").v4;
const fs = require("fs");
const path = require("path");
const cloudinary = require("../utils/cloudinary");

// --------- Post Creation ----------
// POST: api/posts
// Protected

const createPost = async(req, res, next) => {
    try {
        const {body} = req.body;
        // res.json(req.files);
        if(!body) {
            return next(new HttpError("Fill in some contents", 422));
        }

        if (!req.files) {
            const newPost = await PostModel.create({creator: req.user.id, body})
            await UserModel.findByIdAndUpdate(newPost?.creator, {$push: {posts:newPost?._id}})
            res.json(newPost).status(200);
        }
        // When user include image in their post
        if(req.files.image) {
            const {image} = req.files;
            // Image should be less than 1MB
            if (image.size > 1000000) {
                return next(new HttpError("Image size is too large", 422));
            }
            // rename image
            let fileName = image.name;
            let splittedFileName = fileName.split('.');
            let newFileName = splittedFileName[0] + uuid() + "." + splittedFileName[splittedFileName.length - 1];
            await image.mv(path.join(__dirname, "..", "uploads", newFileName), async(err) => {
                if (err) {
                    return next(new HttpError(err));
                }
                // store image on cloudinary
                const result = await cloudinary.uploader.upload(path.join(__dirname, "..", "uploads", newFileName),
                {resource_type: "image"});
                if (!result.secure_url) {
                    return next(new HttpError("Could not upload image to cloudinary", 422));
                }
                // save post to db
                const newPost = await PostModel.create({creator: req.user.id, body, image: result.secure_url})
                await UserModel.findByIdAndUpdate(newPost?.creator, {$push: {posts:newPost?._id}})
                res.json(newPost).status(200);
            })
        }
    } catch (error) {
        return next(new HttpError(error));
    }
}


// --------- Post Get ----------
// GET: api/posts/:id
// Protected

const getPost = async(req, res, next) => {
    try {
        const {id} = req.params;
        const post = await PostModel.findById(id).populate("creator").populate({path: "comments", 
            options: {sort: {createdAt: -1}}
        });
        res.json(post).status(200);
    } catch (error) {
        return next(new HttpError(error));
    }
}


// --------- Posts Get ----------
// GET: api/posts
// Protected

const getPosts = async(req, res, next) => {
    try {
        const posts = await PostModel.find().sort({createdAt: -1});
        res.json(posts).status(200);
    } catch (error) {
        return next(new HttpError(error));
    }
}


// --------- Post Update ----------
// Only edit the text body of the post not the picture
// PATCH: api/posts/:id
// Protected

const updatePost = async(req, res, next) => {
    try {
        const postId = req.params.id;
        const {body} = req.body;

        // fetch post form db
        const post = await PostModel.findById(postId);
        // check if the updated is the creator
        if (post?.creator != req.user.id) {
            return next(new HttpError("You can edit this post because you are not the owner", 403));
        }
        const updatedPost = await PostModel.findByIdAndUpdate(postId, {body}, {new: true});
        res.json(updatedPost).status(200);
    } catch (error) {
        return next(new HttpError(error));
    }
}


// --------- Post Delete ----------
// DELETE: api/posts/:id
// Protected

const deletePost = async(req, res, next) => {
    try {
        const postId = req.params.id;
        // fetch post form db
        const post = await PostModel.findById(postId);
        // check if the updated is the creator
        if (post?.creator != req.user.id) {
            return next(new HttpError("You can edit this post because you are not the owner", 403));
        }
        const deletedPost = await PostModel.findByIdAndDelete(postId);
        // Delete posts from user's posts array
        await UserModel.findByIdAndUpdate(deletedPost?.creator, {$pull: {posts:deletedPost?._id}});
        res.json(deletedPost).status(200);
    } catch (error) {
        return next(new HttpError(error));
    }
}


// --------- Following Posts ----------
// Able to get the post of whom we are following
// GET: api/posts/following
// Protected

const getFollowingPosts = async(req, res, next) => {
    try {
        const user = await UserModel.findById(req.user.id);
        const posts = await PostModel.find({creator: {$in: user?.following}});
        res.json(posts);
    } catch (error) {
        return next(new HttpError(error));
    }
}


// --------- Like/dislike post ----------
// GET: api/posts/:id/like
// Protected

const likeDislikePost = async(req, res, next) => {
    try {
        const {id} = req.params;
        const post = await PostModel.findById(id);
        // Check if the post has been liked by the user
        let updatedPost;
        if(post?.likes.includes(req.user.id)) {
            updatedPost = await PostModel.findByIdAndUpdate(id, {$pull: {likes: req.user.id}}, {new: true});
        } else {
            updatedPost = await PostModel.findByIdAndUpdate(id, {$push: {likes: req.user.id}}, {new: true});
        }
        res.json(updatedPost).status(200);
    } catch (error) {
        return next(new HttpError(error));
    }
}


// --------- Get users posts ----------
// Retrieve posts of the specific user
// GET: api/users/:id/posts
// Protected

const getUserPosts = async(req, res, next) => {
    try {
        const userId = req.params.id;
        const posts = await UserModel.findById(userId).populate({path: "posts", 
            options: {sort: {createdAt: -1}}
        });
        res.json(posts);
    } catch (error) {
        return next(new HttpError(error));
    }
}


// --------- Bookmark posts ----------
// POST: api/posts/:id/bookmark
// Protected

const createBookmark = async(req, res, next) => {
    try {
        const {id} = req.params;
        const user = await UserModel.findById(req.user.id);

        // check if post already in the bookmark list
        //  if not delete, else add to bookmark list
        const postIsInBookmark = user?.bookmarks?.includes(id);
        if(postIsInBookmark) {
            const userBookmarks = await UserModel.findByIdAndUpdate(req.user.id, {$pull: {bookmarks: id}}, 
                {new: true}
            );
            res.json(userBookmarks);
        } else {
            const userBookmarks = await UserModel.findByIdAndUpdate(req.user.id, {$push: {bookmarks: id}}, 
                {new: true}
            );
            res.json(userBookmarks);
        }
    } catch (error) {
        return next(new HttpError(error));
    }
}


// --------- Get bookmarked posts ----------
// GET: api/bookmarks
// Protected

const getUserBookmarks = async(req, res, next) => {
    try {
        const userBookmarks = await UserModel.findById(req.user.id).populate({path: "bookmarks", 
            option: {sort: {createdAt: -1}}});
        res.json(userBookmarks);
    } catch (error) {
        return next(new HttpError(error));
    }
}

module.exports = {createPost, updatePost, deletePost, getPost, 
    getPosts, getUserPosts, getUserBookmarks, createBookmark, 
    getFollowingPosts, likeDislikePost}