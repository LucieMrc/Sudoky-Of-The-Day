const themes = [
    {
        name: "Classique",
        logo: "🧩",
        bg: "#f4f4f9",
        text: "#333333",
        primary: "#4a90e2",
        gridBorder: "#333333",
        cellBg: "#ffffff",
        readonlyBg: "#e8e8e8",
        userColor: "#4a90e2",
        font: "'Segoe UI', Roboto, sans-serif"
    },
    {
        name: "Café & Papier",
        logo: "☕",
        bg: "#f5f0eb",
        text: "#4a3b32",
        primary: "#8c6d58",
        gridBorder: "#4a3b32",
        cellBg: "#fcfaf7",
        readonlyBg: "#ebdcd0",
        userColor: "#a6522c",
        font: "Georgia, serif"
    },
    {
        name: "Néon Cyber",
        logo: "⚡",
        bg: "#12121e",
        text: "#00ffcc",
        primary: "#ff007f",
        gridBorder: "#00ffcc",
        cellBg: "#1a1a2e",
        readonlyBg: "#0f3460",
        userColor: "#ff007f",
        font: "'Courier New', monospace"
    },
    {
        name: "Zen Printemps",
        logo: "🌸",
        bg: "#f0f7f4",
        text: "#2d5a27",
        primary: "#52b788",
        gridBorder: "#2d5a27",
        cellBg: "#ffffff",
        readonlyBg: "#d8f3dc",
        userColor: "#1b4332",
        font: "'Trebuchet MS', sans-serif"
    },
    {
        name: "Nuit Étoilée",
        logo: "🌙",
        bg: "#0b132b",
        text: "#e0e1dd",
        primary: "#48cae4",
        gridBorder: "#48cae4",
        cellBg: "#1c2541",
        readonlyBg: "#3a506b",
        userColor: "#ffd166",
        font: "Garamond, serif"
    },
    {
        name: "Océan",
        logo: "🌊",
        bg: "#e0f4f7",
        text: "#004e64",
        primary: "#00a896",
        gridBorder: "#004e64",
        cellBg: "#ffffff",
        readonlyBg: "#a8dadc",
        userColor: "#028090",
        font: "Arial, sans-serif"
    },
    {
        name: "Forêt d'Automne",
        logo: "🌲",
        bg: "#fefae0",
        text: "#283618",
        primary: "#dda15e",
        gridBorder: "#283618",
        cellBg: "#ffffff",
        readonlyBg: "#e9edc9",
        userColor: "#bc6c25",
        font: "'Palatino Linotype', serif"
    },
    {
        name: "Rétro Arcade",
        logo: "🎮",
        bg: "#2b2d42",
        text: "#edf2f4",
        primary: "#ef233c",
        gridBorder: "#8d99ae",
        cellBg: "#1d1e2c",
        readonlyBg: "#3d405b",
        userColor: "#ffb703",
        font: "'Impact', 'Arial Black', sans-serif"
    },
    {
        name: "Japon Encre",
        logo: "⛩️",
        bg: "#faf8f5",
        text: "#111111",
        primary: "#d90429",
        gridBorder: "#111111",
        cellBg: "#ffffff",
        readonlyBg: "#e5e5e5",
        userColor: "#d90429",
        font: "'Times New Roman', serif"
    },
    {
        name: "Cépia Vintage",
        logo: "📜",
        bg: "#f4ebd9",
        text: "#3d312a",
        primary: "#b07d62",
        gridBorder: "#3d312a",
        cellBg: "#faf6ee",
        readonlyBg: "#e3d5ca",
        userColor: "#6b4d3e",
        font: "Verdana, sans-serif"
    }
];

let startTime;
let timerInterval;
let seed;
let fullBoard;
let puzzleBoard;
let currentDifficulty = 'moyen';
let celluleSelectionnee = null;

function appliquerThemeDuJour() {
    let d = new Date();
    let dateOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    let dateFormatee = d.toLocaleDateString('fr-FR', dateOptions);
    
    let seedJour = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
    let themeIndex = seedJour % themes.length;
    let theme = themes[themeIndex];

    const root = document.documentElement;
    root.style.setProperty('--bg-color', theme.bg);
    root.style.setProperty('--text-color', theme.text);
    root.style.setProperty('--primary-color', theme.primary);
    root.style.setProperty('--grid-border', theme.gridBorder);
    root.style.setProperty('--cell-bg', theme.cellBg);
    root.style.setProperty('--readonly-bg', theme.readonlyBg);
    root.style.setProperty('--user-color', theme.userColor);
    root.style.setProperty('--font-family', theme.font);

    document.getElementById('page-title').innerText = `${theme.logo} Sudoku du ${dateFormatee}`;
    document.getElementById('theme-name').innerText = `Thème : ${theme.name}`;
}

function updateTimer() {
    let elapsed = Math.floor((Date.now() - startTime) / 1000);
    let minutes = String(Math.floor(elapsed / 60)).padStart(2, '0');
    let seconds = String(elapsed % 60).padStart(2, '0');
    document.getElementById('timer').innerText = `${minutes}:${seconds}`;
}

function setSeed(difficulte) {
    let d = new Date();
    let baseSeed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
    let offsets = { 'facile': 1, 'moyen': 2, 'difficile': 3 };
    seed = baseSeed * 10 + offsets[difficulte];
}

function seededRandom() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(seededRandom() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function isValid(board, row, col, num) {
    for (let i = 0; i < 9; i++) {
        if (board[row][i] === num || board[i][col] === num) return false;
    }
    let startRow = Math.floor(row / 3) * 3;
    let startCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[startRow + i][startCol + j] === num) return false;
        }
    }
    return true;
}

function generateFullBoard() {
    let board = Array.from({length: 9}, () => Array(9).fill(0));
    function solve() {
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (board[r][c] === 0) {
                    let nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
                    shuffle(nums);
                    for (let num of nums) {
                        if (isValid(board, r, c, num)) {
                            board[r][c] = num;
                            if (solve()) return true;
                            board[r][c] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }
    solve();
    return board;
}

function createPuzzle(board, difficulte) {
    let puzzle = JSON.parse(JSON.stringify(board));
    let configCases = { 'facile': 35, 'moyen': 46, 'difficile': 56 };
    let cellsToRemove = configCases[difficulte];
    
    while (cellsToRemove > 0) {
        let r = Math.floor(seededRandom() * 9);
        let c = Math.floor(seededRandom() * 9);
        if (puzzle[r][c] !== 0) {
            puzzle[r][c] = 0;
            cellsToRemove--;
        }
    }
    return puzzle;
}

function chargerJeu(difficulte) {
    currentDifficulty = difficulte;
    celluleSelectionnee = null;
    
    document.querySelectorAll('.difficulty-selector button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`btn-${difficulte}`).classList.add('active');
    
    document.getElementById('victory-message').style.display = 'none';
    clearInterval(timerInterval);
    startTime = Date.now();
    updateTimer();
    timerInterval = setInterval(updateTimer, 1000);

    setSeed(difficulte);
    fullBoard = generateFullBoard();
    puzzleBoard = createPuzzle(fullBoard, difficulte);
    
    construireUI();
}

function construireUI() {
    const boardDiv = document.getElementById('board');
    boardDiv.innerHTML = '';

    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            let cellDiv = document.createElement('div');
            cellDiv.className = 'cell';
            let input = document.createElement('input');
            input.type = 'text';
            input.maxLength = 1;
            input.setAttribute('inputmode', 'none'); // Empêche l'ouverture du clavier mobile
            
            if (puzzleBoard[r][c] !== 0) {
                input.value = puzzleBoard[r][c];
                input.readOnly = true;
            } else {
                // Gestion de la sélection de case
                input.addEventListener('click', function() {
                    deselectionnerToutes();
                    this.classList.add('selected');
                    celluleSelectionnee = this;
                });

                // Compatibilité avec le clavier physique (bureau)
                input.addEventListener('keydown', function(e) {
                    if (/[1-9]/.test(e.key)) {
                        this.value = e.key;
                        checkWin();
                        e.preventDefault();
                    } else if (e.key === 'Backspace' || e.key === 'Delete') {
                        this.value = '';
                        e.preventDefault();
                    }
                });
            }

            cellDiv.appendChild(input);
            boardDiv.appendChild(cellDiv);
        }
    }
}

// --- ACTIONS DU PAVÉ NUMÉRIQUE ---
function saisirChiffre(num) {
    if (celluleSelectionnee && !celluleSelectionnee.readOnly) {
        celluleSelectionnee.value = num;
        checkWin();
    }
}

function effacerCase() {
    if (celluleSelectionnee && !celluleSelectionnee.readOnly) {
        celluleSelectionnee.value = '';
    }
}

function deselectionnerToutes() {
    document.querySelectorAll('.sudoku-board input').forEach(inp => inp.classList.remove('selected'));
    celluleSelectionnee = null;
}

function clearAll() {
    let inputs = document.querySelectorAll('input:not([readonly])');
    inputs.forEach(input => input.value = '');
    deselectionnerToutes();
}

function checkWin() {
    let inputs = document.querySelectorAll('input');
    let currentBoard = Array.from({length: 9}, () => Array(9).fill(0));
    let index = 0;
    
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            let val = parseInt(inputs[index].value);
            if (isNaN(val) || val < 1 || val > 9) return;
            currentBoard[r][c] = val;
            index++;
        }
    }
    
    for (let i = 0; i < 9; i++) {
        let rowSet = new Set();
        let colSet = new Set();
        let gridSet = new Set();
        for (let j = 0; j < 9; j++) {
            rowSet.add(currentBoard[i][j]);
            colSet.add(currentBoard[j][i]);
            let r = Math.floor(i / 3) * 3 + Math.floor(j / 3);
            let c = (i % 3) * 3 + (j % 3);
            gridSet.add(currentBoard[r][c]);
        }
        if (rowSet.size !== 9 || colSet.size !== 9 || gridSet.size !== 9) return;
    }

    // Victoire
    clearInterval(timerInterval);
    deselectionnerToutes();
    let timeTaken = document.getElementById('timer').innerText;
    inputs.forEach(input => input.readOnly = true);
    
    let diffNom = currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1);
    let msg = document.getElementById('victory-message');
    msg.innerText = `🎉 Félicitations ! Vous avez résolu le Sudoku du jour (${diffNom}) en ${timeTaken}.`;
    msg.style.display = 'block';
}

// --- DÉMARRAGE ---
appliquerThemeDuJour();
chargerJeu('moyen');