document.addEventListener('DOMContentLoaded', function() {
    // Text size adjustment
    const increaseBtn = document.getElementById('increase-text');
    const decreaseBtn = document.getElementById('decrease-text');
    let currentSize = 18; // Base font size in pixels
    
    if (increaseBtn && decreaseBtn) {
        increaseBtn.addEventListener('click', function() {
            currentSize += 2;
            document.documentElement.style.fontSize = currentSize + 'px';
            localStorage.setItem('fontSize', currentSize);
        });
        
        decreaseBtn.addEventListener('click', function() {
            if (currentSize > 16) {
                currentSize -= 2;
                document.documentElement.style.fontSize = currentSize + 'px';
                localStorage.setItem('fontSize', currentSize);
            }
        });
        
        // Load saved font size if available
        const savedSize = localStorage.getItem('fontSize');
        if (savedSize) {
            currentSize = parseInt(savedSize);
            document.documentElement.style.fontSize = currentSize + 'px';
        }
    }
    
    // Question form handling
    const questionForm = document.getElementById('question-form');
    const responseContainer = document.getElementById('response-container');
    
    if (questionForm) {
        questionForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const questionInput = document.getElementById('question-input');
            const question = questionInput.value.trim();
            
            if (!question) {
                return;
            }
            
            // Show loading state
            if (!responseContainer) {
                const mainElement = document.querySelector('main');
                const askSection = document.querySelector('.ask-section');
                
                const newResponseContainer = document.createElement('section');
                newResponseContainer.id = 'response-container';
                newResponseContainer.className = 'response-section';
                newResponseContainer.innerHTML = `
                    <div class="container">
                        <h2>Finding Your Answer...</h2>
                        <div class="loading-indicator">
                            <div class="loading-spinner"></div>
                            <p>Please wait while I find information for you.</p>
                        </div>
                    </div>
                `;
                
                mainElement.insertBefore(newResponseContainer, askSection.nextSibling);
            } else {
                responseContainer.innerHTML = `
                    <div class="container">
                        <h2>Finding Your Answer...</h2>
                        <div class="loading-indicator">
                            <div class="loading-spinner"></div>
                            <p>Please wait while I find information for you.</p>
                        </div>
                    </div>
                `;
            }
            
            try {
                // Call the serverless API function
                const response = await fetch('/api/ask', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ question }),
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    // Format the answer with paragraphs
                    const formattedAnswer = data.answer.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>');
                    
                    // Display the response
                    const updatedResponseContainer = document.getElementById('response-container');
                    updatedResponseContainer.innerHTML = `
                        <div class="container">
                            <h2>Your Answer</h2>
                            <div class="question-asked">
                                <strong>You asked:</strong> ${question}
                            </div>
                            <div class="answer-content">
                                <p>${formattedAnswer}</p>
                            </div>
                            <div class="answer-sources">
                                <p><strong>Sources:</strong> ${data.sources}</p>
                            </div>
                            <div class="feedback-buttons">
                                <button class="feedback-helpful">This Was Helpful</button>
                                <button class="feedback-not-helpful">This Was Not Helpful</button>
                            </div>
                        </div>
                    `;
                    
                    // Add event listeners for feedback buttons
                    const helpfulBtn = updatedResponseContainer.querySelector('.feedback-helpful');
                    const notHelpfulBtn = updatedResponseContainer.querySelector('.feedback-not-helpful');
                    
                    helpfulBtn.addEventListener('click', function() {
                        alert('Thank you for your feedback! We\'re glad this was helpful.');
                        helpfulBtn.disabled = true;
                        notHelpfulBtn.disabled = true;
                    });
                    
                    notHelpfulBtn.addEventListener('click', function() {
                        alert('We appreciate your feedback. We\'ll work to improve our answers.');
                        helpfulBtn.disabled = true;
                        notHelpfulBtn.disabled = true;
                    });
                } else {
                    // Handle error
                    const updatedResponseContainer = document.getElementById('response-container');
                    updatedResponseContainer.innerHTML = `
                        <div class="container">
                            <h2>Sorry, There Was a Problem</h2>
                            <p>We couldn't get an answer for your question right now. Please try again later.</p>
                            <p>Error: ${data.error || 'Unknown error'}</p>
                        </div>
                    `;
                }
            } catch (error) {
                console.error('Error:', error);
                const updatedResponseContainer = document.getElementById('response-container');
                updatedResponseContainer.innerHTML = `
                    <div class="container">
                        <h2>Sorry, There Was a Problem</h2>
                        <p>We couldn't get an answer for your question right now. Please try again later.</p>
                        <p>Error: ${error.message || 'Unknown error'}</p>
                    </div>
                `;
            }
        });
    }
    
    // Voice input functionality
    const voiceInputBtn = document.getElementById('voice-input');
    
    if (voiceInputBtn && 'webkitSpeechRecognition' in window) {
        const recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        voiceInputBtn.addEventListener('click', function() {
            recognition.start();
            voiceInputBtn.textContent = '🎤 Listening...';
            voiceInputBtn.classList.add('listening');
        });
        
        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            const questionInput = document.getElementById('question-input');
            questionInput.value = transcript;
            voiceInputBtn.textContent = '🎤 Use Voice Instead';
            voiceInputBtn.classList.remove('listening');
        };
        
        recognition.onerror = function() {
            voiceInputBtn.textContent = '🎤 Use Voice Instead';
            voiceInputBtn.classList.remove('listening');
            alert('Sorry, there was an error with voice recognition. Please try again or type your question.');
        };
        
        recognition.onend = function() {
            voiceInputBtn.textContent = '🎤 Use Voice Instead';
            voiceInputBtn.classList.remove('listening');
        };
    } else if (voiceInputBtn) {
        voiceInputBtn.style.display = 'none';
    }
});
