const courseGrid = document.getElementById("course-grid");

loadCourses();

async function loadCourses() {
    try {
        showLoadingMessage();

        const response = await fetch("data/courses.json");

        if (!response.ok) {
            throw new Error(
                `Could not load courses.json. HTTP status: ${response.status}`
            );
        }

        const data = await response.json();

        if (!data.courses || !Array.isArray(data.courses)) {
            throw new Error(
                "Invalid courses.json structure. Expected a courses array."
            );
        }

        if (data.courses.length === 0) {
            showEmptyMessage();
            return;
        }

        renderCourses(data.courses);
    } catch (error) {
        console.error("Error loading courses:", error);
        showErrorMessage();
    }
}

function renderCourses(courses) {
    courseGrid.innerHTML = "";

    courses.forEach((course) => {
        const courseCard = createCourseCard(course);
        courseGrid.appendChild(courseCard);
    });
}

function createCourseCard(course) {
    const article = document.createElement("article");
    article.classList.add("course-card");

    const image = document.createElement("img");
    image.classList.add("course-image");
    image.src = course.image;
    image.alt = course.title;
    image.loading = "lazy";

    image.addEventListener("error", () => {
        image.style.display = "none";
    });

    const content = document.createElement("div");
    content.classList.add("course-content");

    const code = document.createElement("p");
    code.classList.add("course-code");
    code.textContent = course.code || "Course";

    if (course.color) {
        code.style.color = course.color;
    }

    const title = document.createElement("h3");
    title.classList.add("course-title");
    title.textContent = course.title || "Untitled course";

    const description = document.createElement("p");
    description.classList.add("course-description");
    description.textContent =
        course.description || "No course description is available.";

    const meta = document.createElement("div");
    meta.classList.add("course-meta");

    const credits = document.createElement("span");
    credits.textContent = course.credits || "";

    const topicCount = document.createElement("span");

    if (typeof course.topics === "number") {
        topicCount.textContent =
            course.topics === 1
                ? "1 topic"
                : `${course.topics} topics`;
    }

    meta.appendChild(credits);
    meta.appendChild(topicCount);

    const button = document.createElement("a");
    button.classList.add("course-button");
    button.textContent = "Open Course";
    button.href = `course.html?course=${encodeURIComponent(course.id)}`;

    if (course.color) {
        button.style.backgroundColor = course.color;
    }

    content.appendChild(code);
    content.appendChild(title);
    content.appendChild(description);
    content.appendChild(meta);
    content.appendChild(button);

    article.appendChild(image);
    article.appendChild(content);

    return article;
}

function showLoadingMessage() {
    courseGrid.innerHTML = `
        <div class="status-message">
            <p>Loading courses...</p>
        </div>
    `;
}

function showEmptyMessage() {
    courseGrid.innerHTML = `
        <div class="status-message">
            <h3>No courses found</h3>
            <p>Add courses to data/courses.json.</p>
        </div>
    `;
}

function showErrorMessage() {
    courseGrid.innerHTML = `
        <div class="status-message error-message">
            <h3>Courses could not be loaded</h3>
            <p>
                Check that data/courses.json exists and contains valid JSON.
            </p>
        </div>
    `;
}
