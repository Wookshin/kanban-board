'use strict'

/* 변수 */
var registerInput = document.querySelector('.register__input');
var registerBtn = document.querySelector('.register__btn');
var boardsContainer = document.querySelector('.boards__container');
var boardHeaders = document.querySelectorAll('.board__header');

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

function addToDoIntoBoard(board, todo) {
  let item = document.createElement('div');
  item.classList.add('item');
  item.classList.add('create');
  item.innerHTML = `
    <span class="item__content">${todo}</span>
    <span class="item__remove"><i class="far fa-trash-alt"></i></span>
  `;

  board.children[1].appendChild(item);
  setTimeout(() => {
    item.classList.remove('create');
  }, 100);   
}

function addToDoBySelector(selector) {
  let todo = registerInput.value;
  if (todo === '') return;
  let firstBoard = document.querySelector(selector);
  addToDoIntoBoard(firstBoard, todo)
  registerInput.value = '';
}

function addToDoByElement(elem) {
  let todo = registerInput.value;
  addToDoIntoBoard(elem, todo)
  registerInput.value = '';
}

function addToDo() {  
  var activeBoard = document.querySelector('.board__header.active');

  if (activeBoard == null) {
    addToDoBySelector('.board');
  } else {
    addToDoByElement(activeBoard.parentElement);
  }
}