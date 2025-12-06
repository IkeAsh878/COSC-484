import React from 'react'

const ProfilePhoto = ({image, className}) => {
  return (
    <div className={`profilePhoto ${className}`}>
        <img src={image} alt="ProfilePic" style={{ width: '30px', height: '30px'}} />
    </div>
  )
}

export default ProfilePhoto