# AI ASSIST - Microsoft Word Add-in

AI ASSIST is a Microsoft Word add-in that integrates with Google's Gemini API to provide AI-powered writing assistance directly within your documents.

## Features

### 1. Writing Style and Tone Suggestions
- Analyzes your writing and suggests improvements based on selected tone (formal, casual, persuasive, etc.)
- Helps maintain consistent tone throughout your documents

### 2. Audience Adaptation
- Adapts your content for different audiences (students, parents, professionals, etc.)
- Makes your writing more accessible and relevant to the target reader

### 3. Text Rewriting / Paraphrasing
- Helps rephrase sentences for better clarity or to avoid repetition
- Offers different rewriting styles (simple, formal, creative, concise, elaborate)

### 4. Smart Autocomplete / Predictive Text
- Predicts and suggests the next word or sentence based on context
- Speeds up writing with intelligent continuations

### 5. Summarization
- Summarizes long documents or sections into concise text
- Creates bullet points or short paragraphs for effective communication

### 6. Auto-Generation of Documents
- Templates for various document types (business letters, reports, lesson plans, etc.)
- Generate first drafts from keywords and prompts

## Installation

### Prerequisites
- Microsoft Word (desktop version)
- Node.js and npm

### Setup Instructions

1. Clone this repository:
   ```
   git clone <repository-url>
   cd "AI ASSIST"
   ```

2. Install the dependencies:
   ```
   npm install
   ```

3. Add your Gemini API key:
   - Sign up for a Google API key at https://makersuite.google.com/
   - Open `src/config.js` and replace `YOUR_GEMINI_API_KEY` with your actual API key

4. Start the development server:
   ```
   npm start
   ```

5. Sideload the add-in in Word:
   - Follow the instructions that appear in the console after running `npm start`
   - Or follow Microsoft's official guide: [Sideload Office Add-ins for testing](https://learn.microsoft.com/en-us/office/dev/add-ins/testing/test-debug-office-add-ins)

## Usage

1. Open Microsoft Word
2. Navigate to the Home tab in the ribbon
3. Click on the "AI ASSIST" button
4. Select text in your document that you want to improve
5. Choose the desired feature from the navigation tabs
6. Follow the instructions for each feature
7. Apply the AI suggestions to your document

## Development

### Folder Structure
- `src/` - Source code
  - `taskpane/` - Main UI components
  - `services/` - API services
  - `utils/` - Utility functions
  - `config.js` - Configuration settings

### Building for Production
```
npm run build
```

### Deploying to Production
Follow Microsoft's guide for [publishing Office Add-ins](https://learn.microsoft.com/en-us/office/dev/add-ins/publish/publish).

## License
[MIT](LICENSE)

## Acknowledgements
- This add-in uses [Google's Generative AI](https://ai.google.dev/) (Gemini)
- Built with [Office Add-ins framework](https://learn.microsoft.com/en-us/office/dev/add-ins/)
- UI components from [Fluent UI React](https://developer.microsoft.com/en-us/fluentui) 