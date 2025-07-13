import jwt from "jsonwebtoken";

export const generateToken = (userId, role = null, res = null) => {
    try {
        const payload = { userId };
        if (role) payload.role = role;

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        if (res) {
            const cookieOptions = {
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
                httpOnly: true,
                sameSite: 'strict',
                secure: process.env.NODE_ENV === 'production',
                path: '/',
            };

            // For production with custom domain
            if (process.env.NODE_ENV === 'production' && process.env.DOMAIN) {
                cookieOptions.domain = process.env.DOMAIN;
            }

            res.cookie('jwt', token, cookieOptions);
        }

        return token;
    } catch (error) {
        console.error("Token generation error:", error);
        throw new Error("Failed to generate authentication token");
    }
};