import React, { useState } from "react";

const questions = [
  "Are you the policyholder?",
  "Do you have a valid government ID?",
  "Are you in a quiet environment?"
];

const Questionnaire = () => {
  const [index, setIndex] = useState(0);

  const handleAnswer = () => {
    if (index < questions.length - 1) {
      setIndex(index + 1);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow m-4">
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div
          className="bg-blue-600 h-2 rounded-full"
          style={{ width: `${((index + 1) / questions.length) * 100}%` }}
        ></div>
      </div>

      {/* Question */}
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        {questions[index]}
      </h2>

      {/* Answer Options */}
      <div className="flex justify-left space-x-4">
        <button
          onClick={handleAnswer}
          className="bg-green-600 text-white px-6 py-2 rounded-lg"
        >
          Yes
        </button>
        <button
          onClick={handleAnswer}
          className="bg-red-600 text-white px-6 py-2 rounded-lg"
        >
          No
        </button>
      </div>
    </div>
  );
};

export default Questionnaire;
