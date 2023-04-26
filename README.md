Node.js Quiz Application
This Node.js application allows users to create and participate in timed quizzes. The application has a RESTful API that provides functionalities for creating and retrieving quizzes.

Functionalities
The following functionalities are supported by the API:

Create a Quiz
Users can create a quiz by sending a POST request to the API with the following fields:

question: the text of the question
options: an array of the answer options for the question
rightAnswer: the index of the correct answer in the options array
startDate: the date and time when the quiz should start
endDate: the date and time when the quiz should end
Example request:

bash
POST /api/quizzes HTTP/1.1
Content-Type: application/json

{
  "question": "What is the capital of France?",
  "options": ["London", "Paris", "New York", "Tokyo"],
  "rightAnswer": 1,
  "startDate": "2023-04-27T09:00:00.000Z",
  "endDate": "2023-04-27T10:00:00.000Z"
}
Example response:

css
HTTP/1.1 201 Created
Content-Type: application/json

{
  "id": "60ac9fb1f0f0c15280f23e6c",
  "question": "What is the capital of France?",
  "options": ["London", "Paris", "New York", "Tokyo"],
  "rightAnswer": 1,
  "startDate": "2023-04-27T09:00:00.000Z",
  "endDate": "2023-04-27T10:00:00.000Z"
}
Get Active Quiz
Users can retrieve the active quiz (the quiz that is currently within its start and end time).

Example request:

bash
GET /api/quizzes/active HTTP/1.1
Example response:

css
HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": "60ac9fb1f0f0c15280f23e6c",
  "question": "What is the capital of France?",
  "options": ["London", "Paris", "New York", "Tokyo"],
  "startDate": "2023-04-27T09:00:00.000Z",
  "endDate": "2023-04-27T10:00:00.000Z"
}
Get Quiz Result
After the end time of a quiz, users can retrieve the result of the quiz. The result is basically the right answer.

Example request:

bash
GET /api/quizzes/quizId/result HTTP/1.1
Example response:

css
Content-Type: application/json

{
    "status": "Success",
    "message": "Quiz result not available yet. Please try again in 186608.519 seconds."
}

Installation
To install and run the application, follow these steps:

Clone the repository: git clone https://github.com/navjeet4real/quizzes.git

Install dependencies: npm install

Start the server: npx nodemon server

The server will start running on http://localhost:8000/
