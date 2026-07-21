const params = new URLSearchParams(window.location.search);

const quizFile = params.get("file");
const courseId = params.get("course");
const topicsFile = params.get("topics");
const topicId = params.get("topic");

const quizTitle = document.getElementById("quiz-title");
const quizDescription = document.getElementById("quiz-description");
const quizBox = document.getElementById("quiz-box");
const loadingMessage = document.getElementById("loading-message");
const errorMessage = document.getElementById("error-message");
const nextButton = document.getElementById("next-btn");
const previousButton = document.getElementById("previous-btn");
const backLink = document.getElementById("back-to-topic");

let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let quizCompleted = false;

initializeQuiz();

async function initializeQuiz() {
  configureBackLink();
  configureButtons();

  if (!quizFile) {
    showError(
      "No quiz file was selected. Open the quiz from a topic page."
    );
    return;
  }

  try {
    showLoading();

    const response = await fetch(quizFile);

    if (!response.ok) {
      throw new Error(
        `The quiz file could not be loaded: ${quizFile}. HTTP status: ${response.status}`
      );
    }

    const data = await response.json();

    validateQuizData(data);

    document.title = `${data.title} | UiA Indøk`;

    if (quizTitle) {
      quizTitle.textContent = data.title;
    }

    if (quizDescription) {
      quizDescription.textContent =
        data.description ||
        "Select the best answer for each question.";
    }

    questions = prepareQuestions(data.questions);

    hideLoading();
    renderQuestion();
  } catch (error) {
    console.error("Quiz loading error:", error);

    showError(
      error.message ||
        "The quiz could not be loaded."
    );
  }
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

function configureButtons() {
  if (nextButton) {
    nextButton.addEventListener("click", handleNextButton);
  }

  if (previousButton) {
    previousButton.addEventListener(
      "click",
      handlePreviousButton
    );
  }
}

function validateQuizData(data) {
  if (!data || typeof data !== "object") {
    throw new Error(
      "The quiz file does not contain valid JSON data."
    );
  }

  if (!data.title || typeof data.title !== "string") {
    throw new Error(
      "The quiz file is missing a valid title."
    );
  }

  if (!Array.isArray(data.questions)) {
    throw new Error(
      "The quiz file is missing a valid questions array."
    );
  }

  if (data.questions.length === 0) {
    throw new Error(
      "The quiz does not contain any questions."
    );
  }

  data.questions.forEach((question, index) => {
    validateQuestion(question, index);
  });
}

function validateQuestion(question, index) {
  const questionNumber = index + 1;

  if (!question || typeof question !== "object") {
    throw new Error(
      `Question ${questionNumber} is not a valid object.`
    );
  }

  if (
    !question.question ||
    typeof question.question !== "string"
  ) {
    throw new Error(
      `Question ${questionNumber} is missing its question text.`
    );
  }

  if (
    !Array.isArray(question.options) ||
    question.options.length < 2
  ) {
    throw new Error(
      `Question ${questionNumber} must contain at least two answer options.`
    );
  }

  if (
    !Number.isInteger(question.answer) ||
    question.answer < 0 ||
    question.answer >= question.options.length
  ) {
    throw new Error(
      `Question ${questionNumber} contains an invalid answer index.`
    );
  }
}

function prepareQuestions(rawQuestions) {
  const preparedQuestions = rawQuestions.map(
    (question, index) => {
      const options = question.options.map(
        (optionText, optionIndex) => ({
          text: optionText,
          originalIndex: optionIndex
        })
      );

      const shuffledOptions = shuffleArray(options);

      const correctOptionIndex =
        shuffledOptions.findIndex(
          option =>
            option.originalIndex === question.answer
        );

      return {
        id: question.id || `question-${index + 1}`,
        question: question.question,
        difficulty:
          question.difficulty || "Understanding",
        explanation:
          question.explanation ||
          "No explanation is available.",
        options: shuffledOptions.map(option => option.text),
        correctOptionIndex,
        selectedOptionIndex: null,
        submitted: false
      };
    }
  );

  return sortQuestionsByDifficulty(preparedQuestions);
}

function sortQuestionsByDifficulty(questionList) {
  const difficultyOrder = {
    Foundation: 1,
    Easy: 1,
    Understanding: 2,
    Medium: 2,
    Application: 3,
    Analysis: 4,
    Hard: 4,
    Expert: 5
  };

  return [...questionList].sort((first, second) => {
    const firstDifficulty =
      difficultyOrder[first.difficulty] || 99;

    const secondDifficulty =
      difficultyOrder[second.difficulty] || 99;

    return firstDifficulty - secondDifficulty;
  });
}

function renderQuestion() {
  if (!quizBox || questions.length === 0) {
    return;
  }

  quizCompleted = false;

  const question =
    questions[currentQuestionIndex];

  quizBox.innerHTML = "";

  const progress = createProgressSection();
  const questionCard = document.createElement("section");

  questionCard.className = "quiz-question-card";

  const questionHeader = document.createElement("div");
  questionHeader.className = "quiz-question-header";

  const questionNumber = document.createElement("p");
  questionNumber.className = "quiz-question-number";
  questionNumber.textContent =
    `Question ${currentQuestionIndex + 1} of ${questions.length}`;

  const difficulty = document.createElement("span");
  difficulty.className =
    `quiz-difficulty ${getDifficultyClass(question.difficulty)}`;
  difficulty.textContent = question.difficulty;

  questionHeader.append(
    questionNumber,
    difficulty
  );

  const questionText = document.createElement("h2");
  questionText.className = "quiz-question-text";
  questionText.textContent = question.question;

  const optionsContainer =
    document.createElement("div");

  optionsContainer.className = "quiz-options";

  question.options.forEach(
    (optionText, optionIndex) => {
      const optionButton = createOptionButton(
        question,
        optionText,
        optionIndex
      );

      optionsContainer.appendChild(optionButton);
    }
  );

  questionCard.append(
    questionHeader,
    questionText,
    optionsContainer
  );

  if (question.submitted) {
    const feedback = createFeedback(question);
    questionCard.appendChild(feedback);
  }

  quizBox.append(progress, questionCard);

  updateNavigationButtons();
}

function createProgressSection() {
  const progressWrapper =
    document.createElement("div");

  progressWrapper.className = "quiz-progress-wrapper";

  const progressText = document.createElement("div");
  progressText.className = "quiz-progress-text";

  const position = document.createElement("span");
  position.textContent =
    `${currentQuestionIndex + 1} / ${questions.length}`;

  const answered = document.createElement("span");
  answered.textContent =
    `${getAnsweredCount()} answered`;

  progressText.append(position, answered);

  const progressTrack =
    document.createElement("div");

  progressTrack.className = "quiz-progress-track";
  progressTrack.setAttribute(
    "role",
    "progressbar"
  );

  const progressPercentage =
    ((currentQuestionIndex + 1) /
      questions.length) *
    100;

  progressTrack.setAttribute(
    "aria-valuenow",
    String(Math.round(progressPercentage))
  );
  progressTrack.setAttribute(
    "aria-valuemin",
    "0"
  );
  progressTrack.setAttribute(
    "aria-valuemax",
    "100"
  );

  const progressBar = document.createElement("div");
  progressBar.className = "quiz-progress-bar";
  progressBar.style.width =
    `${progressPercentage}%`;

  progressTrack.appendChild(progressBar);

  progressWrapper.append(
    progressText,
    progressTrack
  );

  return progressWrapper;
}

function createOptionButton(
  question,
  optionText,
  optionIndex
) {
  const button = document.createElement("button");

  button.type = "button";
  button.className = "quiz-option";
  button.dataset.optionIndex = String(optionIndex);

  const optionLetter =
    document.createElement("span");

  optionLetter.className = "quiz-option-letter";
  optionLetter.textContent =
    String.fromCharCode(65 + optionIndex);

  const optionLabel =
    document.createElement("span");

  optionLabel.className = "quiz-option-text";
  optionLabel.textContent = optionText;

  button.append(optionLetter, optionLabel);

  if (
    question.selectedOptionIndex === optionIndex
  ) {
    button.classList.add("selected");
  }

  if (question.submitted) {
    button.disabled = true;

    if (
      optionIndex ===
      question.correctOptionIndex
    ) {
      button.classList.add("correct");
    }

    if (
      optionIndex ===
        question.selectedOptionIndex &&
      optionIndex !==
        question.correctOptionIndex
    ) {
      button.classList.add("incorrect");
    }
  } else {
    button.addEventListener("click", () => {
      selectOption(optionIndex);
    });
  }

  return button;
}

function selectOption(optionIndex) {
  const question =
    questions[currentQuestionIndex];

  if (question.submitted) {
    return;
  }

  question.selectedOptionIndex =
    optionIndex;

  renderQuestion();
}

function submitCurrentAnswer() {
  const question =
    questions[currentQuestionIndex];

  if (
    question.selectedOptionIndex === null
  ) {
    showTemporaryMessage(
      "Select an answer before continuing."
    );
    return false;
  }

  if (!question.submitted) {
    question.submitted = true;

    if (
      question.selectedOptionIndex ===
      question.correctOptionIndex
    ) {
      score += 1;
    }
  }

  renderQuestion();
  return true;
}

function createFeedback(question) {
  const isCorrect =
    question.selectedOptionIndex ===
    question.correctOptionIndex;

  const feedback = document.createElement("div");

  feedback.className = isCorrect
    ? "quiz-feedback quiz-feedback-correct"
    : "quiz-feedback quiz-feedback-incorrect";

  const heading = document.createElement("h3");

  heading.textContent = isCorrect
    ? "Correct"
    : "Not quite";

  const explanation =
    document.createElement("p");

  explanation.textContent =
    question.explanation;

  feedback.append(heading, explanation);

  return feedback;
}

function handleNextButton() {
  if (quizCompleted) {
    restartQuiz();
    return;
  }

  const question =
    questions[currentQuestionIndex];

  if (!question.submitted) {
    submitCurrentAnswer();
    return;
  }

  if (
    currentQuestionIndex <
    questions.length - 1
  ) {
    currentQuestionIndex += 1;
    renderQuestion();
    scrollQuizToTop();
    return;
  }

  renderResults();
}

function handlePreviousButton() {
  if (
    quizCompleted ||
    currentQuestionIndex === 0
  ) {
    return;
  }

  currentQuestionIndex -= 1;
  renderQuestion();
  scrollQuizToTop();
}

function updateNavigationButtons() {
  const question =
    questions[currentQuestionIndex];

  if (previousButton) {
    previousButton.disabled =
      currentQuestionIndex === 0;
  }

  if (!nextButton) {
    return;
  }

  nextButton.disabled = false;

  if (!question.submitted) {
    nextButton.textContent = "Check Answer";
    return;
  }

  if (
    currentQuestionIndex ===
    questions.length - 1
  ) {
    nextButton.textContent = "View Results";
    return;
  }

  nextButton.textContent = "Next Question";
}

function renderResults() {
  quizCompleted = true;

  if (!quizBox) {
    return;
  }

  const percentage = Math.round(
    (score / questions.length) * 100
  );

  const resultLevel =
    getResultLevel(percentage);

  quizBox.innerHTML = "";

  const resultCard = document.createElement("section");
  resultCard.className = "quiz-results";

  const eyebrow = document.createElement("p");
  eyebrow.className = "eyebrow";
  eyebrow.textContent = "Quiz completed";

  const heading = document.createElement("h2");
  heading.textContent = resultLevel.heading;

  const scoreText = document.createElement("p");
  scoreText.className = "quiz-result-score";
  scoreText.textContent =
    `${score} of ${questions.length} correct`;

  const percentageText =
    document.createElement("p");

  percentageText.className =
    "quiz-result-percentage";
  percentageText.textContent =
    `${percentage}%`;

  const message = document.createElement("p");
  message.className = "quiz-result-message";
  message.textContent = resultLevel.message;

  const review = createResultReview();

  resultCard.append(
    eyebrow,
    heading,
    percentageText,
    scoreText,
    message,
    review
  );

  quizBox.appendChild(resultCard);

  if (previousButton) {
    previousButton.disabled = true;
  }

  if (nextButton) {
    nextButton.disabled = false;
    nextButton.textContent = "Restart Quiz";
  }

  scrollQuizToTop();
}

function createResultReview() {
  const reviewSection =
    document.createElement("div");

  reviewSection.className =
    "quiz-result-review";

  const heading = document.createElement("h3");
  heading.textContent = "Question Review";

  const reviewList = document.createElement("div");
  reviewList.className = "quiz-review-list";

  questions.forEach((question, index) => {
    const isCorrect =
      question.selectedOptionIndex ===
      question.correctOptionIndex;

    const item = document.createElement("button");

    item.type = "button";
    item.className = isCorrect
      ? "quiz-review-item correct"
      : "quiz-review-item incorrect";

    item.textContent =
      `${index + 1}. ${isCorrect ? "Correct" : "Incorrect"}`;

    item.addEventListener("click", () => {
      quizCompleted = false;
      currentQuestionIndex = index;
      renderQuestion();
      scrollQuizToTop();
    });

    reviewList.appendChild(item);
  });

  reviewSection.append(heading, reviewList);

  return reviewSection;
}

function getResultLevel(percentage) {
  if (percentage >= 90) {
    return {
      heading: "Excellent result",
      message:
        "You demonstrate a strong understanding of the module and can apply the concepts in complex situations."
    };
  }

  if (percentage >= 75) {
    return {
      heading: "Good result",
      message:
        "You have a solid understanding of the module. Review the questions you missed before moving on."
    };
  }

  if (percentage >= 60) {
    return {
      heading: "Developing understanding",
      message:
        "You understand several core concepts, but some areas should be reviewed in the reading module."
    };
  }

  return {
    heading: "More review recommended",
    message:
      "Return to the reading material and focus on the explanations and practical examples before trying again."
  };
}

function restartQuiz() {
  score = 0;
  currentQuestionIndex = 0;
  quizCompleted = false;

  questions.forEach(question => {
    question.selectedOptionIndex = null;
    question.submitted = false;
  });

  renderQuestion();
  scrollQuizToTop();
}

function getAnsweredCount() {
  return questions.filter(
    question => question.submitted
  ).length;
}

function getDifficultyClass(difficulty) {
  return String(difficulty)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");
}

function shuffleArray(items) {
  const shuffled = [...items];

  for (
    let index = shuffled.length - 1;
    index > 0;
    index -= 1
  ) {
    const randomIndex = Math.floor(
      Math.random() * (index + 1)
    );

    [
      shuffled[index],
      shuffled[randomIndex]
    ] = [
      shuffled[randomIndex],
      shuffled[index]
    ];
  }

  return shuffled;
}

function showLoading() {
  if (loadingMessage) {
    loadingMessage.hidden = false;
    loadingMessage.textContent =
      "Loading quiz...";
  }

  if (errorMessage) {
    errorMessage.hidden = true;
  }

  if (quizBox) {
    quizBox.innerHTML = "";
  }

  if (nextButton) {
    nextButton.disabled = true;
  }

  if (previousButton) {
    previousButton.disabled = true;
  }
}

function hideLoading() {
  if (loadingMessage) {
    loadingMessage.hidden = true;
  }

  if (errorMessage) {
    errorMessage.hidden = true;
  }
}

function showError(message) {
  if (loadingMessage) {
    loadingMessage.hidden = true;
  }

  if (errorMessage) {
    errorMessage.hidden = false;
    errorMessage.textContent = message;
  }

  if (quizBox) {
    quizBox.innerHTML = `
      <section class="quiz-error-card">
        <h2>The quiz could not be opened</h2>
        <p>${escapeHtml(message)}</p>
      </section>
    `;
  }

  if (nextButton) {
    nextButton.disabled = true;
  }

  if (previousButton) {
    previousButton.disabled = true;
  }
}

function showTemporaryMessage(message) {
  let messageElement =
    document.getElementById(
      "quiz-temporary-message"
    );

  if (!messageElement) {
    messageElement =
      document.createElement("p");

    messageElement.id =
      "quiz-temporary-message";

    messageElement.className =
      "quiz-temporary-message";

    if (quizBox) {
      quizBox.prepend(messageElement);
    }
  }

  messageElement.textContent = message;

  window.setTimeout(() => {
    messageElement?.remove();
  }, 2500);
}

function scrollQuizToTop() {
  const quizMain =
    document.querySelector(".quiz-page") ||
    quizBox;

  if (!quizMain) {
    return;
  }

  quizMain.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
