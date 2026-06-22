const COLS = 10;
const ROWS = 20;
const FALL_INTERVAL_MS = 800;
const LINE_SCORES = [0, 100, 300, 500, 800];

const PIECES = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    color: "#00f0f0",
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: "#f0f000",
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: "#a000f0",
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    color: "#00f000",
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    color: "#f00000",
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: "#0000f0",
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: "#f0a000",
  },
};

const PIECE_TYPES = Object.keys(PIECES);

const KEY_HANDLERS = {
  ArrowLeft: () => attemptMove(-1, 0),
  ArrowRight: () => attemptMove(1, 0),
  ArrowDown: () => attemptMove(0, 1),
  ArrowUp: () => attemptRotate(),
  Space: () => hardDrop(),
};

const boardElement = document.getElementById("game-board");
const scoreElement = document.getElementById("score");
const gameStatusElement = document.getElementById("game-status");
const startButton = document.getElementById("start-btn");
const restartButton = document.getElementById("restart-btn");

const cellElements = [];

let board = [];
let currentPiece = null;
let score = 0;
let fallTimerId = null;
let isPlaying = false;
let isGameOverState = false;
let keyboardControlsInitialized = false;

function createEmptyBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

function copyShape(shape) {
  return shape.map((row) => [...row]);
}

function createPiece(type) {
  const { shape, color } = PIECES[type];
  const shapeWidth = shape[0].length;

  return {
    type,
    shape: copyShape(shape),
    color,
    row: 0,
    col: Math.floor((COLS - shapeWidth) / 2),
  };
}

function pickRandomPieceType() {
  const index = Math.floor(Math.random() * PIECE_TYPES.length);
  return PIECE_TYPES[index];
}

function spawnNewPiece() {
  currentPiece = createPiece(pickRandomPieceType());
}

function isInsideBoard(boardRow, boardCol) {
  return boardCol >= 0 && boardCol < COLS && boardRow >= 0 && boardRow < ROWS;
}

function eachOccupiedCell(piece, deltaCol, deltaRow, visitCell) {
  for (let shapeRow = 0; shapeRow < piece.shape.length; shapeRow++) {
    for (let shapeCol = 0; shapeCol < piece.shape[shapeRow].length; shapeCol++) {
      if (!piece.shape[shapeRow][shapeCol]) {
        continue;
      }

      const boardRow = piece.row + shapeRow + deltaRow;
      const boardCol = piece.col + shapeCol + deltaCol;
      const shouldContinue = visitCell(boardRow, boardCol);

      if (shouldContinue === false) {
        return false;
      }
    }
  }

  return true;
}

function canMove(piece, deltaCol, deltaRow, matrix) {
  return eachOccupiedCell(piece, deltaCol, deltaRow, (boardRow, boardCol) => {
    if (!isInsideBoard(boardRow, boardCol)) {
      return false;
    }

    if (matrix[boardRow][boardCol] !== null) {
      return false;
    }
  });
}

function tryMovePiece(deltaCol, deltaRow) {
  if (!currentPiece) {
    return false;
  }

  if (!canMove(currentPiece, deltaCol, deltaRow, board)) {
    return false;
  }

  currentPiece.row += deltaRow;
  currentPiece.col += deltaCol;
  return true;
}

function rotateShape(shape) {
  const rowCount = shape.length;
  const colCount = shape[0].length;
  const rotated = Array.from({ length: colCount }, () => Array(rowCount).fill(0));

  for (let row = 0; row < rowCount; row++) {
    for (let col = 0; col < colCount; col++) {
      rotated[col][rowCount - 1 - row] = shape[row][col];
    }
  }

  return rotated;
}

function tryRotatePiece() {
  if (!currentPiece) {
    return false;
  }

  const rotatedShape = rotateShape(currentPiece.shape);
  const rotatedPiece = {
    ...currentPiece,
    shape: rotatedShape,
  };

  if (!canMove(rotatedPiece, 0, 0, board)) {
    return false;
  }

  currentPiece.shape = rotatedShape;
  return true;
}

function lockPiece(piece) {
  eachOccupiedCell(piece, 0, 0, (boardRow, boardCol) => {
    if (isInsideBoard(boardRow, boardCol)) {
      board[boardRow][boardCol] = piece.color;
    }
  });
}

function isRowFull(row) {
  return row.every((cell) => cell !== null);
}

function addScoreForClearedLines(lineCount) {
  if (lineCount === 0) {
    return;
  }

  score += LINE_SCORES[lineCount] ?? lineCount * 100;
  updateScoreDisplay();
}

function clearLines() {
  let linesCleared = 0;

  for (let row = ROWS - 1; row >= 0; row--) {
    if (!isRowFull(board[row])) {
      continue;
    }

    board.splice(row, 1);
    board.unshift(Array(COLS).fill(null));
    linesCleared++;
    row++;
  }

  addScoreForClearedLines(linesCleared);
  return linesCleared;
}

function isSpawnBlocked() {
  return currentPiece && !canMove(currentPiece, 0, 0, board);
}

function settleActivePiece() {
  lockPiece(currentPiece);
  clearLines();
  spawnNewPiece();

  if (isSpawnBlocked()) {
    triggerGameOver();
    return;
  }

  renderCurrentBoard();
}

function hardDrop() {
  if (!currentPiece || isGameOverState) {
    return;
  }

  while (tryMovePiece(0, 1)) {}

  settleActivePiece();
}

function drawPiece(baseBoard, piece) {
  const displayBoard = baseBoard.map((row) => [...row]);

  eachOccupiedCell(piece, 0, 0, (boardRow, boardCol) => {
    if (isInsideBoard(boardRow, boardCol)) {
      displayBoard[boardRow][boardCol] = piece.color;
    }
  });

  return displayBoard;
}

function renderBoard(displayBoard) {
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const cell = cellElements[row * COLS + col];
      const color = displayBoard[row][col];

      if (color) {
        cell.classList.add("filled");
        cell.style.backgroundColor = color;
      } else {
        cell.classList.remove("filled");
        cell.style.backgroundColor = "";
      }
    }
  }
}

function renderCurrentBoard() {
  renderBoard(drawPiece(board, currentPiece));
}

function attemptMove(deltaCol, deltaRow) {
  if (tryMovePiece(deltaCol, deltaRow)) {
    renderCurrentBoard();
  }
}

function attemptRotate() {
  if (tryRotatePiece()) {
    renderCurrentBoard();
  }
}

function updateScoreDisplay() {
  scoreElement.textContent = String(score);
}

function updateGameStatus() {
  if (!gameStatusElement) {
    return;
  }

  if (isGameOverState) {
    gameStatusElement.textContent = "게임 오버";
    gameStatusElement.classList.add("game-over");
    return;
  }

  gameStatusElement.classList.remove("game-over");
  gameStatusElement.textContent = isPlaying ? "플레이 중" : "준비";
}

function triggerGameOver() {
  isGameOverState = true;
  currentPiece = null;
  stopFallTimer();
  updateGameStatus();
  renderBoard(board);
}

function tick() {
  if (!currentPiece || isGameOverState) {
    return;
  }

  if (tryMovePiece(0, 1)) {
    renderCurrentBoard();
    return;
  }

  settleActivePiece();
}

function clearFallTimer() {
  if (fallTimerId !== null) {
    clearInterval(fallTimerId);
    fallTimerId = null;
  }
}

function stopFallTimer() {
  clearFallTimer();
  isPlaying = false;
  updateGameStatus();
}

function startFallTimer() {
  clearFallTimer();
  isPlaying = true;
  fallTimerId = setInterval(tick, FALL_INTERVAL_MS);
  updateGameStatus();
}

function resetGame() {
  stopFallTimer();
  isGameOverState = false;
  score = 0;
  board = createEmptyBoard();
  currentPiece = createPiece(pickRandomPieceType());
  updateScoreDisplay();
  updateGameStatus();
  renderCurrentBoard();
}

function startGame() {
  if (isPlaying || isGameOverState) {
    return;
  }

  startFallTimer();
}

function restartGame() {
  resetGame();
  startGame();
}

function initBoardCells() {
  boardElement.innerHTML = "";
  cellElements.length = 0;

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.setAttribute("role", "gridcell");
      cell.dataset.row = String(row);
      cell.dataset.col = String(col);
      boardElement.appendChild(cell);
      cellElements.push(cell);
    }
  }
}

function handleKeyDown(event) {
  if (!isPlaying || !currentPiece || isGameOverState) {
    return;
  }

  const handler = KEY_HANDLERS[event.code];
  if (!handler) {
    return;
  }

  event.preventDefault();
  handler();
}

function initKeyboardControls() {
  if (keyboardControlsInitialized) {
    return;
  }

  document.addEventListener("keydown", handleKeyDown);
  keyboardControlsInitialized = true;
}

startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", restartGame);

initBoardCells();
initKeyboardControls();
resetGame();
