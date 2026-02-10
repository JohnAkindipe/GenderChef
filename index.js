// Game state
let currentNameData = null;
let askedGender = null;
let score = 0;
let currentRound = 1;
const totalRounds = 10;
let usedNames = new Set(); // Track names used in current game session

const SPOONACULAR_API_KEY = 'd0552c86319a42a784bfd064c5b485dd';

// DOM elements
const nameInput = document.getElementById('nameInput');
const searchBtn = document.getElementById('searchBtn');
const questionContainer = document.getElementById('questionContainer');
const questionText = document.getElementById('questionText');
const submitBtn = document.getElementById('submitBtn');
const scoreDisplay = document.getElementById('scoreDisplay');
const scoreValue = document.getElementById('scoreValue');
const roundValue = document.getElementById('roundValue');
const gameOverContainer = document.getElementById('gameOverContainer');
const gameOverMessage = document.getElementById('gameOverMessage');
const playAgainBtn = document.getElementById('playAgainBtn');
const recipeDisplay = document.getElementById('recipeDisplay');
const recipeTitle = document.getElementById('recipeTitle');
const recipeImage = document.getElementById('recipeImage');
const recipeTime = document.getElementById('recipeTime');
const recipeLoader = document.getElementById('recipeLoader');
const recipeError = document.getElementById('recipeError');

// Fetch name data from Genderize API
async function fetchNameData(name) {
    try {
        const response = await fetch(`https://api.genderize.io/?name=${name}`);
        if (!response.ok) {
            throw new Error('Failed to fetch name data');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        alert('Failed to fetch name data. Please try again.');
        return null;
    }
}

// Fetch random recipe from Spoonacular API
async function fetchRandomRecipe() {
    try {
        const response = await fetch(`https://api.spoonacular.com/recipes/random?apiKey=${SPOONACULAR_API_KEY}&number=1`);
        if (!response.ok) {
            throw new Error('Failed to fetch recipe data');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Failed to fetch recipe:', error);
        return null;
    }
}

// Display question to user
function displayQuestion(nameData) {
    // Randomly choose to ask about male or female
    askedGender = Math.random() < 0.5 ? 'male' : 'female';
    
    let theName = nameData.name.charAt(0).toUpperCase() + nameData.name.slice(1);
    // Display question
    questionText.textContent = `What is the probability that ${theName} is ${askedGender}?`;
    
    // Show question container, score display, and submit button
    questionContainer.style.display = 'block';
    scoreDisplay.style.display = 'block';
    submitBtn.style.display = 'inline-block';
}

// Update score display
function updateScoreDisplay() {
    scoreValue.textContent = score;
    roundValue.textContent = currentRound;
}

// Reset for next round
function prepareNextRound() {
    // Hide submit button
    submitBtn.style.display = 'none';
    
    // Clear radio button selection
    const radioButtons = document.querySelectorAll('input[name="probability"]');
    radioButtons.forEach(radio => radio.checked = false);
    
    // Reset state
    currentNameData = null;
    askedGender = null;
}

// Check if answer is correct
function checkAnswer(selectedOption) {
    // Calculate the actual probability for the asked gender
    let actualProbability;
    
    if (currentNameData.gender === askedGender) {
        // If the gender matches, use the probability as is
        actualProbability = currentNameData.probability * 100;
    } else {
        // If the gender doesn't match, use 1 - probability
        actualProbability = (1 - currentNameData.probability) * 100;
    }
    
    // Define the ranges for each option
    const ranges = {
        'A': { min: 0, max: 19 },
        'B': { min: 20, max: 39 },
        'C': { min: 40, max: 59 },
        'D': { min: 60, max: 79 },
        "E": { min: 80, max: 100 }
    };
    
    const selectedRange = ranges[selectedOption];
    
    // Check if actual probability falls within the selected range
    const isCorrect = actualProbability >= selectedRange.min && actualProbability <= selectedRange.max;
    
    return isCorrect
}
// Handle search button click
searchBtn.addEventListener('click', async () => {
    const name = nameInput.value.trim().toLowerCase();
    
    if (!name) {
        alert('Please enter a name');
        return;
    }
    
    // Check if name has already been used in this game session
    if (usedNames.has(name)) {
        alert('This name has already been used. Please enter a different name.');
        return;
    }
    
    // Fetch data from API
    currentNameData = await fetchNameData(name);
    
    if (currentNameData) {
        // Add name to used names
        usedNames.add(name);
        
        // Clear the input
        nameInput.value = '';
        
        // Display question to user
        displayQuestion(currentNameData);
    }
});

// Handle submit button click
submitBtn.addEventListener('click', async () => {
    // Get selected option
    const selectedOption = document.querySelector('input[name="probability"]:checked');
    
    if (!selectedOption) {
        alert('Please select an option');
        return;
    }
    
    // Check if answer is correct
    const isCorrect = checkAnswer(selectedOption.value);
    
    // Update score if correct
    if (isCorrect) {
        score++;
    }
    
    // Check if game is over
    if (currentRound === totalRounds) {
        // Update score one last time if correct
        updateScoreDisplay();
        
        // Reset radio buttons at game end
        const radioButtons = document.querySelectorAll('input[name="probability"]');
        radioButtons.forEach(radio => radio.checked = false);
        
        // Hide question container and search container
        questionContainer.style.display = 'none';
        document.querySelector('.search-container').style.display = 'none';
        
        // Display game over message based on score
        let message = '';
        if (score === 10) {
            message = 'Agba Chef, you deserve a buffet';
        } else if (score >= 6) {
            message = 'You cooked, take your meal!';
        } else {
            message = 'You got cooked! nothing for you';
        }
        
        gameOverMessage.textContent = message;
        gameOverContainer.style.display = 'block';
        
        // Fetch and display recipe only if score > 5
        if (score > 5) {
            // Show loader and hide play again button
            recipeLoader.style.display = 'block';
            playAgainBtn.style.display = 'none';
            
            const recipeData = await fetchRandomRecipe();
            
            // Hide loader
            recipeLoader.style.display = 'none';
            
            if (recipeData && recipeData.recipes && recipeData.recipes[0]) {
                // Success: Display recipe
                const recipe = recipeData.recipes[0];
                recipeTitle.textContent = `Shey o ma je ${recipe.title}`;
                recipeImage.src = recipe.image;
                recipeImage.alt = recipe.title;
                recipeTime.textContent = `It will be ready in ${recipe.readyInMinutes} minutes`;
                recipeDisplay.style.display = 'block';
            } else {
                // Error: Display error message
                recipeError.style.display = 'block';
            }
            
            // Show play again button after loading completes
            playAgainBtn.style.display = 'inline-block';
        }
        
        // Reset used names for new game
        usedNames.clear();
    } else {
        // Display result and tell user to enter next search
        alert(`${isCorrect ? 'Correct!' : 'Incorrect!'} Enter next search`);
        
        // Increment round
        currentRound++;
        updateScoreDisplay();
        
        // Prepare for next round
        prepareNextRound();
    }
});

// Handle play again button click
playAgainBtn.addEventListener('click', () => {
    // Reset game state
    score = 0;
    currentRound = 1;
    usedNames.clear();
    
    // Reset displays
    updateScoreDisplay();
    scoreDisplay.style.display = 'none';
    gameOverContainer.style.display = 'none';
    recipeDisplay.style.display = 'none';
    recipeLoader.style.display = 'none';
    recipeError.style.display = 'none';
    playAgainBtn.style.display = 'inline-block';
    document.querySelector('.search-container').style.display = 'flex';
    
    //Reset name input
    nameInput.value = '';
});