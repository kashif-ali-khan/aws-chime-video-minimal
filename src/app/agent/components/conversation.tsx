import React from "react";
import { Question, QuestionnaireResponse } from "../../data/questionnaire";

interface ConversationProps {
  questions?: Question[];
  responses?: Record<string, QuestionnaireResponse>;
  isCompleted?: boolean;
  currentQuestionIndex?: number;
  isStarted?: boolean;
  customerAgreed?: boolean;
  onSubmit?: () => void;
}

const Conversation: React.FC<ConversationProps> = ({ 
  questions = [], 
  responses = {}, 
  isCompleted = false,
  currentQuestionIndex = 0,
  isStarted = false,
  customerAgreed = false,
  onSubmit 
}) => {
  return (
    <div className="h-full bg-white p-4 rounded-xl shadow m-4 max-h-[750px] overflow-y-auto space-y-4">
      <h3 className="text-[#143C76] font-semibold mb-4">Show Conversation</h3>
      
      {/* Display questions and responses progressively */}
      {isStarted && (
        <div className="space-y-4">
          {questions.slice(0, currentQuestionIndex + 1).map((question, index) => {
            const response = responses[question.id];
            const questionNumber = index + 1;
            
            return (
              <div key={question.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                {/* Question */}
                <div className="mb-2">
                  <p className="text-sm font-medium text-gray-800">
                    Q{questionNumber}. {question.question}
                  </p>
                </div>
                
                {/* Response */}
                {response && (
                  <div className="ml-4">
                    <p className="text-xs text-gray-500 mb-1">Response:</p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 inline-block">
                      <p className="text-sm text-blue-800 font-medium">
                        {response.selectedOption.label}
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Show "Not answered yet" for the current question if not answered */}
                {!response && index === currentQuestionIndex && (
                  <div className="ml-4">
                    <p className="text-xs text-gray-400 italic">Waiting for response...</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      
      {/* Show message when questionnaire hasn't started */}
      {!isStarted && (
        <div className="text-center text-gray-500 py-8">
          <p>Questionnaire not started yet</p>
        </div>
      )}
      
      {/* Submit button when questionnaire is completed */}
      {isCompleted && customerAgreed && onSubmit && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={onSubmit}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Submit Questionnaire
          </button>
        </div>
      )}
    </div>
  );
};

export default Conversation;
