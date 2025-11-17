<video controls>
  <source src="videos/10ChapterNovellaTemplateConvertedToBook.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

<video controls>
  <source src="videos/10_pages_for_dog_story.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>


# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
   
# 10-Chapter Novella Template

A web application that helps you generate a novella using a structured 10-chapter template. Powered by Google Gemini AI, it drafts story content and generates a cover image based on your topic.

---

## Features
- **AI-Powered Novella Generation**: Uses Gemini to generate a 10-chapter novella from your topic.
- **Automatic Cover Creation**: Generates a cover image for your story (or uses a debug cat cover).
- **Interactive UI**: Easily input your topic, toggle debug/template modes, and preview your novella.
- **Modern Design**: Responsive, clean interface styled with CSS variables and Google Fonts.

---

## Tech Stack
- **TypeScript** (React-style JSX, DOM manipulation)
- **Vite** (build tool)
- **@google/genai** and **@google/generative-ai** (Gemini API)
- **CSS** (custom theming)

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- A Gemini API key ([get one here](https://aistudio.google.com/app/apikey))

### Installation
1. Clone this repository or download the source.
2. Install dependencies:
   ```sh
   npm install
   ```
3. Create a `.env.local` file in the root directory and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your-gemini-api-key-here
   ```
4. Run the app locally:
   ```sh
   npm run dev
   ```
5. Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Configuration
- The app reads your Gemini API key from `.env.local` and injects it at build time.
- You can adjust Vite and TypeScript settings in `vite.config.ts` and `tsconfig.json`.

---

## Usage
- Enter a topic in the input box.
- Use the checkboxes to toggle "View Template" (debug mode) and "Cat Cover" (use a sample cover image).
- Click **Generate** to create your novella.
- Navigate through chapters and view the generated cover.

---

## Scripts
- `npm run dev` – Start the development server
- `npm run build` – Build for production
- `npm run preview` – Preview the production build

---

## Project Structure (root files)
- `index.html` – Main HTML file, includes import maps and Google Fonts
- `index.tsx` – Main TypeScript logic for UI and AI integration
- `index.css` – App styling and theming
- `vite.config.ts` – Vite configuration (API key injection, path aliases)
- `tsconfig.json` – TypeScript configuration
- `package.json` – Project metadata and dependencies
- `metadata.json` – App description and metadata

---

## License

This project is licensed under the [Apache-2.0 License](https://www.apache.org/licenses/LICENSE-2.0).
