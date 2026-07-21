const params = new URLSearchParams(window.location.search);
const courseId = params.get("course");

const courseCode = document.getElementById("course-code");
const courseTitle = document.getElementById("course-title");
const courseDescription = document.getElementById("course-description");
const courseDetails = document.getElementById("course-details");
const topicGrid = document.getElementById("topic-grid");

if (!courseId) {
  showCourseError(
    "No course was selected.",
    "Return to the front page and select a course."
  );
} else {
  loadCourse();
}

async function loadCourse() {
  try {
    showLoadingMessage();

    const coursesResponse = await fetch("data/courses.json");

    if (!coursesResponse.ok) {
      throw new Error(
        `Could not load data/courses.json. HTTP status: ${coursesResponse.status}`
      );
    }

    const coursesData = await coursesResponse.json();

    validateCoursesData(coursesData);

    const selectedCourse = coursesData.courses.find(
      course =>
        String(course.id).toLowerCase() ===
        String(courseId).toLowerCase()
    );

    if (!selectedCourse) {
      throw new Error(
        `The course "${courseId}" was not found in data/courses.json.`
      );
    }

    if (
      !selectedCourse.topics ||
      typeof selectedCourse.topics !== "string"
    ) {
      throw new Error(
        `The course "${courseId}" does not contain a valid topics file path.`
      );
    }

    const topicsResponse = await fetch(selectedCourse.topics);

    if (!topicsResponse.ok) {
      throw new Error(
        `Could not load ${selectedCourse.topics}. HTTP status: ${topicsResponse.status}`
      );
    }

    const topicsData = await topicsResponse.json();

    validateTopicsData(topicsData);

    renderCourseHeader(selectedCourse, topicsData.topics.length);
    renderTopics(topicsData.topics, selectedCourse);
  } catch (error) {
    console.error("Error loading course:", error);

    showCourseError(
      "The course could not be loaded.",
      error.message ||
        "Check that the course exists and that its topics.json file is valid."
    );
  }
}

function validateCoursesData(data) {
  if (!data || !Array.isArray(data.courses)) {
    throw new Error(
      "Invalid courses.json structure. Expected a courses array."
    );
  }
}

function validateTopicsData(data) {
  if (!data || !Array.isArray(data.topics)) {
    throw new Error(
      "Invalid topics.json structure. Expected a topics array."
    );
  }
}

function renderCourseHeader(course, topicCount) {
  document.title = `${course.code} | Learning Platform`;

  courseCode.textContent = course.code || "Course";
  courseTitle.textContent = course.title || "Untitled course";

  courseDescription.textContent =
    course.description ||
    "No course description is available.";

  courseDetails.innerHTML = "";

  const detailItems = [
    course.credits,
    course.semester,
    formatTopicCount(topicCount),
    course.difficulty
  ];

  detailItems
    .filter(Boolean)
    .forEach(item => {
      const detail = document.createElement("span");
      detail.classList.add("course-detail");
      detail.textContent = item;
      courseDetails.appendChild(detail);
    });
}

function renderTopics(topics, course) {
  topicGrid.innerHTML = "";

  if (topics.length === 0) {
    showEmptyMessage(course);
    return;
  }

  topics.forEach((topic, index) => {
    const topicCard = createTopicCard(topic, index, course);
    topicGrid.appendChild(topicCard);
  });
}

function createTopicCard(topic, index, course) {
  const article = document.createElement("article");
  article.classList.add("topic-card");

  const number = document.createElement("p");
  number.classList.add("topic-number");
  number.textContent = `Topic ${topic.number || index + 1}`;

  const title = document.createElement("h3");
  title.classList.add("topic-title");
  title.textContent = topic.title || "Untitled topic";

  const description = document.createElement("p");
  description.classList.add("topic-description");
  description.textContent =
    topic.description ||
    "No topic description is available.";

  article.append(number, title, description);

  const meta = createTopicMeta(topic);

  if (meta) {
    article.appendChild(meta);
  }

  const button = document.createElement("a");
  button.classList.add("topic-button");
  button.textContent = "Open topic →";

  button.href =
    `topic.html?topics=${encodeURIComponent(course.topics)}` +
    `&topic=${encodeURIComponent(topic.id)}` +
    `&course=${encodeURIComponent(course.id)}`;

  article.appendChild(button);

  return article;
}

function createTopicMeta(topic) {
  const tags = [];

  if (topic.estimatedReadingTime) {
    tags.push(`Reading: ${topic.estimatedReadingTime}`);
  } else if (topic.readingTime) {
    tags.push(topic.readingTime);
  }

  if (topic.estimatedQuizTime) {
    tags.push(`Quiz: ${topic.estimatedQuizTime}`);
  }

  if (topic.questionCount) {
    tags.push(`${topic.questionCount} questions`);
  }

  if (topic.quiz) {
    tags.push("Quiz");
  }

  if (tags.length === 0) {
    return null;
  }

  const meta = document.createElement("div");
  meta.classList.add("topic-meta");

  tags.forEach(tagText => {
    const tag = document.createElement("span");
    tag.classList.add("topic-tag");
    tag.textContent = tagText;
    meta.appendChild(tag);
  });

  return meta;
}

function formatTopicCount(count) {
  return count === 1 ? "1 topic" : `${count} topics`;
}

function showLoadingMessage() {
  topicGrid.innerHTML = `
    <div class="status-message">
      <p>Loading topics...</p>
    </div>
  `;
}

function showEmptyMessage(course) {
  topicGrid.innerHTML = `
    <div class="status-message">
      <h3>No topics found</h3>
      <p>Add topics to ${escapeHtml(course.topics)}.</p>
    </div>
  `;
}

function showCourseError(title, message) {
  courseCode.textContent = "Course unavailable";
  courseTitle.textContent = title;
  courseDescription.textContent = message;
  courseDetails.innerHTML = "";

  topicGrid.innerHTML = `
    <div class="status-message error-message">
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(message)}</p>
    </div>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
