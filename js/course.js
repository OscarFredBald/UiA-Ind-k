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

        const [coursesResponse, topicsResponse] = await Promise.all([
            fetch("data/courses.json"),
            fetch(`data/${courseId}/topics.json`)
        ]);

        if (!coursesResponse.ok) {
            throw new Error(
                `Could not load data/courses.json. HTTP status: ${coursesResponse.status}`
            );
        }

        if (!topicsResponse.ok) {
            throw new Error(
                `Could not load data/${courseId}/topics.json. HTTP status: ${topicsResponse.status}`
            );
        }

        const coursesData = await coursesResponse.json();
        const topicsData = await topicsResponse.json();

        validateCoursesData(coursesData);
        validateTopicsData(topicsData);

        const selectedCourse = coursesData.courses.find(
            (course) => course.id === courseId
        );

        if (!selectedCourse) {
            throw new Error(
                `The course "${courseId}" was not found in data/courses.json.`
            );
        }

        renderCourseHeader(selectedCourse);
        renderTopics(topicsData.topics);
    } catch (error) {
        console.error("Error loading course:", error);

        showCourseError(
            "The course could not be loaded.",
            "Check that the course exists in data/courses.json and that its topics.json file is valid."
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

function renderCourseHeader(course) {
    document.title = `${course.code} | Learning Platform`;

    courseCode.textContent = course.code || "Course";
    courseTitle.textContent = course.title || "Untitled course";
    courseDescription.textContent =
        course.description || "No course description is available.";

    courseDetails.innerHTML = "";

    const detailItems = [
        course.credits,
        course.semester,
        typeof course.topics === "number"
            ? formatTopicCount(course.topics)
            : null,
        course.difficulty
    ];

    detailItems
        .filter(Boolean)
        .forEach((item) => {
            const detail = document.createElement("span");
            detail.classList.add("course-detail");
            detail.textContent = item;
            courseDetails.appendChild(detail);
        });
}

function renderTopics(topics) {
    topicGrid.innerHTML = "";

    if (topics.length === 0) {
        showEmptyMessage();
        return;
    }

    topics.forEach((topic, index) => {
        const topicCard = createTopicCard(topic, index);
        topicGrid.appendChild(topicCard);
    });
}

function createTopicCard(topic, index) {
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
        topic.description || "No topic description is available.";

    article.appendChild(number);
    article.appendChild(title);
    article.appendChild(description);

    const meta = createTopicMeta(topic);

    if (meta) {
        article.appendChild(meta);
    }

    const button = document.createElement("a");
    button.classList.add("topic-button");
    button.textContent = "Open topic →";
    button.href =
        `topic.html?course=${encodeURIComponent(courseId)}` +
        `&topic=${encodeURIComponent(topic.id)}`;

    article.appendChild(button);

    return article;
}

function createTopicMeta(topic) {
    const tags = [];

    if (Array.isArray(topic.modules)) {
        tags.push(formatModuleCount(topic.modules.length));
    } else if (typeof topic.moduleCount === "number") {
        tags.push(formatModuleCount(topic.moduleCount));
    }

    if (topic.hasQuiz === true) {
        tags.push("Quiz");
    }

    if (topic.readingTime) {
        tags.push(topic.readingTime);
    }

    if (tags.length === 0) {
        return null;
    }

    const meta = document.createElement("div");
    meta.classList.add("topic-meta");

    tags.forEach((tagText) => {
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

function formatModuleCount(count) {
    return count === 1 ? "1 module" : `${count} modules`;
}

function showLoadingMessage() {
    topicGrid.innerHTML = `
        <div class="status-message">
            <p>Loading topics...</p>
        </div>
    `;
}

function showEmptyMessage() {
    topicGrid.innerHTML = `
        <div class="status-message">
            <h3>No topics found</h3>
            <p>Add topics to data/${escapeHtml(courseId)}/topics.json.</p>
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
