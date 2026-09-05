# EXAMPLE — AI Interactive Visual Learning App

**EXAMPLE** is an interactive, AI-powered learning application that transforms any academic or programming problem into a step-by-step visual lesson with grounded quizzes and adaptive re-teaching.

---

##  Key Features

- **Visual Lesson Generation**: Converts complex problems into a sequence of step-by-step interactive visual scenes powered by Google Gemini AI.
- **Subject Modes**:
  - **GENERAL**: Tailored for Math, Physics, Chemistry, and Logic — produces formulas, unit conversions, and clean SVG diagrams (zero code clutter).
  - **CODING**: Tailored for Computer Science and Competitive Programming — produces full compileable C++ / Python implementations.
- **Dynamic Math & SVG Rendering**: Render LaTeX math expressions via KaTeX, custom SVG vector graphics, sequence tables, and number lines.
- **Grounded Quizzes**: Automatically generates targeted multiple-choice questions linked to specific lesson scenes.
- **Adaptive Misconception Re-teaching**: Detects wrong answers and re-explains misunderstood concepts using alternative visual analogies.
- **Solutions History Drawer**: Automatically extracts clean formulas or C++ code snippets into a slide-over history drawer with fail-safe copy capabilities.
- **Brutalist UI Aesthetics**: Premium high-contrast yellow & black design system built with Framer Motion animations.

---

##  Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Server Actions)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **AI Engine**: [Google Gemini API](https://ai.google.dev/) (`@google/genai`)
- **Styling & Motion**: Tailwind CSS, [Framer Motion](https://www.framer.com/motion/), Magic UI
- **Math Rendering**: KaTeX
- **Security & Safety**: DOMPurify (client-side SVG sanitization)

---

##  Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

> Get your API key from [Google AI Studio](https://aistudio.google.com/apikey).

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

##  License

MIT © 2026 EXAMPLE
