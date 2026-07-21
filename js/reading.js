const params = new URLSearchParams(window.location.search);
const readingFile = params.get("file");

const readingContent = document.getElementById("reading-content");
const readingNavigation = document.getElementById("reading-navigation");
const loadingState = document.getElementById("loading-state");
const errorState = document.getElementById("error-state");
const errorMessage = document.getElementById("error-message");

if (!readingFile) {
  showError(
    "No reading file was selected. Open the module from the course page."
  );
} else {
  loadReading();
}

async function loadReading() {
  try {
    const response = await fetch(readingFile);

    if (!response.ok) {
      throw new Error(
        `The reading file could not be found: ${readingFile}`
      );
    }

    const data = await response.json();

    validateReadingData(data);
    renderReading(data);
  } catch (error) {
    console.error("Reading module error:", error);

    showError(
      error.message ||
      "The reading material could not be loaded."
    );
  }
}

function validateReadingData(data) {
  if (!data || typeof data !== "object") {
    throw new Error("The reading file does not contain valid JSON data.");
  }

  if (!data.title || typeof data.title !== "string") {
    throw new Error("The reading file is missing a valid title.");
  }

  if (!Array.isArray(data.sections)) {
    throw new Error("The reading file is missing a sections array.");
  }
}

function renderReading(data) {
  document.title = `${data.title} | UiA Indøk`;

  loadingState.remove();
  errorState.hidden = true;

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
  renderNavigation(validSections);
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

  if (data.estimatedReadingTime) {
    const meta = document.createElement("div");
    meta.className = "reading-meta";

    const time = document.createElement("span");
    time.className = "reading-time";
    time.textContent = `Estimated reading time: ${data.estimatedReadingTime}`;

    meta.appendChild(time);
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

  if (section.heading) {
    const heading = document.createElement("h2");
    heading.textContent = section.heading;
    sectionElement.appendChild(heading);
  }

  if (Array.isArray(section.paragraphs)) {
    section.paragraphs.forEach(paragraphText => {
      if (typeof paragraphText !== "string") {
        return;
      }

      const paragraph = document.createElement("p");
      paragraph.textContent = paragraphText;
      sectionElement.appendChild(paragraph);
    });
  }

  if (Array.isArray(section.bullets)) {
    const list = document.createElement("ul");

    section.bullets.forEach(bulletText => {
      if (typeof bulletText !== "string") {
        return;
      }

      const item = document.createElement("li");
      item.textContent = bulletText;
      list.appendChild(item);
    });

    sectionElement.appendChild(list);
  }

  if (Array.isArray(section.numberedItems)) {
    const list = document.createElement("ol");

    section.numberedItems.forEach(itemText => {
      if (typeof itemText !== "string") {
        return;
      }

      const item = document.createElement("li");
      item.textContent = itemText;
      list.appendChild(item);
    });

    sectionElement.appendChild(list);
  }

  if (section.quote && typeof section.quote === "string") {
    const quote = document.createElement("blockquote");
    quote.textContent = section.quote;
    sectionElement.appendChild(quote);
  }

  if (Array.isArray(section.reflectionQuestions)) {
    const reflectionList = document.createElement("ol");
    reflectionList.className = "reflection-questions";

    section.reflectionQuestions.forEach(questionText => {
      if (typeof questionText !== "string") {
        return;
      }

      const item = document.createElement("li");
      item.textContent = questionText;
      reflectionList.appendChild(item);
    });

    sectionElement.appendChild(reflectionList);
  }

  return sectionElement;
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

function renderNavigation(sections) {
  readingNavigation.innerHTML = "";

  const navigableSections = sections.filter(
    section => section.heading
  );

  if (navigableSections.length === 0) {
    const message = document.createElement("p");
    message.className = "navigation-placeholder";
    message.textContent = "No section navigation available.";

    readingNavigation.appendChild(message);
    return;
  }

  navigableSections.forEach((section, index) => {
    const sectionId =
      sanitizeId(section.id) ||
      `section-${index + 1}`;

    const link = document.createElement("a");
    link.href = `#${sectionId}`;
    link.textContent = section.heading;
    link.className = "reading-navigation-link";

    link.addEventListener("click", event => {
      event.preventDefault();

      const target = document.getElementById(sectionId);

      if (!target) {
        return;
      }

      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

      history.replaceState(null, "", `#${sectionId}`);
    });

    readingNavigation.appendChild(link);
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
  loadingState.hidden = true;
  errorState.hidden = false;
  errorMessage.textContent = message;

  readingNavigation.innerHTML = "";

  const navigationMessage = document.createElement("p");
  navigationMessage.className = "navigation-placeholder";
  navigationMessage.textContent = "Module navigation unavailable.";

  readingNavigation.appendChild(navigationMessage);
}
