const express = require('express');
const userMiddleware = require('../middleware/userMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { createProblem, updateProblem, removeProblemById, getProblemAll, getProblemById, solvedAllProblemByUser, submittedProblem, getProblemAndUpdateById } = require('../controllers/userProblem');

const problemRouter = express.Router();

problemRouter.post("/create", adminMiddleware, createProblem);
problemRouter.patch("/update/:id", adminMiddleware, updateProblem);
problemRouter.post("/delete/:id", adminMiddleware, removeProblemById);

problemRouter.get("/getProblemAndUpdateById/:id", adminMiddleware, getProblemAndUpdateById);

problemRouter.get("/problemById/:id", userMiddleware, getProblemById);
problemRouter.get("/getAllProblem", userMiddleware, getProblemAll);
problemRouter.get('/problemSolvedByUser', userMiddleware, solvedAllProblemByUser);
problemRouter.get('/submittedProblem/:pid', userMiddleware, submittedProblem);

module.exports = problemRouter;