import React, { useState, useEffect } from 'react'
import ProfilePhoto from './ProfilePhoto';
import { useSelector } from 'react-redux';
import { IoPencil, IoImagesSharp, IoCloseCircleOutline } from "react-icons/io5";

const CreatePost = ({ onCreatePost, error }) => {

    const { user } = useSelector((state) => state.auth);
    const [caption, setCaption] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    // Preview image
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            // Create a temporary URL to show the image before uploading
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const clearImage = () => {
        setSelectedFile(null);
        setImagePreview(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // make sure user does not submit an empty post
        if (!caption.trim() && !selectedFile) {
            return;
        }
        const formData = new FormData();
        // 'body' and 'image' keys must match with the database
        formData.append('body', caption);
        if (selectedFile) {
            formData.append('image', selectedFile);
        }

        onCreatePost(formData);

        // Reset form
        setCaption("");
        clearImage();
    };

    return (
        <form className="createPost" encType='multipart/form-data' onSubmit={handleSubmit}>
            {error && <p className='createPost-error-message'>{error}</p>}
            <div className="createPost-top">
                <ProfilePhoto image={user?.profilePic} />
                <textarea value={caption} onChange={(e) => setCaption(e.target.value)}
                    placeholder={`What is on your mind, ${user?.username || 'User'}?`} />
            </div>

            {/* Preview image section*/}
            {imagePreview && (
                <div className="createPost-preview">
                    <img src={imagePreview} alt="Preview" className="preview-image" />
                    <button type="button" onClick={clearImage} className="preview-close-btn">
                        <IoCloseCircleOutline size="1.5rem" />
                    </button>
                </div>
            )}


            <div className="createPost-bottom">
                <div className="createPost-action">
                    <label htmlFor="file-upload" className='post-imageIcon'>
                        <IoImagesSharp size="1.2rem" />
                    </label>
                    <input
                        type="file"
                        id='file-upload'
                        className="hidden-input"
                        onChange={handleFileSelect}
                        accept="image/*"
                    />
                    <button
                        type='submit'
                        className='post-icon'
                        disabled={!caption && !selectedFile}
                    >
                        <IoPencil />
                    </button>
                </div>
            </div>
        </form>
    )
}

export default CreatePost