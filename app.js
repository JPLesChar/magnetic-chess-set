"use strict";

const boardElement = document.querySelector("#board");
const statusElement = document.querySelector("#status");
const spareCountElement = document.querySelector("#spare-count");
const whiteReserveElement = document.querySelector("#white-reserve");
const blackReserveElement = document.querySelector("#black-reserve");
const whiteEmptyElement = document.querySelector("#white-empty");
const blackEmptyElement = document.querySelector("#black-empty");
const mirrorButton = document.querySelector("#mirror-pieces");
const reverseButton = document.querySelector("#revert-board");

const symbols = {
  white: { king: "♔", queen: "♕", rook: "♖", bishop: "♗", knight: "♘", pawn: "♙" },
  black: { king: "♚", queen: "♛", rook: "♜", bishop: "♝", knight: "♞", pawn: "♟" },
};
const backRank = ["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"];
let pieces = [];
let selectedPieceId = null;
let nextId = 1;
let mirrorBlack = false;
let boardReversed = false;

function makePiece(color, type, square) {
  return { id: String(nextId++), color, type, square };
}

function startingPosition() {
  nextId = 1;
  const result = [];
  for (let i = 0; i < 8; i++) {
    const file = String.fromCharCode(97 + i);
    result.push(makePiece("black", backRank[i], `${file}8`));
    result.push(makePiece("black", "pawn", `${file}7`));
    result.push(makePiece("white", "pawn", `${file}2`));
    result.push(makePiece("white", backRank[i], `${file}1`));
  }
  return result;
}

function pieceAt(square) {
  return pieces.find((piece) => piece.square === square);
}

function describe(piece) {
  return `${piece.color} ${piece.type}`;
}

function pieceHtml(piece) {
  const colorClass = piece.color === "white" ? "white-piece" : "black-piece";
  const mirroredClass = piece.color === "black" && mirrorBlack ? " is-mirrored" : "";
  return `<button class="piece ${colorClass}${mirroredClass}" type="button" draggable="true" data-piece-id="${piece.id}" aria-label="${describe(piece)}">${symbols[piece.color][piece.type]}</button>`;
}

function renderBoard() {
  const files = boardReversed ? "hgfedcba" : "abcdefgh";
  const ranks = boardReversed ? [1, 2, 3, 4, 5, 6, 7, 8] : [8, 7, 6, 5, 4, 3, 2, 1];
  const labelRank = boardReversed ? 8 : 1;
  let html = "";

  for (const rank of ranks) {
    for (const file of files) {
      const square = `${file}${rank}`;
      const fileIndex = file.charCodeAt(0) - 97;
      const piece = pieceAt(square);
      const color = (fileIndex + rank) % 2 === 0 ? "light" : "dark";
      const selected = piece?.id === selectedPieceId ? " is-selected" : "";
      html += `<div class="square ${color}${selected}" role="gridcell" data-square="${square}" aria-label="${square}${piece ? `, ${describe(piece)}` : ", empty"}" tabindex="0">${piece ? pieceHtml(piece) : ""}${rank === labelRank ? `<span class="square-label" aria-hidden="true">${file}</span>` : ""}</div>`;
    }
  }
  boardElement.innerHTML = html;
}

function renderReserve(color, container, emptyMessage) {
  const reserve = pieces.filter((piece) => piece.color === color && piece.square === null);
  reserve.sort((a, b) => a.type.localeCompare(b.type));
  container.innerHTML = reserve.map(pieceHtml).join("");
  emptyMessage.classList.toggle("is-visible", reserve.length === 0);
  return reserve.length;
}

function render() {
  renderBoard();
  const count = renderReserve("white", whiteReserveElement, whiteEmptyElement)
    + renderReserve("black", blackReserveElement, blackEmptyElement);
  spareCountElement.textContent = String(count);
  boardElement.setAttribute("aria-label", boardReversed ? "Chessboard, black side at bottom" : "Chessboard, white side at bottom");
}

function setStatus(message) {
  statusElement.textContent = message;
}

function placePiece(id, square) {
  const moving = pieces.find((piece) => piece.id === id);
  if (!moving) return;
  const displaced = pieceAt(square);
  if (displaced && displaced.id !== moving.id) displaced.square = null;
  moving.square = square;
  selectedPieceId = null;
  setStatus(`${describe(moving)} placed on ${square}.`);
  render();
}

function handleBoardClick(event) {
  const squareElement = event.target.closest("[data-square]");
  if (!squareElement) return;
  const square = squareElement.dataset.square;
  const clicked = pieceAt(square);
  if (selectedPieceId) {
    if (clicked?.id === selectedPieceId) {
      selectedPieceId = null;
      setStatus("Selection cleared.");
      render();
    } else {
      placePiece(selectedPieceId, square);
    }
  } else if (clicked) {
    selectedPieceId = clicked.id;
    setStatus(`Selected ${describe(clicked)}. Choose a square or drag it.`);
    render();
  }
}

function dragStart(event) {
  const button = event.target.closest("[data-piece-id]");
  if (!button) return;
  event.dataTransfer.setData("text/plain", button.dataset.pieceId);
  event.dataTransfer.effectAllowed = "move";
}

boardElement.addEventListener("click", handleBoardClick);
boardElement.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    const square = event.target.closest("[data-square]");
    if (square) { event.preventDefault(); square.click(); }
  }
});
boardElement.addEventListener("dragstart", dragStart);
boardElement.addEventListener("dragover", (event) => {
  if (event.target.closest("[data-square]")) event.preventDefault();
});
boardElement.addEventListener("drop", (event) => {
  const square = event.target.closest("[data-square]");
  if (!square) return;
  event.preventDefault();
  placePiece(event.dataTransfer.getData("text/plain"), square.dataset.square);
});

for (const [container, color] of [[whiteReserveElement, "white"], [blackReserveElement, "black"]]) {
  container.addEventListener("click", (event) => {
    const button = event.target.closest("[data-piece-id]");
    const piece = button && pieces.find((item) => item.id === button.dataset.pieceId);
    if (piece) {
      selectedPieceId = piece.id;
      setStatus(`Selected ${describe(piece)}. Choose a square or drag it.`);
      render();
    }
  });
  container.addEventListener("dragstart", dragStart);
  container.addEventListener("dragover", (event) => event.preventDefault());
  container.addEventListener("drop", (event) => {
    event.preventDefault();
    const piece = pieces.find((item) => item.id === event.dataTransfer.getData("text/plain"));
    if (piece && piece.color === color) {
      piece.square = null;
      selectedPieceId = null;
      setStatus(`${describe(piece)} moved to spare pieces.`);
      render();
    }
  });
}

document.querySelector("#clear-board").addEventListener("click", () => {
  pieces.forEach((piece) => { piece.square = null; });
  selectedPieceId = null;
  setStatus("Board cleared. All pieces are in the spare trays.");
  render();
});
document.querySelector("#reset-board").addEventListener("click", () => {
  pieces = startingPosition();
  selectedPieceId = null;
  setStatus("Starting position restored.");
  render();
});
mirrorButton.addEventListener("click", () => {
  mirrorBlack = !mirrorBlack;
  mirrorButton.setAttribute("aria-pressed", String(mirrorBlack));
  setStatus(mirrorBlack ? "Black pieces are upside down." : "Black pieces are upright.");
  render();
});
reverseButton.addEventListener("click", () => {
  boardReversed = !boardReversed;
  reverseButton.setAttribute("aria-pressed", String(boardReversed));
  setStatus(boardReversed ? "Board reversed. Black pieces are at the bottom." : "Board restored. White pieces are at the bottom.");
  render();
});

pieces = startingPosition();
render();
