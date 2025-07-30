const fileInput = document.getElementById("file-input");
const audio = document.getElementById("audio");
// const playBtn = document.getElementById("play");
const pauseBtn = document.getElementById("pause");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const loopBtn = document.getElementById("loopBtn");
const shuffleBtn = document.getElementById("shuffle");
const progress = document.getElementById("progress");
const volume = document.getElementById("volume");
const playlistEl = document.getElementById("playlist");
const currentSong = document.getElementById("current-song");
const currentArtist = document.getElementById("current-artist")
const currentTimeEl = document.getElementById("current-time");
const durationEl = document.getElementById("duration");
const coverArt = document.getElementById("cover-art");
const playPauseBtn = document.getElementById("play-pause");
const backToTopBtn = document.getElementById('backToTopBtn');


let playlist = [];
let currentIndex = 0;
let isLooping = false;
let loopMode = "none"; // Can be "none", "all", or "one"
let isShuffling = false;
let shuffleEnabled = false;
let shufflePool = [];
let playedIndices = new Set();



fileInput.addEventListener("change", (e) => {
    const files = Array.from(e.target.files);
    const oldLength = playlist.length;
    let processed = 0;

    files.forEach((file) => {
        const url = URL.createObjectURL(file);

        jsmediatags.read(file, {
            onSuccess: function (tag) {
                let imageUrl = "";
                let title = tag.tags.title || file.name;
                let artist = tag.tags.artist || "-";

                if (tag.tags.picture) {
                    const { data, format } = tag.tags.picture;
                    const byteArray = new Uint8Array(data);
                    const blob = new Blob([byteArray], { type: format });
                    imageUrl = URL.createObjectURL(blob);
                }

                playlist.push({
                    file,
                    url,
                    title,
                    artist,
                    imageUrl,
                });

                processed++;
                if (processed === files.length) {
                    updatePlaylist();
                    if (oldLength === 0) playTrack(0);
                }
            },
            onError: function () {
                playlist.push({
                    file,
                    url,
                    title: file.name,
                    artist: "-",
                    imageUrl: ""
                });

                processed++;
                if (processed === files.length) {
                    updatePlaylist();
                    if (oldLength === 0) playTrack(0);
                }
            }
        });
    });
});


// fileInput.addEventListener("change", async (e) => {
//     const files = Array.from(e.target.files);
//     const oldLength = playlist.length;

//     for (const file of files) {
//         const url = URL.createObjectURL(file);
//         let imageUrl = "";

//         try {
//             const tag = await new Promise((resolve, reject) => {
//                 jsmediatags.read(file, {
//                     onSuccess: resolve,
//                     onError: reject
//                 });
//             });

//             if (tag.tags.picture) {
//                 const { data, format } = tag.tags.picture;
//                 const byteArray = new Uint8Array(data);
//                 const blob = new Blob([byteArray], { type: format });
//                 imageUrl = URL.createObjectURL(blob);
//             }
//         } catch (err) {
//             console.warn("Failed to read tags for", file.name);
//         }

//         playlist.push({ title: file.name, url, imageUrl });
//     }

//     updatePlaylist();
//     if (oldLength === 0 && playlist.length > 0) playTrack(0);
// });


document.getElementById("clear-songs").addEventListener("click", () => {
    playlist.length = 0;
    currentIndex = 0;
    audio.pause();
    audio.src = "";
    progress.value = 0;
    progress.max = 100;
    currentTimeEl.textContent = "0:00";
    durationEl.textContent = "0:00";
    playlistEl.innerHTML = "";
    currentSong.textContent = "Nothing Playing";
    currentArtist.textContent = "-";
    coverArt.src = "/assets/img/default-cover.png";
    playPauseBtn.textContent = "▶️";
    isLooping = false;
    // ✅ fix for re-adding same files
    fileInput.value = "";

});


function updatePlaylist() {
    playlistEl.innerHTML = "";
    playlist.forEach((track, index) => {
        const li = document.createElement("li");

        // Title wrapper
        const titleWrapper = document.createElement("div");
        titleWrapper.style.flex = "1";
        titleWrapper.style.minWidth = "0";

        const titleEl = document.createElement("span");
        titleEl.textContent = track.title;
        titleEl.style.wordWrap = "break-word";
        titleEl.style.wordBreak = "break-word";
        titleEl.style.whiteSpace = "normal";
        titleEl.onclick = () => playTrack(index);

        // Artist element (below title)
        const artistEl = document.createElement("div");
        artistEl.textContent = track.artist || "-";
        artistEl.style.fontStyle = "italic";
        artistEl.style.fontSize = "0.9em";
        artistEl.style.opacity = "0.8";
        artistEl.style.marginTop = "2px";

        titleWrapper.appendChild(titleEl);
        titleWrapper.appendChild(artistEl);

        // Button wrapper
        const buttonGroup = document.createElement("div");
        buttonGroup.style.display = "flex";
        buttonGroup.style.flexShrink = "0";
        buttonGroup.style.gap = "5px";
        buttonGroup.style.flexWrap = "wrap";

        const removeBtn = document.createElement("button");
        removeBtn.textContent = "🗑️";
        removeBtn.onclick = (e) => {
            e.stopPropagation();

            const isCurrent = index === currentIndex;

            playlist.splice(index, 1);

            if (isCurrent) {
                if (playlist.length > 0) {
                    if (index < playlist.length) {
                        playTrack(index);
                    } else {
                        playTrack(0);
                    }
                } else {
                    // No songs left — stop playback
                    audio.pause();
                    audio.src = "";
                    coverArt.src = "/assets/img/default-cover.png";
                    currentSong.textContent = "Nothing Playing";
                    currentArtist.textContent = "-";
                }
            } else if (index < currentIndex) {
                currentIndex--; // Adjust currentIndex since playlist shifted
            }

            updatePlaylist();
        };

        const upBtn = document.createElement("button");
        upBtn.textContent = "⬆️";
        upBtn.onclick = (e) => {
            e.stopPropagation();
            if (index > 0) {
                [playlist[index - 1], playlist[index]] = [playlist[index], playlist[index - 1]];
                updatePlaylist();
            }
        };

        const downBtn = document.createElement("button");
        downBtn.textContent = "⬇️";
        downBtn.onclick = (e) => {
            e.stopPropagation();
            if (index < playlist.length - 1) {
                [playlist[index + 1], playlist[index]] = [playlist[index], playlist[index + 1]];
                updatePlaylist();
            }
        };

        buttonGroup.appendChild(upBtn);
        buttonGroup.appendChild(downBtn);
        buttonGroup.appendChild(removeBtn);

        li.appendChild(titleWrapper);
        li.appendChild(buttonGroup);
        playlistEl.appendChild(li);
    });
}

function playTrack(index) {
    if (!playlist[index]) return;
    currentIndex = index;
    const track = playlist[index];

    audio.src = track.url;
    audio.play();

    // Reset UI
    document.getElementById("current-song").textContent = "Now Playing: Loading...";
    document.getElementById("current-artist").textContent = "-";

    // Read metadata from the original File object (if available)
    if (track.file) {
        jsmediatags.read(track.file, {
            onSuccess: (tag) => {
                const title = tag.tags.title || track.title || "Unknown Title";
                const artist = tag.tags.artist || "-";

                document.getElementById("current-song").textContent = "Now Playing: " + title;
                document.getElementById("current-artist").textContent = artist;
                document.getElementById("current-artist").style.fontStyle = "italic";
            },
            onError: () => {
                document.getElementById("current-song").textContent = "Now Playing: " + (track.title || "Unknown Title");
                document.getElementById("current-artist").textContent = "-";
            }
        });
    } else {
        // Fallback if no file reference
        document.getElementById("current-song").textContent = "Now Playing: " + (track.title || "Unknown Title");
        document.getElementById("current-artist").textContent = "-";
    }

    // Handle cover art with fallback and error recovery
    coverArt.onerror = () => {
        coverArt.src = "/assets/img/default-cover.png";
    };
    coverArt.src = track.imageUrl && track.imageUrl.trim() !== ""
        ? track.imageUrl
        : "/assets/img/default-cover.png";
}



// playBtn.onclick = () => audio.play();
// pauseBtn.onclick = () => audio.pause();

playPauseBtn.onclick = () => {
    if (audio.paused) {
        audio.play();
        playPauseBtn.textContent = "⏸️";
    } else {
        audio.pause();
        playPauseBtn.textContent = "▶️";
    }
};

audio.onended = () => {
    if (loopMode === "one") {
        playTrack(currentIndex); // Repeat current track
        return;
    }

    if (isShuffling && playlist.length > 1) {
        if (playedIndices.size >= playlist.length - 1) {
            if (loopMode === "all") {
                playedIndices.clear(); // Reset for a new shuffle cycle
            } else {
                playPauseBtn.textContent = "▶️";
                return;
            }
        }

        let nextIndex;
        do {
            nextIndex = Math.floor(Math.random() * playlist.length);
        } while (nextIndex === currentIndex || playedIndices.has(nextIndex));

        playedIndices.add(nextIndex);
        playTrack(nextIndex);
        currentIndex = nextIndex;
    } else if (currentIndex < playlist.length - 1) {
        playTrack(currentIndex + 1);
    } else if (loopMode === "all" && playlist.length > 0) {
        playTrack(0);
    } else {
        playPauseBtn.textContent = "▶️";
    }
};


// Change icon when playback starts (e.g. via playlist click)
audio.onplay = () => {
    playPauseBtn.textContent = "⏸️";
};

audio.onpause = () => {
    playPauseBtn.textContent = "▶️";
};

nextBtn.onclick = () => {
    if (loopMode === "one") {
        playTrack(currentIndex); // Stay on same song
    } else if (isShuffling && playlist.length > 1) {
        let nextIndex;
        do {
            nextIndex = Math.floor(Math.random() * playlist.length);
        } while (nextIndex === currentIndex);
        playTrack(nextIndex);
    } else if (currentIndex < playlist.length - 1) {
        playTrack(currentIndex + 1);
    } else if (loopMode === "all") {
        playTrack(0);
    }
};

prevBtn.onclick = () => {
    if (loopMode === "one") {
        playTrack(currentIndex); // Replay the same track
    } else if (currentIndex > 0) {
        playTrack(currentIndex - 1);
    }
};


loopBtn.onclick = () => {
    if (loopMode === "none") {
        loopMode = "all";
        isLooping = true;
        loopBtn.textContent = "🔁"; // Keep default loop icon
        loopBtn.title = "Loop All";
    } else if (loopMode === "all") {
        loopMode = "one";
        isLooping = true;
        loopBtn.textContent = "🔂"; // Show loop-one icon
        loopBtn.title = "Loop One";
    } else {
        loopMode = "none";
        isLooping = false;
        loopBtn.textContent = "🔁"; // Reset to default icon
        loopBtn.title = "Loop Off";
    }

    loopBtn.style.backgroundColor = isLooping ? "#bb86fc" : "#282828";
};

shuffleBtn.onclick = () => {
    isShuffling = !isShuffling;
    shuffleBtn.style.backgroundColor = isShuffling ? "#bb86fc" : "#282828";

    // Reset shuffle state
    playedIndices.clear();
    shufflePool = [...Array(playlist.length).keys()];
    if (shuffleEnabled) shuffleArray(shufflePool);
};


function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}


function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60)
        .toString()
        .padStart(2, "0");
    return `${min}:${sec}`;
}

audio.ontimeupdate = () => {
    if (audio.duration) {
        progress.value = (audio.currentTime / audio.duration) * 100;
        currentTimeEl.textContent = formatTime(audio.currentTime);
        durationEl.textContent = formatTime(audio.duration);
    }
};

progress.oninput = () => {
    const seekTime = (progress.value / 100) * audio.duration;
    audio.currentTime = seekTime;
};

volume.oninput = () => {
    audio.volume = volume.value;
};



// Back-to-top

window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        backToTopBtn.style.display = 'flex';
    } else {
        backToTopBtn.style.display = 'none';
    }
});

backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

