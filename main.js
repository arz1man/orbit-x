gsap.registerPlugin(ScrollTrigger);

// ==========================================
// 1. CINEMATIC LOADER & AUDIO LOGIC
// ==========================================
const loader = document.getElementById('loader');
const startBtn = document.getElementById('start-journey-btn');
const cineTextContainer = document.getElementById('cinematic-text-container');
const cineText = document.getElementById('cinematic-text');
const interstellarAudio = document.getElementById('interstellar-audio');

startBtn.addEventListener('click', () => {
    // Start Hans Zimmer just before the massive organ drop
    interstellarAudio.currentTime = 61.5; 
    interstellarAudio.volume = 0;
    interstellarAudio.play();
    
    // Swell audio in
    gsap.to(interstellarAudio, { volume: 1, duration: 2 });

    // Hide button, prep text
    startBtn.style.display = 'none';
    cineTextContainer.style.display = 'block';

    const tl = gsap.timeline();
    
    // 1. Fade background to pitch black and vibrate screen slightly
    tl.to(loader, { backgroundColor: '#000000', duration: 1.5 })
      .to(cineTextContainer, { x: "random(-3, 3)", y: "random(-3, 3)", duration: 0.05, yoyo: true, repeat: 40 }, "<")
      
    // 2. First massive text drop (synced with the organ hit)
      .to(cineText, { 
          onStart: () => {
              cineText.innerText = "ASCENDING TO ORBIT";
              gsap.set(cineText, { scale: 0.8, opacity: 0 });
          },
          opacity: 1, scale: 1.1, duration: 3, ease: "power2.out" 
      }, "+=0.5") 
      
      .to(cineText, { opacity: 0, scale: 1.2, duration: 1 })
      
    // 3. Second text drop
      .to(cineText, { 
          onStart: () => {
              cineText.innerText = "THE UNKNOWN AWAITS";
              gsap.set(cineText, { scale: 0.8, opacity: 0 });
          },
          opacity: 1, scale: 1.1, duration: 3, ease: "power2.out" 
      }, "+=0.5")
      
      .to(cineText, { opacity: 0, scale: 1.2, duration: 1 })
      
    // 4. Slow cinematic reveal of the main site
      .to(loader, { 
          opacity: 0, 
          duration: 3.5, 
          ease: "power3.inOut", 
          onStart: () => {
              initHeroAnimations();
          },
          onComplete: () => {
              loader.style.display = 'none';
          }
      }, "+=0.5");
});

function initHeroAnimations() {
    gsap.from(".hero-content > *", {
        y: 40, opacity: 0, duration: 1.5, stagger: 0.2, ease: "power3.out"
    });
    gsap.from(".nav", {
        y: -50, opacity: 0, duration: 1, ease: "power3.out"
    });
}

// ==========================================
// 1.5 AUDIO ENGINE (Web Audio API Sci-Fi SFX)
// ==========================================
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const sfx = {
    hover: () => {
        if(audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.02, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
        osc.start(); osc.stop(audioCtx.currentTime + 0.1);
    },
    click: () => {
        if(audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
        osc.start(); osc.stop(audioCtx.currentTime + 0.15);
    },
    launch: () => {
        if(audioCtx.state === 'suspended') audioCtx.resume();
        const bufferSize = audioCtx.sampleRate * 2;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(100, audioCtx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(1500, audioCtx.currentTime + 1.5);
        const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.5);
        gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 2);
        noise.connect(filter); filter.connect(gain); gain.connect(audioCtx.destination);
        noise.start();
    },
    music: () => {
        // Procedural music removed in favor of Hans Zimmer Interstellar OST
    }
};

document.body.addEventListener('click', () => {
    if(audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}, {once: true});


// ==========================================
// 2. MODAL FORM LOGIC
// ==========================================
const modal = document.getElementById('reserve-modal');
const btnOpen = document.getElementById('open-reserve');
const btnClose = document.getElementById('close-modal');
const form = document.getElementById('reserve-form');
const formState = document.getElementById('form-state');
const successState = document.getElementById('success-state');

// Open modal from ANY reserve button
const openBtns = document.querySelectorAll('#open-reserve, .cta-btn');
openBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        modal.classList.add('active');
        gsap.fromTo('.modal-content', { scale: 0.8, y: 50, opacity: 0 }, { scale: 1, y: 0, opacity: 1, duration: 0.6, ease: "back.out(1.7)" });
    });
});

btnClose.addEventListener('click', () => {
    gsap.to('.modal-content', { scale: 0.9, y: 30, opacity: 0, duration: 0.3, onComplete: () => modal.classList.remove('active') });
});

form.addEventListener('submit', async (e) => {
    e.preventDefault(); 
    
    // Play Sci-Fi Rocket Launch SFX
    sfx.launch();
    
    // Save to Cloud Database (KVDB) and local storage fallback
    const name = document.getElementById('req-name').value;
    const email = document.getElementById('req-email').value;
    const phone = document.getElementById('req-phone').value;
    
    const newUser = { name, email, phone, timestamp: new Date().toISOString() };
    const DB_URL = 'https://kvdb.io/LiW4JtWa8oKyDbR5pvzKD6/users';

    try {
        // Fetch existing users
        const response = await fetch(DB_URL);
        let users = [];
        if(response.ok) {
            users = await response.json();
        }
        users.push(newUser);
        
        // Save back to cloud
        await fetch(DB_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(users)
        });
        
        // Local fallback
        localStorage.setItem('orbitX_users', JSON.stringify(users));
    } catch(err) {
        console.error("Cloud DB Error:", err);
        // Fallback to purely local if network fails
        let users = [];
        try {
            const existing = localStorage.getItem('orbitX_users');
            if (existing) users = JSON.parse(existing);
        } catch(e) {}
        users.push(newUser);
        localStorage.setItem('orbitX_users', JSON.stringify(users));
    }
    
    // Shake the whole modal for G-force effect
    gsap.to('.modal-content', { x: "random(-10, 10)", y: "random(-5, 5)", duration: 0.05, yoyo: true, repeat: 30 });

    // Fade out form, blast off rocket!
    gsap.to(formState, { opacity: 0, scale: 0.9, duration: 0.3, onComplete: () => {
        formState.style.display = 'none';
        successState.style.display = 'block';
        
        // Rocket blasts from bottom to top
        gsap.fromTo('#rocket-launch', { y: 100, opacity: 1 }, { y: -300, duration: 1.5, ease: "power2.in" });
        
        // Success text fades in after blast
        gsap.to('#success-text', { opacity: 1, y: 0, duration: 0.6, delay: 1, ease: "back.out(2)" });
        
        // Auto close after 5 seconds
        setTimeout(() => {
            gsap.to('.modal-content', { scale: 0.9, y: 30, opacity: 0, duration: 0.3, onComplete: () => {
                modal.classList.remove('active');
                setTimeout(() => {
                    successState.style.display = 'none';
                    formState.style.display = 'block';
                    formState.style.opacity = 1;
                    gsap.set(formState, {scale: 1});
                    gsap.set('#success-text', {opacity: 0, y: 20});
                    form.reset();
                }, 500);
            }});
        }, 5000);
    }});
});

// ==========================================
// 3. THREE.JS GLOWING PARTICLE TUNNEL
// ==========================================
const canvas = document.querySelector('#webgl');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 10;

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Particle Galaxy (Golden Hour Vibe)
const parameters = { count: 120000, size: 0.015, radius: 25, branches: 4, spin: 1, randomness: 0.2, randomnessPower: 3, insideColor: '#ffedd5', outsideColor: '#ea580c' };
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(parameters.count * 3);
const colors = new Float32Array(parameters.count * 3);

const colorInside = new THREE.Color(parameters.insideColor);
const colorOutside = new THREE.Color(parameters.outsideColor);

for(let i=0; i<parameters.count; i++) {
    const i3 = i * 3;
    const r = Math.random() * parameters.radius;
    const spinAngle = r * parameters.spin;
    const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2;
    const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * r;
    const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * r;
    const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * r;
    
    positions[i3] = Math.cos(branchAngle + spinAngle) * r + randomX;
    positions[i3+1] = randomY;
    positions[i3+2] = Math.sin(branchAngle + spinAngle) * r + randomZ;
    
    const mixedColor = colorInside.clone().lerp(colorOutside, r / parameters.radius);
    colors[i3] = mixedColor.r; colors[i3+1] = mixedColor.g; colors[i3+2] = mixedColor.b;
}

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const material = new THREE.PointsMaterial({ size: parameters.size, sizeAttenuation: true, depthWrite: false, blending: THREE.AdditiveBlending, vertexColors: true });
const points = new THREE.Points(geometry, material);
points.rotation.x = 0.5;
scene.add(points);

// Scroll Warp Animation (Pinned)
gsap.to(camera.position, {
    z: -10,
    ease: "none",
    scrollTrigger: { trigger: ".webgl-section", start: "top top", end: "bottom top", scrub: 1 }
});
gsap.to(points.rotation, {
    y: Math.PI,
    ease: "none",
    scrollTrigger: { trigger: ".webgl-section", start: "top top", end: "bottom top", scrub: 1 }
});

// ==========================================
// 4. EDITORIAL SCROLL REVEALS & PARALLAX
// ==========================================
gsap.utils.toArray('.editorial-section').forEach(section => {
    // Reveal text with bounce
    gsap.from(section.querySelector('.editorial-text'), {
        scrollTrigger: { trigger: section, start: "top 75%" },
        y: 80, opacity: 0, duration: 1.2, ease: "back.out(1.5)"
    });
    
    // Reveal image with bounce
    gsap.from(section.querySelector('.editorial-img-container'), {
        scrollTrigger: { trigger: section, start: "top 70%" },
        scale: 0.9, y: 100, opacity: 0, duration: 1.5, ease: "back.out(1.2)"
    });

    // Subtle Image Parallax inside container
    gsap.to(section.querySelector('.editorial-img'), {
        scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: true },
        y: "20%", ease: "none"
    });
});

// CTA Reveal
gsap.from('.cta-section > *', {
    scrollTrigger: { trigger: '.cta-section', start: "top 80%" },
    scale: 0.8, y: 50, opacity: 0, duration: 1.2, stagger: 0.2, ease: "back.out(1.5)"
});

// Render Loop
const tick = () => {
    points.rotation.y += 0.001;
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
};
tick();

// Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ==========================================
// 5. PREMIUM WOW-FACTOR ANIMATIONS
// ==========================================

// Lenis Smooth Scrolling
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    smoothTouch: false,
    touchMultiplier: 2
});

// Sync Lenis with GSAP ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// Text Scrubbing (Color fill on scroll)
gsap.utils.toArray('.scrub-text').forEach(text => {
    gsap.to(text, {
        backgroundPosition: "0% 0",
        ease: "none",
        scrollTrigger: {
            trigger: text,
            start: "top 80%",
            end: "top 30%",
            scrub: true
        }
    });
});

// Custom Glowing Trailing Cursor
const cursorDot = document.getElementById('cursor-dot');
const cursorOutline = document.getElementById('cursor-outline');

let cursorX = 0, cursorY = 0;
let outlineX = 0, outlineY = 0;

window.addEventListener('mousemove', (e) => {
    cursorX = e.clientX;
    cursorY = e.clientY;
    
    // Instant dot
    cursorDot.style.left = `${cursorX}px`;
    cursorDot.style.top = `${cursorY}px`;
});

// Trailing outline animation
const animateCursor = () => {
    const dx = cursorX - outlineX;
    const dy = cursorY - outlineY;
    
    outlineX += dx * 0.15; // The trailing delay factor
    outlineY += dy * 0.15;
    
    cursorOutline.style.left = `${outlineX}px`;
    cursorOutline.style.top = `${outlineY}px`;
    
    requestAnimationFrame(animateCursor);
};
animateCursor();

// Magnetic Buttons & Cursor Hover States
const interactables = document.querySelectorAll('a, button, input');
interactables.forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursorOutline.classList.add('hover');
        if(!el.tagName.toLowerCase().includes('input')) sfx.hover(); // Play hover SFX
    });
    el.addEventListener('mouseleave', () => {
        cursorOutline.classList.remove('hover');
        if(el.classList.contains('magnetic-btn')) {
            gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
        }
    });
    el.addEventListener('click', () => {
        if(!el.tagName.toLowerCase().includes('input')) sfx.click(); // Play click SFX
    });
});

const magneticBtns = document.querySelectorAll('.magnetic-btn');
magneticBtns.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        // Pull button towards cursor
        gsap.to(btn, { x: x * 0.3, y: y * 0.3, duration: 0.3, ease: "power2.out" });
    });
});
