const questions = [
    // Easy/Playful Questions
    { type: 'personal', difficulty: 'easy', text: 'If your life was a book, what would the current chapter be titled?' },
    { type: 'worldview', difficulty: 'easy', text: 'Do you think animals have philosophical thoughts?' },
    { type: 'personal', difficulty: 'easy', text: 'What simple pleasure makes you feel most alive?' },
    { type: 'worldview', difficulty: 'easy', text: 'Is a hot dog a sandwich? Defend your position philosophically.' },
    { type: 'personal', difficulty: 'easy', text: 'If you could have dinner with any philosopher, who would it be and what would you order?' },
    { type: 'worldview', difficulty: 'easy', text: 'Do you think colors look the same to everyone?' },
    { type: 'personal', difficulty: 'easy', text: 'What everyday object best represents your approach to life?' },
    { type: 'worldview', difficulty: 'easy', text: 'Can something be both completely true and completely false?' },
    { type: 'personal', difficulty: 'easy', text: 'What childhood belief do you secretly still hold?' },
    { type: 'worldview', difficulty: 'easy', text: 'Is cereal soup? Make your philosophical case.' },
    { type: 'personal', difficulty: 'easy', text: 'If your mind was a room, what would it look like?' },
    { type: 'worldview', difficulty: 'easy', text: 'Do you think plants can be happy?' },
    { type: 'personal', difficulty: 'easy', text: 'What rule do you love to break?' },
    { type: 'worldview', difficulty: 'easy', text: 'Is the present moment all that exists, or is time real?' },
    { type: 'personal', difficulty: 'easy', text: 'What makes you feel most like yourself?' },
    { type: 'worldview', difficulty: 'easy', text: 'If you could rename "philosophy," what would you call it?' },
    { type: 'personal', difficulty: 'easy', text: 'What question would you ask your future self?' },
    { type: 'worldview', difficulty: 'easy', text: 'Is boredom a philosophical state of mind?' },
    { type: 'personal', difficulty: 'easy', text: 'What ordinary moment recently felt extraordinary?' },
    { type: 'worldview', difficulty: 'easy', text: 'Do dreams count as experiences?' },
    { type: 'personal', difficulty: 'easy', text: 'If you were a philosophical concept, which would you be?' },
    { type: 'worldview', difficulty: 'easy', text: 'Can you think of a thought that has never been thought before?' },
    { type: 'personal', difficulty: 'easy', text: 'What habit reveals the most about your worldview?' },
    { type: 'worldview', difficulty: 'easy', text: 'Is doing nothing actually doing something?' },
    { type: 'personal', difficulty: 'easy', text: 'What would your philosophy of breakfast be?' },
    { type: 'worldview', difficulty: 'easy', text: 'Are coincidences meaningful or meaningless?' },
    { type: 'personal', difficulty: 'easy', text: 'What small rebellion brings you joy?' },
    { type: 'worldview', difficulty: 'easy', text: 'If aliens exist, what philosophical question would you ask them?' },
    { type: 'personal', difficulty: 'easy', text: 'What makes a day worth remembering?' },
    { type: 'worldview', difficulty: 'easy', text: 'Is forgetting things a bug or a feature of consciousness?' },
    { type: 'personal', difficulty: 'easy', text: 'What invisible thing do you believe in most strongly?' },
    { type: 'worldview', difficulty: 'easy', text: 'Can opposites both be true at the same time?' },
    { type: 'personal', difficulty: 'easy', text: 'What do you pretend to understand but really don\'t?' },
    { type: 'worldview', difficulty: 'easy', text: 'Is humor a way of understanding truth?' },
    
    // Medium Questions
    { type: 'personal', difficulty: 'medium', text: 'What belief have you changed your mind about in the last year?' },
    { type: 'worldview', difficulty: 'medium', text: 'Is free will an illusion or do we truly make choices?' },
    { type: 'personal', difficulty: 'medium', text: 'How do you know when you\'re being authentic versus performing a version of yourself?' },
    { type: 'worldview', difficulty: 'medium', text: 'If a tree falls in a forest and no one hears it, does it make a sound? What does this really ask?' },
    { type: 'personal', difficulty: 'medium', text: 'What paradox best describes your life philosophy?' },
    { type: 'worldview', difficulty: 'medium', text: 'Is mathematics discovered or invented?' },
    { type: 'personal', difficulty: 'medium', text: 'When do you feel most connected to something greater than yourself?' },
    { type: 'worldview', difficulty: 'medium', text: 'Can artificial intelligence ever truly understand consciousness?' },
    { type: 'personal', difficulty: 'medium', text: 'What question do you keep asking yourself but haven\'t found an answer to?' },
    { type: 'worldview', difficulty: 'medium', text: 'Is reality fundamentally physical, mental, or something else?' },
    { type: 'personal', difficulty: 'medium', text: 'How has failure shaped your understanding of success?' },
    { type: 'worldview', difficulty: 'medium', text: 'Does language shape thought or does thought shape language?' },
    { type: 'personal', difficulty: 'medium', text: 'What part of your personality do you think is truly "you" versus learned behavior?' },
    { type: 'worldview', difficulty: 'medium', text: 'Is consciousness binary (on/off) or does it exist on a spectrum?' },
    { type: 'personal', difficulty: 'medium', text: 'How do you distinguish between intuition and bias?' },
    { type: 'worldview', difficulty: 'medium', text: 'Can something be valuable even if no one values it?' },
    { type: 'personal', difficulty: 'medium', text: 'What illusion about yourself have you had to let go of?' },
    { type: 'worldview', difficulty: 'medium', text: 'Is the universe fundamentally chaotic or ordered?' },
    { type: 'personal', difficulty: 'medium', text: 'How do you decide which version of yourself to be in different situations?' },
    { type: 'worldview', difficulty: 'medium', text: 'Does the past still exist somewhere?' },
    { type: 'personal', difficulty: 'medium', text: 'What contradiction do you live with comfortably?' },
    { type: 'worldview', difficulty: 'medium', text: 'Is objectivity possible or is everything subjective?' },
    { type: 'personal', difficulty: 'medium', text: 'How has your relationship with uncertainty evolved?' },
    { type: 'worldview', difficulty: 'medium', text: 'Can we ever truly know another person\'s experience?' },
    { type: 'personal', difficulty: 'medium', text: 'What assumption about life have you never questioned until now?' },
    { type: 'worldview', difficulty: 'medium', text: 'Is personal identity continuous or do we become new people over time?' },
    { type: 'personal', difficulty: 'medium', text: 'What role does self-deception play in your happiness?' },
    { type: 'worldview', difficulty: 'medium', text: 'Are emotions forms of knowledge or obstacles to it?' },
    { type: 'personal', difficulty: 'medium', text: 'How do you balance accepting yourself with wanting to change?' },
    { type: 'worldview', difficulty: 'medium', text: 'Is there a difference between existing and living?' },
    { type: 'personal', difficulty: 'medium', text: 'What story do you tell yourself that might not be true?' },
    { type: 'worldview', difficulty: 'medium', text: 'Can meaning exist without consciousness to perceive it?' },
    { type: 'personal', difficulty: 'medium', text: 'How do you know when a belief is truly yours?' },
    { type: 'worldview', difficulty: 'medium', text: 'Is suffering necessary for growth or just something we tell ourselves?' },
    
    // Hard/Deep Questions
    { type: 'personal', difficulty: 'hard', text: 'What part of your identity would you be willing to lose, and what part could you never give up?' },
    { type: 'worldview', difficulty: 'hard', text: 'If consciousness is just brain activity, what makes you "you" from moment to moment?' },
    { type: 'personal', difficulty: 'hard', text: 'How do you reconcile your desire for meaning with the possibility that life might be meaningless?' },
    { type: 'worldview', difficulty: 'hard', text: 'Is there a difference between something being true and something being useful to believe?' },
    { type: 'personal', difficulty: 'hard', text: 'What suffering in your life has shaped your philosophy the most?' },
    { type: 'worldview', difficulty: 'hard', text: 'If we could eliminate all suffering, should we? What would we lose?' },
    { type: 'personal', difficulty: 'hard', text: 'What truth about yourself do you avoid confronting?' },
    { type: 'worldview', difficulty: 'hard', text: 'Is the self an illusion, and if so, who is experiencing the illusion?' },
    { type: 'personal', difficulty: 'hard', text: 'How has your relationship with death shaped how you live?' },
    { type: 'worldview', difficulty: 'hard', text: 'Can something be morally right even if everyone believes it\'s wrong?' },
    { type: 'personal', difficulty: 'hard', text: 'What would you need to believe differently to become the person you want to be?' },
    { type: 'worldview', difficulty: 'hard', text: 'If you could know the absolute truth about one thing, what would you choose and why?' },
    { type: 'personal', difficulty: 'hard', text: 'What part of your suffering have you become attached to?' },
    { type: 'worldview', difficulty: 'hard', text: 'Is there anything that exists beyond human perception and conception?' },
    { type: 'personal', difficulty: 'hard', text: 'How do you live with the knowledge that everyone you love will die?' },
    { type: 'worldview', difficulty: 'hard', text: 'Does absolute truth exist, or is all truth relative to perspective?' },
    { type: 'personal', difficulty: 'hard', text: 'What would remain of "you" if you lost all your memories?' },
    { type: 'worldview', difficulty: 'hard', text: 'Is consciousness fundamental to the universe or an emergent property?' },
    { type: 'personal', difficulty: 'hard', text: 'What fear has shaped your entire worldview?' },
    { type: 'worldview', difficulty: 'hard', text: 'Can we have moral obligations to possible future people?' },
    { type: 'personal', difficulty: 'hard', text: 'How much of your life is genuinely chosen versus determined by circumstances?' },
    { type: 'worldview', difficulty: 'hard', text: 'Is there a difference between being dead and never having existed?' },
    { type: 'personal', difficulty: 'hard', text: 'What would you sacrifice your happiness for?' },
    { type: 'worldview', difficulty: 'hard', text: 'If reality is a simulation, does that change its value or meaning?' },
    { type: 'personal', difficulty: 'hard', text: 'What truth would destroy your current way of living if you fully accepted it?' },
    { type: 'worldview', difficulty: 'hard', text: 'Is the desire to be remembered a form of denying death?' },
    { type: 'personal', difficulty: 'hard', text: 'How do you find meaning in a universe that doesn\'t care about you?' },
    { type: 'worldview', difficulty: 'hard', text: 'Can something be sacred in a purely material universe?' },
    { type: 'personal', difficulty: 'hard', text: 'What have you had to destroy in yourself to survive?' },
    { type: 'worldview', difficulty: 'hard', text: 'Is love a truth about the universe or a human invention?' },
    { type: 'personal', difficulty: 'hard', text: 'What would you be willing to forget to be happy?' },
    { type: 'worldview', difficulty: 'hard', text: 'Does the universe have obligations to conscious beings?' },
    { type: 'personal', difficulty: 'hard', text: 'How do you cope with the vastness of what you\'ll never know?' },
    { type: 'worldview', difficulty: 'hard', text: 'Is there a moral difference between action and inaction?' }
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