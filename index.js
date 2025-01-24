import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import mysql from "mysql2/promise";
import bcrypt from "bcrypt";

const port = process.env.PORT || 3000;
const SECRET = process.env.JWT_SECRET;

const app = express();

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ message: "Unauthorized" });

        const decoded = jwt.verify(token, SECRET);
        req.user = { userId: decoded.userId };
        next();
    } catch (error) {
        console.error("JWT verification failed:", error);
        res.status(403).json({ message: "Forbidden" });
    }
};

// GET All Posts
app.get("/posts", async (req, res) => {
    try {
        const [rows] = await pool.execute(
            "SELECT posts.id, posts.title, posts.content, posts.imageUrl, posts.created_at, users.username " +
                "FROM posts " +
                "JOIN users ON posts.user_id = users.user_id"
        );
        res.json(rows);
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).json({ message: "An internal server error occurred" });
    }
});

// GET Comments for a Post
app.get("/posts/:postId/comments", async (req, res) => {
    const { postId } = req.params;

    try {
        const [rows] = await pool.execute(
            "SELECT comments.id, comments.comment, comments.created_at, users.username " +
                "FROM comments " +
                "JOIN users ON comments.user_id = users.user_id " +
                "WHERE comments.post_id = ?",
            [postId]
        );

        res.json(rows);
    } catch (error) {
        console.error("Error fetching comments:", error);
        res.status(500).json({ message: "An internal server error occurred" });
    }
});

// add a comment to a post.
app.post("/posts/:postId/comments", verifyToken, async (req, res) => {
    const { postId } = req.params;
    const { comment } = req.body;
    const userId = req.user?.userId;

    try {
        if (!comment) {
            return res.status(400).json({ message: "Comment is required" });
        }
        if (!userId) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        const [result] = await pool.execute(
            "INSERT INTO comments (comment, user_id, post_id) VALUES (?, ?, ?)",
            [comment, userId, postId]
        );

        res.status(201).json({
            message: "Comment added successfully",
            commentId: result.insertId,
        });
    } catch (error) {
        console.error("Error adding comment:", error);
        res.status(500).json({ message: "An internal server error occurred" });
    }
});

app.post("/add-post", verifyToken, async (req, res) => {
    const { title, content, imageUrl } = req.body;
    const userId = req.user.userId;

    try {
        if (!title || !content) {
            return res
                .status(400)
                .json({ message: "Title and content are required" });
        }

        // Insert the new post into the database
        const [result] = await pool.execute(
            "INSERT INTO posts (title, content, imageUrl, user_id) VALUES (?, ?, ?, ?)",
            [title, content, imageUrl, userId]
        );

        res.status(201).json({
            message: "Post created successfully",
            postId: result.insertId,
        });
    } catch (error) {
        console.error("Error adding post:", error);
        res.status(500).json({ message: "An internal server error occurred" });
    }
});

// POST Login
app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        const [rows] = await pool.execute(
            "SELECT * FROM users WHERE username = ?",
            [username]
        );

        if (rows.length > 0) {
            const validPassword = await bcrypt.compare(
                password,
                rows[0].password_hash
            );
            if (validPassword) {
                const token = jwt.sign(
                    { username: rows[0].username, userId: rows[0].user_id },
                    SECRET,
                    { expiresIn: "1h" }
                );
                return res.json({ message: "success", accessToken: token });
            }
        }

        res.status(401).json({ message: "Invalid credentials" });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: "An internal server error occurred" });
    }
});

// POST Register
app.post("/register", async (req, res) => {
    const { email, username, password } = req.body;

    try {
        if (!email || !username || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const [emailCheck] = await pool.execute(
            "SELECT user_id FROM users WHERE email = ?",
            [email]
        );

        if (emailCheck.length > 0) {
            return res.status(409).json({ message: "Email already exists" });
        }

        const [usernameCheck] = await pool.execute(
            "SELECT user_id FROM users WHERE username = ?",
            [username]
        );

        if (usernameCheck.length > 0) {
            return res.status(409).json({ message: "Username already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await pool.execute(
            "INSERT INTO users (email, username, password_hash) VALUES (?, ?, ?)",
            [email, username, hashedPassword]
        );

        res.status(201).json({
            message: "User registered successfully",
            userId: result.insertId,
        });
    } catch (error) {
        console.error("Error during registration:", error);
        res.status(500).json({ message: "An internal server error occurred" });
    }
});

// Protected Route Example
app.get("/", verifyToken, (req, res) => {
    res.json({ message: "Token is valid", payload: req.user });
});

app.listen(port, () => {
    console.log("Server started on port:", port);
});
