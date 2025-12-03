const HttpError = require("../models/errorModel");
const UserModel = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const uuid = require("uuid").v4;
const fs = require("fs");
const path = require("path");
const cloudinary = require("../utils/cloudinary");

// --------- Register User ----------------------------------------------------------------
// POST: api/users/register
// Unprotected

const registerUser = async (req, res, next) => {
    try {
        const {fullName, username, email, password, confirmPassword, school} = req.body;
        if (!fullName || !email || !password || !confirmPassword || !school || !username) {
            return next(new HttpError("Please complete all required fields.", 422));
        }

        // Check if password match with confirm password
        if (password != confirmPassword) {
            return next(new HttpError("Passwords do not match", 422));
        }
        
        // Check password length. no shorter than 6 and no longer than 24
        if(password.length < 6 || password.length > 24) {
            return next(new HttpError("Password must be longer than 6 characters", 422));
        }
        // change all email to lowercase. Normalize the email
        const normalizedEmail = email.toLowerCase();
        // Normalize the username too
        const normalizedUsername = username.toLowerCase();

        // We want to dual check if the email already exist in the database
        // or the username already exist in
        const existingUser = await UserModel.findOne({
            $or: [
                {email: normalizedEmail},
                {username: normalizedUsername}
            ]
        });

        // Return error if email or username already exist
        if (existingUser) {
            // if email already exist
            if (existingUser.email === normalizedEmail) {
                return next(new HttpError("This email already associalted with other account.", 422));
            }
            // if username already exist 
            if (existingUser.username ===normalizedUsername) {
                return next(new HttpError("This username already exist", 422));
            }
        }

        // Encrypt password
        const salt = await bcrypt.genSalt(10);
        const encryptedPassword = await bcrypt.hash(password, salt);
        // Create new user in the database

        const newUser = await UserModel.create({
            fullName,
            username: normalizedUsername,
            email: normalizedEmail,
            password: encryptedPassword,
            school
        });
        res.status(201).json(newUser);

    } catch (err) {
        return next(new HttpError("Registration failed, please try again.", 500));
    }
}


// --------- Login User --------------------------------------------------------------------
// POST: api/users/login
// Unprotected

const loginUser = async (req, res, next) => {
    try {
        const {email, password} = req.body;
        if (!email || !password) {
            return next(new HttpError("Please provide both email and password.", 422));
        }
        // // change all email to lowercase. Normalize the email
        const normalizedEmail = email.toLowerCase();
        
        // Find user info from DB
        const existingUser = await UserModel.findOne({email: normalizedEmail});
    
        let isValidPassword = false;

        // Check user credential
        if (existingUser) {
            isValidPassword = await bcrypt.compare(password, existingUser.password);
        }

        if (!existingUser || !isValidPassword) {
            return next(new HttpError("Invalid credentials. Please check your email and password.", 401));
        }

        const tokenPayload = {id: existingUser._id};
        const authToken = await jwt.sign(tokenPayload, process.env.JWT_SECRET, {expiresIn: "3h"});
        res.status(200).json({token: authToken, id: existingUser._id});
    } catch (err) {
        return next(new HttpError("Login failed, please try again later.", 500));
    }
}


// --------- Get Multiple Users ---------------------------------------------------------------------
// GET: api/users
// Protected

const getUsers = async (req, res, next) => {
    try {
        const users = await UserModel.find().limit(10).sort({createdAt: -1});
        res.json(users).status(200);
    } catch (err) {
        return next(new HttpError(err));
    }
}


// --------- Get User ----------------------------------------------------------------------------------------
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
    } catch (err) {
        return next(new HttpError(err));
    }
}


// --------- Edit User -------------------------------------------------------------------------------------------
// PATCH: api/users/edit
// Protected

const editUser = async (req, res, next) => {
    try {
        const {fullName, bio} = req.body;
        const editedUser = await UserModel.findByIdAndUpdate(req.user.id, 
            {fullName, bio}, {new: true});
        res.json(editedUser).status(200);
    } catch (err) {
        return next(new HttpError(err));
    }
}


// --------- Follow/Unfollow User --------------------------------------------------------------------------
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
    } catch (err) {
        return next(new HttpError(err));
    }
}


// --------- Change User Pfp ---------------------------------------------------------------------------------------------
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
    } catch (err) {
        return next(new HttpError(err));
    }
}

module.exports = {registerUser, loginUser, getUser, getUsers, editUser, followUnfollowUser, changeUserPfp};