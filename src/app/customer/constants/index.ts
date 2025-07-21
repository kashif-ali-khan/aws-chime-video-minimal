// Customer Interface Constants

// Socket Configuration
export const SOCKET_CONFIG = {
  REGISTRATION_INTERVAL: 1000,
  AGENT_TARGET_ID: 'agent1',
} as const;

// Image Processing Constants
export const IMAGE_PROCESSING = {
  CHUNK_SIZE: 10 * 1024, // 10KB chunks
  CAPTURE_DELAY: 2000, // 2 seconds
} as const;

// UI Text Constants
export const UI_TEXT = {
  CONNECT_WITH_AGENT: 'Connect with Agent',
  TAP_TO_START: 'Tap to start video call',
  START_CALL: 'Start Call',
  CONNECTING: 'Connecting...',
  WAITING_FOR_AGENT: 'Waiting for Agent',
  WAITING_MESSAGE: 'Please wait while we connect you to an available agent...',
  CANCEL: 'Cancel',
  WAITING_FOR_AGENT_JOIN: 'Waiting for agent to join...',
  ALL_QUESTIONS_ANSWERED: 'All questions answered, showing verification summary',
  CUSTOMER_AGREED: 'Customer agreed to verification summary',
} as const;

// Video Configuration
export const VIDEO_CONFIG = {
  LOCAL_VIDEO_CLASSES: 'absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg object-cover z-10',
  REMOTE_VIDEO_CLASSES: 'w-full h-full object-cover',
  COUNTDOWN_FONT_SIZE: '72px',
  COUNTDOWN_Z_INDEX: 20,
} as const;

// Button Styles
export const BUTTON_STYLES = {
  PRIMARY_ENABLED: 'bg-blue-600 text-white hover:bg-blue-700',
  PRIMARY_DISABLED: 'bg-gray-600 text-gray-300 cursor-not-allowed',
  CANCEL: 'bg-red-600 text-white py-2 px-6 rounded-full font-semibold hover:bg-red-700 transition-colors',
  CALL_CONTROL: 'p-4 rounded-full transition-colors shadow-lg',
  AUDIO_MUTED: 'bg-red-500 text-white hover:bg-red-600',
  AUDIO_ENABLED: 'bg-green-500 text-white hover:bg-green-600',
  END_CALL: 'bg-red-500 text-white p-4 rounded-full hover:bg-red-600 transition-colors shadow-lg',
} as const;

// Icon Sizes
export const ICON_SIZES = {
  LARGE: 'w-24 h-24',
  MEDIUM: 'w-16 h-16',
  SMALL: 'w-12 h-12',
  CONTROL: 'w-6 h-6',
  EXTRA_SMALL: 'w-8 h-8',
} as const;

// Layout Classes
export const LAYOUT_CLASSES = {
  FULL_SCREEN: 'min-h-screen bg-black',
  CENTER_SCREEN: 'h-screen flex items-center justify-center bg-gray-900',
  CENTER_CONTENT: 'text-center',
  FLEX_ROW: 'flex space-x-4',
  ABSOLUTE_OVERLAY: 'absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75',
  BOTTOM_CONTROLS: 'absolute bottom-8 left-1/2 transform -translate-x-1/2',
} as const;

// Animation Classes
export const ANIMATION_CLASSES = {
  SPIN: 'animate-spin',
  PULSE: 'pulse 1s infinite',
  TRANSITION_COLORS: 'transition-colors',
} as const;

// Z-Index Values
export const Z_INDEX = {
  OVERLAY: 10,
  COUNTDOWN: 20,
  MODAL: 50,
  VIDEO_CONTROLS: 10,
} as const;

// Customer Generation
export const CUSTOMER_GENERATION = {
  ID_PREFIX: 'customer-',
  MEETING_ID_PREFIX: 'meetingId-',
  NAME_PREFIX: 'Customer ',
  MAX_CUSTOMER_NUMBER: 1000,
} as const;

// Capture Overlay Styles
export const CAPTURE_OVERLAY_STYLES = {
  BACKGROUND_OPACITY: 'rgba(0, 0, 0, 0.7)',
  INSTRUCTION_STYLES: {
    color: 'white',
    fontSize: '18px',
    fontWeight: 'bold',
    textAlign: 'center' as const,
    background: 'rgba(0, 0, 0, 0.7)',
    padding: '12px 24px',
    borderRadius: '8px',
  },
} as const;

// Console Log Prefixes
export const LOG_PREFIXES = {
  QUESTIONNAIRE_STARTED: '🟢 Customer: Questionnaire started event received:',
  QUESTIONNAIRE_STATE_UPDATED: '🟢 Customer: Questionnaire state updated - started:',
  QUESTION_RECEIVED: '🔵 Customer: Question event received:',
  QUESTION_STATE_UPDATED: '🔵 Customer: Question state updated:',
} as const;