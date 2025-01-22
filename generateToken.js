import jwt from "jsonwebtoken";

const SECRET = process.env.SECRET;
const token = jwt.sign(
    {
        email: "chris@noroff.no",
        username: "chris",
        password_hash: "test",
    },
    SECRET
);

console.log(token);
