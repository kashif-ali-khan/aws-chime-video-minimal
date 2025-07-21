import { useState, useEffect } from 'react';
import { Question, QuestionOption } from '../../data/questionnaire';
import { UI_TEXT } from '../constants';

interface CustomerResponse {
  selectedOption: QuestionOption;
  timestamp: Date;
}

interface UseVerificationSummaryProps {
  questionnaireStarted: boolean;
  questionsList: Question[];
  questionnaireResponses: Record<string, CustomerResponse>;
  onCustomerAgreement: (responses: Record<string, CustomerResponse>) => void;
}

export const useVerificationSummary = ({
  questionnaireStarted,
  questionsList,
  questionnaireResponses,
  onCustomerAgreement,
}: UseVerificationSummaryProps) => {
  const [showVerificationSummary, setShowVerificationSummary] = useState(false);
  const [customerHasAgreed, setCustomerHasAgreed] = useState(false);

  // Check if all questions are answered and show verification summary
  useEffect(() => {
    const allQuestionsAnswered =
      questionnaireStarted &&
      questionsList.length > 0 &&
      Object.keys(questionnaireResponses).length === questionsList.length;
    
    if (
      allQuestionsAnswered &&
      !showVerificationSummary &&
      !customerHasAgreed
    ) {
      console.log(UI_TEXT.ALL_QUESTIONS_ANSWERED);
      setShowVerificationSummary(true);
    }
  }, [
    questionnaireStarted,
    questionsList.length,
    questionnaireResponses,
    showVerificationSummary,
    customerHasAgreed
  ]);

  const handleCustomerAgreement = () => {
    console.log(UI_TEXT.CUSTOMER_AGREED);
    setCustomerHasAgreed(true);
    onCustomerAgreement(questionnaireResponses);
    setShowVerificationSummary(false);
  };

  const handleVerificationSummaryClose = () => {
    setShowVerificationSummary(false);
  };

  const resetVerificationState = () => {
    setShowVerificationSummary(false);
    setCustomerHasAgreed(false);
  };

  return {
    showVerificationSummary: !customerHasAgreed && showVerificationSummary,
    customerHasAgreed,
    handleCustomerAgreement,
    handleVerificationSummaryClose,
    resetVerificationState,
  };
};