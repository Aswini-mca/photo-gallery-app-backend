import jwt from "jsonwebtoken";
import { getUserById } from "./helpers.js";

//custom middleware
const isAuthenticated = async (req, res, next) => {
    let token;
    if (req.headers) {
        try {
            token = await req.headers["x-auth-token"]
            const decode = jwt.verify(token, process.env.secret_key);
            req.user = await getUserById(decode.id);
            next();
        } catch (error) {
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }
}

export { isAuthenticated }