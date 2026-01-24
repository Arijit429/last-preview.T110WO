window.addEventListener('error', function(e) {
    console.error('Global error:', e.message, e.filename, e.lineno);
});

const questionsData = {
    section1: [
        {
            id: 1,
            question: "What is the capital of France?",
            options: ["London", "Berlin", "Paris", "Madrid"],
            correctAnswer: 2
        },
        {
            id: 2,
            question: "Which planet is known as the Red Planet?",
            options: ["Venus", "Mars", "Jupiter", "Saturn"],
            correctAnswer: 1
        },
        {
            id: 3,
            question: "What is 2 + 2?",
            options: ["3", "4", "5", "6"],
            correctAnswer: 1
        },
        {
            id: 4,
            question: "Who wrote 'Romeo and Juliet'?",
            options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"],
            correctAnswer: 1
        },
        {
            id: 5,
            question: "What is the largest ocean on Earth?",
            options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
            correctAnswer: 3
        },
        {
            id: 6,
            question: "What is the chemical symbol for gold?",
            options: ["Go", "Gd", "Au", "Ag"],
            correctAnswer: 2
        },
        {
            id: 7,
            question: "How many continents are there?",
            options: ["5", "6", "7", "8"],
            correctAnswer: 2
        },
        {
            id: 8,
            question: "What is the speed of light?",
            options: ["300,000 km/s", "150,000 km/s", "450,000 km/s", "600,000 km/s"],
            correctAnswer: 0
        },
        {
            id: 9,
            question: "Who painted the Mona Lisa?",
            options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Michelangelo"],
            correctAnswer: 2
        },
        {
            id: 10,
            question: "What is the smallest prime number?",
            options: ["0", "1", "2", "3"],
            correctAnswer: 2
        },
        ...Array.from({length: 20}, (_, i) => ({
            id: i + 11,
            question: `Sample MCQ Question ${i + 11}?`,
            options: ["Option A", "Option B", "Option C", "Option D"],
            correctAnswer: Math.floor(Math.random() * 4)
        }))
    ],
    section2: [
        {
            id: 31,
            question: "Explain the concept of Object-Oriented Programming and its main principles.",
            type: "descriptive"
        },
        {
            id: 32,
            question: "Describe the water cycle and its importance to Earth's ecosystem.",
            type: "descriptive"
        },
        {
            id: 33,
            question: "What are the causes and effects of climate change? Discuss potential solutions.",
            type: "descriptive"
        },
        {
            id: 34,
            question: "Explain the theory of evolution and provide examples of natural selection.",
            type: "descriptive"
        },
        {
            id: 35,
            question: "Discuss the impact of social media on modern society.",
            type: "descriptive"
        },
        ...Array.from({length: 15}, (_, i) => ({
            id: i + 36,
            question: `Sample Descriptive Question ${i + 36}. Provide a detailed answer.`,
            type: "descriptive"
        }))
    ]
};

let currentSection = 1;
let currentQuestionIndex = 0;
let answers = {};
let flaggedQuestions = new Set();
let visitedQuestions = new Set();
let timerInterval;
let timeRemaining = 120 * 60; // 120 minutes in seconds
let examStartTime = Date.now();

const testData = JSON.parse(sessionStorage.getItem('testData') || '{}');

document.getElementById('studentName').textContent = testData.studentName || 'Student';
document.getElementById('testId').textContent = testData.testId || 'TEST-ID';

function initializeExam() {
    const requiredElements = [
        'studentName', 'testId', 'timer', 'timeDisplay',
        'currentQuestionNum', 'totalQuestions', 'questionContent',
        'questionOptions', 'paletteSection1', 'paletteSection2',
        'answeredCount', 'notVisitedCount', 'flaggedCount'
    ];
    
    const missingElements = requiredElements.filter(id => !document.getElementById(id));
    
    if (missingElements.length > 0) {
        console.error('Missing required elements:', missingElements);
        alert('Error: Some page elements are missing. Please refresh the page.');
        return;
    }
    
    
    generatePalette();
    loadQuestion();
    startTimer();
    updateStats();
    
    visitedQuestions.add(getCurrentQuestionId());
    updatePaletteButton(getCurrentQuestionId());
    
}

function startTimer() {
    updateTimerDisplay();
    timerInterval = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();
        
        if (timeRemaining <= 300) { // 5 minutes warning
            document.getElementById('timer').classList.add('warning');
        }
        
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            autoSubmitExam();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const hours = Math.floor(timeRemaining / 3600);
    const minutes = Math.floor((timeRemaining % 3600) / 60);
    const seconds = timeRemaining % 60;
    
    const display = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    document.getElementById('timeDisplay').textContent = display;
}

function getCurrentQuestionId() {
    const section = currentSection === 1 ? questionsData.section1 : questionsData.section2;
    return section[currentQuestionIndex].id;
}

function loadQuestion() {
    const section = currentSection === 1 ? questionsData.section1 : questionsData.section2;
    const question = section[currentQuestionIndex];
    
    const totalQuestions = questionsData.section1.length + questionsData.section2.length;
    const currentNum = currentSection === 1 ? currentQuestionIndex + 1 : questionsData.section1.length + currentQuestionIndex + 1;
    document.getElementById('currentQuestionNum').textContent = currentNum;
    document.getElementById('totalQuestions').textContent = totalQuestions;
    
    document.getElementById('questionContent').innerHTML = `<p>${question.question}</p>`;
    
    const flagBtn = document.getElementById('flagBtn');
    if (flaggedQuestions.has(question.id)) {
        flagBtn.classList.add('flagged');
    } else {
        flagBtn.classList.remove('flagged');
    }
    
    const optionsContainer = document.getElementById('questionOptions');
    if (currentSection === 1) {
        optionsContainer.innerHTML = question.options.map((option, index) => `
            <div class="option ${answers[question.id] === index ? 'selected' : ''}" data-index="${index}">
                <div class="option-label">${String.fromCharCode(65 + index)}</div>
                <div class="option-text">${option}</div>
            </div>
        `).join('');
        
        document.querySelectorAll('.option').forEach(option => {
            option.addEventListener('click', () => selectOption(option));
        });
    } else {
        const savedAnswer = answers[question.id] || '';
        optionsContainer.innerHTML = `
            <textarea class="textarea-answer" id="descriptiveAnswer" placeholder="Type your answer here...">${savedAnswer}</textarea>
        `;
        
        document.getElementById('descriptiveAnswer').addEventListener('input', (e) => {
            answers[question.id] = e.target.value;
            updatePaletteButton(question.id);
            updateStats();
        });
    }
    
    document.getElementById('previousBtn').disabled = currentQuestionIndex === 0 && currentSection === 1;
    
    const isLastQuestion = currentSection === 2 && currentQuestionIndex === questionsData.section2.length - 1;
    document.getElementById('nextBtn').textContent = isLastQuestion ? 'Finish' : 'Next';
    
    visitedQuestions.add(question.id);
    updatePaletteButton(question.id);
    updateStats();
    
    setTimeout(() => {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }, 100);
}

function selectOption(optionElement) {
    document.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));
    
    optionElement.classList.add('selected');
    
    const questionId = getCurrentQuestionId();
    const optionIndex = parseInt(optionElement.dataset.index);
    answers[questionId] = optionIndex;
    
    updatePaletteButton(questionId);
    updateStats();
}

function generatePalette() {
    const palette1 = document.getElementById('paletteSection1');
    const palette2 = document.getElementById('paletteSection2');
    
    palette1.innerHTML = questionsData.section1.map(q => `
        <button class="palette-btn" data-section="1" data-index="${questionsData.section1.indexOf(q)}" data-id="${q.id}">
            ${q.id}
        </button>
    `).join('');
    
    palette2.innerHTML = questionsData.section2.map(q => `
        <button class="palette-btn" data-section="2" data-index="${questionsData.section2.indexOf(q)}" data-id="${q.id}">
            ${q.id}
        </button>
    `).join('');
    
    document.querySelectorAll('.palette-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const section = parseInt(btn.dataset.section);
            const index = parseInt(btn.dataset.index);
            navigateToQuestion(section, index);
        });
    });
}

function updatePaletteButton(questionId) {
    const btn = document.querySelector(`.palette-btn[data-id="${questionId}"]`);
    if (!btn) return;
    
    btn.classList.remove('answered', 'flagged', 'current');
    
    if (questionId === getCurrentQuestionId()) {
        btn.classList.add('current');
    }
    
    if (answers[questionId] !== undefined && answers[questionId] !== '') {
        btn.classList.add('answered');
    }
    
    if (flaggedQuestions.has(questionId)) {
        btn.classList.add('flagged');
    }
}

function updateAllPaletteButtons() {
    const allQuestions = [...questionsData.section1, ...questionsData.section2];
    allQuestions.forEach(q => updatePaletteButton(q.id));
}

function navigateToQuestion(section, index) {
    currentSection = section;
    currentQuestionIndex = index;
    
    document.querySelectorAll('.section-tab').forEach(tab => {
        tab.classList.remove('active');
        if (parseInt(tab.dataset.section) === section) {
            tab.classList.add('active');
        }
    });
    
    loadQuestion();
    updateAllPaletteButtons();
}

function nextQuestion() {
    const section = currentSection === 1 ? questionsData.section1 : questionsData.section2;
    
    if (currentQuestionIndex < section.length - 1) {
        currentQuestionIndex++;
    } else if (currentSection === 1) {
        currentSection = 2;
        currentQuestionIndex = 0;
        document.querySelectorAll('.section-tab').forEach(tab => {
            tab.classList.remove('active');
            if (parseInt(tab.dataset.section) === 2) {
                tab.classList.add('active');
            }
        });
    }
    
    loadQuestion();
    updateAllPaletteButtons();
}

function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
    } else if (currentSection === 2) {
        currentSection = 1;
        currentQuestionIndex = questionsData.section1.length - 1;
        document.querySelectorAll('.section-tab').forEach(tab => {
            tab.classList.remove('active');
            if (parseInt(tab.dataset.section) === 1) {
                tab.classList.add('active');
            }
        });
    }
    
    loadQuestion();
    updateAllPaletteButtons();
}

function clearResponse() {
    const questionId = getCurrentQuestionId();
    delete answers[questionId];
    
    if (currentSection === 1) {
        document.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));
    } else {
        document.getElementById('descriptiveAnswer').value = '';
    }
    
    updatePaletteButton(questionId);
    updateStats();
}

function toggleFlag() {
    const questionId = getCurrentQuestionId();
    
    if (flaggedQuestions.has(questionId)) {
        flaggedQuestions.delete(questionId);
        document.getElementById('flagBtn').classList.remove('flagged');
    } else {
        flaggedQuestions.add(questionId);
        document.getElementById('flagBtn').classList.add('flagged');
    }
    
    updatePaletteButton(questionId);
    updateStats();
}

function updateStats() {
    const allQuestions = [...questionsData.section1, ...questionsData.section2];
    const answeredCount = Object.keys(answers).filter(id => answers[id] !== undefined && answers[id] !== '').length;
    const notVisitedCount = allQuestions.length - visitedQuestions.size;
    const flaggedCount = flaggedQuestions.size;
    
    document.getElementById('answeredCount').textContent = answeredCount;
    document.getElementById('notVisitedCount').textContent = notVisitedCount;
    document.getElementById('flaggedCount').textContent = flaggedCount;
}

function showSubmitModal() {
    const allQuestions = [...questionsData.section1, ...questionsData.section2];
    const answeredCount = Object.keys(answers).filter(id => answers[id] !== undefined && answers[id] !== '').length;
    const notVisitedCount = allQuestions.length - visitedQuestions.size;
    const flaggedCount = flaggedQuestions.size;
    
    document.getElementById('modalAnswered').textContent = answeredCount;
    document.getElementById('modalNotVisited').textContent = notVisitedCount;
    document.getElementById('modalFlagged').textContent = flaggedCount;
    
    document.getElementById('submitModal').classList.add('active');
}

function submitExam() {
    clearInterval(timerInterval);
    calculateResults();
    showResults();
}

function autoSubmitExam() {
    alert('Time is up! Your exam will be submitted automatically.');
    submitExam();
}

function calculateResults() {
    let correctAnswers = 0;
    let wrongAnswers = 0;
    let unanswered = 0;
    let section1Correct = 0;
    let section1Wrong = 0;
    let section2Answered = 0;
    
    questionsData.section1.forEach(q => {
        if (answers[q.id] !== undefined) {
            if (answers[q.id] === q.correctAnswer) {
                correctAnswers++;
                section1Correct++;
            } else {
                wrongAnswers++;
                section1Wrong++;
            }
        } else {
            unanswered++;
        }
    });
    
    questionsData.section2.forEach(q => {
        if (answers[q.id] && answers[q.id].trim().length > 50) {
            section2Answered++;
            correctAnswers++; // For demo purposes, count as correct
        } else if (answers[q.id] && answers[q.id].trim().length > 0) {
            section2Answered++;
            wrongAnswers++; // Partial answer
        } else {
            unanswered++;
        }
    });
    
    const totalQuestions = questionsData.section1.length + questionsData.section2.length;
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    const timeTaken = 120 * 60 - timeRemaining;
    
    const examResults = {
        score,
        correctAnswers,
        wrongAnswers,
        unanswered,
        totalQuestions,
        section1Correct,
        section1Wrong,
        section1Total: questionsData.section1.length,
        section2Answered,
        section2Total: questionsData.section2.length,
        timeTaken,
        answers,
        questions: questionsData
    };
    
    sessionStorage.setItem('examResults', JSON.stringify(examResults));
}

function showResults() {
    window.location.href = 'results.html';
}


document.getElementById('nextBtn').addEventListener('click', nextQuestion);
document.getElementById('previousBtn').addEventListener('click', previousQuestion);
document.getElementById('clearBtn').addEventListener('click', clearResponse);
document.getElementById('flagBtn').addEventListener('click', toggleFlag);
document.getElementById('submitExamBtn').addEventListener('click', showSubmitModal);
document.getElementById('closeSubmitModal').addEventListener('click', () => {
    document.getElementById('submitModal').classList.remove('active');
});
document.getElementById('cancelSubmit').addEventListener('click', () => {
    document.getElementById('submitModal').classList.remove('active');
});
document.getElementById('confirmSubmit').addEventListener('click', () => {
    document.getElementById('submitModal').classList.remove('active');
    submitExam();
});

document.querySelectorAll('.section-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        const section = parseInt(tab.dataset.section);
        navigateToQuestion(section, 0);
    });
});

document.getElementById('paletteToggle').addEventListener('click', () => {
    document.querySelector('.question-palette').classList.toggle('collapsed');
});



window.addEventListener('beforeunload', (e) => {
    if (document.getElementById('examContainer').style.display !== 'none') {
        e.preventDefault();
        e.returnValue = '';
    }
});

window.addEventListener('load', () => {
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    } else {
        console.error('Lucide library not loaded!');
    }
    
    try {
        initializeExam();
    } catch (error) {
        console.error('Error initializing exam:', error);
        alert('Error starting exam: ' + error.message);
    }
});

document.addEventListener('DOMContentLoaded', () => {
});

