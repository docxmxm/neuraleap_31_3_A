// AI Chatbot for NeuralLeap
// This JavaScript file implements an AI-powered chatbot that assists users with course recommendations,
// answering questions about the platform, and providing support.

class AIAssistantChatbot {
    constructor() {
        // Initialize chatbot elements
        this.chatbotIcon = document.getElementById('chatbot-icon');
        this.chatbotContainer = document.getElementById('chatbot-container');
        this.chatbotMessages = document.getElementById('chatbot-messages');
        this.chatbotInput = document.getElementById('chatbot-input');
        this.chatbotSend = document.getElementById('chatbot-send');
        this.chatbotClose = document.getElementById('chatbot-close');

        // Chatbot state
        this.isOpen = false;
        this.isTyping = false;
        this.conversationHistory = [];
        this.suggestedResponses = [
            { text: "Tell me about your courses", action: "showCourses" },
            { text: "How do I enroll?", action: "enrollmentProcess" },
            { text: "AI safety importance", action: "aiSafety" }
        ];

        // Custom course recommendations based on user interests
        this.courseRecommendations = {
            beginner: ["LLM Fundamentals", "Introduction to AI Safety", "Python for AI"],
            intermediate: ["Advanced AI Safety", "Prompt Engineering Mastery", "Fine-tuning Language Models"],
            advanced: ["Neural Network Optimization", "AI Alignment Theory", "Advanced Research Methods in AI"]
        };

        // Initialize chatbot if elements exist
        if (this.chatbotIcon) {
            this.initChatbot();
        } else {
            this.createChatbotElements();
        }
    }

    // Create and append chatbot elements to the DOM
    createChatbotElements() {
        // Create chatbot icon
        this.chatbotIcon = document.createElement('div');
        this.chatbotIcon.id = 'chatbot-icon';
        this.chatbotIcon.innerHTML = `
      <div class="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full h-14 w-14 flex items-center justify-center shadow-lg hover:shadow-xl transition-all cursor-pointer fixed right-6 bottom-6 z-50">
        <svg class="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
        </svg>
      </div>
    `;

        // Create chatbot container
        this.chatbotContainer = document.createElement('div');
        this.chatbotContainer.id = 'chatbot-container';
        this.chatbotContainer.classList.add('hidden');
        this.chatbotContainer.innerHTML = `
      <div class="fixed right-6 bottom-24 w-full max-w-sm z-50 transition-all transform scale-95 opacity-0" id="chatbot-box">
        <div class="bg-dark-bg border border-gray-800 rounded-xl shadow-2xl flex flex-col h-96 overflow-hidden">
          <!-- Chatbot Header -->
          <div class="bg-gradient-to-r from-blue-900 to-blue-800 p-4 border-b border-gray-800 flex justify-between items-center">
            <div class="flex items-center">
              <div class="relative h-8 w-8 flex items-center justify-center mr-3">
                <div class="absolute inset-0 bg-cyan-500 opacity-20 rounded-full filter blur-sm"></div>
                <div class="relative z-10 text-cyan-400 font-bold text-lg">N</div>
              </div>
              <span class="text-white font-medium">NeuralLeap Assistant</span>
            </div>
            <button id="chatbot-close" class="text-gray-300 hover:text-white transition-colors">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <!-- Chatbot Messages -->
          <div id="chatbot-messages" class="flex-1 overflow-y-auto p-4 space-y-4"></div>
          
          <!-- Chatbot Input -->
          <div class="p-4 border-t border-gray-800">
            <div class="flex items-center">
              <input id="chatbot-input" type="text" placeholder="Ask me anything..." class="flex-1 bg-dark-card border border-gray-800 rounded-l-lg px-4 py-2 text-gray-300 focus:outline-none focus:border-cyan-400">
              <button id="chatbot-send" class="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-r-lg">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

        // Append elements to body
        document.body.appendChild(this.chatbotIcon);
        document.body.appendChild(this.chatbotContainer);

        // Get references to the newly created elements
        this.chatbotMessages = document.getElementById('chatbot-messages');
        this.chatbotInput = document.getElementById('chatbot-input');
        this.chatbotSend = document.getElementById('chatbot-send');
        this.chatbotClose = document.getElementById('chatbot-close');

        // Initialize the chatbot
        this.initChatbot();
    }

    // Initialize chatbot event listeners
    initChatbot() {
        // Toggle chatbot visibility when icon is clicked
        this.chatbotIcon.addEventListener('click', () => {
            this.toggleChatbot();
        });

        // Close chatbot when close button is clicked
        this.chatbotClose.addEventListener('click', () => {
            this.toggleChatbot(false);
        });

        // Send message when send button is clicked
        this.chatbotSend.addEventListener('click', () => {
            this.sendMessage();
        });

        // Send message when Enter key is pressed
        this.chatbotInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        // Handle clicks on suggested responses
        this.chatbotMessages.addEventListener('click', (e) => {
            const suggestionBtn = e.target.closest('.suggestion-btn');
            if (suggestionBtn) {
                const action = suggestionBtn.getAttribute('data-action');
                const text = suggestionBtn.textContent;
                this.handleSuggestionClick(text, action);
            }
        });

        // Add CSS styles for chatbot animations and transitions
        this.addChatbotStyles();
    }

    // Add custom CSS for the chatbot
    addChatbotStyles() {
        const styleEl = document.createElement('style');
        styleEl.textContent = `
      /* Chatbot animations */
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
      
      #chatbot-icon {
        animation: pulse 2s infinite;
      }
      
      #chatbot-box {
        transition: all 0.3s ease-out;
      }
      
      #chatbot-box.visible {
        transform: scale(1);
        opacity: 1;
      }
      
      .bot-message, .user-message {
        max-width: 80%;
        animation: message-fade-in 0.3s ease-out;
      }
      
      @keyframes message-fade-in {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      .typing-indicator {
        display: flex;
        align-items: center;
        padding: 8px 12px;
        background-color: #1a1a2e;
        border-radius: 12px;
        max-width: 80%;
      }
      
      .typing-dot {
        width: 8px;
        height: 8px;
        background-color: #06b6d4;
        border-radius: 50%;
        margin-right: 4px;
        animation: typing-dot 1.4s infinite ease-in-out;
      }
      
      .typing-dot:nth-child(1) { animation-delay: 0s; }
      .typing-dot:nth-child(2) { animation-delay: 0.2s; }
      .typing-dot:nth-child(3) { animation-delay: 0.4s; }
      
      @keyframes typing-dot {
        0%, 60%, 100% { transform: translateY(0); }
        30% { transform: translateY(-5px); }
      }
      
      .suggestion-btn {
        transition: all 0.2s ease;
      }
      
      .suggestion-btn:hover {
        transform: translateY(-2px);
      }
    `;
        document.head.appendChild(styleEl);
    }

    // Toggle chatbot visibility
    toggleChatbot(forceState) {
        this.isOpen = forceState !== undefined ? forceState : !this.isOpen;

        const chatbotBox = document.getElementById('chatbot-box');

        if (this.isOpen) {
            this.chatbotContainer.classList.remove('hidden');

            // Use setTimeout to ensure the transition works properly
            setTimeout(() => {
                chatbotBox.classList.add('visible');
            }, 10);

            // Send welcome message if it's the first time opening
            if (this.conversationHistory.length === 0) {
                this.sendBotMessage("Hello! I'm the NeuralLeap Assistant. How can I help you today?", true);
                this.showSuggestedResponses();
            }

            // Focus the input field
            this.chatbotInput.focus();
        } else {
            chatbotBox.classList.remove('visible');

            // Hide the container after transition completes
            setTimeout(() => {
                this.chatbotContainer.classList.add('hidden');
            }, 300);
        }
    }

    // Send a message from the user
    sendMessage() {
        const message = this.chatbotInput.value.trim();
        if (!message) return;

        // Add user message to the chat
        this.addUserMessage(message);

        // Clear input field
        this.chatbotInput.value = '';

        // Process the message and generate a response
        this.processMessage(message);
    }

    // Add a user message to the chat
    addUserMessage(message) {
        const userMessageEl = document.createElement('div');
        userMessageEl.className = 'flex justify-end';
        userMessageEl.innerHTML = `
      <div class="user-message bg-blue-800 text-white py-2 px-4 rounded-lg rounded-tr-none">
        ${this.escapeHTML(message)}
      </div>
    `;

        this.chatbotMessages.appendChild(userMessageEl);
        this.scrollToBottom();

        // Add to conversation history
        this.conversationHistory.push({
            role: 'user',
            message: message
        });
    }

    // Send a message from the bot
    sendBotMessage(message, withSuggestions = false) {
        // Show typing indicator
        this.showTypingIndicator();

        // Simulate typing delay (variable based on message length)
        const typingDelay = Math.min(1000, 500 + message.length * 10);

        setTimeout(() => {
            // Remove typing indicator
            this.hideTypingIndicator();

            // Add bot message
            const botMessageEl = document.createElement('div');
            botMessageEl.className = 'flex';
            botMessageEl.innerHTML = `
        <div class="bot-message bg-dark-card text-white py-2 px-4 rounded-lg rounded-tl-none">
          ${this.formatMessage(message)}
        </div>
      `;

            this.chatbotMessages.appendChild(botMessageEl);

            // Show suggested responses if needed
            if (withSuggestions) {
                this.showSuggestedResponses();
            }

            this.scrollToBottom();

            // Add to conversation history
            this.conversationHistory.push({
                role: 'assistant',
                message: message
            });
        }, typingDelay);
    }

    // Show typing indicator
    showTypingIndicator() {
        if (this.isTyping) return;

        this.isTyping = true;

        const typingIndicator = document.createElement('div');
        typingIndicator.id = 'typing-indicator';
        typingIndicator.className = 'flex';
        typingIndicator.innerHTML = `
      <div class="typing-indicator">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    `;

        this.chatbotMessages.appendChild(typingIndicator);
        this.scrollToBottom();
    }

    // Hide typing indicator
    hideTypingIndicator() {
        if (!this.isTyping) return;

        this.isTyping = false;

        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    // Show suggested responses
    showSuggestedResponses() {
        const suggestionsEl = document.createElement('div');
        suggestionsEl.className = 'flex flex-wrap gap-2 mt-3';

        // Create buttons for each suggested response
        this.suggestedResponses.forEach(suggestion => {
            const suggestionBtn = document.createElement('button');
            suggestionBtn.className = 'suggestion-btn bg-blue-900 hover:bg-blue-800 text-white text-sm py-1 px-3 rounded-full transition-colors';
            suggestionBtn.textContent = suggestion.text;
            suggestionBtn.setAttribute('data-action', suggestion.action);

            suggestionsEl.appendChild(suggestionBtn);
        });

        this.chatbotMessages.appendChild(suggestionsEl);
        this.scrollToBottom();
    }

    // Handle suggested response click
    handleSuggestionClick(text, action) {
        // Add the clicked suggestion as a user message
        this.addUserMessage(text);

        // Process the action
        switch (action) {
            case 'showCourses':
                this.showCoursesInfo();
                break;
            case 'enrollmentProcess':
                this.showEnrollmentProcess();
                break;
            case 'aiSafety':
                this.showAISafetyInfo();
                break;
            default:
                this.processMessage(text);
        }
    }

    // Process user message and generate a response
    processMessage(message) {
        // Convert to lowercase for easier matching
        const lowercaseMsg = message.toLowerCase();

        // Define keywords and their corresponding handlers
        const keywords = {
            course: () => this.showCoursesInfo(),
            enroll: () => this.showEnrollmentProcess(),
            register: () => this.showEnrollmentProcess(),
            sign: () => this.showEnrollmentProcess(),
            cost: () => this.showPricingInfo(),
            price: () => this.showPricingInfo(),
            safety: () => this.showAISafetyInfo(),
            beginner: () => this.recommendCourses('beginner'),
            start: () => this.recommendCourses('beginner'),
            intermediate: () => this.recommendCourses('intermediate'),
            advanced: () => this.recommendCourses('advanced'),
            expert: () => this.recommendCourses('advanced'),
            contact: () => this.showContactInfo(),
            partnership: () => this.showPartnershipInfo(),
            certification: () => this.showCertificationInfo(),
            help: () => this.showGeneralHelp()
        };

        // Check for keyword matches
        let matched = false;

        for (const [keyword, handler] of Object.entries(keywords)) {
            if (lowercaseMsg.includes(keyword)) {
                handler();
                matched = true;
                break;
            }
        }

        // Default response if no keyword matches
        if (!matched) {
            this.showGeneralResponse(message);
        }
    }

    // Different response handlers
    showCoursesInfo() {
        const response = `
      <strong>NeuralLeap Courses</strong><br>
      We offer a variety of courses on AI and large model training:<br><br>
      <strong>• Beginner:</strong> LLM Fundamentals, Introduction to AI Safety<br>
      <strong>• Intermediate:</strong> Advanced AI Safety, Prompt Engineering<br>
      <strong>• Advanced:</strong> Neural Network Optimization, AI Alignment Theory<br><br>
      Would you like recommendations for a specific level?
    `;

        this.sendBotMessage(response, true);
    }

    showEnrollmentProcess() {
        const response = `
      <strong>Enrollment Process</strong><br>
      Enrolling in a NeuralLeap course is easy:<br><br>
      1. Create an account on our platform<br>
      2. Browse courses and select the one you want<br>
      3. Complete payment through our secure system<br>
      4. Get immediate access to your course materials<br><br>
      Would you like me to help you with account creation now?
    `;

        this.sendBotMessage(response);
    }

    showPricingInfo() {
        const response = `
      <strong>Course Pricing</strong><br>
      Our courses are priced based on level and content:<br><br>
      • Beginner courses: $99-$149<br>
      • Intermediate courses: $149-$249<br>
      • Advanced courses: $249-$399<br><br>
      We also offer bundle discounts and enterprise pricing. Would you like details on a specific course?
    `;

        this.sendBotMessage(response);
    }

    showAISafetyInfo() {
        const response = `
      <strong>AI Safety at NeuralLeap</strong><br>
      AI safety is core to our mission and curriculum. We believe responsible AI development requires:<br><br>
      • Understanding alignment challenges<br>
      • Implementing robust validation systems<br>
      • Prioritizing transparency and explainability<br>
      • Considering ethical implications<br><br>
      All our courses incorporate these principles, with dedicated advanced courses on safety frameworks.
    `;

        this.sendBotMessage(response);
    }

    recommendCourses(level) {
        const courses = this.courseRecommendations[level];

        const response = `
      <strong>Recommended ${level.charAt(0).toUpperCase() + level.slice(1)} Courses</strong><br>
      Based on your interest in ${level} content, I recommend:<br><br>
      ${courses.map(course => `• <strong>${course}</strong>`).join('<br>')}<br><br>
      Would you like details about any of these courses?
    `;

        this.sendBotMessage(response);
    }

    showContactInfo() {
        const response = `
      <strong>Contact NeuralLeap</strong><br>
      You can reach our team through multiple channels:<br><br>
      • Email: info@neuralleap.com<br>
      • Phone: +1 (800) 123-4567<br>
      • Office: 123 AI Street, Tech City<br><br>
      Our support team is available Monday-Friday, 9AM-6PM EST.
    `;

        this.sendBotMessage(response);
    }

    showPartnershipInfo() {
        const response = `
      <strong>Partnership Opportunities</strong><br>
      NeuralLeap collaborates with universities, research institutions, and enterprises.<br><br>
      Our partnership models include:<br>
      • Educational content development<br>
      • Joint research initiatives<br>
      • Enterprise training programs<br>
      • Technology integration<br><br>
      For partnership inquiries, please contact partnerships@neuralleap.com
    `;

        this.sendBotMessage(response);
    }

    showCertificationInfo() {
        const response = `
      <strong>NeuralLeap Certifications</strong><br>
      Our certifications are recognized across the AI industry:<br><br>
      • Course-specific certificates upon completion<br>
      • Professional certification tracks<br>
      • Specialization certificates for multiple related courses<br><br>
      All certificates can be shared directly to LinkedIn and include secure verification links.
    `;

        this.sendBotMessage(response);
    }

    showGeneralHelp() {
        const response = `
      <strong>How Can I Help You?</strong><br>
      I'm here to assist with:<br><br>
      • Course information and recommendations<br>
      • Enrollment and account questions<br>
      • Technical support for the platform<br>
      • AI safety and learning resources<br><br>
      Let me know what you're interested in!
    `;

        this.sendBotMessage(response, true);
    }

    showGeneralResponse(message) {
        // Generate a generic response if no specific intent is matched
        const responses = [
            `Thanks for your message! To better assist you with "${this.escapeHTML(message)}", could you provide more details about what you're looking for?`,
            `I'd be happy to help with your question about "${this.escapeHTML(message)}". Could you specify which aspect you're most interested in?`,
            `Thanks for reaching out about "${this.escapeHTML(message)}". I can provide information about our courses, enrollment process, AI safety principles, and more. What specific details would you like?`
        ];

        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        this.sendBotMessage(randomResponse, true);
    }

    // Helper methods
    scrollToBottom() {
        if (this.chatbotMessages) {
            this.chatbotMessages.scrollTop = this.chatbotMessages.scrollHeight;
        }
    }

    escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatMessage(message) {
        // Allow HTML in bot messages but escape user input
        return message;
    }
}

// Initialize the chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    const neuralLeapChatbot = new AIAssistantChatbot();

    // Make the chatbot available globally (for debugging and future extensions)
    window.neuralLeapChatbot = neuralLeapChatbot;
});