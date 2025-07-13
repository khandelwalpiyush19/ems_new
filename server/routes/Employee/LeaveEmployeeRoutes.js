import express from "express";
import { createLeave, getMyLeaves } from "../../controllers/leave/leaveEmployeeController.js";
import isAuthenticated from "../../middlewares/isAuthenticated.js";




const router = express.Router();
 router.route("/create-leave").post(isAuthenticated,createLeave)
router.route("/get-my-leaves").get(isAuthenticated,getMyLeaves)



export default router;