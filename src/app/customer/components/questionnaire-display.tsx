import React from 'react';
import { Question, QuestionOption } from '../../data/questionnaire';
import ProgressBar from './progress-bar';

interface CustomerResponse {
  selectedOption: QuestionOption;
  timestamp: Date;
}

interface QuestionnaireDisplayProps {
  isStarted: boolean;
  currentQuestion: Question | null;
  questionIndex: number;
  totalQuestions: number;
  isCompleted: boolean;
  responses: Record<string, CustomerResponse>;
}

const QuestionnaireDisplay: React.FC<QuestionnaireDisplayProps> = ({
  isStarted,
  currentQuestion,
  questionIndex,
  totalQuestions,
  isCompleted,
  responses
}) => {
  console.log('🎯 QuestionnaireDisplay render:', { 
    isStarted, 
    currentQuestion: currentQuestion?.question, 
    questionIndex, 
    totalQuestions, 
    isCompleted 
  });

  if (!isStarted && !isCompleted) {
    return null;
  }

  


  if (!currentQuestion) return null;

  const currentResponse = responses[currentQuestion.id];

  return (
    <div className="absolute top-0 left-0 right-0 bg-white z-30 border-b shadow-sm">
      <ProgressBar
        current={questionIndex}
        total={totalQuestions}
      />

      {/* Question Content */}
      <div className="p-2">
        {/* Question */}
        <div className="mb-2">
          <h2 className="text-base text-gray-800 leading-relaxed">
            Q{questionIndex + 1}. {currentQuestion.question}
          </h2>
        </div>

        {/* Response Display */}
        {currentResponse && (
          <div className="mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Response:</span>
              <span className="text-sm font-bold text-black">
                {currentResponse.selectedOption.label}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionnaireDisplay;