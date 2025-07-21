import React from 'react';
import { Question, QuestionOption } from '../../data/questionnaire';

interface CustomerResponse {
  selectedOption: QuestionOption;
  timestamp: Date;
}

interface VerificationSummaryProps {
  questions: Question[];
  responses: Record<string, CustomerResponse>;
  isVisible: boolean;
  onAgree: () => void;
  onClose: () => void;
}

const VerificationSummary: React.FC<VerificationSummaryProps> = ({
  questions,
  responses,
  isVisible,
  onAgree,
  onClose
}) => {
  if (!isVisible) return null;

  // Use actual questions and responses
  const verificationItems = questions.map((question) => ({
    questionId: question.id,
    text: question.question,
    response: responses[question.id]?.selectedOption.label || 'No'
  }));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Summary of your verification</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {verificationItems.map((item, index) => (
            <div key={item.questionId} className="mb-6">
              <p className="text-gray-700 text-base leading-relaxed mb-2">
                Q{index + 1}. {item.text} <span className="font-bold text-black">{item.response}</span>
              </p>
            </div>
          ))}
        </div>

        {/* Footer with I Agree button */}
        <div className="p-6 border-t flex justify-center">
          <button
            onClick={onAgree}
            className="bg-[#97144D] text-white px-12 py-4 rounded-full text-lg font-medium hover:bg-[#7a103d] transition-colors shadow-lg hover:shadow-xl"
          >
            I Agree
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerificationSummary;