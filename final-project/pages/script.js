// ==================== ABOUT PAGE: HOVER INTERACTION ====================
const hoverBoxes = document.querySelectorAll(".hover-box");
const descriptionBox = document.getElementById("image-description");

if (hoverBoxes.length > 0 && descriptionBox) {
  hoverBoxes.forEach(box => {
    box.addEventListener("mouseenter", () => {
      descriptionBox.textContent = box.dataset.description;
    });
    box.addEventListener("mouseleave", () => {
      descriptionBox.textContent = "";
    });
  });
}

// ==================== CREATIVE PAGE: POMODORO TIMER ====================

// Pomodoro Timer Variables
let timer;
let timeLeft = 1500; // 25 minutes in seconds
let isRunning = false;
let isBreak = false;
let cycleCount = 0;
let currentTask = '';

// Audio Playlist Variables
let audioPlaylist = [];
let currentAudioIndex = 0;
let currentAudio = null;

// DOM Elements
const taskInputScreen = document.getElementById('task-input-screen');
const timerScreen = document.getElementById('timer-screen');
const taskInput = document.getElementById('task-input');
const startPomodoroBtn = document.getElementById('start-pomodoro-btn');
const timerDisplay = document.getElementById('timer-display');
const timerStatus = document.getElementById('timer-status');
const currentTaskSpan = document.getElementById('current-task');
const startPauseBtn = document.getElementById('start-pause-btn');
const resetBtn = document.getElementById('reset-btn');
const skipPomodoroBtn = document.getElementById('skip-pomodoro-btn');
const skipBreakBtn = document.getElementById('skip-break-btn');
const pomodoroSection = document.querySelector('.pomodoro-section');
const backgroundVideo = document.getElementById('background-video');

// Only run Pomodoro code if elements exist (i.e., we're on creative.html)
if (startPomodoroBtn) {
  // Initialize audio playlist (update these paths to match your file names)
  audioPlaylist = [
    '../audio/1.mp3',
    '../audio/2.mp3',
    '../audio/3.mp3',
    '../audio/4.mp3',
    '../audio/5.mp3',
    '../audio/6.mp3',
    '../audio/7.mp3',
    '../audio/8.mp3',
    '../audio/9.mp3',
    '../audio/10.mp3'
  ];

  // Audio Functions
  function playNextTrack() {
    if (currentAudioIndex < audioPlaylist.length) {
      // Stop current audio if playing
      if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
      }

      // Create new audio element
      currentAudio = new Audio(audioPlaylist[currentAudioIndex]);
      currentAudio.volume = 0.5; // Set volume to 50%

      // When this track ends, play the next one
      currentAudio.addEventListener('ended', () => {
        currentAudioIndex++;
        if (isRunning && !isBreak) {
          playNextTrack();
        }
      });

      // Play the track
      currentAudio.play().catch(error => {
        console.log('Audio playback failed:', error);
      });
    } else {
      // If we've reached the end of the playlist, loop back to the start
      currentAudioIndex = 0;
      if (isRunning && !isBreak) {
        playNextTrack();
      }
    }
  }

  function stopAllAudio() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }
    currentAudioIndex = 0;
  }

  function pauseAudio() {
    if (currentAudio) {
      currentAudio.pause();
    }
  }

  function resumeAudio() {
    if (currentAudio) {
      currentAudio.play().catch(error => {
        console.log('Audio playback failed:', error);
      });
    }
  }

  // Start Pomodoro from task input
  startPomodoroBtn.addEventListener('click', () => {
    const task = taskInput.value.trim();
    if (task === '') {
      alert('Please enter a task to work on!');
      return;
    }
    
    currentTask = task;
    currentTaskSpan.textContent = currentTask;
    
    // Switch screens
    taskInputScreen.classList.add('hidden');
    timerScreen.classList.remove('hidden');
    
    // Set working mode
    isBreak = false;
    timeLeft = 1500; // 25 minutes
    updateDisplay();
    updateButtonVisibility();
    pomodoroSection.classList.add('working');
  });

  // Start/Pause Button
  startPauseBtn.addEventListener('click', () => {
    if (isRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  });

  // Reset Button
  resetBtn.addEventListener('click', () => {
    resetTimer();
  });

  // Skip Pomodoro Button
  skipPomodoroBtn.addEventListener('click', () => {
    if (!isBreak) {
      skipPomodoro();
    }
  });

  // Skip Break Button
  skipBreakBtn.addEventListener('click', () => {
    if (isBreak) {
      skipBreak();
    }
  });

  // Timer Functions
  function startTimer() {
    isRunning = true;
    
    // Play video and music if in work mode
    if (!isBreak) {
      if (backgroundVideo) {
        backgroundVideo.classList.add('active');
        backgroundVideo.play();
      }
      
      // Start or resume audio playlist
      if (currentAudio && currentAudio.paused) {
        resumeAudio();
      } else if (!currentAudio) {
        playNextTrack();
      }
    }
    
    timer = setInterval(() => {
      timeLeft--;
      updateDisplay();
      
      if (timeLeft === 0) {
        clearInterval(timer);
        isRunning = false;
        handleTimerEnd();
      }
    }, 1000);
  }

  function pauseTimer() {
    isRunning = false;
    clearInterval(timer);
    
    // Pause video and music
    if (backgroundVideo) {
      backgroundVideo.pause();
    }
    pauseAudio();
  }

  function resetTimer() {
    pauseTimer();
    
    // Stop and hide video
    if (backgroundVideo) {
      backgroundVideo.pause();
      backgroundVideo.currentTime = 0;
      backgroundVideo.classList.remove('active');
    }
    
    // Stop all audio
    stopAllAudio();
    
    // Reset to task input screen
    timerScreen.classList.add('hidden');
    taskInputScreen.classList.remove('hidden');
    taskInput.value = '';
    
    // Reset variables
    timeLeft = 1500;
    isBreak = false;
    cycleCount = 0;
    currentTask = '';
    
    // Remove background classes
    pomodoroSection.classList.remove('working', 'break');
    
    updateDisplay();
  }

  function skipPomodoro() {
    pauseTimer();
    
    // Stop video
    if (backgroundVideo) {
      backgroundVideo.pause();
      backgroundVideo.currentTime = 0;
      backgroundVideo.classList.remove('active');
    }
    
    // Stop all audio
    stopAllAudio();
    
    // Go directly to break
    cycleCount++;
    startBreak();
  }

  function skipBreak() {
    pauseTimer();
    
    // Stop video
    if (backgroundVideo) {
      backgroundVideo.pause();
      backgroundVideo.currentTime = 0;
      backgroundVideo.classList.remove('active');
    }
    
    // Stop all audio
    stopAllAudio();
    
    startWorkSession();
  }

  function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  function updateButtonVisibility() {
    if (skipPomodoroBtn && skipBreakBtn) {
      if (isBreak) {
        // During break: show Skip Break, hide Skip Pomodoro
        skipPomodoroBtn.style.display = 'none';
        skipBreakBtn.style.display = 'block';
      } else {
        // During work: show Skip Pomodoro, hide Skip Break
        skipPomodoroBtn.style.display = 'block';
        skipBreakBtn.style.display = 'none';
      }
    }
  }

  function handleTimerEnd() {
    if (isBreak) {
      // Break ended, start work session
      startWorkSession();
    } else {
      // Work session ended, start break
      // Stop video and audio
      if (backgroundVideo) {
        backgroundVideo.pause();
        backgroundVideo.currentTime = 0;
        backgroundVideo.classList.remove('active');
      }
      stopAllAudio();
      
      cycleCount++;
      startBreak();
    }
  }

  function startWorkSession() {
    isBreak = false;
    timeLeft = 1500; // 25 minutes
    timerStatus.innerHTML = `Working on: <span id="current-task">${currentTask}</span>`;
    pomodoroSection.classList.remove('break');
    pomodoroSection.classList.add('working');
    updateDisplay();
    updateButtonVisibility();
  }

  function startBreak() {
    isBreak = true;
    
    // Determine break length
    if (cycleCount % 4 === 0) {
      // Long break after 4 cycles (15-30 minutes, using 20 minutes)
      timeLeft = 1200; // 20 minutes
      timerStatus.textContent = 'Long Break Time!!!';
    } else {
      // Short break (5 minutes)
      timeLeft = 300; // 5 minutes
      timerStatus.textContent = 'Break Time!!!';
    }
    
    pomodoroSection.classList.remove('working');
    pomodoroSection.classList.add('break');
    updateDisplay();
    updateButtonVisibility();
    
    // Auto-start break
    startTimer();
  }

  // Initialize
  updateDisplay();
  updateButtonVisibility();
}