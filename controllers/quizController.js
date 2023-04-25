const Quiz = require("../models/quiz");
const filterObj = require("../utils/filterObj");

const quizController = {
  // to create a new quiz
  create: async (req, res) => {
    try {
      const { question } = req.body;

      const filterBody = filterObj(
        req.body,
        "question",
        "options",
        "rightAnswer",
        "startDate",
        "endDate"
      );

      const existing_quiz = await Quiz.findOne({ question: question });

      if (existing_quiz) {
        return res.status(400).json({
          status: "error",
          message: "Quiz already Exist. Change your question.",
        });
      } else {
        const new_quiz = await Quiz.create(filterBody);
        return res.status(200).json({
          status: "Success",
          message: "Quiz has been Created.",
          quiz: new_quiz,
        });
      }
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  // to retrieve the active quiz (the quiz that is currently within its start and end time)
  getActive: async (req, res) => {
    try {
      const currentDate = new Date();
      const activeQuizzes = await Quiz.find({
        startDateTime: { $lte: currentDate },
        endDateTime: { $gte: currentDate },
        status: "active",
      });

      if (activeQuizzes.length === 0) {
        return res.status(400).json({
          status: "error",
          message: "Not a single Quiz is active to participate.",
        });
      }

      return res.status(200).json({
        status: "Success",
        message: "All the active quizzes now.",
        quiz: activeQuizzes,
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  //  to retrieve the result of a quiz by its ID
  getResultById: async (req, res) => {
    try {
      const quizId = req.params.id;
      const currentTime = new Date();

      const quiz = await Quiz.findById(quizId).select(
        "question options rightAnswer startDate endDate status"
      );
      const endTime = new Date(quiz.endDate);
      if (!quiz) {
        return res.status(404).send({ message: "Quiz not found" });
      } else if (quiz.status !== "finished") {
        const timeRemaining = (endTime - currentTime) / 1000; // in seconds
        return res.status(400).json({
          status: "Success",
          message: `Quiz result not available yet. Please try again in ${timeRemaining} seconds.`,
        });
      } else {
        endTime.setMinutes(endTime.getMinutes() + 5); // add 5 minutes to the end time

        if (currentTime >= endTime) {
          return res.status(200).json({
            status: "Success",
            message: "Result has been fetched.",
            quiz: quiz,
            result: quiz.options[quiz.rightAnswer],
          });
        } else {
          res.status(400).send("Quiz result not available yet");
        }
      }
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  // to retrieve the all quizes
  getAll: async (req, res) => {
    try {
      const allQuizzes = await Quiz.find();

      if (!allQuizzes) {
        return res.status(400).json({
          status: "Error",
          message: "There are no quizzes. Go create one.",
        });
      }
      return res.status(200).json({
        status: "Success",
        message: "Result has been fetched.",
        allQuizzes: allQuizzes,
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  updateStatus: async (req, res) => {
    try {
      const currentTime = new Date();
      const quizzes = await Quiz.find({
        endDate: { $gt: currentTime },
      });
      quizzes.forEach(async (quiz) => {
        if (quiz.startDate > currentTime) {
          quiz.status = "inactive";
        } else if (quiz.endDate > currentTime) {
          quiz.status = "active";
        } else {
          quiz.status = "finished";
        }
        await quiz.save();
      });
      res.status(200).send("Quiz status updated successfully");
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
};



module.exports = quizController;
