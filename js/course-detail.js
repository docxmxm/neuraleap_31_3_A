/**
 * Course Detail JavaScript for NeuralLeap
 * Handles functionality for course detail pages
 */

document.addEventListener('DOMContentLoaded', function() {
    initCourseDetailPage();
    handleLessonNavigation();
    setupEnrollButton();
});

/**
 * Initialize the course detail page
 */
function initCourseDetailPage() {
    // Check if there's a lesson parameter in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const lessonParam = urlParams.get('lesson');
    
    if (lessonParam) {
        // If there's a lesson parameter, show that specific lesson
        showLesson(parseInt(lessonParam));
    }
    
    // Update progress indicators
    updateProgressIndicators();
}

/**
 * Handle lesson navigation
 */
function handleLessonNavigation() {
    // Next lesson buttons
    const nextLessonButtons = document.querySelectorAll('.next-lesson-btn');
    if (nextLessonButtons) {
        nextLessonButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const currentLesson = parseInt(this.dataset.currentLesson);
                const nextLesson = currentLesson + 1;
                showLesson(nextLesson);
                
                // Update URL without reloading the page
                const url = new URL(window.location);
                url.searchParams.set('lesson', nextLesson);
                window.history.pushState({}, '', url);
            });
        });
    }
    
    // Previous lesson buttons
    const prevLessonButtons = document.querySelectorAll('.prev-lesson-btn');
    if (prevLessonButtons) {
        prevLessonButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const currentLesson = parseInt(this.dataset.currentLesson);
                const prevLesson = currentLesson - 1;
                if (prevLesson >= 1) {
                    showLesson(prevLesson);
                    
                    // Update URL without reloading the page
                    const url = new URL(window.location);
                    url.searchParams.set('lesson', prevLesson);
                    window.history.pushState({}, '', url);
                }
            });
        });
    }
    
    // Lesson navigation in sidebar
    const lessonLinks = document.querySelectorAll('.lesson-link');
    if (lessonLinks) {
        lessonLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const lessonNumber = parseInt(this.dataset.lesson);
                showLesson(lessonNumber);
                
                // Update URL without reloading the page
                const url = new URL(window.location);
                url.searchParams.set('lesson', lessonNumber);
                window.history.pushState({}, '', url);
                
                // On mobile, close the lesson navigation if it's open
                const lessonNav = document.querySelector('.lesson-navigation');
                if (lessonNav && lessonNav.classList.contains('active')) {
                    lessonNav.classList.remove('active');
                }
            });
        });
    }
}

/**
 * Show a specific lesson
 * @param {number} lessonNumber - The lesson number to show
 */
function showLesson(lessonNumber) {
    // Hide all lessons
    const allLessons = document.querySelectorAll('.lesson-content');
    if (allLessons) {
        allLessons.forEach(lesson => {
            lesson.classList.add('hidden');
        });
    }
    
    // Show the selected lesson
    const selectedLesson = document.querySelector(`.lesson-content[data-lesson="${lessonNumber}"]`);
    if (selectedLesson) {
        selectedLesson.classList.remove('hidden');
    }
    
    // Update active state in lesson navigation
    const lessonLinks = document.querySelectorAll('.lesson-link');
    if (lessonLinks) {
        lessonLinks.forEach(link => {
            link.classList.remove('active');
            if (parseInt(link.dataset.lesson) === lessonNumber) {
                link.classList.add('active');
            }
        });
    }
    
    // Update next/prev buttons
    updateNavigationButtons(lessonNumber);
    
    // Scroll to top of lesson
    window.scrollTo(0, 0);
}

/**
 * Update the next and previous lesson buttons
 * @param {number} currentLesson - The current lesson number
 */
function updateNavigationButtons(currentLesson) {
    // Update next lesson buttons
    const nextLessonButtons = document.querySelectorAll('.next-lesson-btn');
    if (nextLessonButtons) {
        nextLessonButtons.forEach(button => {
            button.dataset.currentLesson = currentLesson;
            
            // Disable next button if this is the last lesson
            const totalLessons = document.querySelectorAll('.lesson-content').length;
            if (currentLesson >= totalLessons) {
                button.classList.add('disabled');
                button.disabled = true;
            } else {
                button.classList.remove('disabled');
                button.disabled = false;
            }
        });
    }
    
    // Update previous lesson buttons
    const prevLessonButtons = document.querySelectorAll('.prev-lesson-btn');
    if (prevLessonButtons) {
        prevLessonButtons.forEach(button => {
            button.dataset.currentLesson = currentLesson;
            
            // Disable prev button if this is the first lesson
            if (currentLesson <= 1) {
                button.classList.add('disabled');
                button.disabled = true;
            } else {
                button.classList.remove('disabled');
                button.disabled = false;
            }
        });
    }
}

/**
 * Update progress indicators
 */
function updateProgressIndicators() {
    const progressBars = document.querySelectorAll('.progress-bar');
    if (progressBars) {
        progressBars.forEach(bar => {
            const progress = bar.dataset.progress;
            if (progress) {
                bar.style.width = `${progress}%`;
            }
        });
    }
}

/**
 * Setup the enroll button
 */
function setupEnrollButton() {
    const enrollButtons = document.querySelectorAll('.enroll-button');
    if (enrollButtons) {
        enrollButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Get course ID from data attribute
                const courseId = this.dataset.courseId;
                
                // Show enrollment confirmation or redirect to payment page
                if (courseId) {
                    // For demo purposes, just show an alert
                    alert(`You have successfully enrolled in this course!`);
                    
                    // In a real implementation, you would redirect to a payment page
                    // or show a modal with payment options
                    // window.location.href = `/enroll/${courseId}`;
                    
                    // For demo, update UI to show enrolled state
                    const enrollSection = document.querySelector('.enroll-section');
                    if (enrollSection) {
                        enrollSection.innerHTML = `
                            <div class="bg-green-900 bg-opacity-30 p-4 rounded-lg text-center">
                                <svg class="h-12 w-12 text-green-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                <h3 class="text-xl font-bold text-white mb-2">Enrolled Successfully!</h3>
                                <p class="text-gray-300 mb-4">You now have access to all course materials.</p>
                                <a href="#lesson-1" class="neon-button px-6 py-3 rounded-lg inline-block">Start Learning</a>
                            </div>
                        `;
                    }
                }
            });
        });
    }
}
