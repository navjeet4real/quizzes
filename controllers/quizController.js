const Quiz = require("../models/quiz");
const filterObj = require("../utils/filterObj");
const cron = require('node-cron');

const quizController = {
  create: async (req, res) => {
   try {
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
   } catch (error) {
    res.status(500).send('An error occurred while creating quiz');
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
  getResultById: async (req, res) => {
    const {id} = req.params

    const quiz = await Quiz.findOne({_id: id}).select("question options rightAnswer")

    const quizIndex = quiz.rightAnswer
    const quizOptions = quiz.options

    const result = quizOptions[quizIndex]

    return res.status(400).json({
      status: "Success",
      message: "Result has been fetched.",
      quiz: quiz,
      result: result
    });
  },
  getAll: async (req, res) => {
    const allQuizzes = await Quiz.find()

    return res.status(400).json({
      status: "Success",
      message: "Result has been fetched.",
      allQuizzes : allQuizzes
    });
  },
  updateStatus: async (req, res) => {
    try {
      const currentTime = new Date();
      const quizzes = await Quiz.find({
        endDate: { $gt: currentTime },
      });
      quizzes.forEach(async (quiz) => {
        if (quiz.startDate > currentTime) {
          quiz.status = 'inactive';
        } else if (quiz.endDate > currentTime) {
          quiz.status = 'active';
        } else {
          quiz.status = 'finished';
        }
        await quiz.save();
      });
      res.status(200).send('Quiz status updated successfully');
    } catch (error) {
      console.error(error);
      res.status(500).send('An error occurred while updating quiz status');
    }
  }
};


cron.schedule('* * * * *', updateQuizStatus);

module.exports = quizController;
