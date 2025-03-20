/**
 * Boomer Ask - Senior-friendly JavaScript
 * Implementing accessibility features and AI functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Text size adjustment functionality
    const increaseTextBtn = document.getElementById('increase-text');
    const decreaseTextBtn = document.getElementById('decrease-text');
    
    if (increaseTextBtn && decreaseTextBtn) {
        // Get the current font size from localStorage or use default
        let currentFontSize = localStorage.getItem('boomerAskFontSize') || 100;
        
        // Apply stored font size on page load
        document.documentElement.style.fontSize = `${currentFontSize}%`;
        
        // Increase text size
        increaseTextBtn.addEventListener('click', function() {
            if (currentFontSize < 150) { // Maximum 150% of original size
                currentFontSize = parseInt(currentFontSize) + 10;
                document.documentElement.style.fontSize = `${currentFontSize}%`;
                localStorage.setItem('boomerAskFontSize', currentFontSize);
                announceTextSizeChange(currentFontSize);
            }
        });
        
        // Decrease text size
        decreaseTextBtn.addEventListener('click', function() {
            if (currentFontSize > 80) { // Minimum 80% of original size
                currentFontSize = parseInt(currentFontSize) - 10;
                document.documentElement.style.fontSize = `${currentFontSize}%`;
                localStorage.setItem('boomerAskFontSize', currentFontSize);
                announceTextSizeChange(currentFontSize);
            }
        });
    }
    
    // Voice input functionality
    const voiceInputBtn = document.getElementById('voice-input');
    const questionInput = document.getElementById('question-input');
    
    if (voiceInputBtn && questionInput) {
        voiceInputBtn.addEventListener('click', function() {
            // Check if browser supports speech recognition
            if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                const recognition = new SpeechRecognition();
                
                recognition.lang = 'en-US';
                recognition.interimResults = false;
                recognition.maxAlternatives = 1;
                
                // Change button text to indicate recording
                voiceInputBtn.innerHTML = '<span class="button-icon">🔴</span> Listening...';
                voiceInputBtn.classList.add('recording');
                
                recognition.start();
                
                recognition.onresult = function(event) {
                    const speechResult = event.results[0][0].transcript;
                    questionInput.value = speechResult;
                    
                    // Reset button text
                    voiceInputBtn.innerHTML = '<span class="button-icon">🎤</span> Use Voice Instead';
                    voiceInputBtn.classList.remove('recording');
                    
                    // Announce the recognized text
                    announceMessage(`Recognized: ${speechResult}`);
                };
                
                recognition.onerror = function(event) {
                    console.error('Speech recognition error', event.error);
                    
                    // Reset button text
                    voiceInputBtn.innerHTML = '<span class="button-icon">🎤</span> Use Voice Instead';
                    voiceInputBtn.classList.remove('recording');
                    
                    // Announce the error
                    announceMessage('Sorry, there was a problem with voice recognition. Please try again.');
                };
                
                recognition.onend = function() {
                    // Reset button text if it hasn't been reset already
                    if (voiceInputBtn.classList.contains('recording')) {
                        voiceInputBtn.innerHTML = '<span class="button-icon">🎤</span> Use Voice Instead';
                        voiceInputBtn.classList.remove('recording');
                    }
                };
            } else {
                // Browser doesn't support speech recognition
                alert('Sorry, your browser does not support voice input. Please try using a different browser like Chrome.');
            }
        });
    }
    
    // Question form submission
    const questionForm = document.getElementById('question-form');
    
    if (questionForm) {
        questionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const question = questionInput.value.trim();
            
            if (question) {
                // In a real implementation, this would send the question to an AI API
                // For now, we'll simulate a response
                simulateAIResponse(question);
            } else {
                announceMessage('Please enter a question first.');
            }
        });
    }
    
    // Create an accessible announcement area for screen readers
    createAccessibilityAnnouncer();
});

// Function to create an accessibility announcer for screen readers
function createAccessibilityAnnouncer() {
    if (!document.getElementById('accessibility-announcer')) {
        const announcer = document.createElement('div');
        announcer.id = 'accessibility-announcer';
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.classList.add('sr-only');
        document.body.appendChild(announcer);
        
        // Add CSS for screen reader only class
        const style = document.createElement('style');
        style.textContent = `
            .sr-only {
                position: absolute;
                width: 1px;
                height: 1px;
                padding: 0;
                margin: -1px;
                overflow: hidden;
                clip: rect(0, 0, 0, 0);
                white-space: nowrap;
                border-width: 0;
            }
        `;
        document.head.appendChild(style);
    }
}

// Function to announce messages to screen readers
function announceMessage(message) {
    const announcer = document.getElementById('accessibility-announcer');
    if (announcer) {
        announcer.textContent = message;
    }
}

// Function to announce text size changes
function announceTextSizeChange(size) {
    announceMessage(`Text size changed to ${size} percent.`);
}

// Function to simulate AI response (placeholder for actual AI integration)
function simulateAIResponse(question) {
    // Create response container if it doesn't exist
    let responseContainer = document.querySelector('.response-container');
    
    if (!responseContainer) {
        responseContainer = document.createElement('div');
        responseContainer.className = 'response-container';
        
        const askSection = document.querySelector('.ask-section .container');
        if (askSection) {
            askSection.appendChild(responseContainer);
        }
    }
    
    // Show loading indicator
    responseContainer.innerHTML = `
        <div class="response-loading">
            <p>Thinking...</p>
            <div class="loading-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    
    // Add CSS for loading animation
    if (!document.getElementById('loading-animation-style')) {
        const style = document.createElement('style');
        style.id = 'loading-animation-style';
        style.textContent = `
            .response-container {
                margin-top: 2rem;
                padding: 1.5rem;
                background-color: #f5f5f5;
                border-radius: 8px;
                max-width: 800px;
                margin-left: auto;
                margin-right: auto;
            }
            
            .response-loading {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
            }
            
            .loading-dots {
                display: flex;
                gap: 8px;
            }
            
            .loading-dots span {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background-color: #0056b3;
                animation: loading 1.4s infinite ease-in-out both;
            }
            
            .loading-dots span:nth-child(1) {
                animation-delay: -0.32s;
            }
            
            .loading-dots span:nth-child(2) {
                animation-delay: -0.16s;
            }
            
            @keyframes loading {
                0%, 80%, 100% { 
                    transform: scale(0);
                } 40% { 
                    transform: scale(1.0);
                }
            }
            
            .ai-response {
                margin-top: 1rem;
            }
            
            .response-sources {
                margin-top: 1.5rem;
                padding-top: 1rem;
                border-top: 1px solid #cccccc;
            }
            
            .response-sources h4 {
                margin-bottom: 0.5rem;
            }
            
            .response-sources ul {
                padding-left: 1.5rem;
            }
            
            .response-feedback {
                margin-top: 1.5rem;
                display: flex;
                gap: 1rem;
                justify-content: center;
            }
            
            .feedback-button {
                padding: 0.5rem 1rem;
                border: 1px solid #cccccc;
                background-color: #ffffff;
                border-radius: 4px;
                cursor: pointer;
                transition: background-color 0.3s;
            }
            
            .feedback-button:hover {
                background-color: #f0f0f0;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Simulate delay for AI processing
    setTimeout(() => {
        // Generate a simple response based on the question
        let response, sources;
        
        if (question.toLowerCase().includes('video chat') || question.toLowerCase().includes('grandchildren')) {
            response = `
                <h3>How to Video Chat with Grandchildren</h3>
                <p>Video chatting with your grandchildren is a wonderful way to stay connected. Here's how you can do it:</p>
                <ol>
                    <li><strong>Choose a video chat app</strong> - Popular options include FaceTime (for Apple devices), Zoom, or Google Meet.</li>
                    <li><strong>Install the app</strong> on your device - You can download these apps from the App Store (iPhone/iPad) or Google Play Store (Android).</li>
                    <li><strong>Create an account</strong> if needed - Some apps require you to sign up with an email address.</li>
                    <li><strong>Ask your family for their contact information</strong> - You'll need their phone number or email depending on the app.</li>
                    <li><strong>Schedule a time</strong> to video chat that works for everyone.</li>
                    <li><strong>Start the call</strong> by opening the app and selecting their contact.</li>
                </ol>
                <p>If you need help setting up a specific app, I can provide more detailed instructions.</p>
            `;
            
            sources = `
                <ul>
                    <li>AARP: "How to Video Chat with Family" (2023)</li>
                    <li>National Institute on Aging: "Staying Connected with Technology" (2022)</li>
                    <li>Consumer Reports: "Best Video Chat Apps for Seniors" (2024)</li>
                </ul>
            `;
        } else if (question.toLowerCase().includes('medication') || question.toLowerCase().includes('pill')) {
            response = `
                <h3>Medication Management Tips</h3>
                <p>Keeping track of medications can be challenging. Here are some helpful strategies:</p>
                <ul>
                    <li><strong>Use a pill organizer</strong> - These containers have compartments for each day of the week and time of day.</li>
                    <li><strong>Set alarms</strong> on your phone or use a timer to remind you when to take medications.</li>
                    <li><strong>Create a medication list</strong> with names, dosages, and when to take each medication.</li>
                    <li><strong>Use a medication reminder app</strong> on your smartphone or tablet.</li>
                    <li><strong>Take medications at the same time</strong> each day to establish a routine.</li>
                    <li><strong>Ask your pharmacy</strong> about special packaging options that pre-sort your medications.</li>
                </ul>
                <p>Always consult with your doctor or pharmacist before changing how you take your medications.</p>
            `;
            
            sources = `
                <ul>
                    <li>Mayo Clinic: "Medication Management Tips" (2023)</li>
                    <li>National Council on Aging: "Medication Management for Older Adults" (2022)</li>
                    <li>FDA: "Safe Medication Use for Seniors" (2024)</li>
                </ul>
            `;
        } else {
            response = `
                <h3>Information About "${question}"</h3>
                <p>Thank you for your question. Here's what I can tell you about this topic:</p>
                <p>This is a simulated response for demonstration purposes. In the actual implementation, this would be replaced with a real AI-generated answer based on your specific question.</p>
                <p>The response would include relevant information, presented in a clear, easy-to-understand format with appropriate headings, bullet points, and explanations.</p>
                <p>If you have more questions or need clarification, feel free to ask a follow-up question.</p>
            `;
            
            sources = `
                <ul>
                    <li>This is a simulated response for demonstration purposes.</li>
                    <li>In the actual implementation, real sources would be cited here.</li>
                </ul>
            `;
        }
        
        // Display the response
        responseContainer.innerHTML = `
            <div class="ai-response">
                ${response}
            </div>
            <div class="response-sources">
                <h4>Sources:</h4>
                ${sources}
            </div>
            <div class="response-feedback">
                <button class="feedback-button" onclick="provideFeedback('helpful')">
                    <span role="img" aria-label="Thumbs up">👍</span> This was helpful
                </button>
                <button class="feedback-button" onclick="provideFeedback('not-helpful')">
                    <span role="img" aria-label="Thumbs down">👎</span> This wasn't helpful
                </button>
            </div>
        `;
        
        // Announce to screen readers that a response is available
        announceMessage('Answer ready. A response to your question has been provided.');
        
        // Scroll to the response
        responseContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 2000);
}

// Function to handle feedback (placeholder)
function provideFeedback(type) {
    // In a real implementation, this would send feedback to a server
    const message = type === 'helpful' ? 
        'Thank you for your feedback! We\'re glad this was helpful.' : 
        'Thank you for your feedback. We\'ll work to improve our answers.';
    
    alert(message);
    
    // Announce feedback submission to screen readers
    announceMessage(message);
}
