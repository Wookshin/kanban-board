"use strict";

/* 변수 */
var registerInput = document.querySelector(".register__input");
var registerBtn = document.querySelector(".register__btn");
var boardsContainer = document.querySelector(".boards__container");
var boardHeaders = document.querySelectorAll(".board__header");
var boardsBtns = document.querySelector(".boards__btns");
var boards = document.querySelectorAll(".board");
var boardPlus = document.querySelector(".board-plus");
var _dragged;
var _dropzone;

/* localStorage에 저장된 datas가 있다면 해당 datas를 반영한다. */
if (localStorage.key("datas")) {
  loadDatas();
}

/* 텍스트 박스에 To-do를 입력 후 엔터를 쳤을 때 active Board Or 첫번째 Board에 반영된다 */
registerInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    addTodo();
    saveDatas();
  }
});

/* 텍스트 박스에 To-do를 입력 후 Add 버튼을 눌렀을 때 active Board Or 첫번째 Board에 반영된다 */
registerBtn.addEventListener("click", () => {
  addTodo();
  saveDatas();
});

/* 휴지통 아이콘을 누르면 해당 아이템이 삭제된다 */
boardsContainer.addEventListener("click", (e) => {
  if (e.target.matches(".fa-trash-alt")) {
    var item = e.target.parentElement.parentElement;
    item.parentElement.removeChild(item);
    saveDatas();
  }
});

/* Board를 클릭하면 해당 Board가 Active 상태가 된다 */
/* 이미 Active 상태인 Board가 있다면 Active 상태를 없앤다 */
boardsContainer.addEventListener("click", (e) => {
  let target = e.target;
  if (target.matches(".board__header") || target.matches(".board__items")) {
    boards.forEach((board) => {
      if (board === target.parentElement) {
        board.classList.toggle("active");
      } else {
        board.classList.remove("active");
      }
    });
  }
});

/* Board를 추가하거나 삭제할 수 있다 */
boardsBtns.addEventListener("click", (e) => {
  var target = e.target;

  if (
    target.matches(".btns-add__icon") ||
    target.matches(".boards__btns-add")
  ) {
    addBoard();
    saveDatas();
    updateGlobalVariable();
  } else if (
    target.matches(".btns-minus__icon") ||
    target.matches(".boards__btns-remove")
  ) {
    removeBoard();
    saveDatas();
    updateGlobalVariable();
  }
});

/* board title을 클릭하면 title 내용을 변경할 수 있다 */
boardsContainer.addEventListener("click", (e) => {
  let target = e.target;
  if (target.matches(".header__title")) {
    target.classList.add("focused");
  }
});

boardsContainer.addEventListener("keydown", (e) => {
  let target = e.target;
  if (target.matches(".header__title")) {
    if (e.key == "Enter") {
      target.blur();
    }
  }
});

boardsContainer.addEventListener(
  "blur",
  (e) => {
    let target = e.target;
    if (target.matches(".header__title")) {
      target.classList.remove("focused");
      saveDatas();
    }
  },
  true
);

/* board 플러스 버튼을 클릭하면 새로운 보드가 생성된다 */
boardsContainer.addEventListener("click", (e) => {
  let target = e.target;
  if (target.matches(".board-plus__btn__icon")) {
    target = target.parentElement.parentElement;
  }

  if (target.matches(".board-plus")) {
    addBoard();
    saveDatas();
    updateGlobalVariable();
  }
});

/* board header에 있는 X 버튼을 누르면 해당 board가 삭제된다 */
boardsContainer.addEventListener("click", (e) => {
  let target = e.target;
  if (target.matches(".header__remove") || target.matches(".fa-times")) {
    let board = null;
    if (target.matches(".header__remove")) {
      board = target.parentElement.parentElement;
    } else if (target.matches(".fa-times")) {
      board = target.parentElement.parentElement.parentElement;
    }

    board.classList.add("active");
    removeBoard();
    saveDatas();
    updateGlobalVariable();
  }
});

/* Todo를 클릭하면 finished 처리가 된다 */
boardsContainer.addEventListener("click", (e) => {
  let target = e.target;
  if (target.matches(".item:not(.empty)")) {
    target.classList.toggle("finished");
    saveDatas();
  }
});

/* 빈공간의 Todo 플러스를 클릭하면 해당 Board가 Active 되고, Todo 입력란으로 Focus 된다. */
boardsContainer.addEventListener("click", (e) => {
  let target = e.target;

  if (target.matches(".item-empty__btn__icon")) {
    target = target.parentElement.parentElement;
  }

  if (target.matches(".item.empty")) {
    let activeBoard = target.parentElement.parentElement;
    boards.forEach((board) => {
      if (board === activeBoard) {
        board.classList.toggle("active");
      } else {
        board.classList.remove("active");
      }
    });

    registerInput.focus();
  }
});

/* Todo를 드래그하여 다른 Board로 옮길 수 있다 */
boardsContainer.addEventListener(
  "dragstart",
  (e) => {
    _dragged = e.target;
    e.target.style.opacity = 0.5;
  },
  false
);

boardsContainer.addEventListener(
  "dragend",
  (e) => {
    e.target.style.opacity = "";
  },
  false
);

boardsContainer.addEventListener(
  "dragover",
  (e) => {
    e.preventDefault();
  },
  false
);

boardsContainer.addEventListener(
  "dragenter",
  (e) => {
    e.preventDefault();
    console.log("dragenter1", e.target);
    var target = getDropZone(e.target);
    console.log("dragenter2", target);

    if (!target || target === _dragged.parentElement) {
      _dropzone?.classList.remove("dragging");
      _dropzone = null;
      return;
    }

    _dropzone?.classList.remove("dragging");
    _dropzone = target;
    target.classList.add("dragging");
  },
  false
);

boardsContainer.addEventListener(
  "dragleave",
  (e) => {
    e.preventDefault();
  },
  false
);

boardsContainer.addEventListener(
  "drop",
  (e) => {
    e.preventDefault();
    console.log("drop");
    _dropzone?.classList.remove("dragging");
    if (!_dropzone) {
      return;
    }

    insertTodoIntoBoard(_dropzone, _dragged);
    saveDatas();
    _dragged = null;
    _dropzone = null;
  },
  false
);

function insertTodoIntoBoard(board, todo) {
  let item = typeof todo === "string" ? createTodoItem(todo) : todo;
  let boardItems = board.querySelector(".board__items");
  let emptyItem = boardItems.querySelector(".item.empty");
  boardItems.insertBefore(item, emptyItem);
  setTimeout(() => {
    item.classList.remove("create");
  }, 100);
}

function createTodoItem(todo) {
  let item = document.createElement("div");
  item.classList.add("item");
  item.classList.add("create");
  item.draggable = true;
  item.innerHTML = `
    <span class="item__content">${todo}</span>
    <span class="item__remove"><i class="far fa-trash-alt"></i></span>
  `;
  return item;
}

function addTodo() {
  let todo = registerInput.value;
  if (todo === "") {
    return;
  }

  var activeBoard = getActiveBoard();
  insertTodoIntoBoard(activeBoard, todo);
  registerInput.value = "";
}

function getActiveBoard() {
  var activeBoard = document.querySelector(".board.active");

  if (activeBoard == null) {
    activeBoard = document.querySelector(".board");
  }

  return activeBoard;
}

function getDropZone(target) {
  let dropZone = null;

  if (target.matches(".board")) {
    dropZone = target;
  } else if (target.matches(".board__items")) {
    dropZone = target.parentElement;
  } else if (target.matches(".item")) {
    dropZone = target.parentElement.parentElement;
  } else if (
    target.matches(".item__content") ||
    target.matches(".item__remove")
  ) {
    dropZone = target.parentElement.parentElement.parentElement;
  } else if (target.matches(".fa-trash-alt")) {
    dropZone = target.parentElement.parentElement.parentElement.parentElement;
  }

  return dropZone;
}

function getLeaveDropZone(target) {
  let dropzone = null;

  if (target.matches(".dragging")) {
    dropzone = target;
  } else if (target.matches(".board__header")) {
    dropzone = target.parentElement.children[1];
  } else if (target.matches(".board")) {
    dropzone = target.children[1];
  }

  return dropzone;
}

function addBoard() {
  var board = document.createElement("div");
  board.classList.add("board");
  board.innerHTML = `
    <div class="board__header">
      <span class="header__title" contenteditable="true">New Board</span>
      <button class="header__remove"><i class="fas fa-times"></i></button></div>
    <div class="board__items">
      <div class="item empty" >
        <button class="item-empty__btn">
          <i class="item-empty__btn__icon fas fa-plus-circle"></i>
        </button>
      </div>
    </div>
  `;

  boardsContainer.insertBefore(board, boardPlus);
}

function removeBoard() {
  var activeBoard = document.querySelector(".board.active");
  if (activeBoard == null) {
    return;
  }
  boardsContainer.removeChild(activeBoard);
}

function updateGlobalVariable() {
  boardHeaders = document.querySelectorAll(".board__header");
  boards = document.querySelectorAll(".board");
}

function saveDatas() {
  var datas = { boards: [] };
  boards.forEach((board) => {
    let data = { title: "", items: [] };
    data.title = board.querySelector(".header__title").textContent;
    let items = board.querySelectorAll(".item:not(.empty)");
    items.forEach((item) => {
      data.items.push({
        content: item.firstElementChild.textContent,
        finished: item.classList.contains("finished"),
      });
    });
    datas.boards.push(data);
  });

  localStorage.setItem("datas", JSON.stringify(datas));
}

function loadDatas() {
  var datas = JSON.parse(localStorage.getItem("datas"));
  boardsContainer.innerHTML = `
    ${datas.boards
      .map(
        (board) => `
      <div class="board">
          <div class="board__header"><span class="header__title" contenteditable="true">${
            board.title
          }</span><button class="header__remove"><i class="fas fa-times"></i></button></div>
          <div class="board__items">
            ${board.items
              .map(
                (item) => `
            <div class="item ${
              item.finished ? "finished" : ""
            }" draggable="true">
              <span class="item__content">${item.content}</span>
              <span class="item__remove"><i class="far fa-trash-alt"></i></span>
            </div>  
            `
              )
              .join("")}
            <div class="item empty" >
              <button class="item-empty__btn">
                <i class="item-empty__btn__icon fas fa-plus-circle"></i>
              </button>
            </div>
          </div>
        </div>
    `
      )
      .join("")}
    <div class="board-plus">
      <button class="board-plus__btn">
        <i class="fas fa-plus-circle"></i>
      </button>
    </div>
  `;

  updateAllGlobalVariable();
}

function updateAllGlobalVariable() {
  boardsContainer = document.querySelector(".boards__container");
  boardHeaders = document.querySelectorAll(".board__header");
  boardsBtns = document.querySelector(".boards__btns");
  boards = document.querySelectorAll(".board");
  boardPlus = document.querySelector(".board-plus");
}
