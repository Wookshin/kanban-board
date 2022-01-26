"use strict";

/* 변수 */
var registerInput = document.querySelector(".register__input");
var registerBtn = document.querySelector(".register__btn");
var boardsContainer = document.querySelector(".boards__container");
var boardHeaders = document.querySelectorAll(".board__header");
var boards = document.querySelectorAll(".board");
var _dragged;
var _dropzone;

/* 텍스트 박스에 To-do를 입력 후 엔터를 쳤을 때 active Board Or 첫번째 Board에 반영된다 */
registerInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    addTodo();
  }
});

/* 텍스트 박스에 To-do를 입력 후 Add 버튼을 눌렀을 때 active Board Or 첫번째 Board에 반영된다 */
registerBtn.addEventListener("click", () => {
  addTodo();
});

/* 휴지통 아이콘을 누르면 해당 아이템이 삭제된다 */
boardsContainer.addEventListener("click", (e) => {
  if (e.target.matches(".fa-trash-alt")) {
    var item = e.target.parentElement.parentElement;
    console.log(e.target);
    item.parentElement.removeChild(item);
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

/* board title을 클릭하면 title 내용을 변경할 수 있다 */
//https://lasdri.tistory.com/1237 
//blur, keypress 처리하기

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
    var target = getEnterDropZone(e.target);
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
    console.log("_dragged", _dragged);
    console.log("_dropzone", _dropzone);

    insertTodoIntoBoard(_dropzone, _dragged);
    _dragged = null;
    _dropzone = null;
  },
  false
);

function insertTodoIntoBoard(board, todo) {
  let item = typeof todo === "string" ? createTodoItem(todo) : todo;
  let boardItems = board.querySelector('.board__items');
  let emptyItem = boardItems.querySelector('.item.empty');
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
    activeBoard = document.querySelector('.board');
  } 

  return activeBoard;
}

function getEnterDropZone(target) {
  let dropZone = null;

  if (target.matches(".board")) {
    dropZone = target.children[1];
  } else if (target.matches(".board__items")) {
    dropZone = target;
  } else if (target.matches(".item")) {
    dropZone = target.parentElement;
  } else if (
    target.matches(".item__content") ||
    target.matches(".item__remove")
  ) {
    dropZone = target.parentElement.parentElement;
  } else if (target.matches(".fa-trash-alt")) {
    dropZone = target.parentElement.parentElement.parentElement;
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
