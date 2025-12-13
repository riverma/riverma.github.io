const questions = [
    // Easy/Playful Questions
    { type: 'personal', difficulty: 'easy', text: 'If your life was a book, what would the current chapter be titled?' },
    { type: 'personal', difficulty: 'easy', text: 'What simple pleasure makes you feel most alive?' },
    { type: 'personal', difficulty: 'easy', text: 'What everyday object best represents your approach to life?' },
    { type: 'worldview', difficulty: 'easy', text: 'Can something be both completely true and completely false?' },
    { type: 'personal', difficulty: 'easy', text: 'What childhood belief do you secretly still hold?' },
    { type: 'personal', difficulty: 'easy', text: 'If your mind was a room, what would it look like?' },
    { type: 'personal', difficulty: 'easy', text: 'What rule do you love to break?' },
    { type: 'worldview', difficulty: 'easy', text: 'Is the present moment all that exists, or is time real?' },
    { type: 'personal', difficulty: 'easy', text: 'What makes you feel most like yourself?' },
    { type: 'personal', difficulty: 'easy', text: 'What question would you ask your future self?' },
    { type: 'personal', difficulty: 'easy', text: 'What ordinary moment recently felt extraordinary?' },
    { type: 'worldview', difficulty: 'easy', text: 'Do dreams count as experiences?' },
    { type: 'worldview', difficulty: 'easy', text: 'Can you think of a thought that has never been thought before?' },
    { type: 'worldview', difficulty: 'easy', text: 'Is doing nothing actually doing something?' },
    { type: 'personal', difficulty: 'easy', text: 'What small rebellion brings you joy?' },
    { type: 'personal', difficulty: 'easy', text: 'What makes a day worth remembering?' },
    { type: 'worldview', difficulty: 'easy', text: 'Is forgetting things a bug or a feature of consciousness?' },
    { type: 'personal', difficulty: 'easy', text: 'What do you pretend to understand but really don\'t?' },

    // Medium Questions
    { type: 'personal', difficulty: 'medium', text: 'What belief have you changed your mind about in the last year?' },
    { type: 'worldview', difficulty: 'medium', text: 'Is free will an illusion or do we truly make choices?' },
    { type: 'personal', difficulty: 'medium', text: 'How do you know when you\'re being authentic versus performing a version of yourself?' },
    { type: 'worldview', difficulty: 'medium', text: 'Is mathematics discovered or invented?' },
    { type: 'personal', difficulty: 'medium', text: 'When do you feel most connected to something greater than yourself?' },
    { type: 'personal', difficulty: 'medium', text: 'What question do you keep asking yourself but haven\'t found an answer to?' },
    { type: 'worldview', difficulty: 'medium', text: 'Is reality fundamentally physical, mental, or something else?' },
    { type: 'worldview', difficulty: 'medium', text: 'Does language shape thought or does thought shape language?' },
    { type: 'personal', difficulty: 'medium', text: 'What part of your personality do you think is truly "you" versus learned behavior?' },
    { type: 'worldview', difficulty: 'medium', text: 'Is consciousness binary (on/off) or does it exist on a spectrum?' },
    { type: 'personal', difficulty: 'medium', text: 'How do you distinguish between intuition and bias?' },
    { type: 'personal', difficulty: 'medium', text: 'What illusion about yourself have you had to let go of?' },
    { type: 'personal', difficulty: 'medium', text: 'What contradiction do you live with comfortably?' },
    { type: 'worldview', difficulty: 'medium', text: 'Is objectivity possible or is everything subjective?' },
    { type: 'personal', difficulty: 'medium', text: 'What role does self-deception play in your happiness?' },
    { type: 'personal', difficulty: 'medium', text: 'What story do you tell yourself that might not be true?' },
    { type: 'worldview', difficulty: 'medium', text: 'Can meaning exist without consciousness to perceive it?' },
    { type: 'personal', difficulty: 'medium', text: 'How do you know when a belief is truly yours?' },
    { type: 'worldview', difficulty: 'medium', text: 'Is suffering necessary for growth or just something we tell ourselves?' },
    { type: 'worldview', difficulty: 'medium', text: 'Is beauty a real property of the universe or something we make up?' },
    { type: 'worldview', difficulty: 'medium', text: 'Can language define truth or does naming it limit it?' },
    { type: 'personal', difficulty: 'medium', text: 'When did you become aware of something you believed but later realized you were conditioned to believe?' },

    // Hard/Deep Questions
    { type: 'personal', difficulty: 'hard', text: 'What part of your identity would you be willing to lose, and what part could you never give up?' },
    { type: 'worldview', difficulty: 'hard', text: 'If we could eliminate all suffering, should we? What would we lose?' },
    { type: 'personal', difficulty: 'hard', text: 'What truth about yourself do you avoid confronting?' },
    { type: 'personal', difficulty: 'hard', text: 'How has your relationship with death shaped how you live?' },
    { type: 'personal', difficulty: 'hard', text: 'What would you need to believe differently to become the person you want to be?' },
    { type: 'worldview', difficulty: 'hard', text: 'If you could know the absolute truth about one thing, what would you choose and why?' },
    { type: 'personal', difficulty: 'hard', text: 'What part of your suffering have you become attached to?' },
    { type: 'worldview', difficulty: 'hard', text: 'Does absolute truth exist, or is all truth relative to perspective?' },
    { type: 'personal', difficulty: 'hard', text: 'What would remain of "you" if you lost all your memories?' },
    { type: 'worldview', difficulty: 'hard', text: 'Is consciousness fundamental to the universe or an emergent property?' },
    { type: 'personal', difficulty: 'hard', text: 'What fear has shaped your entire worldview?' },
    { type: 'personal', difficulty: 'hard', text: 'How much of your life is genuinely chosen versus determined by circumstances?' },
    { type: 'worldview', difficulty: 'hard', text: 'Is there a difference between being dead and never having existed?' },
    { type: 'personal', difficulty: 'hard', text: 'What would you sacrifice your happiness for?' },
    { type: 'personal', difficulty: 'hard', text: 'What truth would destroy your current way of living if you fully accepted it?' },
    { type: 'personal', difficulty: 'hard', text: 'What have you had to destroy in yourself to survive?' },
    { type: 'worldview', difficulty: 'hard', text: 'Is love a truth about the universe or a human invention?' },
    { type: 'personal', difficulty: 'hard', text: 'What would you be willing to forget to be happy?' },
    { type: 'personal', difficulty: 'hard', text: 'How do you cope with the vastness of what you\'ll never know?' },
    { type: 'worldview', difficulty: 'hard', text: 'What is the \'I\'... truly? What is the self?' },
    { type: 'worldview', difficulty: 'hard', text: 'Which came first, being or non-being?' },
    { type: 'personal', difficulty: 'hard', text: 'How can you live without fear?' },
    { type: 'worldview', difficulty: 'hard', text: 'What is the nature of love given the vast universe?' },
    { type: 'worldview', difficulty: 'hard', text: 'Is the observer different from the observed?' }
];

let currentPlayer = 1;
let totalPlayers = 2;
let usedQuestions = [];
let currentQuestionIndex = -1;

// DOM elements
const instructionsOverlay = document.getElementById('instructionsOverlay');
const startButton = document.getElementById('startButton');
const gameContainer = document.getElementById('gameContainer');
const turnIndicator = document.getElementById('turnIndicator');
const card = document.getElementById('card');
const questionText = document.getElementById('questionText');
const tapHint = document.getElementById('tapHint');
const playerCountInput = document.getElementById('playerCount');
const decreaseButton = document.getElementById('decreaseButton');
const increaseButton = document.getElementById('increaseButton');

// Initialize game
function initGame() {
    // Create a shuffled copy of questions
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    
    // Sort by difficulty while maintaining some randomness within each difficulty
    usedQuestions = [];
    ['easy', 'medium', 'hard'].forEach(difficulty => {
        const difficultyQuestions = shuffled
            .filter(q => q.difficulty === difficulty)
            .sort(() => Math.random() - 0.5);
        usedQuestions.push(...difficultyQuestions);
    });
    
    currentQuestionIndex = -1;
}

// Show next question
function showNextQuestion() {
    currentQuestionIndex++;
    
    // Reset if we've used all questions
    if (currentQuestionIndex >= usedQuestions.length) {
        initGame();
        currentQuestionIndex = 0;
    }
    
    const question = usedQuestions[currentQuestionIndex];
    
    // Add fade animation
    questionText.style.animation = 'none';
    setTimeout(() => {
        questionText.textContent = question.text;
        questionText.style.animation = 'fadeIn 0.5s ease-in';
    }, 10);
    
    // Update turn indicator
    currentPlayer = currentPlayer >= totalPlayers ? 1 : currentPlayer + 1;
    turnIndicator.textContent = `Player ${currentPlayer}'s Turn`;
    turnIndicator.style.display = 'block';
    
    // Hide tap hint after first tap
    if (currentQuestionIndex === 0) {
        setTimeout(() => {
            tapHint.style.display = 'none';
        }, 2000);
    }
}

// Event listeners
startButton.addEventListener('click', () => {
    totalPlayers = parseInt(playerCountInput.value);
    instructionsOverlay.style.display = 'none';
    initGame();
});

decreaseButton.addEventListener('click', () => {
    const currentValue = parseInt(playerCountInput.value);
    if (currentValue > 2) {
        playerCountInput.value = currentValue - 1;
    }
});

increaseButton.addEventListener('click', () => {
    const currentValue = parseInt(playerCountInput.value);
    if (currentValue < 8) {
        playerCountInput.value = currentValue + 1;
    }
});

card.addEventListener('click', (e) => {
    e.preventDefault();
    showNextQuestion();
});

// Prevent text selection on mobile
document.addEventListener('selectstart', (e) => {
    e.preventDefault();
});

// Handle touch events for better mobile experience
let touchStart = null;
card.addEventListener('touchstart', (e) => {
    touchStart = e.timeStamp;
});

card.addEventListener('touchend', (e) => {
    const touchDuration = e.timeStamp - touchStart;
    if (touchDuration < 500) { // Quick tap
        e.preventDefault();
        showNextQuestion();
    }
});

// Prevent zoom on double tap
let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
    const now = new Date().getTime();
    if (now - lastTouchEnd <= 300) {
        e.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// Initialize
initGame();