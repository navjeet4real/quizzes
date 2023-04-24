const mongoose = require("mongoose");

const quiz = mongoose.Schema(
  {
    question: {
      type: String,
    },
    options: {
      type: Array,
    },
    rightAnswer: {
      type: Number,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    status: {
      type: String,
      default: "inactive",
      enums: ["inactive", "active", "finished"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Quiz", quiz);
