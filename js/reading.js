const params = new URLSearchParams(window.location.search);

const readingFile = params.get("file");
const courseId = params.get("course");
const topicsFile = params.get("topics");
const topicId = params.get("topic");

const readingContent = document.getElementById("reading-content");
const readingNavigation = document.getElementById("reading-navigation");
const loadingState = document.getElementById("loading-state");
const errorState = document.getElementById("error-state");
const errorMessage = document.getElementById("error-message");

const backLink = document.querySelector(
  ".reading-sidebar .back-link"
);

let currentTopic = null;

initializeReadingPage();

async function initializeReadingPage() {
  configureBackLink();

  if (!readingFile) {
    showError(
      "No reading file was selected. Open the reading module from the topic page."
    );
    return;
  }

  try {
    const readingResponse = await fetch(readingFile);

    if (!readingResponse.ok) {
      throw new Error(
        `The reading file could not be loaded: ${readingFile}. HTTP status: ${readingResponse.status}`
      );
    }

    const readingData = await readingResponse.json();

    validateReadingData(readingData);

    if (topicsFile && topicId) {
      currentTopic = await loadCurrentTopic();
    }

    renderReading(readingData);
  } catch (error) {
    console.error("Reading page error:", error);

    showError(
      error.message ||
        "The reading material could not be loaded."
    );
  }
}

async function loadCurrentTopic() {
  const response = await fetch(topicsFile);

  if (!response.ok) {
    console.warn(
      `The topics file could not be loaded: ${topicsFile}`
    );
    return null;
  }

  const data = await response.json();

  if (!data || !Array.isArray(data.topics)) {
    console.warn(
      "The topics file does not contain a valid topics array."
    );
    return null;
  }

  return (
    data.topics.find(topic => topic.id === topicId) ||
    null
  );
}

function configureBackLink() {
  if (!backLink) {
    return;
  }

  if (topicsFile && topicId) {
    backLink.href =
      `topic.html?topics=${encodeURIComponent(topicsFile)}` +
      `&topic=${encodeURIComponent(topicId)}` +
      `&course=${encodeURIComponent(courseId || "")}`;

    backLink.textContent = "← Back to topic";
    return;
  }

  if (courseId) {
    backLink.href =
      `course.html?course=${encodeURIComponent(courseId)}`;

    backLink.textContent = "← Back to course";
    return;
  }

  backLink.href = "index.html";
  backLink.textContent = "← Back to courses";
}

function validateReadingData(data) {
  if (!data || typeof data !== "object") {
    throw new Error(
      "The reading file does not contain valid JSON data."
    );
  }

  if (!data.title || typeof data.title !== "string") {
    throw new Error(
      "The reading file is missing a valid title."
    );
  }

  if (!Array.isArray(data.sections)) {
    throw new Error(
      "The reading file is missing a valid sections array."
    );
  }
}

function renderReading(data) {
  document.title = `${data.title} | UiA Indøk`;

  if (loadingState) {
    loadingState.remove();
  }

  if (errorState) {
    errorState.hidden = true;
  }

  const header = createReadingHeader(data);
  const sectionsContainer = document.createElement("div");

  sectionsContainer.className = "reading-sections";

  const validSections = data.sections.filter(
    section => section && typeof section === "object"
  );

  validSections.forEach((section, index) => {
    const sectionElement = createSection(section, index);
    sectionsContainer.appendChild(sectionElement);
  });

  readingContent.append(header, sectionsContainer);

  const quizSection = createQuizSection();

  if (quizSection) {
    readingContent.appendChild(quizSection);
  }

  renderNavigation(validSections);
  scrollToRequestedSection();
}

function createReadingHeader(data) {
  const header = document.createElement("header");
  header.className = "reading-header";

  const eyebrow = document.createElement("p");
  eyebrow.className = "eyebrow";
  eyebrow.textContent = "Reading module";

  const title = document.createElement("h1");
  title.textContent = data.title;

  header.append(eyebrow, title);

  if (data.description) {
    const description = document.createElement("p");
    description.className = "reading-description";
    description.textContent = data.description;

    header.appendChild(description);
  }

  const metaItems = [];

  if (data.estimatedReadingTime) {
    metaItems.push(
      `Estimated reading time: ${data.estimatedReadingTime}`
    );
  }

  if (data.level) {
    metaItems.push(`Level: ${data.level}`);
  }

  if (metaItems.length > 0) {
    const meta = document.createElement("div");
    meta.className = "reading-meta";

    metaItems.forEach(itemText => {
      const item = document.createElement("span");
      item.className = "reading-meta-item";
      item.textContent = itemText;

      meta.appendChild(item);
    });

    header.appendChild(meta);
  }

  return header;
}

function createSection(section, index) {
  const sectionElement = document.createElement("section");

  const sectionId =
    sanitizeId(section.id) ||
    `section-${index + 1}`;

  sectionElement.id = sectionId;
  sectionElement.className = getSectionClass(section.type);

  const headingText =
    section.heading ||
    getDefaultHeading(section.type);

  if (headingText) {
    const heading = document.createElement("h2");
    heading.textContent = headingText;

    sectionElement.appendChild(heading);
  }

  appendParagraphs(
    sectionElement,
    section.paragraphs
  );

  appendBullets(
    sectionElement,
    section.bullets
  );

  appendNumberedItems(
    sectionElement,
    section.numberedItems
  );

  appendQuote(
    sectionElement,
    section.quote
  );

  appendReflectionQuestions(
    sectionElement,
    section.reflectionQuestions
  );

  return sectionElement;
}

function appendParagraphs(parent, paragraphs) {
  if (!Array.isArray(paragraphs)) {
    return;
  }

  paragraphs.forEach(paragraphText => {
    if (
      typeof paragraphText !== "string" ||
      paragraphText.trim() === ""
    ) {
      return;
    }

    const paragraph = document.createElement("p");
    paragraph.textContent = paragraphText;

    parent.appendChild(paragraph);
  });
}

function appendBullets(parent, bullets) {
  if (!Array.isArray(bullets) || bullets.length === 0) {
    return;
  }

  const list = document.createElement("ul");

  bullets.forEach(bulletText => {
    if (
      typeof bulletText !== "string" ||
      bulletText.trim() === ""
    ) {
      return;
    }

    const item = document.createElement("li");
    item.textContent = bulletText;

    list.appendChild(item);
  });

  if (list.children.length > 0) {
    parent.appendChild(list);
  }
}

function appendNumberedItems(parent, numberedItems) {
  if (
    !Array.isArray(numberedItems) ||
    numberedItems.length === 0
  ) {
    return;
  }

  const list = document.createElement("ol");

  numberedItems.forEach(itemText => {
    if (
      typeof itemText !== "string" ||
      itemText.trim() === ""
    ) {
      return;
    }

    const item = document.createElement("li");
    item.textContent = itemText;

    list.appendChild(item);
  });

  if (list.children.length > 0) {
    parent.appendChild(list);
  }
}

function appendQuote(parent, quoteText) {
  if (
    typeof quoteText !== "string" ||
    quoteText.trim() === ""
  ) {
    return;
  }

  const quote = document.createElement("blockquote");
  quote.textContent = quoteText;

  parent.appendChild(quote);
}

function appendReflectionQuestions(parent, questions) {
  if (!Array.isArray(questions) || questions.length === 0) {
    return;
  }

  const list = document.createElement("ol");
  list.className = "reflection-questions";

  questions.forEach(questionText => {
    if (
      typeof questionText !== "string" ||
      questionText.trim() === ""
    ) {
      return;
    }

    const item = document.createElement("li");
    item.textContent = questionText;

    list.appendChild(item);
  });

  if (list.children.length > 0) {
    parent.appendChild(list);
  }
}

function createQuizSection() {
  if (!currentTopic || !currentTopic.quiz) {
    return null;
  }

  const section = document.createElement("section");
  section.className = "reading-complete-card";

  const eyebrow = document.createElement("p");
  eyebrow.className = "eyebrow";
  eyebrow.textContent = "Module completed";

  const title = document.createElement("h2");
  title.textContent = "Ready to test your knowledge?";

  const description = document.createElement("p");
  description.textContent =
    "You have reached the end of the reading module. Continue to the quiz and apply what you have learned in practical, scenario-based questions.";

  const button = document.createElement("a");
  button.className = "button button-primary";
  button.textContent = "Start Quiz →";

  button.href =
    `quiz.html?file=${encodeURIComponent(currentTopic.quiz)}` +
    `&course=${encodeURIComponent(courseId || "")}` +
    `&topics=${encodeURIComponent(topicsFile || "")}` +
    `&topic=${encodeURIComponent(topicId || "")}`;

  section.append(
    eyebrow,
    title,
    description,
    button
  );

  return section;
}

function getSectionClass(type) {
  const baseClass = "reading-section";

  const typeClasses = {
    learningObjectives: "reading-section-objectives",
    theory: "reading-section-theory",
    example: "reading-section-example",
    expertInsight: "reading-section-insight",
    warning: "reading-section-warning",
    summary: "reading-section-summary",
    reflection: "reading-section-reflection"
  };

  const typeClass = typeClasses[type];

  return typeClass
    ? `${baseClass} ${typeClass}`
    : baseClass;
}

function getDefaultHeading(type) {
  const defaultHeadings = {
    learningObjectives: "Learning Objectives",
    theory: "Core Theory",
    example: "Example",
    expertInsight: "Expert Insight",
    warning: "Important",
    summary: "Key Takeaways",
    reflection: "Reflection"
  };

  return defaultHeadings[type] || "";
}

function renderNavigation(sections) {
  if (!readingNavigation) {
    return;
  }

  readingNavigation.innerHTML = "";

  const navigableSections = sections
    .map((section, index) => ({
      sectionId:
        sanitizeId(section.id) ||
        `section-${index + 1}`,
      heading:
        section.heading ||
        getDefaultHeading(section.type)
    }))
    .filter(item => item.heading);

  if (navigableSections.length === 0) {
    const message = document.createElement("p");
    message.className = "navigation-placeholder";
    message.textContent =
      "No section navigation available.";

    readingNavigation.appendChild(message);
    return;
  }

  navigableSections.forEach(item => {
    const link = document.createElement("a");

    link.href = `#${item.sectionId}`;
    link.textContent = item.heading;
    link.className = "reading-navigation-link";

    link.addEventListener("click", event => {
      event.preventDefault();

      const target = document.getElementById(
        item.sectionId
      );

      if (!target) {
        return;
      }

      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

      history.replaceState(
        null,
        "",
        `${window.location.pathname}${window.location.search}#${item.sectionId}`
      );
    });

    readingNavigation.appendChild(link);
  });
}

function scrollToRequestedSection() {
  const sectionId = window.location.hash.replace("#", "");

  if (!sectionId) {
    return;
  }

  const target = document.getElementById(sectionId);

  if (!target) {
    return;
  }

  requestAnimationFrame(() => {
    target.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });
}

function sanitizeId(value) {
  if (!value || typeof value !== "string") {
    return "";
  }

  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function showError(message) {
  if (loadingState) {
    loadingState.hidden = true;
  }

  if (errorState) {
    errorState.hidden = false;
  }

  if (errorMessage) {
    errorMessage.textContent = message;
  }

  if (readingNavigation) {
    readingNavigation.innerHTML = "";

    const navigationMessage = document.createElement("p");
    navigationMessage.className = "navigation-placeholder";
    navigationMessage.textContent =
      "Module navigation unavailable.";

    readingNavigation.appendChild(navigationMessage);
  }
}
