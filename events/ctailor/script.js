document.addEventListener("DOMContentLoaded", () => {
    // --- 1. Splash Screen Logic ---
    const splashScreen = document.getElementById("splash-screen");
    const mainContent = document.getElementById("main-content");

    // Play subtle drum sound (if audio was provided, we would trigger it here)
    // const drumAudio = new Audio('path-to-atumpan-strike.mp3');
    // setTimeout(() => drumAudio.play().catch(e => console.log('Audio play blocked')), 500);

    // Fade out splash screen after 3 seconds
    setTimeout(() => {
        splashScreen.style.opacity = "0";
        splashScreen.style.visibility = "hidden";
        
        // Show main content and ensure scroll is restored
        setTimeout(() => {
            splashScreen.classList.add("hidden");
            mainContent.classList.remove("hidden");
            mainContent.style.opacity = "0";
            
            // Fade in main content smoothly
            requestAnimationFrame(() => {
                mainContent.style.transition = "opacity 1s ease-in";
                mainContent.style.opacity = "1";
            });
        }, 1500); // Wait for CSS transition to finish before hiding from DOM
    }, 3000);


    // --- 3. Scripture Ribbon Logic ---
    const scriptures = [
        `"Precious in the sight of the Lord is the death of His saints." — Psalm 116:15`,
        `"Blessed are those who mourn, for they shall be comforted." — Matthew 5:4`,
        `"I have fought the good fight, I have finished the race, I have kept the faith." — 2 Timothy 4:7`
    ];

    const marqueeContainer = document.getElementById("scripture-marquee");
    let currentScriptureIndex = 0;

    // Inject initial scripture
    marqueeContainer.innerHTML = `<p>${scriptures[currentScriptureIndex]}</p>`;

    // Rotate every 8 seconds
    setInterval(() => {
        const pTag = marqueeContainer.querySelector("p");
        
        // Fade out
        pTag.style.opacity = "0";
        
        setTimeout(() => {
            // Update text
            currentScriptureIndex = (currentScriptureIndex + 1) % scriptures.length;
            pTag.innerText = scriptures[currentScriptureIndex];
            
            // Fade in
            pTag.style.opacity = "1";
        }, 500); // Wait for fade out
    }, 8000);

    // --- 7. Countdown Logic ---
    const targetDate = new Date("June 13, 2026 06:00:00").getTime();
    
    const daysEl = document.getElementById("days");
    const hoursEl = document.getElementById("hours");
    const minutesEl = document.getElementById("minutes");
    const secondsEl = document.getElementById("seconds");

    const updateCountdown = () => {
        const now = new Date().getTime();
        const distance = targetDate - now;

        if (distance < 0) {
            clearInterval(countdownInterval);
            daysEl.innerText = "00";
            hoursEl.innerText = "00";
            minutesEl.innerText = "00";
            secondsEl.innerText = "00";
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        daysEl.innerText = days.toString().padStart(2, '0');
        hoursEl.innerText = hours.toString().padStart(2, '0');
        minutesEl.innerText = minutes.toString().padStart(2, '0');
        secondsEl.innerText = seconds.toString().padStart(2, '0');
    };

    // Initial call
    updateCountdown();
    // --- 10. Tribute Wall Logic ---
    // Tag Selection
    const tags = document.querySelectorAll('.tag');
    tags.forEach(tag => {
        tag.addEventListener('click', () => {
            tags.forEach(t => t.classList.remove('active'));
            tag.classList.add('active');
        });
    });

    // Unfold Letter
    const foldedLetters = document.querySelectorAll('.folded-letter');
    foldedLetters.forEach(letter => {
        letter.addEventListener('click', () => {
            const inside = letter.querySelector('.letter-inside');
            const hint = letter.querySelector('.tap-hint');
            
            if (inside.classList.contains('hidden')) {
                inside.classList.remove('hidden');
                inside.classList.add('show');
                hint.innerText = "Tap to fold";
            } else {
                inside.classList.add('hidden');
                inside.classList.remove('show');
                hint.innerText = "Tap to unfold";
            }
        });
    });

    // Simple Form Submission Mockups
    document.getElementById('condolence-form').addEventListener('submit', (e) => {
        e.preventDefault();
        alert("Thank you. Your condolence has been added to the altar.");
        e.target.reset();
    });

    const rsvpForm = document.querySelector('.rsvp-form');
    if(rsvpForm) {
        rsvpForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert("Thank you for confirming your attendance. The family looks forward to receiving you.");
            e.target.reset();
        });
    }

    // Share Button Mockups
    document.querySelectorAll('.share-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if(btn.innerText === "Copy Link") {
                alert("Link copied to clipboard!");
            } else {
                alert(`Opening ${btn.innerText} share dialogue...`);
            }
        });
    });
});
