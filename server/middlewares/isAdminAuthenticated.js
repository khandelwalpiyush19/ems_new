import jwt from "jsonwebtoken";

const isAdminAuthenticated = async (req, res, next) => {
    try {
        console.log("Received Cookies:", req.cookies);

        const token = req.cookies.jwt;
        if (!token) {
            return res.status(401).json({ message: "User not authenticated", success: false });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded Token:", decoded);

        if (!decoded || !decoded.userId) {
            return res.status(401).json({ message: "Invalid token payload", success: false });
        }

        // Restrict access to admins only
        if (decoded.role !== "admin") {
            return res.status(403).json({ message: "Access restricted to admins only", success: false });
        }

        // ✅ Set user object with role info
        req.user = {
            _id: decoded.userId,
            role: decoded.role
        };
console.log("Authenticated Admin User:", req.user);

        next();
    } catch (error) {
        console.error("Admin Auth Middleware Error:", error);
        return res.status(500).json({ message: "Server authentication error", error: error.message });
    }
};

export default isAdminAuthenticated;
