import React, { useState, useEffect } from "react";
import { Question, QuestionOption, QuestionnaireResponse, QuestionnairePayload, sampleQuestions, QUESTIONNAIRE_MESSAGE_TYPES } from "../../data/questionnaire";
import ProgressBar from "./progress-bar";

interface QuestionnaireProps {
  onSendMessage?: (type: string, data: QuestionnairePayload) => void;
  isCallConnected?: boolean;
  questions?: Question[];
  responses?: Record<string, QuestionnaireResponse>;
  onResponseChange?: (responses: Record<string, QuestionnaireResponse>) => void;
  onCompletionChange?: (isCompleted: boolean) => void;
  onCurrentQuestionChange?: (index: number) => void;
  onStartedChange?: (isStarted: boolean) => void;
  customerAgreed?: boolean;
}

const Questionnaire: React.FC<QuestionnaireProps> = ({ 
  onSendMessage, 
  isCallConnected = false,
  questions = sampleQuestions,
  responses = {},
  onResponseChange,
  onCompletionChange,
  onCurrentQuestionChange,
  onStartedChange,
  customerAgreed = false
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (!isCallConnected) {
      setCurrentQuestionIndex(0);
      setIsStarted(false);
      setIsCompleted(false);
    }
   }, [isCallConnected]);

  useEffect(() => {
    // Check if questionnaire is completed
    console.log("responses",responses)
    const completed = isStarted && Object.keys(responses).length === questions.length;
    if (completed !== isCompleted) {
      setIsCompleted(completed);
      onCompletionChange?.(completed);
    }
    
    // Send completion message when both completed and customer has agreed
    if (completed && customerAgreed) {
      console.log("Sending final questionnaire completion message");
      onSendMessage?.(QUESTIONNAIRE_MESSAGE_TYPES.QUESTIONNAIRE_COMPLETED, {
        responses,
        totalQuestions: questions.length,
        completedAt: new Date()
      });
    }
  }, [responses, questions.length, isStarted, onSendMessage, isCompleted, onCompletionChange, customerAgreed]);

  const handleStartQuestionnaire = () => {
    setIsStarted(true);
    setCurrentQuestionIndex(0);
    onResponseChange?.({});
    setIsCompleted(false);
    onStartedChange?.(true);
    onCurrentQuestionChange?.(0);
    
    // Send start message and first question to customer
    onSendMessage?.(QUESTIONNAIRE_MESSAGE_TYPES.QUESTION_STARTED, {
      totalQuestions: questions.length
    });
    
    onSendMessage?.(QUESTIONNAIRE_MESSAGE_TYPES.QUESTIONS_LIST, {
      questions
    });
    
    // Send the first question immediately
    if (questions.length > 0) {
      setTimeout(() => {
        onSendMessage?.(QUESTIONNAIRE_MESSAGE_TYPES.QUESTION, {
          question: questions[0],
          questionIndex: 0,
          totalQuestions: questions.length
        });
      }, 100);
    }
  };


  const handleResponse = (selectedOption: QuestionOption) => {
    const currentQuestion = questions[currentQuestionIndex];
    
    const response: QuestionnaireResponse = {
      questionId: currentQuestion.id,
      selectedOption,
      timestamp: new Date()
    };
    
    const newResponses = {
      ...responses,
      [currentQuestion.id]: response
    };
    onResponseChange?.(newResponses);
    
    // Send response to customer
    onSendMessage?.(QUESTIONNAIRE_MESSAGE_TYPES.SUBMIT_RESPONSE, {
      questionId: currentQuestion.id,
      response: selectedOption,
      questionIndex: currentQuestionIndex
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      onCurrentQuestionChange?.(nextIndex);
      
      // Send next question to customer
      setTimeout(() => {
        const nextQuestion = questions[nextIndex];
        onSendMessage?.(QUESTIONNAIRE_MESSAGE_TYPES.QUESTION, {
          question: nextQuestion,
          questionIndex: nextIndex,
          totalQuestions: questions.length
        });
      }, 500);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(prevIndex);
      onCurrentQuestionChange?.(prevIndex);
      
      // Send previous question to customer
      setTimeout(() => {
        const prevQuestion = questions[prevIndex];
        onSendMessage?.(QUESTIONNAIRE_MESSAGE_TYPES.QUESTION, {
          question: prevQuestion,
          questionIndex: prevIndex,
          totalQuestions: questions.length
        });
      }, 500);
    }
  };

  if (!isStarted) {
    return (
      <div className="flex justify-center p-4 bg-white rounded-lg shadow m-4">
        <button
          onClick={handleStartQuestionnaire}
          disabled={!isCallConnected}
          className={`px-8 py-3 rounded-full font-medium transition-all duration-200 ${
            isCallConnected
              ? 'bg-[#97144D] text-white hover:bg-[#7a103d] cursor-pointer shadow-lg hover:shadow-xl'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed border border-gray-300'
          }`}
        >
          Start Questionnaire
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const currentResponse = responses[currentQuestion?.id];
  if (isCompleted && customerAgreed) {
    return (
      <div className="p-4 bg-white rounded-lg shadow m-4">
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <p className="text-green-800 text-sm font-medium">
              Customer Agreed on the verification summary. Questionnaire is completed.
            </p>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="p-4 bg-white rounded-lg shadow m-4">
      {/* Progress Bar */}
      <ProgressBar
        current={currentQuestionIndex}
        total={questions.length}
      />

      {/* Question */}
      <h2 className="text-lg text-center text-gray-800 mb-4">
        Q{currentQuestionIndex + 1}. {currentQuestion?.question}
      </h2>

      {/* Answer Options */}
      <div className="flex items-center justify-center gap-2 mb-4">
        {currentQuestion?.options.map((option) => (
          <label
            key={option.id}
            className={`flex items-center p-3 pr-20 border rounded-lg cursor-pointer transition-colors ${
              currentResponse?.selectedOption.id === option.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input
              style={{display:'none'}}
              type="radio"
              name="questionResponse"
              value={option.value}
              checked={currentResponse?.selectedOption.id === option.id}
              onChange={() => handleResponse(option)}
              className="mr-3"
            />
            <span className="text-gray-700">{option.label}</span>
          </label>
        ))}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between space-x-2">
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
        >
          Previous
        </button>
          
        <button
          onClick={handleNext}
          disabled={!currentResponse}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:bg-blue-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
        >
          {currentQuestionIndex === questions.length - 1 ? 'Complete' : 'Next'}
        </button>
      </div>

      {/* Waiting for Customer Agreement */}
      {isCompleted && !customerAgreed && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-yellow-800 text-sm font-medium">
              Waiting for customer to review and agree to the verification summary...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Questionnaire;
