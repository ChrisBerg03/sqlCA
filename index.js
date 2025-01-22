import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import mysql from "mysql2/promise";
import bcrypt from "bcrypt"; // Import bcrypt

const port = process.env.PORT || 3000;
const SECRET = process.env.JWT_SECRET || "your-secret-key";

const app = express();

app.use(cors());
app.use(express.json());

// Create a MySQL connection
const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Verify JWT Middleware
function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res
            .status(401)
            .json({ error: "Authorization header is missing" });
    }

    const token = authHeader.split(" ")[1];
    try {
        const payload = jwt.verify(token, SECRET);
        req.user = payload; // Attach the payload to the request for later use
        next();
    } catch (err) {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
}

// Generate Token on Login
app.post("/users", async (req, res) => {
    const { username, password } = req.body;

    // Query the database for the user
    const [rows] = await connection.execute(
        "SELECT * FROM users WHERE username = ?",
        [username]
    );

    if (rows.length > 0) {
        // Check password hash
        const validPassword = await bcrypt.compare(
            password,
            rows[0].password_hash
        );
        if (validPassword) {
            const token = jwt.sign({ username }, SECRET, { expiresIn: "1h" });
            return res.json({ message: "success", accessToken: token });
        }
    }

    res.status(401).json({ message: "Invalid credentials" });
});

app.post("/register", async (req, res) => {
    const { email, username, password } = req.body;

    try {
        // Validate request body
        if (!email || !username || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if the email already exists
        const [emailCheck] = await connection.execute(
            "SELECT id FROM users WHERE email = ?",
            [email]
        );

        if (emailCheck.length > 0) {
            return res.status(409).json({ message: "Email already exists" });
        }

        // Check if the username already exists
        const [usernameCheck] = await connection.execute(
            "SELECT id FROM users WHERE username = ?",
            [username]
        );

        if (usernameCheck.length > 0) {
            return res.status(409).json({ message: "Username already exists" });
        }

        // Hash the password before saving it in the database
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the new user into the database
        const [result] = await connection.execute(
            "INSERT INTO users (email, username, password_hash) VALUES (?, ?, ?)",
            [email, username, hashedPassword]
        );

        // Respond with success message
        res.status(201).json({
            message: "User registered successfully",
            userId: result.insertId, // Return the new user's ID for reference
        });
    } catch (error) {
        console.error("Error during registration:", error);

        // Generic error response
        res.status(500).json({ message: "An internal server error occurred" });
    }
});

// Protected Route
app.get("/", verifyToken, (req, res) => {
    res.json({ message: "Token is valid", payload: req.user });
});

app.listen(port, () => {
    console.log("Server started on port:", port);
});
