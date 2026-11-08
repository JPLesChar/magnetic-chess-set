"use strict";

const boardElement = document.querySelector("#board");
const statusElement = document.querySelector("#status");
const spareCountElement = document.querySelector("#spare-count");
const whiteReserveElement = document.querySelector("#white-reserve");
const blackReserveElement = document.querySelector("#black-reserve");
const whiteEmptyElement = document.querySelector("#white-empty");
const blackEmptyElement = document.querySelector("#black-empty");

const pieceSymbols = {
  white: {
    king: "♔",
    queen: "♕",
    rook: "♖",
    bishop: "♗",
    knight: "♘",
    pawn: "♙",
  },
  black: {
    king: "♚",
    queen: "♛",
    rook: "♜",
    bishop: "♝",
    knight: "♞",
    pawn: "♟",
  },
};

const pieceNames = {
  king: "king",
  queen: "queen",
  rook: "rook",
  bishop: "bishop",
  knight: "knight",
  pawn: "pawn",
};

let pieces = [];
let selectedPieceId = null;
let nextPieceId = 1;

function makePiece(color, type, square = null) {
  return {
    id: String(nextPieceId++),
    color,
    type,
    square,
  };
}

function createStartingPosition() {
  nextPieceId = 1;

  const startingPieces = [];
  const backRank = ["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"];

  for (let file = 0; file < 8; file += 1) {
    startingPieces.push(makePiece("black", backRank[file], `${String.fromCharCode(97 + file)}8`));
    startingPieces.push(makePiece("black", "pawn", `${String.fromCharCode(97 + file)}7`));
    startingPieces.push(makePiece("white", "pawn", `${String.fromCharCode(97 + file)}2`));
    startingPieces.push(makePiece("white", backRank[file], `${String.fromCharCode(97 + file)}1`));
  }

  return startingPieces;
}

function pieceAt(square) {
  return pieces.find((piece) => piece.square === square);
}

function pieceDescription(piece) {
  return `${piece.color} ${pieceNames[piece.type]}`;
}

function pieceMarkup(piece, inReserve = false) {
  const description = pieceDescription(piece);
  const colorClass = piece.color === "white" ? "white-piece" : "black-piece";

  return `
    <button
      class="piece ${colorClass}"
      type="button"
      draggable="true"
      data-piece-id="${piece.id}"
      aria-label="${description}"
      title="${description} — drag to move"
    >${pieceSymbols[piece.color][piece.type]}</button>
  `;
}

function renderBoard() {
  const files = "abcdefgh";
  let markup = "";

  for (let rank = 8; rank >= 1; rank -= 1) {
    for (let fileIndex = 0; fileIndex < 8; fileIndex += 1) {
      const file = files[fileIndex];
      const square = `${file}${rank}`;
      const isLight = (fileIndex + rank) % 2 === 0;
      const piece = pieceAt(square);
      const classes = ["square", isLight ? "light" : "dark"];

      if (piece?.id === selectedPieceId) {
        classes.push("is-selected");
      }

      markup += `
        <div
          class="${classes.join(" ")}"
          role="gridcell"
          data-square="${square}"
          aria-label="${square}${piece ? `, ${pieceDescription(piece)}` : ", empty"}"
          tabindex="0"
        >
          ${piece ? pieceMarkup(piece) : ""}
          ${rank === 1 ? `<span class="square-label" aria-hidden="true">${file}</span>` : ""}
        </div>
      `;
    }
  }

  boardElement.innerHTML = markup;
}

function renderReserve(color, container, emptyMessage) {
  const reservePieces = pieces
    .filter((piece) => piece.color === color && piece.square === null)
    .sort((a, b) => a.type.localeCompare(b.type));

  container.innerHTML = reservePieces.map((piece) => pieceMarkup(piece, true)).join("");
  emptyMessage.classList.toggle("is-visible", reservePieces.length === 0);
  return reservePieces.length;
}

function render() {
  renderBoard();

  const whiteCount = renderReserve("white", whiteReserveElement, whiteEmptyElement);
  const blackCount = renderReserve("black", blackReserveElement, blackEmptyElement);
  spareCountElement.textContent = String(whiteCount + blackCount);

  const selectedPiece = pieces.find((piece) => piece.id === selectedPieceId);
  boardElement.setAttribute(
    "aria-label",
    selectedPiece
      ? `Chessboard. Selected ${pieceDescription(selectedPiece)}. Choose a destination square.`
      : "Chessboard",
  );
}

function setStatus(message) {
  statusElement.textContent = message;
}

function selectPiece(piece) {
  selectedPieceId = piece.id;
  setStatus(`Selected ${pieceDescription(piece)}. Choose a square or drag it.`);
  render();
}

function placePiece(pieceId, square) {
  const movingPiece = pieces.find((piece) => piece.id === pieceId);
  if (!movingPiece) return;

  const displacedPiece = pieceAt(square);
  if (displacedPiece && displacedPiece.id !== movingPiece.id) {
    displacedPiece.square = null;
  }

  movingPiece.square = square;
  selectedPieceId = null;
  setStatus(`${pieceDescription(movingPiece)} placed on ${square}.`);
  render();
}

function handleBoardClick(event) {
  const squareElement = event.target.closest("[data-square]");
  if (!squareElement) return;

  const square = squareElement.dataset.square;
  const clickedPiece = pieceAt(square);

  if (selectedPieceId) {
    if (clickedPiece?.id === selectedPieceId) {
      selectedPieceId = null;
      setStatus("Selection cleared. Select a piece to move it.");
      render();
      return;
    }

    placePiece(selectedPieceId, square);
    return;
  }

  if (clickedPiece) {
    selectPiece(clickedPiece);
  }
}

function handleReserveClick(event, color) {
  const pieceButton = event.target.closest("[data-piece-id]");
  if (!pieceButton) return;

  const piece = pieces.find((item) => item.id === pieceButton.dataset.pieceId);
  if (piece && piece.color === color) {
    selectPiece(piece);
  }
}

function handleDragStart(event) {
  const pieceButton = event.target.closest("[data-piece-id]");
  if (!pieceButton) return;

  event.dataTransfer.setData("text/plain", pieceButton.dataset.pieceId);
  event.dataTransfer.effectAllowed = "move";
}

function handleDragOver(event) {
  const squareElement = event.target.closest("[data-square]");
  if (!squareElement) return;

  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
  squareElement.classList.add("is-drop-target");
}

function handleDragLeave(event) {
  const squareElement = event.target.closest("[data-square]");
  if (squareElement && !squareElement.contains(event.relatedTarget)) {
    squareElement.classList.remove("is-drop-target");
  }
}

function handleDrop(event) {
  const squareElement = event.target.closest("[data-square]");
  if (!squareElement) return;

  event.preventDefault();
  squareElement.classList.remove("is-drop-target");

  const pieceId = event.dataTransfer.getData("text/plain");
  if (pieceId) {
    placePiece(pieceId, squareElement.dataset.square);
  }
}

function handleReserveDrop(event, color) {
  event.preventDefault();

  const pieceId = event.dataTransfer.getData("text/plain");
  const piece = pieces.find((item) => item.id === pieceId);

  if (!piece || piece.color !== color) return;

  piece.square = null;
  selectedPieceId = null;
  setStatus(`${pieceDescription(piece)} moved to the ${color} spare pieces.`);
  render();
}

function handleSquareKeyboard(event) {
  if (event.key !== "Enter" && event.key !== " ") return;

  const squareElement = event.target.closest("[data-square]");
  if (!squareElement) return;

  event.preventDefault();
  squareElement.click();
}

document.querySelector("#clear-board").addEventListener("click", () => {
  pieces.forEach((piece) => {
    piece.square = null;
  });

  selectedPieceId = null;
  setStatus("Board cleared. All pieces are in the spare trays.");
  render();
});

document.querySelector("#reset-board").addEventListener("click", () => {
  pieces = createStartingPosition();
  selectedPieceId = null;
  setStatus("Starting position restored.");
  render();
});

boardElement.addEventListener("click", handleBoardClick);
boardElement.addEventListener("keydown", handleSquareKeyboard);
boardElement.addEventListener("dragstart", handleDragStart);
boardElement.addEventListener("dragover", handleDragOver);
boardElement.addEventListener("dragleave", handleDragLeave);
boardElement.addEventListener("drop", handleDrop);

whiteReserveElement.addEventListener("click", (event) => handleReserveClick(event, "white"));
blackReserveElement.addEventListener("click", (event) => handleReserveClick(event, "black"));

for (const reserve of [whiteReserveElement, blackReserveElement]) {
  reserve.addEventListener("dragstart", handleDragStart);
}

whiteReserveElement.addEventListener("dragover", (event) => event.preventDefault());
blackReserveElement.addEventListener("dragover", (event) => event.preventDefault());
whiteReserveElement.addEventListener("drop", (event) => handleReserveDrop(event, "white"));
blackReserveElement.addEventListener("drop", (event) => handleReserveDrop(event, "black"));

pieces = createStartingPosition();
render();
