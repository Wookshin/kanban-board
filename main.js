'use strict'
/* 텍스트 박스에 To-do를 입력 후 엔터를 쳤을 때 첫번째 Board에 반영된다 */
var registerInput = document.querySelector('.register__input');
registerInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    addToDoAtFirstBoard();
  }
})

/* 텍스트 박스에 To-do를 입력 후 Add 버튼을 눌렀을 때 첫번째 Board에 반영된다 */
var registerBtn = document.querySelector('.register__btn');
registerBtn.addEventListener('click', () => {
  addToDoAtFirstBoard();
})

function addToDoIntoBoard(board, todo) {
  let item = document.createElement('div');
  item.classList.add('item');
  item.classList.add('create');
  item.innerHTML = `
    <span class="item__content">${todo}</span>
    <span><i class="far fa-trash-alt"></i></span>
  `;

  board.children[1].appendChild(item);
  setTimeout(() => {
    item.classList.remove('create');
  }, 100); 
  
}

function addToDoAtFirstBoard() {
  let todo = registerInput.value;
  let firstBoard = document.querySelector('.board');
  addToDoIntoBoard(firstBoard, todo)
  registerInput.value = '';
}