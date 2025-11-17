<video controls>
  <source src="videos/10ChapterNovellaTemplateConvertedToBook.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

<video controls>
  <source src="videos/10_pages_for_dog_story.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>


# AI-Powered 10-Chapter Novella Generator

A web-based creative writing assistant that empowers users to generate complete 10-chapter novellas from a single topic idea. The application leverages the Google Gemini AI to draft a story and an accompanying cover image, presenting the final output in an interactive, 3D flippable digital book format.

The core of the application is a structured prompting mechanism based on a proven 10-chapter novella template, ensuring that the generated stories have a coherent plot progression, from the initial hook to the final resolution. Users can interact with the generated book, turn pages with a satisfying animation, and download the full story as a text file for later use. The application also includes developer/debug modes for viewing the base template and testing with a default cover image.

---

## Features
- **AI Story Generation**: Generate unique 10-chapter novellas from any topic using Google Gemini AI
- **AI Cover Art Generation**: Create contextually relevant book cover images for each story
- **Interactive 3D Book Interface**: Flip through pages with realistic 3D turning animations
- **Text File Download**: Download complete stories (title and all chapters) as .txt files
- **Collapsible Input UI**: Minimize controls for unobstructed book viewing
- **Template Viewer Mode**: Debug feature to view the underlying 10-chapter writing template
- **Debug Cover Mode**: Toggle a default "Cat Cover" image for testing
- **Genre Selection**: Choose from various genres (Fantasy, Science Fiction, Mystery, Romance, etc.) to guide AI generation
- **Loading Animations**: Visual progress indicators during story and image generation
- **Story History**: Local storage of generated stories with quick access to previous content
- **Story Editing**: Post-generation editing capabilities to modify and improve stories
- **Export Options**: PDF and EPUB export functionality for professional publishing
- **Responsive Design**: Optimized for mobile devices and various screen sizes
- **PWA Support**: Progressive Web App capabilities for offline access
- **Accessibility**: Full keyboard navigation and screen reader support

---

## Tech Stack
- **TypeScript** (React-style JSX, DOM manipulation)
- **Vite** (build tool)
- **@google/genai** and **@google/generative-ai** (Gemini API)
- **CSS** (custom theming with Material Design aesthetic)

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
- Enter a topic in the textarea (e.g., "A lonely lighthouse keeper who discovers a message in a bottle").
- Select a genre to guide the AI story generation.
- Use the checkboxes to toggle "View Template" (debug mode) and "Cat Cover" (use sample cover image).
- Click **Generate** to create your novella.
- Interact with the 3D book: click pages or use keyboard (Enter/Space) to flip through chapters.
- Use the **Download** button to save the complete story as a text file.
- Access story history and editing features for previously generated content.
- Export stories as PDF or EPUB for publishing.

---

## Scripts
- `npm run dev` – Start the development server
- `npm run build` – Build for production
- `npm run preview` – Preview the production build

---

## Project Structure (root files)
- `index.html` – Main HTML file, includes import maps and Google Fonts
- `index.tsx` – Main TypeScript logic for UI, AI integration, and book interactions
- `index.css` – App styling and theming with Material Design
- `vite.config.ts` – Vite configuration (API key injection, path aliases)
- `tsconfig.json` – TypeScript configuration
- `package.json` – Project metadata and dependencies
- `metadata.json` – App description and metadata
- `StorySupportFiles/` – Contains template files and debug assets
- `videos/` – Demo videos showcasing the application

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
