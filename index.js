// Game state
let currentNameData = null;
let askedGender = null;
let score = 0;
let currentRound = 1;
const totalRounds = 10;

// DOM elements
const nameInput = document.getElementById('nameInput');
const searchBtn = document.getElementById('searchBtn');
const questionContainer = document.getElementById('questionContainer');
const questionText = document.getElementById('questionText');
const submitBtn = document.getElementById('submitBtn');
const scoreDisplay = document.getElementById('scoreDisplay');
const scoreValue = document.getElementById('scoreValue');
const roundValue = document.getElementById('roundValue');

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

// Display question to user
function displayQuestion(nameData) {
    // Randomly choose to ask about male or female
    askedGender = Math.random() < 0.5 ? 'male' : 'female';
    
    // Display question
    questionText.textContent = `What is the probability that ${nameData.name} is ${askedGender}?`;
    
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
        'A': { min: 0, max: 20 },
        'B': { min: 20, max: 55 },
        'C': { min: 55, max: 80 },
        'D': { min: 80, max: 100 }
    };
    
    const selectedRange = ranges[selectedOption];
    
    // Check if actual probability falls within the selected range
    const isCorrect = actualProbability >= selectedRange.min && actualProbability <= selectedRange.max;
    
    return { isCorrect, actualProbability };
}

// Handle search button click
searchBtn.addEventListener('click', async () => {
    const name = nameInput.value.trim();
    
    if (!name) {
        alert('Please enter a name');
        return;
    }
    
    // Fetch data from API
    currentNameData = await fetchNameData(name);
    
    if (currentNameData) {
        console.log('Name data:', currentNameData);
        
        // Clear the input
        nameInput.value = '';
        
        // Display question to user
        displayQuestion(currentNameData);
    }
});

// Handle submit button click
submitBtn.addEventListener('click', () => {
    // Get selected option
    const selectedOption = document.querySelector('input[name="probability"]:checked');
    
    if (!selectedOption) {
        alert('Please select an option');
        return;
    }
    
    // Check if answer is correct
    const { isCorrect, actualProbability } = checkAnswer(selectedOption.value);
    
    // Update score if correct
    if (isCorrect) {
        score++;
    }
    
    // Check if game is over
    if (currentRound === totalRounds) {
        alert(`${isCorrect ? 'Correct!' : 'Incorrect!'} Game Over! Your final score is ${score}/${totalRounds}`);
        
        // Reset radio buttons at game end
        const radioButtons = document.querySelectorAll('input[name="probability"]');
        radioButtons.forEach(radio => radio.checked = false);
        
        // Hide question container
        questionContainer.style.display = 'none';
        
        // TODO: Show recipes based on score
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