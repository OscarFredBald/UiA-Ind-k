const params = new URLSearchParams(window.location.search);

const topicsFile = params.get("topics");
const topicId = params.get("topic");
const courseFile = params.get("course");

const courseCodeElement = document.getElementById("course-code");
const topicTitleElement = document.getElementById("topic-title");
const topicDescriptionElement = document.getElementById("topic-description");

const backToCourseLink = document.getElementById("back-to-course");
const readingLink = document.getElementById("reading-link");
const quizLink = document.getElementById("quiz-link");

const loadingSection = document.getElementById("topic-loading");
const errorSection = document.getElementById("topic-error");
const errorMessageElement = document.getElementById(
  "topic-error-message"
);
const topicContent = document.getElementById("topic-content");

const topicDetails = document.getElementById("topic-details");
const topicDetailsContent = document.getElementById(
  "topic-details-content"
);

initializeTopicPage();

async function initializeTopicPage() {
  if (!topicsFile) {
    showError(
      "No topics file was selected. Open this module from the course page."
    );
    return;
  }

  if (!topicId) {
    showError(
      "No topic was selected. Open a module from the course page."
    );
    return;
  }

  try {
    const response = await fetch(topicsFile);

    if (!response.ok) {
      throw new Error(
        `The topics file could not be loaded: ${topicsFile}`
      );
    }

    const data = await response.json();

    validateTopicsData(data);

    const topic = data.topics.find(
      currentTopic => currentTopic.id === topicId
    );

    if (!topic) {
      throw new Error(
        `The topic "${topicId}" could not be found in the topics file.`
      );
    }

    renderTopic(data, topic);
  } catch (error) {
    console.error("Topic page error:", error);

    showError(
      error.message ||
      "The selected topic could not be loaded."
    );
  }
}

function validateTopicsData(data) {
  if (!data || typeof data !== "object") {
    throw new Error(
      "The topics file does not contain valid JSON data."
    );
  }

  if (!Array.isArray(data.topics)) {
    throw new Error(
      "The topics file is missing a valid topics array."
    );
  }
}

function renderTopic(courseData, topic) {
  const courseCode =
    courseData.courseCode ||
    courseData.code ||
    "Course module";

  const courseTitle =
    courseData.courseTitle ||
    courseData.title ||
    "";

  document.title =
    `${topic.title} | ${courseCode} | UiA Indøk`;

  courseCodeElement.textContent = courseTitle
    ? `${courseCode} · ${courseTitle}`
    : courseCode;

  topicTitleElement.textContent = topic.title;

  topicDescriptionElement.textContent =
    topic.description ||
    "Study the reading material before completing the quiz.";

  configureBackLink();
  configureReadingLink(topic);
  configureQuizLink(topic);
  renderTopicDetails(topic);

  loadingSection.hidden = true;
  errorSection.hidden = true;
  topicContent.hidden = false;
}

function configureBackLink() {
  if (courseFile) {
    backToCourseLink.href =
      `course.html?file=${encodeURIComponent(courseFile)}`;

    return;
  }

  if (topicsFile) {
    backToCourseLink.href =
      `course.html?topics=${encodeURIComponent(topicsFile)}`;

    return;
  }

  backToCourseLink.href = "index.html";
}

function configureReadingLink(topic) {
  if (!topic.reading) {
    disableLink(
      readingLink,
      "Reading unavailable"
    );

    return;
  }

  readingLink.href =
    `reading.html?file=${encodeURIComponent(topic.reading)}`;
}

function configureQuizLink(topic) {
  if (!topic.quiz) {
    disableLink(
      quizLink,
      "Quiz unavailable"
    );

    return;
  }

  quizLink.href =
    `quiz.html?file=${encodeURIComponent(topic.quiz)}`;
}

function disableLink(link, label) {
  link.textContent = label;
  link.removeAttribute("href");
  link.classList.add("button-disabled");
  link.setAttribute("aria-disabled", "true");
  link.setAttribute("tabindex", "-1");
}

function renderTopicDetails(topic) {
  const details = [];

  if (topic.estimatedReadingTime) {
    details.push({
      label: "Reading time",
      value: topic.estimatedReadingTime
    });
  }

  if (topic.estimatedQuizTime) {
    details.push({
      label: "Quiz time",
      value: topic.estimatedQuizTime
    });
  }

  if (topic.questionCount) {
    details.push({
      label: "Questions",
      value: String(topic.questionCount)
    });
  }

  if (topic.difficulty) {
    details.push({
      label: "Level",
      value: topic.difficulty
    });
  }

  if (details.length === 0) {
    topicDetails.hidden = true;
    return;
  }

  topicDetailsContent.innerHTML = "";

  details.forEach(detail => {
    const item = document.createElement("div");
    item.className = "topic-detail-item";

    const label = document.createElement("span");
    label.className = "topic-detail-label";
    label.textContent = detail.label;

    const value = document.createElement("strong");
    value.className = "topic-detail-value";
    value.textContent = detail.value;

    item.append(label, value);
    topicDetailsContent.appendChild(item);
  });

  topicDetails.hidden = false;
}

function showError(message) {
  loadingSection.hidden = true;
  topicContent.hidden = true;
  errorSection.hidden = false;

  topicTitleElement.textContent =
    "Module unavailable";

  topicDescriptionElement.textContent =
    "The requested module could not be opened.";

  errorMessageElement.textContent = message;
}
