const HttpError = require("../models/errorModel");
const UserModel = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const uuid = require("uuid").v4;
const fs = require("fs");
const path = require("path");
const cloudinary = require("../utils/cloudinary");

// --------- Register User ----------
// POST: api/users/register
// Unprotected

const registerUser = async (req, res, next) => {
    try {
        const {fullName, email, password, confirmPassword, school} = req.body;
        if (!fullName || !email || !password || !confirmPassword || !school) {
            return next(new HttpError("Fill in all required fields", 422));
        }
        // make email for first letter of email lowercase
        const lowerCaseEmail = email.toLowerCase();
        // check if the email already exist in the database
        const emailExist = await UserModel.findOne({email: lowerCaseEmail});
        if (emailExist) {
            return next(new HttpError("Email already exists", 422));
        }
        // check if password match with confirm password
        if (password != confirmPassword) {
            return next(new HttpError("Passwords do not match", 422));
        }
        // chech passwaord length
        if(password.length < 6) {
            return next(new HttpError("Password must be longer than 6 characters", 422));
        }
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);
        // Add user to DB
        const newUser = await UserModel.create({
            fullName,
            email: lowerCaseEmail,
            password: hashPassword,
            school
        });
        res.json(newUser).status(201);

    } catch (error) {
        return next(new HttpError(error));
    }
}


// --------- Login User ----------
// POST: api/users/login
// Unprotected

const loginUser = async (req, res, next) => {
    try {
        const {email, password} = req.body;
        if (!email || !password) {
            return next(new HttpError("Fill in all required fields", 422));
        }
        // make email lowercase
        const lowerCaseEmail = email.toLowerCase();
        // fetch user info from DB
        const user = await UserModel.findOne({email: lowerCaseEmail});
        if (!user) {
            return next(new HttpError("Invalid Email or Password"), 422);
        }
        // const {uPassword, ...userInfo} = user;
        // Compare input password with password in the DB
        const comparePassword = await bcrypt.compare(password, user?.password);
        if (!comparePassword) {
            return next(new HttpError("Invalid Email or Password"), 422);
        }
        const token = await jwt.sign({id: user?._id}, process.env.JWT_SECRET, {expiresIn: "3h"});
        res.json({token, id: user?._id}).status(200);
        // res.json({token, id: user?._id, ...userInfo}).status(200);
    } catch (error) {
        return next(new HttpError(error));
    }
}


// --------- Get Multiple Users ----------
// GET: api/users
// Protected

const getUsers = async (req, res, next) => {
    try {
        const users = await UserModel.find().limit(10).sort({createdAt: -1});
        res.json(users).status(200);
    } catch (error) {
        return next(new HttpError(error));
    }
}


// --------- Get User ----------
// GET: api/users/:id
// Protected

const getUser = async (req, res, next) => {
    try {
        const {id} = req.params;
        const user = await UserModel.findById(id);
        if (!user) {
            return next(new HttpError("User Not Found", 422));
        }
        res.json(user).status(200);
    } catch (error) {
        return next(new HttpError(error));
    }
}


// --------- Edit User ----------
// PATCH: api/users/edit
// Protected

const editUser = async (req, res, next) => {
    try {
        const {fullName, bio} = req.body;
        const editUser = await UserModel.findByIdAndUpdate(req.user.id, 
            {fullName, bio}, {new: true});
        res.json(editUser).status(200);
    } catch (error) {
        return next(new HttpError(error));
    }
}


// --------- Follow/Unfollow User ----------
// GET: api/users/:id/follow-unfollow
// Protected

const followUnfollowUser = async (req, res, next) => {
    try {
        const userFollowId = req.params.id;
        if(req.user.id == userFollowId) {
            return next(new HttpError("Cannot follow or unfollow yourself", 422));
        }
        // get info of the current user
        const currentUser = await UserModel.findById(req.user.id); 
        // check if following include user follow id
        const isFollowing = currentUser?.following?.includes(userFollowId);
        // Follow if not following else unfollow
        if (!isFollowing) {
            const updatedUser = await UserModel.findByIdAndUpdate(userFollowId, 
                {$push: {followers: req.user.id}}, {new: true}
            )
            await UserModel.findByIdAndUpdate(req.user.id, 
                {$push: {following: userFollowId}}
            )
            res.json(updatedUser)
        } else {
            const updatedUser = await UserModel.findByIdAndUpdate(userFollowId, 
                {$pull: {followers: req.user.id}}, {new: true}
            )
            await UserModel.findByIdAndUpdate(req.user.id, 
                {$pull: {following: userFollowId}}
            )
            res.json(updatedUser)
        }
    } catch (error) {
        return next(new HttpError(error));
    }
}


// --------- Change User Pfp ----------
// POST: api/users/avatar
// Protected

const changeUserPfp = async (req, res, next) => {
    try {
        if (!req.files.avatar) {
            return next(new HttpError("Please choose an image", 422));
        }
        const {avatar} = req.files;
        // check file size
        if (avatar.size > 500000) {
            return next(new HttpError("Profile pictures is too big. Need to be less than 500kB"));
        }

        let fileName = avatar.name;
        let splittedFileName = fileName.split('.');
        let newFileName = splittedFileName[0] + uuid() + "." + splittedFileName[splittedFileName.length - 1];
        avatar.mv(path.join(__dirname, "..", "uploads", newFileName), async(err) => {
            if (err) {
                return next(new HttpError(err));
            }
            // store image on cloudinary
            const result = await cloudinary.uploader.upload(path.join(__dirname, "..", "uploads", newFileName),
            {resource_type: "image"});
            if (!result.secure_url) {
                return next(new HttpError("Could not upload image to cloudinary", 422));
            }
            const updatedUser = await UserModel.findByIdAndUpdate(req.user.id, {profilePic: result?.secure_url},
                {new: true}
            )
            res.json(updatedUser).status(200);
        })
    } catch (error) {
        return next(new HttpError(error));
    }
}

module.exports = {registerUser, loginUser, getUser, getUsers, editUser, followUnfollowUser, changeUserPfp};