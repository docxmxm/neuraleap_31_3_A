// Payment.js - Handles Stripe payment integration for NeuraLeap

document.addEventListener('DOMContentLoaded', function() {
    // Initialize page components
    loadHeaderFooter();
    initPaymentTabs();
    initStripeElements();
    initPayPalButton();
    
    // Get URL params if any - for loading course details
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('course_id');
    if (courseId) {
        loadCourseDetails(courseId);
    }
});

// Function to load header and footer components
function loadHeaderFooter() {
    fetch('/components/header.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('header-container').innerHTML = data;
            // Re-initialize header scripts if needed
            if (window.initializeHeader) {
                window.initializeHeader();
            }
        });
    
    fetch('/components/footer.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('footer-container').innerHTML = data;
        });
}

// Handle payment method tab switching
function initPaymentTabs() {
    const tabs = document.querySelectorAll('.payment-tab');
    const contents = document.querySelectorAll('.payment-method-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active', 'border-b-2', 'border-cyan-500'));
            
            // Hide all content panels
            contents.forEach(c => c.classList.add('hidden'));
            
            // Add active class to clicked tab
            this.classList.add('active', 'border-b-2', 'border-cyan-500');
            
            // Show corresponding content
            const target = this.id.replace('tab-', 'payment-');
            document.getElementById(target).classList.remove('hidden');
        });
    });
}

// Initialize Stripe Elements
function initStripeElements() {
    // Replace with your Stripe publishable key
    const stripe = Stripe('pk_test_YOUR_PUBLISHABLE_KEY');
    const elements = stripe.elements({
        locale: 'en',
        currency: 'aud', // Australian Dollar
    });
    
    // Create card Element and add to the form
    const style = {
        base: {
            color: '#fff',
            fontFamily: '"Inter", sans-serif',
            fontSmoothing: 'antialiased',
            fontSize: '16px',
            '::placeholder': {
                color: '#6B7280'
            },
            backgroundColor: '#1F2937',
        },
        invalid: {
            color: '#EF4444',
            iconColor: '#EF4444'
        }
    };
    
    const card = elements.create('card', { 
        style: style,
        hidePostalCode: true // Postal code will be collected separately if needed
    });
    card.mount('#card-element');
    
    // Handle real-time validation errors from the card Element
    card.addEventListener('change', function(event) {
        const displayError = document.getElementById('card-errors');
        if (event.error) {
            displayError.textContent = event.error.message;
        } else {
            displayError.textContent = '';
        }
    });
    
    // Handle form submission - Stripe payment processing
    const form = document.getElementById('payment-form');
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // Disable the submit button to prevent repeated clicks
        setLoading(true);
        
        const cardholderName = document.getElementById('cardholder-name').value;
        const coursePrice = document.getElementById('course-price').textContent;
        const amountInCents = parseFloat(coursePrice.replace('A$', '')) * 100;
        
        // Create a payment intent on your server
        createPaymentIntent(amountInCents)
            .then(function(clientSecret) {
                return stripe.confirmCardPayment(clientSecret, {
                    payment_method: {
                        card: card,
                        billing_details: {
                            name: cardholderName
                        }
                    }
                });
            })
            .then(function(result) {
                setLoading(false);
                
                if (result.error) {
                    // Show error to the customer
                    const errorElement = document.getElementById('card-errors');
                    errorElement.textContent = result.error.message;
                } else {
                    // The payment succeeded!
                    handlePaymentSuccess(result.paymentIntent);
                }
            })
            .catch(function(error) {
                setLoading(false);
                console.error('Error:', error);
                // Show a generic error message
                const errorElement = document.getElementById('card-errors');
                errorElement.textContent = 'An unexpected error occurred. Please try again later.';
            });
    });
}

// Toggle loading state for payment button
function setLoading(isLoading) {
    const submitButton = document.getElementById('submit-button');
    const buttonText = document.getElementById('button-text');
    const spinner = document.getElementById('spinner');
    
    if (isLoading) {
        submitButton.disabled = true;
        buttonText.classList.add('opacity-0');
        spinner.classList.remove('hidden');
    } else {
        submitButton.disabled = false;
        buttonText.classList.remove('opacity-0');
        spinner.classList.add('hidden');
    }
}

// Initialize PayPal button
function initPayPalButton() {
    // This is just a placeholder for the PayPal button
    // In a real application, you would integrate the PayPal SDK
    const paypalButtonContainer = document.getElementById('paypal-button-container');
    
    if (paypalButtonContainer) {
        const mockButton = document.createElement('button');
        mockButton.className = 'paypal-button bg-blue-800 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded';
        mockButton.textContent = 'Pay with PayPal';
        mockButton.addEventListener('click', function() {
            alert('In a real implementation, this would open the PayPal checkout flow. For this demo, we\'ll simulate a successful payment.');
            handlePaymentSuccess({ id: 'pp_' + generateRandomId() });
        });
        
        paypalButtonContainer.appendChild(mockButton);
    }
    
    // In a real application, the PayPal button would be initialized like this:
    /*
    paypal.Buttons({
        createOrder: function(data, actions) {
            // Create a PayPal order
            return createPayPalOrder().then(function(orderData) {
                return orderData.id;
            });
        },
        onApprove: function(data, actions) {
            // Capture the funds from the transaction
            return capturePayPalOrder(data.orderID).then(function(details) {
                handlePaymentSuccess({ id: details.id });
            });
        }
    }).render('#paypal-button-container');
    */
}

// Function to load course details from an API or local data
function loadCourseDetails(courseId) {
    // In a real application, you would fetch this from an API
    // For this demo, we'll use mock data
    const coursesData = {
        'course1': {
            name: 'Introduction to AI',
            duration: '8 weeks',
            format: 'Online, self-paced',
            price: 'A$499.00'
        },
        'course2': {
            name: 'Advanced AI Programming',
            duration: '12 weeks',
            format: 'Online, self-paced',
            price: 'A$799.00'
        },
        'course3': {
            name: 'AI for Business Leaders',
            duration: '6 weeks',
            format: 'Online, instructor-led',
            price: 'A$649.00'
        }
    };
    
    // Update page with course details
    const course = coursesData[courseId] || coursesData.course2; // Default to course2 if not found
    
    document.getElementById('course-name').textContent = course.name;
    document.getElementById('course-duration').textContent = course.duration;
    document.getElementById('course-format').textContent = course.format;
    document.getElementById('course-price').textContent = course.price;
    document.getElementById('button-text').textContent = `Pay ${course.price}`;
}

// Mock function to create a payment intent (in real application, this would call your server)
function createPaymentIntent(amountInCents) {
    // This is a mock function for demo purposes
    // In a real app, you would make a call to your server to create a payment intent
    return new Promise((resolve) => {
        console.log(`Creating payment intent for ${amountInCents} cents AUD`);
        // Simulate API delay
        setTimeout(() => {
            // Return a mock client secret
            resolve('pi_mock_client_secret_' + generateRandomId());
        }, 1000);
    });
}

// Handle successful payment
function handlePaymentSuccess(paymentIntent) {
    // Redirect to success page or show success message
    console.log('Payment successful!', paymentIntent);
    
    // Show success message in place of payment form
    const paymentCard = document.querySelector('.bg-dark-card');
    if (paymentCard) {
        paymentCard.innerHTML = `
            <div class="text-center py-8">
                <svg class="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <h2 class="text-2xl font-bold mb-2">Payment Successful!</h2>
                <p class="text-gray-300 mb-6">Your payment has been processed successfully.</p>
                <p class="text-gray-400 mb-6">Transaction ID: ${paymentIntent.id}</p>
                <div class="flex justify-center space-x-4">
                    <a href="/pages/courses/index.html" class="primary-button text-white px-6 py-3 rounded-lg">
                        Go to Courses
                    </a>
                    <a href="/index.html" class="neon-button px-6 py-3 rounded-lg">
                        Return to Home
                    </a>
                </div>
            </div>
        `;
    }
    
    // In a real application, you would also redirect to a success page
    // window.location.href = '/pages/payment-success.html?transaction=' + paymentIntent.id;
}

// Helper function to generate a random ID
function generateRandomId() {
    return Math.random().toString(36).substring(2, 15);
}

// Add a simple spinner animation for the loading state
document.head.insertAdjacentHTML('beforeend', `
    <style>
        .spinner {
            border: 3px solid rgba(0, 0, 0, 0.1);
            border-radius: 50%;
            border-top: 3px solid #fff;
            width: 24px;
            height: 24px;
            animation: spin 1s linear infinite;
            margin: 0 auto;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
`); 