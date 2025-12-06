import React from 'react'

const TrimParagraph = ({text, maxLength}) => {
  return (
    <>
        {text.length > maxLength ? text.substring(0, maxLength) + " ..." : text}
    </>
  )
}

export default TrimParagraph;