// Sample post data (later this would come from a database)
const postsData = [
    {
        id: 1,
        title: "What's your favorite programming language?",
        content: "I'm curious to hear what languages everyone prefers and why!",
        author: "CodeMaster",
        date: "2 hours ago",
        votes: 42,
        commentCount: 24
    },
    {
        id: 2,
        title: "Just launched my first web app!",
        content: "After 6 months of learning, I finally deployed my project. Feeling proud!",
        author: "NewbieDev",
        date: "5 hours ago",
        votes: 128,
        commentCount: 56
    },
    {
        id: 3,
        title: "Best resources for learning JavaScript?",
        content: "Looking for recommendations on tutorials, courses, or books.",
        author: "LearningJS",
        date: "1 day ago",
        votes: 89,
        commentCount: 43
    }, 
    {
        id: 4,
        title: "CSS Grid vs Flexbox - When to use each?",
        content: "I always get confused about when to use Grid vs Flexbox. Any tips?",
        author: "CSSNinja",
        date: "2 days ago",
        votes: 67,
        commentCount: 31
    },
    {
        id: 5,
        title: "My journey from beginner to full-stack developer",
        content: "Sharing my story and tips for anyone starting their coding journey.",
        author: "DevJourney",
        date: "3 days ago",
        votes: 215,
        commentCount: 78
    }
];

// Function to create a single post card
function createPostCard(post) {
    return `
        <article class="post-card" data-post-id="${post.id}">
            <div class="post-votes">
                <button class="vote-btn like">▲</button>
                <span class="vote-count">${post.votes}</span>
                <button class="vote-btn dislike">▼</button>
            </div>
            <div class="post-content">
                <div class="post-citation">
                    <span class="post-author">u/${post.author}</span>
                    <span class="post-date">${post.date}</span>
                </div>
                <h2 class="post-title">${post.title}</h2>
                <p class="post-body">${post.content}</p>
                <div class="post-comments">
                    <button class="comments-btn">
                        💬 <span class="comment-count">${post.commentCount}</span> Comments
                    </button>
                </div>
            </div>
        </article>
    `;
}

// Function to render all posts
function renderPosts() {
    const container = document.getElementById('posts-container');
    
    // Create HTML for all posts
    const postsHTML = postsData.map(post => createPostCard(post)).join('');
    
    // Add to container
    container.innerHTML = postsHTML;
}

// Load posts when page loads
document.addEventListener('DOMContentLoaded', renderPosts);