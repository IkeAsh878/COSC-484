const HttpError = require("../models/errorModel");
const PostModel = require("../models/postModel");
const UserModel = require("../models/userModel");
const CommentModel = require("../models/commentModel");


// --------- Comment Creation -------------------------------------------------
// POST: api/comments/:postId
// Protected
const createComment = async(req, res, next) => {
    try {
        const {postId} = req.params;
        const {comment} = req.body;
        if(!comment) {
            return next(new HttpError("Need to write a comment", 422));
        }
        // Get creator info
        const commentCreator = await UserModel.findById(req.user.id);
        const newComment = await CommentModel.create({creator: {creatorId: req.user.id, 
            creatorName: commentCreator?.fullName, 
            creatorPhoto: commentCreator?.profilePic
        }, postId, comment})
        // await PostModel.findByIdAndUpdate(postId, ($push, {comments: newComment?._id}), {new: true});
        await PostModel.findByIdAndUpdate(postId, {$push: {comments: newComment?._id}}, {new: true});
        res.json(newComment).status(200);
    } catch (error) {
        return next(new HttpError(error));
    }
}


// --------- Comment Get -------------------------------------------------------
// GET: api/comments/:postId
// Protected
const getComment = async(req, res, next) => {
    try {
        const {postId} = req.params;
        const comment = await PostModel.findById(postId).populate({path: "comments",
            options: {sort: {createdAt: -1}}
        });
        res.json(comment);
    } catch (error) {
        return next(new HttpError(error));
    }
}


// --------- Delete comment -----------------------------------------------------
// DELETE: api/comments/:commentId
// Protected
const deleteComment = async(req, res, next) => {
    try {
        const {commentId} = req.params;
        const comment = await CommentModel.findById(commentId);
        // check to see the comment creator is the one who delete the comment
        const commentCreator = await UserModel.findById(comment?.creator?.creatorId);
        if (commentCreator?._id != req.user.id) {
            return next(new HttpError("Cannot delete comment. Unauthorization"));
        }
        await PostModel.findByIdAndUpdate(comment?.postId, {$pull: {comments: commentId}})
        const deletedComment = await CommentModel.findByIdAndDelete(commentId);
        res.json(deletedComment).status(200);
    } catch (error) {
        return next(new HttpError(error));
    }
}

module.exports = {createComment, getComment, deleteComment};
