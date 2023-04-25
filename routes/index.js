const router = require("express").Router();
const quizController = require("../controllers/quizController");

// to create a new quiz
router.post("/quizzes", quizController.create);

// to retrieve the active quiz (the quiz that is currently within its start and end time)
router.get("/quizzes/active", quizController.getActive);

//  to retrieve the result of a quiz by its ID
router.get("/quizzes/:id/result", quizController.getResultById);

// to retrieve the all quizes
router.get("/quizzes/all", quizController.getAll);

module.exports = router;
