const {Schema, model} = require("mongoose");

const userSchema = new Schema({
    fullName: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
    school: {type: String, required: true},
    profilePic: {type: String, default: "https://res.cloudinary.com/dlwyoik86/image/upload/v1764461783/Default_pfp_mejlvx.jpg"},
    bio: {type: String, default: "There is no bio"},
    followers: [{type: Schema.Types.ObjectId, ref: "User"}],
    following: [{type: Schema.Types.ObjectId, ref: "User"}],
    bookmarks: [{type: Schema.Types.ObjectId, ref: "Post"}],
    posts: [{type: Schema.Types.ObjectId, ref: "Post"}],
}, {timestamps: true})

module.exports = model("User", userSchema);