async function getData() {
    const accessToken = localStorage.getItem("accessToken");

    try {
        const res = await fetch("http://localhost:1313/", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!res.ok) {
            throw new Error("Failed to fetch user data");
        }

        const data = await res.json();
        console.log(data);
    } catch (error) {
        console.error("Error fetching user data:", error);
        alert("Failed to fetch user data. Please log in again.");
    }
}

async function getPosts() {
    try {
        const res = await fetch("http://localhost:1313/posts", {
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!res.ok) {
            throw new Error("Failed to fetch posts");
        }

        const posts = await res.json();

        // Fetch comments for each post
        for (const post of posts) {
            const commentsRes = await fetch(
                `http://localhost:1313/posts/${post.id}/comments`,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!commentsRes.ok) {
                throw new Error(`Failed to fetch comments for post ${post.id}`);
            }

            post.comments = await commentsRes.json(); // Attach comments to the post object
        }

        renderPosts(posts); // Pass the posts with comments to renderPosts
    } catch (error) {
        console.error("Error fetching posts and comments:", error);
        alert("Failed to fetch posts. Please try again later.");
    }
}

function renderPosts(posts) {
    const postsContainer = document.getElementById("postsContainer");
    const accessToken = localStorage.getItem("accessToken");

    // Clear previous posts
    postsContainer.innerHTML = "";

    // Loop through posts
    posts.forEach((post) => {
        const postDiv = document.createElement("div");
        postDiv.classList.add("post");

        // Post content
        postDiv.innerHTML = `
            <img src="${
                post.imageUrl ||
                "https://media.istockphoto.com/id/1500807425/fr/vectoriel/image-introuvable-ic%C3%B4ne-vectorielle-design.jpg?s=612x612&w=0&k=20&c=Z-dlqJZ1zxDNppQEyWz1cPFJxcAbPHWhPfJvfhFN-kE="
            }" alt="Post image"/>
            <h3>${post.title}</h3>
            <p>${post.content}</p>
            <small>Posted by: ${post.username} on ${new Date(
            post.created_at
        ).toLocaleDateString()}</small>
        `;

        const commentsDiv = document.createElement("div");
        commentsDiv.classList.add("comments");

        const commentsHeader = document.createElement("h4");
        commentsHeader.textContent = "Comments:";
        commentsDiv.appendChild(commentsHeader);

        if (post.comments && post.comments.length > 0) {
            post.comments.forEach((comment) => {
                const commentParagraph = document.createElement("p");
                commentParagraph.innerHTML = `<strong>${
                    comment.username
                }:</strong> ${comment.comment} <small>(${new Date(
                    comment.created_at
                ).toLocaleDateString()})</small>`;
                commentsDiv.appendChild(commentParagraph);
            });
        } else {
            commentsDiv.innerHTML += `<p>No comments yet.</p>`;
        }

        // Comment form
        if (accessToken) {
            const commentForm = document.createElement("form");
            commentForm.innerHTML = `
                <textarea id="commentContent" placeholder="Add your comment"></textarea>
                <button type="submit">Add Comment</button>
            `;
            commentForm.addEventListener("submit", (e) => {
                e.preventDefault();
                createComment(post.id);
            });

            commentsDiv.appendChild(commentForm);
        } else {
            commentsDiv.innerHTML += `<p>Login to add a comment</p>`;
        }
        postDiv.appendChild(commentsDiv);
        postsContainer.appendChild(postDiv);
    });
}

getPosts();

async function getComments(postId) {
    try {
        const res = await fetch(
            `http://localhost:1313/posts/${postId}/comments`,
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        if (!res.ok) {
            throw new Error("Failed to fetch comments");
        }

        const comments = await res.json();
        console.log(comments);
        // Optionally, update the DOM to display comments
    } catch (error) {
        console.error("Error fetching comments:", error);
        alert("Failed to fetch comments. Please try again later.");
    }
}

async function login() {
    const username = document.querySelector("#username").value;
    const password = document.querySelector("#password").value;

    try {
        const res = await fetch("http://localhost:1313/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username,
                password,
            }),
        });

        if (!res.ok) {
            throw new Error("Login failed");
        }

        const data = await res.json();
        console.log(data);
        localStorage.setItem("accessToken", data.accessToken);
        window.location.reload();
        alert("Login successful!");
    } catch (error) {
        console.error("Error during login:", error);
        alert("Login failed. Please check your credentials.");
    }
}

async function register() {
    const email = document.querySelector("#email").value;
    const username = document.querySelector("#registerUsername").value;
    const password = document.querySelector("#registerPassword").value;

    try {
        const res = await fetch("http://localhost:1313/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                username,
                password,
            }),
        });

        if (!res.ok) {
            throw new Error("Registration failed");
        }

        const data = await res.json();
        console.log(data);
        alert("Registration successful! You can now log in.");
    } catch (error) {
        console.error("Error during registration:", error);
        alert("Registration failed. Please try again.");
    }
}

async function createPost() {
    const title = document.querySelector("#postTitle").value;
    const content = document.querySelector("#postContent").value;
    const imageUrl = document.querySelector("#postImageUrl").value;

    const accessToken = localStorage.getItem("accessToken");

    try {
        const res = await fetch("http://localhost:1313/add-post", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                title,
                content,
                imageUrl,
            }),
        });

        if (!res.ok) {
            throw new Error("Failed to create post");
        }

        const data = await res.json();
        console.log(data);
        alert("Post created successfully!");
        window.location.reload();
    } catch (error) {
        console.error("Error creating post:", error);
        alert("Failed to create post. Please try again later.");
    }
}

async function createComment(postId) {
    const comment = document.querySelector("#commentContent").value; // Get comment content from the form
    const accessToken = localStorage.getItem("accessToken"); // Get JWT from localStorage

    try {
        const res = await fetch(
            `http://localhost:1313/posts/${postId}/comments`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    comment, // The comment content
                }),
            }
        );

        if (!res.ok) {
            throw new Error("Failed to add comment");
        }

        const data = await res.json();
        console.log(data);
        alert("Comment added successfully!");

        // Optionally, you may want to reload the comments after adding
        getComments(postId); // Reload the comments for this post
    } catch (error) {
        console.error("Error adding comment:", error);
        alert("Failed to add comment. Please try again.");
    }
}

// Add event listener to form
document.querySelector("#createPostForm").addEventListener("submit", (e) => {
    e.preventDefault();
    createPost();
});

// Add event listeners to separate forms
document.querySelector("#loginForm").addEventListener("submit", (e) => {
    e.preventDefault();
    login();
});

document.querySelector("#registerForm").addEventListener("submit", (e) => {
    e.preventDefault();
    register();
});

document.addEventListener("DOMContentLoaded", () => {
    const accessToken = localStorage.getItem("accessToken");

    // createPost hide
    const createPostForm = document.querySelector("#createPostForm");
    if (!accessToken) {
        createPostForm.style.display = "none";
    }

    // register hide
    const registerForm = document.querySelector("#registerForm");
    const loginForm = document.querySelector("#loginForm");
    if (accessToken) {
        registerForm.style.display = "none";
        loginForm.style.display = "none";
    }
});
