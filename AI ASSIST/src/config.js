// Configuration file for the AI ASSIST add-in
export const API_KEY_HEADER = 'X-API-Key';
// export const GEMINI_API_KEY = 'YOUR_API_KEY_HERE'; // Removed - Now managed via settings

// List of available writing tones
export const TONES = [
  { key: 'formal', text: 'Formal' },
  { key: 'casual', text: 'Casual' },
  { key: 'persuasive', text: 'Persuasive' },
  { key: 'academic', text: 'Academic' },
  { key: 'professional', text: 'Professional' },
  { key: 'friendly', text: 'Friendly' },
  { key: 'technical', text: 'Technical' },
];

// List of available audiences
export const AUDIENCES = [
  { key: 'general', text: 'General' },
  { key: 'students', text: 'Students' },
  { key: 'parents', text: 'Parents' },
  { key: 'professionals', text: 'Professionals' },
  { key: 'executives', text: 'Executives' },
  { key: 'technical', text: 'Technical' },
  { key: 'children', text: 'Children' },
];

// List of rewriting styles
export const REWRITING_STYLES = [
  { key: 'simple', text: 'Simple' },
  { key: 'formal', text: 'Formal' },
  { key: 'creative', text: 'Creative' },
  { key: 'concise', text: 'Concise' },
  { key: 'elaborate', text: 'Elaborate' },
];

// List of document templates
export const DOCUMENT_TEMPLATES = [
  { key: 'business_letter', text: 'Business Letter' },
  { key: 'report', text: 'Report' },
  { key: 'lesson_plan', text: 'Lesson Plan' },
  { key: 'student_feedback', text: 'Student Feedback' },
  { key: 'resume', text: 'Resume' },
  { key: 'cover_letter', text: 'Cover Letter' },
  { key: 'proposal', text: 'Proposal' },
];

// List of desired lengths for generated content
export const LENGTH_OPTIONS = [
  { key: 'one_sentence', text: 'One Sentence' },
  { key: 'short', text: 'Short Paragraph (Approx. 1-2)' },
  { key: 'medium', text: 'Medium Paragraphs (Approx. 3-5)' },
  { key: 'long', text: 'Long Form (Multiple Paragraphs)' },
  { key: 'essay', text: 'Essay (Detailed Explanation)' },
  { key: 'research_paper', text: 'Research Paper (In-depth, Structured)' },
];

// List of available Gemini models
export const GEMINI_MODELS = [
  { key: 'gemini-1.5-flash-latest', text: 'Gemini 1.5 Flash (Latest)' }, // Alias for the latest stable 1.5 Flash
  { key: 'gemini-1.5-pro-latest', text: 'Gemini 1.5 Pro (Latest)' }, // Alias for the latest stable 1.5 Pro
  { key: 'gemini-2.0-flash', text: 'Gemini 2.0 Flash (Latest Stable)' }, // Stable 2.0 Flash
  { key: 'gemini-2.0-flash-lite', text: 'Gemini 2.0 Flash Lite (Latest Stable)' }, // Stable 2.0 Flash Lite
  { key: 'gemini-2.5-flash-preview-04-17', text: 'Gemini 2.5 Flash (Preview)' }, // Preview 2.5 Flash
  { key: 'gemini-2.5-pro-preview-03-25', text: 'Gemini 2.5 Pro (Preview)' }, // Preview 2.5 Pro
];