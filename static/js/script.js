// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    
    // --- GLOBE ANIMATION (THREE.JS) ---
    const globeContainer = document.getElementById('globe-container');
    let scene, camera, renderer, globe;
    function initGlobe() {
        if (!globeContainer) return;
        
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, globeContainer.clientWidth / globeContainer.clientHeight, 0.1, 1000);
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(globeContainer.clientWidth, globeContainer.clientHeight);
        globeContainer.appendChild(renderer.domElement);
        const geometry = new THREE.SphereGeometry(5, 64, 64);
        const material = new THREE.MeshBasicMaterial({ color: 0xcc0000, wireframe: true, transparent: true, opacity: 0.5 });
        globe = new THREE.Mesh(geometry, material);
        scene.add(globe);
        camera.position.z = 10;
        animateGlobe();
    }
    function animateGlobe() {
        requestAnimationFrame(animateGlobe);
        if (globe) {
            globe.rotation.y += 0.001;
            globe.rotation.x += 0.0005;
            renderer.render(scene, camera);
        }
    }
    function onWindowResize() {
        if (camera && renderer && globeContainer) {
            camera.aspect = globeContainer.clientWidth / globeContainer.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(globeContainer.clientWidth, globeContainer.clientHeight);
        }
    }
    window.addEventListener('resize', onWindowResize, false);
    initGlobe();

    // --- UI & SCROLL EFFECTS ---
    const header = document.getElementById('header');
    const backToTopBtn = document.getElementById('back-to-top');
    if (header && backToTopBtn) {
        window.addEventListener('scroll', () => {
            header.classList.toggle('scrolled', window.scrollY > 50);
            backToTopBtn.classList.toggle('visible', window.scrollY > 300);
        });
    }
    
    // --- MOBILE MENU ---
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.getElementById('nav-links');
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => navLinks.classList.toggle('active'));
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => navLinks.classList.remove('active'));
        });
    }

    // --- SCROLL-TRIGGERED ANIMATIONS ---
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    if (animatedElements.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    if (entry.target.classList.contains('stat-item')) {
                        animateCounter(entry.target.querySelector('.stat-number'));
                    }
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        animatedElements.forEach(el => observer.observe(el));
    }

    // --- STATS COUNTER ANIMATION ---
    function animateCounter(element) {
        const target = +element.getAttribute('data-target');
        if (element.hasAnimated) return;
        element.hasAnimated = true;
        let count = 0;
        const duration = 2000;
        const stepTime = Math.abs(Math.floor(duration / target));
        const timer = setInterval(() => {
            count++;
            element.innerText = count;
            if (count === target) clearInterval(timer);
        }, stepTime);
    }

    // --- FAQ ACCORDION ---
    const faqs = [
        {
            question: "What is a 'Point of Order'?",
            answer: "A 'Point of Order' is used to indicate an improper procedure or incorrect application of the rules. It cannot be used for factual errors and the delegate raising it cannot speak on the substance of the matter under discussion."
        },
        {
            question: "How are speeches managed?",
            answer: "No one may address the committee without permission from the Chair. A speakers list is maintained, and the Chair calls upon speakers in order. Debate is confined to the issue at hand, and speaking time may be limited."
        },
        {
            question: "What is the difference between suspending and adjourning a meeting?",
            answer: "Suspending a meeting is a temporary pause for consultations (caucusing). Adjourning a meeting ends the session for a longer period (e.g., for lunch) or for the day."
        },
        {
            question: "How are resolutions created and passed?",
            answer: "Draft resolutions are submitted in writing after debate and consultations. They should be sponsored by at least one State. The primary method for adoption is consensus, where the Chair asks for objections. If there are none, it passes. Voting is a secondary option if consensus cannot be reached."
        },
        {
            question: "What is 'Right of Reply'?",
            answer: "A delegate can request a 'Right of Reply' if their personal or national integrity has been insulted by another delegate. It should be brief and is typically granted at the end of a meeting."
        }
    ];
    const faqContainer = document.querySelector('.faq-container');
    if (faqContainer) {
        faqContainer.innerHTML = faqs.map(faq => `
            <div class="faq-item">
                <button class="faq-question">
                    <span>${faq.question}</span>
                    <i data-lucide="plus-circle" class="faq-icon"></i>
                </button>
                <div class="faq-answer">
                    <p>${faq.answer}</p>
                </div>
            </div>
        `).join('');
        
        document.querySelectorAll('.faq-question').forEach(button => {
            button.addEventListener('click', () => {
                const faqItem = button.parentElement;
                faqItem.classList.toggle('active');
                lucide.createIcons();
            });
        });
        lucide.createIcons();
    }

    // --- TESTIMONIAL SLIDER ---
    const testimonials = [
        {
            quote: "CyberAlliance MUN was a game-changer. The crisis simulation was incredibly realistic and pushed my diplomatic skills to the limit.",
            author: "Elena Rodriguez",
            title: "Delegate of Spain"
        },
        {
            quote: "The level of debate and the quality of the research materials were top-notch. I've never been more prepared for an MUN.",
            author: "Kenji Tanaka",
            title: "Delegate of Japan"
        },
        {
            quote: "An unparalleled experience in digital diplomacy. It's the most relevant and forward-thinking MUN I have ever attended.",
            author: "Aisha Khan",
            title: "Delegate of UAE"
        }
    ];
    const testimonialContainer = document.getElementById('testimonial-container');
    let currentTestimonial = 0;

    function renderTestimonials() {
        if (!testimonialContainer) return;
        
        testimonialContainer.innerHTML = testimonials.map(t => `
            <div class="testimonial-card">
                <div class="quote-icon"><i data-lucide="quote"></i></div>
                <p class="testimonial-text">"${t.quote}"</p>
                <p class="testimonial-author">${t.author}</p>
                <p class="testimonial-author-title">${t.title}</p>
            </div>
        `).join('');
        lucide.createIcons();
        updateSlider();
    }

    function updateSlider() {
        if (!testimonialContainer) return;
        const offset = -currentTestimonial * 100;
        testimonialContainer.style.transform = `translateX(${offset}%)`;
    }
    
    const prevBtn = document.getElementById('prev-testimonial');
    const nextBtn = document.getElementById('next-testimonial');
    
    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            currentTestimonial = (currentTestimonial - 1 + testimonials.length) % testimonials.length;
            updateSlider();
        });

        nextBtn.addEventListener('click', () => {
            currentTestimonial = (currentTestimonial + 1) % testimonials.length;
            updateSlider();
        });

        renderTestimonials();
    }

    // --- CHAT FUNCTIONALITY ---
    const chatMessages = document.getElementById('chatMessages');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendMessage');
    const voiceButton = document.getElementById('voiceButton');
    
    function addMessage(text, type, time) {
        if (!chatMessages) return null;
        
        const messageEl = document.createElement('div');
        messageEl.className = `message ${type}`;
        if (type === 'typing-indicator') {
            messageEl.innerHTML = `<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>`;
        } else {
            messageEl.innerHTML = `<div class="message-text">${text}</div><div class="message-time">${time}</div>`;
        }
        chatMessages.appendChild(messageEl);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return messageEl;
    }
    
    async function handleSendMessage() {
        if (!messageInput || !chatMessages) return;
        
        const message = messageInput.value.trim();
        if (message) {
            const currentTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            addMessage(message, 'user', currentTime);
            messageInput.value = '';
            
            const typingIndicator = addMessage('', 'typing-indicator');
            
            try {
                const response = await fetch('/chat', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ message, user_id: 'mun_delegate' })
                });
                
                const data = await response.json();
                if (typingIndicator) chatMessages.removeChild(typingIndicator);
                const botTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                addMessage(data.response, 'bot', botTime);
            } catch (error) {
                if (typingIndicator) chatMessages.removeChild(typingIndicator);
                const botTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                addMessage('Error: Could not connect to the diplomacy hub.', 'bot', botTime);
            }
        }
    }
    
    async function handleVoiceInput() {
        try {
            const response = await fetch('/voice', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({user_id: 'mun_delegate'})
            });
            
            const data = await response.json();
            if (messageInput && data.text && !data.text.startsWith("Error:")) {
                messageInput.value = data.text;
                handleSendMessage();
            } else if (chatMessages) {
                const botTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                addMessage(data.response, 'bot', botTime);
            }
        } catch (error) {
            if (chatMessages) {
                const botTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                addMessage('Error processing voice command. Please try again.', 'bot', botTime);
            }
        }
    }
    
    if (sendButton && messageInput) {
        sendButton.addEventListener('click', handleSendMessage);
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
            }
        });
    }
    
    if (voiceButton) {
        voiceButton.addEventListener('click', handleVoiceInput);
    }

    // Back to top button functionality
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // --- AUTHENTICATION SYSTEM ---
    let isLoggedIn = false;
    let currentUserEmail = '';
    
    // Auth modals
    const authModal = document.getElementById('auth-modal');
    const loginModal = document.getElementById('login-modal');
    const signupModal = document.getElementById('signup-modal');
    const registrationModal = document.getElementById('registration-modal');
    
    // Close all modals
    function closeAllModals() {
        [authModal, loginModal, signupModal, registrationModal].forEach(modal => {
            if (modal) modal.classList.remove('active');
        });
    }
    
    // Check auth status on load
    checkAuthStatus();
    
    async function checkAuthStatus() {
        try {
            const response = await fetch('/check_auth');
            const data = await response.json();
            isLoggedIn = data.logged_in;
            if (isLoggedIn) {
                currentUserEmail = data.email;
                updateAuthUI(true);
            } else {
                updateAuthUI(false);
            }
        } catch (error) {
            console.error("Auth check failed:", error);
            updateAuthUI(false);
        }
    }
    
    function updateAuthUI(loggedIn) {
        const registerBtn = document.getElementById('register-btn');
        const userState = document.getElementById('user-state');
        
        if (!registerBtn || !userState) return;

        if (loggedIn) {
            registerBtn.textContent = 'Complete Registration';
            registerBtn.onclick = () => {
                openModal(registrationModal);
                const emailInput = document.getElementById('registered-email');
                if (emailInput) {
                    emailInput.value = currentUserEmail;
                }
            };
            
            userState.innerHTML = `
                <span class="user-email">${currentUserEmail}</span>
                <button id="logout-btn" class="btn btn-outline">Logout</button>
            `;
            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', logout);
            }
        } else {
            registerBtn.textContent = 'Register Now';
            registerBtn.onclick = () => openModal(authModal);
            userState.innerHTML = '';
        }
    }
    
    function openModal(modal) {
        closeAllModals();
        if (modal) modal.classList.add('active');
    }
    
    // Modal event listeners
    document.getElementById('auth-modal-login-btn')?.addEventListener('click', () => openModal(loginModal));
    document.getElementById('auth-modal-signup-btn')?.addEventListener('click', () => openModal(signupModal));
    document.getElementById('auth-modal-close')?.addEventListener('click', closeAllModals);
    document.getElementById('login-modal-close')?.addEventListener('click', closeAllModals);
    document.getElementById('signup-modal-close')?.addEventListener('click', closeAllModals);
    document.getElementById('modal-close')?.addEventListener('click', closeAllModals);
    
    async function logout() {
        try {
            await fetch('/logout');
            isLoggedIn = false;
            currentUserEmail = '';
            updateAuthUI(false);
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }
    
    // Login form submission
    document.getElementById('login-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const messageEl = document.getElementById('login-form-message');
        
        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ email, password })
            });
            
            if (response.ok) {
                const data = await response.json();
                isLoggedIn = true;
                currentUserEmail = data.email;
                updateAuthUI(true);
                closeAllModals();
            } else {
                const errorData = await response.json();
                messageEl.textContent = errorData.message || 'Login failed';
                messageEl.className = 'form-message error';
            }
        } catch (error) {
            messageEl.textContent = 'Network error';
            messageEl.className = 'form-message error';
        }
    });
    
    // Signup form submission
    document.getElementById('signup-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;
        const messageEl = document.getElementById('signup-form-message');
        
        if (password !== confirmPassword) {
            messageEl.textContent = 'Passwords do not match';
            messageEl.className = 'form-message error';
            return;
        }
        
        try {
            const response = await fetch('/signup', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ email, password })
            });
            
            if (response.ok) {
                const loginResponse = await fetch('/login', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ email, password })
                });
                
                if (loginResponse.ok) {
                    const data = await loginResponse.json();
                    isLoggedIn = true;
                    currentUserEmail = data.email;
                    updateAuthUI(true);
                    closeAllModals();
                    openModal(registrationModal);
                    const emailInput = document.getElementById('registered-email');
                    if(emailInput) emailInput.value = currentUserEmail;
                }
            } else {
                const errorData = await response.json();
                messageEl.textContent = errorData.message || 'Signup failed';
                messageEl.className = 'form-message error';
            }
        } catch (error) {
            messageEl.textContent = 'Network error';
            messageEl.className = 'form-message error';
        }
    });

    // Add email field to registration form if it doesn't exist
    const registrationForm = document.getElementById('registration-form');
    if (registrationForm && !document.getElementById('registered-email')) {
        const emailField = document.createElement('div');
        emailField.className = 'form-group';
        emailField.innerHTML = `
            <label>Registered Email</label>
            <input type="text" id="registered-email" class="readonly-email" readonly>
        `;
        registrationForm.insertBefore(emailField, registrationForm.firstChild);
    }

    // Handle registration form submission
    registrationForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('name').value,
            class: document.getElementById('class').value,
            school: document.getElementById('school').value,
            committee: document.getElementById('committee').value,
            country: document.getElementById('country').value,
        };
        
        const submitBtn = registrationForm.querySelector('button[type="submit"]');
        const messageEl = document.getElementById('form-message');
        
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i data-lucide="loader" class="animate-spin"></i> Registering...';
        lucide.createIcons();
        
        try {
            // *** CORRECTED FETCH URL ***
            // This now sends the data to your Flask backend endpoint '/register'
            const response = await fetch('/register', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (data.status === 'success') {
                messageEl.textContent = 'Registration successful! A confirmation email has been sent to your address.';
                messageEl.className = 'form-message success';
                registrationForm.reset();
                // Re-set the email field after resetting the form
                document.getElementById('registered-email').value = currentUserEmail;
                setTimeout(closeAllModals, 3000); // Close modal after 3 seconds
            } else {
                messageEl.textContent = 'Error: ' + (data.message || 'Registration failed. Please try again later.');
                messageEl.className = 'form-message error';
            }
        } catch (error) {
            messageEl.textContent = 'Network error. Please check your connection and try again.';
            messageEl.className = 'form-message error';
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i data-lucide="send"></i> Submit Registration';
            lucide.createIcons();
        }
    });

    // Close modal when clicking outside content
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });

    // Open modal when Register Now is clicked
    document.querySelectorAll('[href="#register"]').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            if (isLoggedIn) {
                openModal(registrationModal);
                const emailInput = document.getElementById('registered-email');
                if (emailInput) emailInput.value = currentUserEmail;
            } else {
                openModal(authModal);
            }
        });
    });
});

// Add loader icon animation to CSS
const style = document.createElement('style');
style.textContent = `
@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}
.animate-spin {
    animation: spin 1s linear infinite;
}
`;
document.head.appendChild(style);
