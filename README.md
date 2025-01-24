# sqlCA

## how to run api locally.
1. open command line.
2. write "npm run dev"
3. command line should respond with "server started on port: ****"

## Express.js Blog API
This project is an Express.js-based RESTful API designed to handle a blogging platform with user authentication, post management, and commenting functionality. It integrates MySQL for database operations and uses JWT for secure user authentication.

## Features
1. Authentication
- User Registration: Users can sign up with an email, username, and password. Passwords are securely hashed using bcrypt.

- User Login: Authenticates users with a username and password and creates a JWT for later requests.

- Token Verification
  
2. Posts
- Create Post: Authenticated users can create blog posts with a title, content, and optional image URL.

- View All Posts: Retrieve a list of all blog posts with their associated usernames.
3. Comments
- Add Comments: Authenticated users can add comments to specific posts.

- View Comments: Retrieve all comments for a specific post.

4. summary
API Endpoints
Authentication
Register a new user.
Login with username and password.
