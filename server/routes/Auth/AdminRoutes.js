import express from "express";
import { loginUser,logoutUser,registerUser } from "../../controllers/auth/adminAuthcontroller.js";
// import { loginEmployee } from "../../controllers/employeeAuthController.js";

const router = express.Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").get(logoutUser);

export default router;