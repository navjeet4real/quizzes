const cron = require("node-cron");
const quizController = require("./quizController")

// function to run every minute using the cron expression "* * * * *"
cron.schedule("* * * * *", quizController.updateStatus);