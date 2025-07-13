import jwt from "jsonwebtoken";

const isAuthenticated = async (req, res, next) => {
    try {
        console.log("Received Cookies:", req.cookies);

        const token = req.cookies.jwt;
        if (!token) {
            return res.status(401).json({ message: "User not authenticated", success: false });
        }

        console.log("Extracted Token:", token);

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log("Decoded Token:", decoded);
        } catch (error) {
            if (error.name === "TokenExpiredError") {
                return res.status(401).json({ message: "Session expired, please log in again", success: false });
            }
            return res.status(401).json({ message: "Invalid token", success: false });
        }

        if (!decoded || !decoded.userId) {
            return res.status(401).json({ message: "Invalid or missing user data in token", success: false });
        }

        // ✅ Restrict access to employees ONLY (Admins blocked)
        if (decoded.role !== "employee") {
            return res.status(403).json({ message: "Access restricted to employees only", success: false });
        }

        req.employee = { _id: decoded.userId }; 
        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error);
        return res.status(500).json({ message: "Server authentication error", error: error.message });
    }
};

export default isAuthenticated;