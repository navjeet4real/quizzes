const Quiz = require("../models/quiz");
const filterObj = require("../utils/filterObj");

const quizController = {
  create: async (req, res) => {
    const { question, options, rightAnswer, startDate, endDate } = req.body;

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
      return res.status(400).json({
        status: "Success",
        message: "Quiz has been Created.",
        quiz: new_quiz,
      });
    }
  },
  getActive: async (req, res) => {
    const currentDate = new Date();

    const activeQuizzes = await Quiz.find({
      startDateTime: { $lte: currentDate },
      endDateTime: { $gte: currentDate },
    });

    return res.status(400).json({
        status: "Success",
        message: "Quiz has been Created.",
        quiz: activeQuizzes,
      });

  },
  getResultById: async (req, res) => {},
  getAll: async (req, res) => {},
};

module.exports = quizController;
