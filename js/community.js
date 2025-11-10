class Community {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.description = data.description;
        this.members = data.members;
        this.createdAt = data.createdAt;
        this.moderators = data.moderators;
    }

    loadPosts() {
        // Fetch and display posts for this community
    }

    toggleJoin() {
        // Handle join/leave logic
    }
}