const Quiz = require("../models/quiz");
const filterObj = require("../utils/filterObj");

// Create an object to use as a cache
const cache = {};
// Set cache expiration time in seconds
const CACHE_EXPIRATION_TIME = 60; // 1 minute

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
      const currentTime = new Date();
      // Check if the active quiz list is already in the cache and not expired
      if (
        cache["activeQuizzes"] &&
        (new Date() - cache["activeQuizzes"].timestamp) / 1000 <
          CACHE_EXPIRATION_TIME
      ) {
        console.log("Retrieving active quiz list from cache");
        return res.status(200).json({
          status: "Success",
          message: "Active quiz list has been fetched from cache.",
          quiz: cache["activeQuizzes"].data,
        });
      }

      const activeQuizzes = await Quiz.find({
        startDateTime: { $lte: currentTime },
        endDateTime: { $gte: currentTime },
        status: "active",
      });

      if (activeQuizzes.length === 0) {
        return res.status(400).json({
          status: "error",
          message: "Not a single Quiz is active to participate.",
        });
      }
      // Store the active quiz list in the cache for future requests
      cache["activeQuizzes"] = {
        data: activeQuizzes,
        timestamp: currentTime,
      };
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

      // Check if the quiz result is already in the cache
      if (
        cache[quizId] &&
        (currentTime - cache[quizId].timestamp) / 1000 < CACHE_EXPIRATION_TIME
      ) {
        return res.status(200).json({
          status: "Success",
          message: "Result has been fetched from cache.",
          quiz: cache[quizId].quiz,
          result: cache[quizId].result,
        });
      }

      const quiz = await Quiz.findById(quizId).select(
        "question options rightAnswer startDate endDate status"
      );
      if (!quiz) {
        return res.status(404).send({ message: "Quiz not found" });
      }

      const endTime = new Date(quiz.endDate);
      if (quiz.status !== "finished") {
        const timeRemaining = (endTime - currentTime) / 1000; // in seconds
        return res.status(400).json({
          status: "Success",
          message: `Quiz result not available yet. Please try again in ${timeRemaining} seconds.`,
        });
      }

      endTime.setMinutes(endTime.getMinutes() + 5); // add 5 minutes to the end time

      const quizResult = quiz.options[quiz.rightAnswer];
      // Store the quiz result in the cache for future requests once it is finished
      cache[quizId] = {
        quiz: quiz,
        result: quizResult,
        timestamp: currentTime, // add timestamp to cache entry
      };

      return res.status(200).json({
        status: "Success",
        message: "Result has been fetched.",
        quiz: quiz,
        result: quizResult,
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  // to retrieve the all quizes
  getAll: async (req, res) => {
    try {
      const currentTime = new Date();

      // Check if the quiz list is already in the cache and not expired
      if (
        cache["allQuizzes"] &&
        (currentTime - cache["allQuizzes"].timestamp) / 1000 <
          CACHE_EXPIRATION_TIME
      ) {
        return res.status(200).json({
          status: "Success",
          message: "Quiz list has been fetched from cache.",
          allQuizzes: cache["allQuizzes"].data,
        });
      }
      const allQuizzes = await Quiz.find();

      if (!allQuizzes) {
        return res.status(400).json({
          status: "Error",
          message: "There are no quizzes. Go create one.",
        });
      }
      // Store the quiz list in the cache for future requests
      cache["allQuizzes"] = {
        data: allQuizzes,
        timestamp: currentTime,
      };

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
