
import express from "express";
import { createProject, deleteProject, getAllProjects, updateProject } from "../../controllers/admin/projectController.js";

const router = express.Router();
router.route("/get-all-project").get(getAllProjects)
router.route("/create-project").post(createProject)
router.route("/update-project/:id").put(updateProject)
router.route("/delete-project/:id").delete(deleteProject)


export default router;