const themes = [
    { name: "Classique", logo: "🧩", bg: "#f4f4f9", text: "#333333", primary: "#4a90e2", gridBorder: "#333333", cellBg: "#ffffff", readonlyBg: "#e8e8e8", userColor: "#4a90e2", font: "'Segoe UI', Roboto, sans-serif" },
    { name: "Café & Papier", logo: "☕", bg: "#f5f0eb", text: "#4a3b32", primary: "#8c6d58", gridBorder: "#4a3b32", cellBg: "#fcfaf7", readonlyBg: "#ebdcd0", userColor: "#a6522c", font: "Georgia, serif" },
    { name: "Néon Cyber", logo: "⚡", bg: "#12121e", text: "#00ffcc", primary: "#ff007f", gridBorder: "#00ffcc", cellBg: "#1a1a2e", readonlyBg: "#0f3460", userColor: "#ff007f", font: "'Courier New', monospace" },
    { name: "Zen Printemps", logo: "🌸", bg: "#f0f7f4", text: "#2d5a27", primary: "#52b788", gridBorder: "#2d5a27", cellBg: "#ffffff", readonlyBg: "#d8f3dc", userColor: "#1b4332", font: "'Trebuchet MS', sans-serif" },
    { name: "Nuit Étoilée", logo: "🌙", bg: "#0b132b", text: "#e0e1dd", primary: "#48cae4", gridBorder: "#48cae4", cellBg: "#1c2541", readonlyBg: "#3a506b", userColor: "#ffd166", font: "Garamond, serif" },
    { name: "Océan", logo: "🌊", bg: "#e0f4f7", text: "#004e64", primary: "#00a896", gridBorder: "#004e64", cellBg: "#ffffff", readonlyBg: "#a8dadc", userColor: "#028090", font: "Arial, sans-serif" },
    { name: "Forêt d'Automne", logo: "🌲", bg: "#fefae0", text: "#283618", primary: "#dda15e", gridBorder: "#283618", cellBg: "#ffffff", readonlyBg: "#e9edc9", userColor: "#bc6c25", font: "'Palatino Linotype', serif" },
    { name: "Rétro Arcade", logo: "🎮", bg: "#2b2d42", text: "#edf2f4", primary: "#ef233c", gridBorder: "#8d99ae", cellBg: "#1d1e2c", readonlyBg: "#3d405b", userColor: "#ffb703", font: "'Impact', 'Arial Black', sans-serif" },
    { name: "Japon Encre", logo: "⛩️", bg: "#faf8f5", text: "#111111", primary: "#d90429", gridBorder: "#111111", cellBg: "#ffffff", readonlyBg: "#e5e5e5", userColor: "#d90429", font: "'Times New Roman', serif" },
    { name: "Cépia Vintage", logo: "📜", bg: "#f4ebd9", text: "#3d312a", primary: "#b07d62", gridBorder: "#3d312a", cellBg: "#faf6ee", readonlyBg: "#e3d5ca", userColor: "#6b4d3e", font: "Verdana, sans-serif" }
];

let startTime;
let timerInterval;
let seed;
let fullBoard;
let puzzleBoard;
let currentDifficulty = 'moyen';
let celluleSelectionnee = null;
let modeNotesActive = false; // Variable pour le mode Notes

// --- THÈME ET TEMPS ---
function appliquerThemeDuJour() {
    let d = new Date();
    let options = { day: 'numeric', month: 'long', year: 'numeric' };
    let seedJour = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
    let theme = themes[seedJour % themes.length];

    const root = document.documentElement;
    root.style.setProperty('--bg-color', theme.bg);
    root.style.setProperty('--text-color', theme.text);
    root.style.setProperty('--primary-color', theme.primary);
    root.style.setProperty('--grid-border', theme.gridBorder);
    root.style.setProperty('--cell-bg', theme.cellBg);
    root.style.setProperty('--readonly-bg', theme.readonlyBg);
    root.style.setProperty('--user-color', theme.userColor);
    root.style.setProperty('--font-family', theme.font);

    document.getElementById("theme-name").innerText = `${theme.logo} ${theme.name}`;
    document.getElementById("page-title").innerText = `Sudoku du ${d.toLocaleDateString('fr-FR', options)}`;
    
    seed = seedJour;
}

function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    startTime = Date.now();
    timerInterval = setInterval(() => {
        let elapsed = Math.floor((Date.now() - startTime) / 1000);
        let m = Math.floor(elapsed / 60).toString().padStart(2, '0');
        let s = (elapsed % 60).toString().padStart(2, '0');
        document.getElementById("timer").innerText = `${m}:${s}`;
    }, 1000);
}

// --- GÉNÉRATION SUDOKU ---
function lcg() {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
}

function randInt(min, max) {
    return Math.floor(lcg() * (max - min + 1)) + min;
}

function generateFullBoard() {
    let board = Array.from({length: 9}, () => Array(9).fill(0));
    
    function fillBoard() {
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (board[r][c] === 0) {
                    let nums = [1,2,3,4,5,6,7,8,9];
                    nums.sort(() => lcg() - 0.5);
                    for (let n of nums) {
                        if (isValid(board, r, c, n)) {
                            board[r][c] = n;
                            if (fillBoard()) return true;
                            board[r][c] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }
    fillBoard();
    return board;
}

function isValid(board, r, c, num) {
    for (let i = 0; i < 9; i++) {
        if (board[r][i] === num || board[i][c] === num) return false;
    }
    let br = Math.floor(r / 3) * 3, bc = Math.floor(c / 3) * 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[br + i][bc + j] === num) return false;
        }
    }
    return true;
}

function createPuzzle(full, difficulty) {
    let puzzle = full.map(row => [...row]);
    let cellsToRemove = difficulty === 'facile' ? randInt(30, 40) : difficulty === 'moyen' ? randInt(41, 50) : randInt(51, 60);
    
    let positions = [];
    for(let i=0; i<81; i++) positions.push(i);
    positions.sort(() => lcg() - 0.5);

    for (let i = 0; i < cellsToRemove; i++) {
        let r = Math.floor(positions[i] / 9);
        let c = positions[i] % 9;
        puzzle[r][c] = 0;
    }
    return puzzle;
}

// --- INTERFACE DU JEU ---
function chargerJeu(difficulty) {
    currentDifficulty = difficulty;
    
    document.querySelectorAll('.difficulty-selector button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`btn-${difficulty}`).classList.add('active');

    let d = new Date();
    seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
    if(difficulty === 'facile') seed += 1;
    else if(difficulty === 'difficile') seed += 2;

    fullBoard = generateFullBoard();
    puzzleBoard = createPuzzle(fullBoard, difficulty);
    
    renderBoard();
    startTimer();
    document.getElementById("victory-message").style.display = "none";
    celluleSelectionnee = null;
}

function renderBoard() {
    const boardDiv = document.getElementById("board");
    boardDiv.innerHTML = "";
    
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            let cellDiv = document.createElement("div");
            cellDiv.className = "cell";
            cellDiv.dataset.row = r;
            cellDiv.dataset.col = c;
            
            // Grille pour les notes
            let notesGrid = document.createElement("div");
            notesGrid.className = "notes-grid";
            for(let i = 1; i <= 9; i++) {
                let noteSpan = document.createElement("span");
                noteSpan.className = `note-${i}`;
                noteSpan.innerText = i;
                notesGrid.appendChild(noteSpan);
            }
            
            // Gros chiffre
            let mainVal = document.createElement("div");
            mainVal.className = "main-value";

            if (puzzleBoard[r][c] !== 0) {
                mainVal.innerText = puzzleBoard[r][c];
                cellDiv.classList.add("readonly");
            } else {
                cellDiv.addEventListener("click", function() {
                    deselectionnerToutes();
                    this.classList.add("selected");
                    celluleSelectionnee = this;
                });
            }

            cellDiv.appendChild(notesGrid);
            cellDiv.appendChild(mainVal);
            boardDiv.appendChild(cellDiv);
        }
    }
}

// --- GESTION DES NOTES ET SAISIE ---
function toggleNotes() {
    modeNotesActive = !modeNotesActive;
    const btn = document.getElementById("btn-notes");
    if (modeNotesActive) {
        btn.classList.add("active");
        btn.innerText = "✏️ Mode Notes : ACTIVÉ";
    } else {
        btn.classList.remove("active");
        btn.innerText = "✏️ Mode Notes : DÉSACTIVÉ";
    }
}

function effacerNotesLiees(row, col, num) {
    // Efface automatiquement la note "num" de toute la ligne, la colonne et le bloc
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;

    document.querySelectorAll('.cell:not(.readonly)').forEach(cell => {
        let r = parseInt(cell.dataset.row);
        let c = parseInt(cell.dataset.col);
        
        if (r === row || c === col || (r >= startRow && r < startRow + 3 && c >= startCol && c < startCol + 3)) {
            let note = cell.querySelector(`.note-${num}`);
            if (note) note.classList.remove('visible');
        }
    });
}

function saisirChiffre(num) {
    if (!celluleSelectionnee || celluleSelectionnee.classList.contains("readonly")) return;

    let mainVal = celluleSelectionnee.querySelector(".main-value");
    
    if (modeNotesActive) {
        // En mode notes, on ne fait rien si un gros chiffre est déjà là
        if (mainVal.innerText !== "") return;
        
        let noteSpan = celluleSelectionnee.querySelector(`.note-${num}`);
        noteSpan.classList.toggle("visible");
    } else {
        // En mode normal
        let r = parseInt(celluleSelectionnee.dataset.row);
        let c = parseInt(celluleSelectionnee.dataset.col);

        // Si on clique sur le même chiffre, on l'efface (pratique sur mobile)
        if (mainVal.innerText == num) {
            effacerCase();
            return;
        }

        // Sinon, on place le chiffre
        mainVal.innerText = num;
        
        // On efface les notes de cette case
        celluleSelectionnee.querySelectorAll(".notes-grid span").forEach(s => s.classList.remove("visible"));
        
        // On efface cette note dans la ligne/colonne/bloc (Quality of Life)
        effacerNotesLiees(r, c, num);
        
        checkWin();
    }
}

function effacerCase() {
    if (!celluleSelectionnee || celluleSelectionnee.classList.contains("readonly")) return;
    
    // On efface le gros chiffre
    celluleSelectionnee.querySelector(".main-value").innerText = "";
    // On efface les notes
    celluleSelectionnee.querySelectorAll(".notes-grid span").forEach(s => s.classList.remove("visible"));
}

function clearAll() {
    if(confirm("Voulez-vous vraiment effacer toute votre progression (chiffres et notes) ?")) {
        document.querySelectorAll('.cell:not(.readonly)').forEach(cell => {
            cell.querySelector(".main-value").innerText = "";
            cell.querySelectorAll(".notes-grid span").forEach(s => s.classList.remove("visible"));
        });
    }
}

function deselectionnerToutes() {
    document.querySelectorAll('.cell').forEach(c => c.classList.remove("selected"));
}

// --- GESTION DU CLAVIER ---
window.addEventListener("keydown", function(e) {
    // Si la touche "N" est pressée, on change de mode
    if (e.key.toLowerCase() === 'n') {
        toggleNotes();
        return;
    }

    if (!celluleSelectionnee || celluleSelectionnee.classList.contains("readonly")) return;

    if (/[1-9]/.test(e.key)) {
        saisirChiffre(parseInt(e.key));
    } else if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") {
        effacerCase();
    }
});

// Enlever la sélection en cliquant en dehors du plateau
document.addEventListener("click", function(e) {
    const board = document.getElementById("board");
    const numpad = document.querySelector(".numpad");
    const btnNotes = document.getElementById("btn-notes");
    
    if (!board.contains(e.target) && !numpad.contains(e.target) && e.target !== btnNotes) {
        deselectionnerToutes();
        celluleSelectionnee = null;
    }
});

// --- VÉRIFICATION DE LA VICTOIRE ---
function checkWin() {
    let inputs = document.querySelectorAll('.cell');
    for (let i = 0; i < 81; i++) {
        let r = Math.floor(i / 9);
        let c = i % 9;
        let val = inputs[i].querySelector(".main-value").innerText;
        
        if (val === "" || parseInt(val) !== fullBoard[r][c]) {
            return;
        }
    }
    
    clearInterval(timerInterval);
    let msg = document.getElementById("victory-message");
    msg.innerText = `Félicitations ! Vous avez résolu le Sudoku en ${document.getElementById("timer").innerText} !`;
    msg.style.display = "block";
}

// --- DÉMARRAGE ---
appliquerThemeDuJour();
chargerJeu('moyen');