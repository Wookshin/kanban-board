'use strict'

/* 변수 */
var registerInput = document.querySelector('.register__input');
var registerBtn = document.querySelector('.register__btn');
var boardsContainer = document.querySelector('.boards__container');
var boardHeaders = document.querySelectorAll('.board__header');
var _dragged;
var _dropzone;

/* 텍스트 박스에 To-do를 입력 후 엔터를 쳤을 때 active Board Or 첫번째 Board에 반영된다 */
registerInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    addToDo();
  }
})

/* 텍스트 박스에 To-do를 입력 후 Add 버튼을 눌렀을 때 active Board Or 첫번째 Board에 반영된다 */
registerBtn.addEventListener('click', () => {
  addToDo();
})

/* 휴지통 아이콘을 누르면 해당 아이템이 삭제된다 */
boardsContainer.addEventListener('click', e => {
  if (e.target.matches('.fa-trash-alt')) {
    var item = e.target.parentElement.parentElement;
    console.log(e.target);
    item.parentElement.removeChild(item);
  }
})

/* Board Title을 클릭하면 해당 Board가 Active 상태가 된다 */
/* 이미 Active 상태인 Board가 있다면 Active 상태를 없앤다 */
boardsContainer.addEventListener('click', e => {
  if (e.target.matches('.board__header')) {
    boardHeaders.forEach(boardHeader => {
      if (boardHeader === e.target) {
        e.target.classList.toggle('active');
      } else {
        boardHeader.classList.remove('active')
      }
    });
  }
})

/* Todo를 드래그하여 다른 Board로 옮길 수 있다 */ 
boardsContainer.addEventListener('dragstart', e => {
  _dragged = e.target;  
  e.target.style.opacity = .5;
}, false);

boardsContainer.addEventListener('dragend', e => {
  e.target.style.opacity = "";
}, false);

boardsContainer.addEventListener('dragover', e => {
  e.preventDefault();
}, false);

boardsContainer.addEventListener('dragenter', e => {
  e.preventDefault();
  console.log('dragenter1', e.target);
  var target = getEnterDropZone(e.target);
  console.log('dragenter2', target);
  
  if (!target || target === _dragged.parentElement) {
    _dropzone?.classList.remove('dragging');
    _dropzone = null;
    return;
  }

  _dropzone?.classList.remove('dragging');
  _dropzone = target;
  target.classList.add('dragging');
}, false);

boardsContainer.addEventListener('dragleave', e => {
  e.preventDefault();
}, false);

boardsContainer.addEventListener('drop', e => {
  e.preventDefault();
  console.log("drop");
  _dropzone?.classList.remove('dragging');
  if (!_dropzone) {
    return;
  }
  console.log("_dragged", _dragged);
  console.log("_dropzone", _dropzone);

  addTodoIntoBoard(_dropzone, _dragged);
  _dragged = null;
  _dropzone = null;
}, false);

function addTodoIntoBoard(board, todo) {
  let item = typeof todo === 'string' ? createTodoItem(todo) : todo;
  let emptyItem = board.lastElementChild;
  board.insertBefore(item, emptyItem);
  setTimeout(() => {
    item.classList.remove('create');
  }, 100);   
}

function createTodoItem(todo) {
  let item = document.createElement('div');
  item.classList.add('item');
  item.classList.add('create');
  item.draggable = true;
  item.innerHTML = `
    <span class="item__content">${todo}</span>
    <span class="item__remove"><i class="far fa-trash-alt"></i></span>
  `;
  return item;
}

function addTodoBySelector(selector) {
  let todo = registerInput.value;
  if (todo === '') return;
  let firstBoard = document.querySelector(selector);
  addTodoIntoBoard(firstBoard, todo)
  registerInput.value = '';
}

function addTodoByElement(elem) {
  let todo = registerInput.value;
  if (todo === '') return;
  addTodoIntoBoard(elem, todo)
  registerInput.value = '';
}

function addToDo() {  
  var activeHeader = document.querySelector('.board__header.active');

  if (activeHeader == null) {
    addTodoBySelector('.board__items');
  } else {
    addTodoByElement(activeHeader.parentElement.children[1]);
  }
}

function getEnterDropZone(target) {
  let dropZone = null; 

  if (target.matches('.board')) {
    dropZone = target.children[1];
  }
  else if (target.matches('.board__items')) {
    dropZone = target;
  } else if (target.matches('.item')) {
    dropZone = target.parentElement;
  } else if (target.matches('.item__content')
  || target.matches('.item__remove')) {
    dropZone = target.parentElement.parentElement;
  } else if (target.matches('.fa-trash-alt')) {
    dropZone = target.parentElement.parentElement.parentElement;
  } 

  return dropZone;
}

function getLeaveDropZone(target) {
  let dropzone = null;

  if (target.matches('.dragging')) {
    dropzone = target;
  } else if (target.matches('.board__header')) {
    dropzone = target.parentElement.children[1];
  } else if (target.matches('.board')) {
    dropzone = target.children[1];
  }

  return dropzone;
}

