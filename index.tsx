/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import {GoogleGenAI, GenerateContentResponse, Type} from '@google/genai';

// Global flags, will be updated by checkboxes
let currentDebugMode = false;
let currentDebugCover = true; // Default to true as per previous behavior and checkbox default

interface Page {
  term: string;
  definition: string;
  coverImageBase64?: string;
  backCoverImageBase64?: string | null;
}

interface Chapter {
  chapterNumber: number;
  text: string;
}

interface BookContent {
  title: string;
  chapters: Chapter[];
  coverImageBase64?: string; // Can be API generated or debug cover
}

interface BookOutput {
  book: BookContent;
}

const topicInput = document.getElementById('topicInput') as HTMLTextAreaElement;
const generateButton = document.getElementById('generateButton') as HTMLButtonElement;
const downloadStoryButton = document.getElementById('downloadStoryButton') as HTMLButtonElement;
const pagesContainer = document.getElementById('pagesContainer') as HTMLDivElement;
const errorMessage = document.getElementById('errorMessage') as HTMLDivElement;
const toggleInputSectionButton = document.getElementById('toggleInputSectionButton') as HTMLButtonElement;
const collapsibleControls = document.getElementById('collapsibleControls') as HTMLDivElement;
const inputSection = document.querySelector('.input-section') as HTMLElement;
const debugModeCheckbox = document.getElementById('debugModeCheckbox') as HTMLInputElement;
const debugCoverCheckbox = document.getElementById('debugCoverCheckbox') as HTMLInputElement;

const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

let currentPageIndex = 0;
let pageElements: HTMLDivElement[] = [];
let allPages: Page[] = [];
let activeBackCoverImageBase64: string | null = null; // Stores base64 of debug_cover.jpg if currentDebugCover is true
let lastRawBookContent: BookContent | null = null; // Stores the raw book content from API before debug cover override

async function getImageAsBase64(imageUrl: string): Promise<string | null> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      console.error(`Failed to fetch image: ${response.statusText} from ${imageUrl}`);
      errorMessage.textContent = `Error: Could not load ${imageUrl}. Ensure it's in the correct location.`;
      return null;
    }
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          resolve((reader.result as string).split(',')[1]);
        } else {
          reject(new Error("FileReader did not successfully read the file."));
        }
      };
      reader.onerror = (error) => {
        console.error(`FileReader error for ${imageUrl}:`, error);
        reject(error);
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error(`Error fetching or converting image ${imageUrl}:`, error);
    errorMessage.textContent = `Error processing ${imageUrl}.`;
    return null;
  }
}

async function setupDebugStory() {
    errorMessage.textContent = 'Using debug story...';
    let coverImageForDebugStory: string | undefined;

    if (currentDebugCover && activeBackCoverImageBase64) {
        coverImageForDebugStory = activeBackCoverImageBase64;
    } else if (currentDebugCover && !activeBackCoverImageBase64) {
        coverImageForDebugStory = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="; // Placeholder
        console.warn("currentDebugCover is true, but debug_cover.jpg failed to load. Using placeholder for front cover.");
        if (!errorMessage.textContent?.includes('Error: Could not load debug_cover.jpg')) {
             errorMessage.textContent = 'Debug story loaded. (Warning: debug_cover.jpg failed for cover)';
        }
    } else { // currentDebugCover is false, use placeholder for debug story
        coverImageForDebugStory = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";
    }

    const debugBookData: BookContent = {
        title: "The Template's Tale: A 10-Chapter Debug Journey",
        coverImageBase64: coverImageForDebugStory,
        chapters: [
          { chapterNumber: 1, text: "Chapter 1: The Hook - Start with a mystery, a question that is provocative and creates an information gap that readers want to fill.\nSee if you could condense this mystery into a single visual image.\nIntroduce the protagonist and the setting.\nPlant seeds of central conflict or problem.\nEstablish the mood.\nHave the protagonist do something that makes them compelling (i.e., they are really competent at something, they perform a kind act, they are oppressed, etc.)." },
          { chapterNumber: 2, text: "Chapter 2: The Inciting Incident - Something happens that turns the Ordinary World of the protagonist upside down.\nIt is not something that can be resolved on its own.\nThere is a lot of conflict.\nThe protagonist is hesitant to engage, but is forced to by events outside of their control.\nThey are forced to make a choice, one that takes them out of their comfort zone and into the \"New World\" of uncertainty in order to resolve this problem." },
          { chapterNumber: 3, text: "Chapter 3: The New World - The protagonist is uncomfortable in their new world.\nThey meet allies who might help them in their quest (mentor, side-kick, love interest), although the cast might be a lot leaner than in a novel. One side character is common.\nMore information about the antagonist might be revealed, directly or indirectly.\nThe protagonist may be given information, items, weapons, or other tools that may help them on their journey.\nThere is a lot of tension." },
          { chapterNumber: 4, text: "Chapter 4: The First Pinch Point - The protagonist goes through the first major try/fail cycle to try and achieve their goals.\nThey have an encounter with the antagonist or the forces of the antagonist.\nThey fail but survive, and maybe even learned some lessons that will help them in the future.\nThere may be a revelation that changes everything.\nThe protagonist realizes that they've underestimated the antagonist.\nThe stakes are raised." },
          { chapterNumber: 5, text: "Chapter 5: The Midpoint - Major turning point that transforms the protagonist from reactive to proactive.\nBuilds on the fallout from the First Pinch Point and the revelation.\nForces the protagonist to reassess their situation.\nMay be an emotional moment, often deepening relationships with other characters, thereby increasing the stakes.\nThere may be a partial success, a glimmer of hope or small victory that motivates the protagonist to press on." },
          { chapterNumber: 6, text: "Chapter 6: The Second Pinch Point - The protagonist gets ready to try again, this time taking a more proactive approach.\nThey fail again or are interrupted by the antagonist or forces of the antagonist.\nThey suffer another literal or figurative battle with the antagonist, and once again they go through another try/fail cycle. This time the consequences are more severe.\nThere is increased tension and stakes.\nGood place for a plot twist." },
          { chapterNumber: 7, text: "Chapter 7: The Darkest Moment - The \"All is Lost\" moment; the protagonist reacts to their greatest setback.\nThe protagonist is forced to confront their greatest flaw or fear.\nDemonstrates the true cost of the journey.\nThey are at their lowest point; they are ready to give up.\nWe may see the antagonist or forces of the antagonist seem poised to win." },
          { chapterNumber: 8, text: "Chapter 8: Climax Prep - A \"pep talk\" either by the protagonist themselves, an ally, a revelation or another outside influence, gets the protagonist and their allies going again.\nThey make a plan of attack, even against overwhelming odds.\nThey may gain resources/information that they didn't have previously that will help.\nThe protagonist shows themselves capable of confronting and overcoming their flaw (although they haven't done so fully yet).\nAll plot threads converge." },
          { chapterNumber: 9, text: "Chapter 9: The Climax - The protagonist and potential allies confront the antagonist.\nAllies may fall behind, leaving the protagonist alone.\nThey once again fail, and the antagonist thinks they have won.\nThe protagonist has a moment of introspection, before gathering their strength and finding a way, however unexpected or improbable, to succeed.\nThe antagonist is defeated.\nThis decisive action resolves the primary conflict." },
          { chapterNumber: 10, text: "Chapter 10: Resolution - Wrap up any loose ends of the story.\nShow the protagonist and how they've grown.\nResolve any key relationships and emotional arcs.\nEnd with a powerful final image that encapsulates the theme." },
        ]
    };
    allPages = transformBookOutputToPages({ book: debugBookData });
    renderPages();
    if (!errorMessage.textContent?.includes('debug_cover.jpg')) {
        errorMessage.textContent = `Debug story loaded. ${currentDebugCover ? (activeBackCoverImageBase64 ? '(Using Cat Cover)' : '(Cat Cover failed to load)') : '(No Cat Cover)'}`;
    }
    lastRawBookContent = null; // Clear API content if switching to debug
}


function handleTurnBackInteraction(
  clickedBackSegment: HTMLDivElement,
  pageIndexOfThisBack: number,
  totalPages: number
) {
  const correspondingFrontSegment = pageElements[pageIndexOfThisBack];

  clickedBackSegment.classList.remove('is-revealed');
  clickedBackSegment.setAttribute('aria-hidden', 'true');
  clickedBackSegment.setAttribute('tabindex', '-1');
  
  const backPageData = allPages[pageIndexOfThisBack];
  let backAriaLabel = `Page ${pageIndexOfThisBack + 1} of ${totalPages}, back. `;
  if (backPageData.backCoverImageBase64) {
    backAriaLabel += `Contains a decorative image.`;
  } else {
    backAriaLabel += `Blank page.`;
  }
  clickedBackSegment.setAttribute('aria-label', backAriaLabel);


  if (correspondingFrontSegment) {
    correspondingFrontSegment.classList.remove('is-turned');
    correspondingFrontSegment.classList.add('current');
    correspondingFrontSegment.setAttribute('tabindex', '0');
    correspondingFrontSegment.setAttribute('aria-hidden', 'false');
    const pageData = allPages[pageIndexOfThisBack];
    let ariaLabel = `Current page ${pageIndexOfThisBack + 1} of ${totalPages}, front. `;
    if (pageIndexOfThisBack === 0 && pageData.coverImageBase64) {
      ariaLabel += `Cover page with image. Title: ${pageData.term}.`;
    } else {
      ariaLabel += `Section: ${pageData.term}. ${pageData.definition ? 'Content follows.' : 'Title page.'}`;
    }
    ariaLabel += ` Press Enter or Space to turn page.`;
    correspondingFrontSegment.setAttribute('aria-label', ariaLabel);
    correspondingFrontSegment.focus();
  }

  if (currentPageIndex < totalPages && currentPageIndex !== pageIndexOfThisBack) {
    const previouslyCurrentFrontSegment = pageElements[currentPageIndex];
    if (previouslyCurrentFrontSegment) {
        previouslyCurrentFrontSegment.classList.remove('current');
        previouslyCurrentFrontSegment.setAttribute('tabindex', '-1');
        previouslyCurrentFrontSegment.setAttribute('aria-hidden', 'true');
        const prevPageData = allPages[currentPageIndex];
        let prevAriaLabel = `Page ${currentPageIndex + 1} of ${totalPages}, front. `;
         if (currentPageIndex === 0 && prevPageData.coverImageBase64) {
            prevAriaLabel += `Cover page with image. Title: ${prevPageData.term}.`;
        } else {
            prevAriaLabel += `Section: ${prevPageData.term}. ${prevPageData.definition ? 'Content follows.' : 'Title page.'}`;
        }
        prevAriaLabel += ` Press Enter or Space to turn page.`;
        previouslyCurrentFrontSegment.setAttribute('aria-label', prevAriaLabel);
    }
  }
  
  currentPageIndex = pageIndexOfThisBack;

  if (errorMessage.textContent?.startsWith('End of book!')) {
    errorMessage.textContent = '';
  }
}


function handleFaceInteraction(
  frontSegmentElement: HTMLDivElement,
  pageIndex: number,
  totalPages: number,
) {
  if (!frontSegmentElement.classList.contains('current')) return;

  const backSegmentElement = pagesContainer.querySelector(
    `.page-segment--back[data-page-index="${pageIndex}"]`
  ) as HTMLDivElement | null;

  frontSegmentElement.classList.add('is-turned');
  frontSegmentElement.classList.remove('current');
  frontSegmentElement.setAttribute('tabindex', '-1');
  frontSegmentElement.setAttribute('aria-hidden', 'true');
  
  const pageData = allPages[pageIndex];
  let turnedAriaLabel = `Page ${pageIndex + 1} of ${totalPages}, front, turned. `;
  if (pageIndex === 0 && pageData.coverImageBase64) {
    turnedAriaLabel += `Cover page with image shown. Title: ${pageData.term}.`;
  } else {
    turnedAriaLabel += `Section: ${pageData.term}. ${pageData.definition ? 'Content was shown.' : 'Title page.'}`;
  }
  frontSegmentElement.setAttribute('aria-label', turnedAriaLabel);

  if (backSegmentElement) {
    backSegmentElement.classList.add('is-revealed');
    backSegmentElement.setAttribute('aria-hidden', 'false');
    backSegmentElement.setAttribute('tabindex', '0');
    
    const backPageData = allPages[pageIndex];
    let backAriaLabel = `Page ${pageIndex + 1} of ${totalPages}, back, revealed. `;
    if (backPageData.backCoverImageBase64) {
        backAriaLabel += `Contains a decorative image.`;
    } else {
        backAriaLabel += `Blank page.`;
    }
    backAriaLabel += ` Press Enter or Space to turn page back.`;
    backSegmentElement.setAttribute('aria-label', backAriaLabel);
  }

  currentPageIndex++;
  if (currentPageIndex < totalPages) {
    const nextFrontSegment = pageElements[currentPageIndex];
    nextFrontSegment.classList.add('current');
    nextFrontSegment.setAttribute('tabindex', '0');
    nextFrontSegment.setAttribute('aria-hidden', 'false');
    const nextPageData = allPages[currentPageIndex];
    let nextAriaLabel = `Current page ${currentPageIndex + 1} of ${totalPages}, front. `;
    nextAriaLabel += `Section: ${nextPageData.term}. ${nextPageData.definition ? 'Content follows.' : 'Title page.'}`;
    nextAriaLabel += ` Press Enter or Space to turn page.`;
    nextFrontSegment.setAttribute('aria-label', nextAriaLabel);
    nextFrontSegment.focus();
  } else {
    errorMessage.textContent = 'End of book! You can generate a new story or turn this page back.';
    if (backSegmentElement) {
      backSegmentElement.focus();
    } else {
      generateButton.focus();
    }
  }
}

function renderPages() {
  pagesContainer.innerHTML = '';
  pageElements = [];
  downloadStoryButton.disabled = allPages.length === 0;

  if (allPages.length === 0) {
    if (topicInput.value && !currentDebugMode && !errorMessage.textContent) {
       // Cleared state, maybe show a prompt to generate
       // errorMessage.textContent = "Enter a topic and click 'Generate'.";
    }
    return;
  }

  const totalPages = allPages.length;

  allPages.forEach((page, index) => {
    const frontSegmentDiv = document.createElement('div');
    frontSegmentDiv.classList.add('page-segment', 'page-segment--front');
    frontSegmentDiv.dataset.pageIndex = index.toString();
    frontSegmentDiv.setAttribute('role', 'button');
    frontSegmentDiv.setAttribute('aria-roledescription', 'page front');
    
    if (index === 0 && page.coverImageBase64) {
      const img = document.createElement('img');
      img.src = `data:image/jpeg;base64,${page.coverImageBase64}`;
      img.alt = `Cover image for ${page.term}`;
      img.classList.add('cover-image');
      frontSegmentDiv.appendChild(img);
    }

    const termDiv = document.createElement('div');
    termDiv.classList.add('term');
    termDiv.textContent = page.term;
    frontSegmentDiv.appendChild(termDiv);

    const definitionDivFront = document.createElement('div');
    definitionDivFront.classList.add('definition-content-front'); 
    if (page.definition) {
      definitionDivFront.textContent = page.definition; 
    }
    if (index > 0 || (index === 0 && page.definition)) {
         frontSegmentDiv.appendChild(definitionDivFront);
    }

    const backSegmentDiv = document.createElement('div');
    backSegmentDiv.classList.add('page-segment', 'page-segment--back');
    backSegmentDiv.dataset.pageIndex = index.toString();
    backSegmentDiv.setAttribute('role', 'button'); 
    backSegmentDiv.setAttribute('aria-roledescription', 'page back');
    backSegmentDiv.setAttribute('aria-hidden', 'true'); 
    backSegmentDiv.setAttribute('tabindex', '-1'); 
    
    let backAriaLabel = `Page ${index + 1} of ${totalPages}, back. `;
    if (page.backCoverImageBase64) {
        const backImg = document.createElement('img');
        backImg.src = `data:image/jpeg;base64,${page.backCoverImageBase64}`;
        backImg.alt = `Decorative image on back of page ${index + 1}`;
        backImg.classList.add('back-cover-image');
        backSegmentDiv.appendChild(backImg);
        backAriaLabel += `Contains a decorative image.`;
    } else {
        const definitionDivBack = document.createElement('div');
        definitionDivBack.classList.add('definition');
        definitionDivBack.innerHTML = '&nbsp;'; 
        backSegmentDiv.appendChild(definitionDivBack);
        backAriaLabel += `Blank page.`;
    }
    backSegmentDiv.setAttribute('aria-label', backAriaLabel);

    backSegmentDiv.style.zIndex = (index + 1).toString();
    const frontBaseZIndex = totalPages + (totalPages - index);
    frontSegmentDiv.style.zIndex = frontBaseZIndex.toString();

    let ariaLabelBase = "";
    if (index === 0 && page.coverImageBase64) {
        ariaLabelBase = `Cover page with image. Title: ${page.term}.`;
    } else {
        ariaLabelBase = `Section: ${page.term}. ${page.definition ? 'Content follows.' : (index === 0 ? 'Title page.' : 'No content.')}`;
    }

    if (index === 0) {
      frontSegmentDiv.classList.add('current');
      frontSegmentDiv.setAttribute('tabindex', '0');
      frontSegmentDiv.setAttribute('aria-hidden', 'false');
      frontSegmentDiv.setAttribute('aria-label', `Current page ${index + 1} of ${totalPages}, front. ${ariaLabelBase} Press Enter or Space to turn page.`);
    } else {
      frontSegmentDiv.setAttribute('tabindex', '-1'); 
      frontSegmentDiv.setAttribute('aria-hidden', 'true'); 
      frontSegmentDiv.setAttribute('aria-label', `Page ${index + 1} of ${totalPages}, front. ${ariaLabelBase} Press Enter or Space to turn page.`);
    }

    pagesContainer.appendChild(frontSegmentDiv);
    pagesContainer.appendChild(backSegmentDiv);
    pageElements.push(frontSegmentDiv);

    frontSegmentDiv.addEventListener('click', () => {
      handleFaceInteraction(frontSegmentDiv, index, totalPages);
    });
    frontSegmentDiv.addEventListener('keydown', (event) => {
      if ((event.key === 'Enter' || event.key === ' ') && frontSegmentDiv.classList.contains('current')) {
        event.preventDefault();
        handleFaceInteraction(frontSegmentDiv, index, totalPages);
      }
    });

    backSegmentDiv.addEventListener('click', () => {
      if (backSegmentDiv.classList.contains('is-revealed')) {
        handleTurnBackInteraction(backSegmentDiv, index, totalPages);
      }
    });
    backSegmentDiv.addEventListener('keydown', (event) => {
      if (backSegmentDiv.classList.contains('is-revealed') && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        handleTurnBackInteraction(backSegmentDiv, index, totalPages);
      }
    });
  });

  if (pageElements.length > 0) {
     pageElements[0].focus();
     currentPageIndex = 0;
  }
}

function transformBookOutputToPages(bookOutput: BookOutput): Page[] {
  const pages: Page[] = [];
  let backImageToUse: string | null | undefined = null;

  if (currentDebugCover && activeBackCoverImageBase64) {
    backImageToUse = activeBackCoverImageBase64;
  } else if (!currentDebugCover && bookOutput.book.coverImageBase64) {
    // If not using Cat Cover, and an API/main cover exists for the book, use that for back pages
    backImageToUse = bookOutput.book.coverImageBase64;
  }
  // If currentDebugCover is true but activeBackCoverImageBase64 is null (load failed), backImageToUse remains null.
  // If !currentDebugCover and bookOutput.book.coverImageBase64 is undefined, backImageToUse remains null.

  if (bookOutput.book.title) {
    pages.push({
      term: bookOutput.book.title,
      definition: "", 
      coverImageBase64: bookOutput.book.coverImageBase64, // This is the front cover image
      backCoverImageBase64: backImageToUse,
    });
  }

  bookOutput.book.chapters.forEach(chapter => {
    pages.push({
      term: `Chapter ${chapter.chapterNumber}`,
      definition: chapter.text,
      // No front cover image for chapter pages by default
      backCoverImageBase64: backImageToUse,
    });
  });

  return pages;
}

function handleDownloadStoryClick() {
  if (allPages.length === 0) {
    errorMessage.textContent = "No story to download.";
    return;
  }

  let storyText = "";
  let storyTitle = "story";

  // First page is the title page
  if (allPages[0] && allPages[0].term) {
    storyTitle = allPages[0].term;
    storyText += `${storyTitle}\n\n`;
  }

  // Subsequent pages are chapters
  for (let i = 1; i < allPages.length; i++) {
    const page = allPages[i];
    storyText += `${page.term}\n`; // Chapter title (e.g., "Chapter 1")
    if (page.definition) {
      storyText += `${page.definition}\n\n\n`; // Chapter text followed by two blank lines
    } else {
      storyText += `\n\n\n`; // Blank lines even if no definition
    }
  }

  const safeTitle = storyTitle.replace(/[^\w\s-]/gi, '').replace(/\s+/g, '_');
  const filename = `${safeTitle || 'story'}.txt`;

  const blob = new Blob([storyText.trimEnd()], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  errorMessage.textContent = `Story downloaded as ${filename}.`;
}

downloadStoryButton.addEventListener('click', handleDownloadStoryClick);


generateButton.addEventListener('click', async () => {
  const topic = topicInput.value.trim();
  
  currentPageIndex = 0;
  allPages = []; 
  lastRawBookContent = null;
  errorMessage.textContent = ''; 
  downloadStoryButton.disabled = true;

  generateButton.disabled = true;
  
  if (currentDebugMode) {
    await setupDebugStory(); 
    generateButton.disabled = false;
    // renderPages will enable download button if allPages is populated
    return;
  }

  if (!topic) {
    errorMessage.textContent = 'Please enter a topic for your story.';
    renderPages(); // This will also update downloadStoryButton.disabled
    generateButton.disabled = false;
    return;
  }
  
  errorMessage.textContent = 'Generating 10-chapter story...';
  let storyDataFromApi: BookContent | undefined;

  try {
    const tenChapterTemplateGuide = `
Follow this 10-chapter novella structure:
Chapter 1: The Hook - Start with a mystery, a question that is provocative and creates an information gap that readers want to fill.\nSee if you could condense this mystery into a single visual image.\nIntroduce the protagonist and the setting.\nPlant seeds of central conflict or problem.\nEstablish the mood.\nHave the protagonist do something that makes them compelling (i.e., they are really competent at something, they perform a kind act, they are oppressed, etc.).
Chapter 2: The Inciting Incident - Something happens that turns the Ordinary World of the protagonist upside down.\nIt is not something that can be resolved on its own.\nThere is a lot of conflict.\nThe protagonist is hesitant to engage, but is forced to by events outside of their control.\nThey are forced to make a choice, one that takes them out of their comfort zone and into the \"New World\" of uncertainty in order to resolve this problem.
Chapter 3: The New World - The protagonist is uncomfortable in their new world.\nThey meet allies who might help them in their quest (mentor, side-kick, love interest), although the cast might be a lot leaner than in a novel. One side character is common.\nMore information about the antagonist might be revealed, directly or indirectly.\nThe protagonist may be given information, items, weapons, or other tools that may help them on their journey.\nThere is a lot of tension.
Chapter 4: The First Pinch Point - The protagonist goes through the first major try/fail cycle to try and achieve their goals.\nThey have an encounter with the antagonist or the forces of the antagonist.\nThey fail but survive, and maybe even learned some lessons that will help them in the future.\nThere may be a revelation that changes everything.\nThe protagonist realizes that they've underestimated the antagonist.\nThe stakes are raised.
Chapter 5: The Midpoint - Major turning point that transforms the protagonist from reactive to proactive.\nBuilds on the fallout from the First Pinch Point and the revelation.\nForces the protagonist to reassess their situation.\nMay be an emotional moment, often deepening relationships with other characters, thereby increasing the stakes.\nThere may be a partial success, a glimmer of hope or small victory that motivates the protagonist to press on.
Chapter 6: The Second Pinch Point - The protagonist gets ready to try again, this time taking a more proactive approach.\nThey fail again or are interrupted by the antagonist or forces of the antagonist.\nThey suffer another literal or figurative battle with the antagonist, and once again they go through another try/fail cycle. This time the consequences are more severe.\nThere is increased tension and stakes.\nGood place for a plot twist.
Chapter 7: The Darkest Moment - The \"All is Lost\" moment; the protagonist reacts to their greatest setback.\nThe protagonist is forced to confront their greatest flaw or fear.\nDemonstrates the true cost of the journey.\nThey are at their lowest point; they are ready to give up.\nWe may see the antagonist or forces of the antagonist seem poised to win.
Chapter 8: Climax Prep - A \"pep talk\" either by the protagonist themselves, an ally, a revelation or another outside influence, gets the protagonist and their allies going again.\nThey make a plan of attack, even against overwhelming odds.\nThey may gain resources/information that they didn't have previously that will help.\nThe protagonist shows themselves capable of confronting and overcoming their flaw (although they haven't done so fully yet).\nAll plot threads converge.
Chapter 9: The Climax - The protagonist and potential allies confront the antagonist.\nAllies may fall behind, leaving the protagonist alone.\nThey once again fail, and the antagonist thinks they have won.\nThe protagonist has a moment of introspection, before gathering their strength and finding a way, however unexpected or improbable, to succeed.\nThe antagonist is defeated.\nThis decisive action resolves the primary conflict.
Chapter 10: Resolution - Wrap up any loose ends of the story.\nShow the protagonist and how they've grown.\nResolve any key relationships and emotional arcs.\nEnd with a powerful final image that encapsulates the theme.
`;

    const storyPrompt = `Generate a compelling short story about "${topic}".
The story MUST have a title and EXACTLY 10 distinct chapters.
The story must follow the 10-chapter novella structure detailed below:
${tenChapterTemplateGuide}
Ensure the narrative is coherent, engaging, and follows a clear plot progression according to the 10-chapter template.`;

    const schema = {
      type: Type.OBJECT,
      properties: {
        book: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            chapters: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  chapterNumber: { type: Type.INTEGER },
                  text: { type: Type.STRING }
                },
                required: ['chapterNumber', 'text']
              }
            }
          },
          required: ['title', 'chapters']
        }
      },
      required: ['book']
    };

    const storyResult: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: storyPrompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema
      }
    });

    const storyJsonStr = storyResult.text.trim();
    
    let parsedData: BookOutput;
    try {
      parsedData = JSON.parse(storyJsonStr) as BookOutput;
    } catch (e) {
      console.error("Failed to parse story JSON response:", e, "\nRaw string:", storyJsonStr);
      errorMessage.textContent = 'Failed to parse the story structure. Please try again.';
      renderPages();
      generateButton.disabled = false;
      return;
    }

    if (!parsedData || !parsedData.book || typeof parsedData.book.title !== 'string' || 
        !Array.isArray(parsedData.book.chapters) || parsedData.book.chapters.length === 0 || 
        !parsedData.book.chapters.every(ch => typeof ch.chapterNumber === 'number' && typeof ch.text === 'string')) {
      errorMessage.textContent = 'The generated story structure is incomplete or invalid. Please try again.';
      console.error('Invalid or incomplete story JSON structure:', parsedData, "\nOriginal string:", storyJsonStr);
      renderPages(); 
      generateButton.disabled = false;
      return;
    }
    storyDataFromApi = parsedData.book;
    // Store raw content before any debug cover modifications
    lastRawBookContent = JSON.parse(JSON.stringify(storyDataFromApi));


    if (currentDebugCover && activeBackCoverImageBase64) {
        storyDataFromApi.coverImageBase64 = activeBackCoverImageBase64;
        errorMessage.textContent = '10-chapter story content generated. Using Cat Cover...';
    } else if (currentDebugCover && !activeBackCoverImageBase64) {
        // No API image, Cat Cover selected but failed to load.
        storyDataFromApi.coverImageBase64 = undefined; 
        errorMessage.textContent = '10-chapter story content generated. (Warning: Cat Cover failed, no front cover).';
        console.warn("currentDebugCover is true, but debug_cover.jpg failed to load. No front cover for API generated story.");
    } else { // currentDebugCover is false, try to generate API cover
        errorMessage.textContent = 'Generating cover image...';
        try {
            const imagePrompt = `A captivating book cover illustration for a story titled "${storyDataFromApi.title}". The story is about: "${topic}". Style: Digital painting, vibrant, intriguing.`;
            const imageResponse = await ai.models.generateImages({
                model: 'imagen-3.0-generate-002',
                prompt: imagePrompt,
                config: { numberOfImages: 1, outputMimeType: 'image/jpeg' },
            });

            if (imageResponse.generatedImages && imageResponse.generatedImages.length > 0 && imageResponse.generatedImages[0].image.imageBytes) {
                storyDataFromApi.coverImageBase64 = imageResponse.generatedImages[0].image.imageBytes;
                // Update lastRawBookContent as well, as this is its "true" cover if not for Cat Cover.
                if(lastRawBookContent) lastRawBookContent.coverImageBase64 = storyDataFromApi.coverImageBase64;
            } else {
                console.warn('Cover image generation did not return an image. Proceeding without cover.');
                errorMessage.textContent = '10-chapter story generated, but cover image could not be created.';
            }
        } catch (imgError) {
            console.error('Error generating cover image:', imgError);
            errorMessage.textContent = '10-chapter story generated, but an error occurred while creating the cover image.';
        }
    }

    allPages = transformBookOutputToPages({book: storyDataFromApi});

    if (allPages.length > 0) {
      if (currentDebugCover) {
          if (activeBackCoverImageBase64) {
              errorMessage.textContent = '10-chapter story generated. Using Cat Cover for front and back pages.';
          } else {
              errorMessage.textContent = '10-chapter story generated. (Warning: Cat Cover failed to load).';
          }
      } else { 
          if (storyDataFromApi.coverImageBase64) {
              errorMessage.textContent = '10-chapter story and API cover image generated successfully!';
          } else {
              errorMessage.textContent = '10-chapter story generated successfully (no API cover image).';
          }
      }
      renderPages();
    } else {
      errorMessage.textContent = 'No valid story chapters could be generated. Please try a different topic.';
      renderPages(); 
    }

  } catch (error: unknown) {
    console.error('Error during generation process:', error);
    let detailedError = 'An unknown error occurred';
    if (typeof error === 'object' && error !== null && 'message' in error) {
        detailedError = (error as Error).message;
    } else if (typeof error === 'string') {
        detailedError = error;
    }
    errorMessage.textContent = `An error occurred: ${detailedError}.`;
    renderPages(); 
  } finally {
    generateButton.disabled = false;
  }
});

toggleInputSectionButton.addEventListener('click', () => {
  const isNowCollapsed = collapsibleControls.classList.toggle('collapsed');
  toggleInputSectionButton.setAttribute('aria-expanded', String(!isNowCollapsed));
  const icon = toggleInputSectionButton.querySelector('.toggle-icon') as HTMLSpanElement;
  const text = toggleInputSectionButton.querySelector('.toggle-text') as HTMLSpanElement;
  
  if (isNowCollapsed) { 
    icon.textContent = '▼';
    text.textContent = 'Expand';
    if (inputSection) inputSection.classList.add('controls-collapsed');
  } else { 
    icon.textContent = '▲';
    text.textContent = 'Collapse';
    if (inputSection) inputSection.classList.remove('controls-collapsed');
  }
});

debugModeCheckbox.addEventListener('change', async () => {
  currentDebugMode = debugModeCheckbox.checked;
  topicInput.disabled = currentDebugMode;
  if (currentDebugMode) {
    await setupDebugStory();
  } else {
    allPages = []; // Clear debug story
    lastRawBookContent = null;
    renderPages();
    errorMessage.textContent = 'Cat Demo disabled. Enter a topic to generate a story.';
  }
});

debugCoverCheckbox.addEventListener('change', async () => {
  currentDebugCover = debugCoverCheckbox.checked;
  if (currentDebugCover) {
    activeBackCoverImageBase64 = await getImageAsBase64('StorySupportFiles/debug_cover.jpg');
  } else {
    activeBackCoverImageBase64 = null;
  }

  if (allPages.length > 0) { // A book is currently displayed
    if (currentDebugMode) {
      await setupDebugStory(); // Re-render debug story with new cover setting
    } else if (lastRawBookContent) { // An API story is displayed
      const bookContentCopy: BookContent = JSON.parse(JSON.stringify(lastRawBookContent));
      
      if (currentDebugCover && activeBackCoverImageBase64) {
        bookContentCopy.coverImageBase64 = activeBackCoverImageBase64;
      } 
      // If currentDebugCover is false, bookContentCopy.coverImageBase64 already holds the API (or undefined) cover.
      
      allPages = transformBookOutputToPages({ book: bookContentCopy });
      renderPages();
      let status = "Cover settings updated. ";
      if (currentDebugCover) {
        status += activeBackCoverImageBase64 ? "Using Cat Cover." : "Cat Cover selected but failed to load.";
      } else {
        status += bookContentCopy.coverImageBase64 ? "Using API generated cover." : "No front cover.";
      }
      errorMessage.textContent = status;

    }
  } else {
     errorMessage.textContent = `Cat Cover ${currentDebugCover ? 'enabled' : 'disabled'}. ${currentDebugCover && !activeBackCoverImageBase64 ? '(Failed to load debug_cover.jpg)' : ''}`;
  }
});


// Initialize application
(async () => {
    currentDebugMode = debugModeCheckbox.checked;
    currentDebugCover = debugCoverCheckbox.checked;
    topicInput.disabled = currentDebugMode;

    if (currentDebugCover) {
        activeBackCoverImageBase64 = await getImageAsBase64('StorySupportFiles/debug_cover.jpg');
    }

    if (currentDebugMode) {
        await setupDebugStory();
    } else {
        renderPages(); 
    }
    
    const initiallyCollapsed = collapsibleControls.classList.contains('collapsed');
    toggleInputSectionButton.setAttribute('aria-expanded', String(!initiallyCollapsed));
    const icon = toggleInputSectionButton.querySelector('.toggle-icon') as HTMLSpanElement;
    const text = toggleInputSectionButton.querySelector('.toggle-text') as HTMLSpanElement;
    
    if (initiallyCollapsed) {
        icon.textContent = '▼';
        text.textContent = 'Expand';
        if (inputSection) inputSection.classList.add('controls-collapsed');
    } else {
        icon.textContent = '▲';
        text.textContent = 'Collapse';
        if (inputSection) inputSection.classList.remove('controls-collapsed');
    }
    downloadStoryButton.disabled = allPages.length === 0;
})();