'use strict'

/* 변수 */
const _registerInput = document.querySelector('.register__input')
const _registerBtn = document.querySelector('.register__btn')
let _boardsContainer = document.querySelector('.boards__container')
let _boardsBtns = document.querySelector('.boards__btns')
let _boards = document.querySelectorAll('.board')
let _boardPlus = document.querySelector('.board-plus')
let _dragged
let _dropzone
let _snapshot = []
let _currentSnapshotIdx = -1

/* localStorage에 저장된 datas가 있다면 해당 datas를 반영한다. */
if (window.localStorage.getItem('snapshot')) {
  loadSnapshotFromLocalStorage()
}

saveSnapshot()

/* 텍스트 박스에 To-do를 입력 후 엔터를 쳤을 때 active Board Or 첫번째 Board에 반영된다 */
_registerInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    addTodo()
    saveSnapshot()
  }
})

/* 텍스트 박스에 To-do를 입력 후 Add 버튼을 눌렀을 때 active Board Or 첫번째 Board에 반영된다 */
_registerBtn.addEventListener('click', () => {
  addTodo()
  saveSnapshot()
})

/* 텍스트 박스에 focus 되면, 텍스트 박스를 강조한다 */
_registerInput.addEventListener('focus', () => {
  _registerInput.classList.add('focused')
})

_registerInput.addEventListener('blur', () => {
  _registerInput.classList.remove('focused')
})

/* Board를 클릭하면 해당 Board가 Active 상태가 된다 */
/* 이미 Active 상태인 Board가 있다면 Active 상태를 없앤다 */
_boardsContainer.addEventListener('click', e => {
  const target = e.target
  if (target.matches('.board__header') || target.matches('.board__items')) {
    _boards.forEach(board => {
      if (board === target.parentElement) {
        board.classList.toggle('active')
      } else {
        board.classList.remove('active')
      }
    })
  }
})

/* Board를 추가하거나 삭제할 수 있다 */
_boardsBtns.addEventListener('click', e => {
  const target = e.target

  if (
    target.matches('.btns-add__icon') ||
    target.matches('.boards__btns-add')
  ) {
    addBoard()
    updateGlobalVariable()
    saveSnapshot()
  } else if (
    target.matches('.btns-minus__icon') ||
    target.matches('.boards__btns-remove')
  ) {
    removeBoard()
    updateGlobalVariable()
    saveSnapshot()
  }
})

/* undo, redo 아이콘 클릭 시, 이전/이후 설정 값으로 되돌릴 수 있다 */
_boardsBtns.addEventListener('click', e => {
  const target = e.target

  if (
    target.matches('.btns-undo__icon') ||
    target.matches('.boards__btns-undo')
  ) {
    loadSnapshot(_currentSnapshotIdx - 1)
    updateGlobalVariable()
  } else if (
    target.matches('.btns-redo__icon') ||
    target.matches('.boards__btns-redo')
  ) {
    loadSnapshot(_currentSnapshotIdx + 1)
    updateGlobalVariable()
  }
})

/* board title을 클릭하면 title 내용을 변경할 수 있다 */
_boardsContainer.addEventListener('click', e => {
  const target = e.target
  if (target.matches('.header__title')) {
    target.classList.add('focused')
  }
})

_boardsContainer.addEventListener('keydown', e => {
  const target = e.target
  if (target.matches('.header__title')) {
    if (e.key === 'Enter') {
      target.blur()
    }
  }
})

_boardsContainer.addEventListener(
  'blur',
  e => {
    const target = e.target
    if (target.matches('.header__title')) {
      target.classList.remove('focused')
      saveSnapshot()
    }
  },
  true
)

/* board 플러스 버튼을 클릭하면 새로운 보드가 생성된다 */
_boardsContainer.addEventListener('click', e => {
  let target = e.target
  if (target.matches('.board-plus__btn__icon')) {
    target = target.parentElement.parentElement
  }

  if (target.matches('.board-plus')) {
    addBoard()
    updateGlobalVariable()
    saveSnapshot()
  }
})

/* board header에 있는 X 버튼을 누르면 해당 board가 삭제된다 */
_boardsContainer.addEventListener('click', e => {
  const target = e.target

  if (!target.matches('.header__remove') && !target.matches('.fa-times')) {
    return
  }

  let activeBoard = null
  if (target.matches('.header__remove')) {
    activeBoard = target.parentElement.parentElement
  } else if (target.matches('.fa-times')) {
    activeBoard = target.parentElement.parentElement.parentElement
  }

  _boards.forEach(board => {
    if (board === activeBoard) {
      board.classList.toggle('active')
    } else {
      board.classList.remove('active')
    }
  })

  removeBoard()
  updateGlobalVariable()
  saveSnapshot()
})

/* To-do 수정 후 엔터를 쳤을 때 수정된 내용을 반영시킨다 */
_boardsContainer.addEventListener('keydown', e => {
  if (e.target.matches('.item__content')) {
    if (e.key === 'Enter') {
      e.target.blur()
    }
  }
})

_boardsContainer.addEventListener('blur', e => {
  if (e.target.matches('.item__content')) {
    saveSnapshot()
  }
}, true)

/* 체크 박스를 누르면 해당 아이템을 완료 처리한다 */
_boardsContainer.addEventListener('click', e => {
  let target = e.target

  if (target.matches('.item__check__icon')) {
    target = target.parentElement
  }

  if (target.matches('.item__check')) {
    const item = target.parentElement
    const itemContent = item.firstElementChild
    itemContent.classList.toggle('finished')
    saveSnapshot()
  }
})

/* 휴지통 아이콘을 누르면 해당 아이템이 삭제된다 */
_boardsContainer.addEventListener('click', e => {
  let target = e.target

  if (target.matches('.item__remove__icon')) {
    target = target.parentElement
  }

  if (target.matches('.item__remove')) {
    const item = target.parentElement
    const board = item.parentElement
    board.removeChild(item)
    saveSnapshot()
  }
})

/* 빈공간의 Todo 플러스를 클릭하면 해당 Board가 Active 되고, Todo 입력란으로 Focus 된다. */
_boardsContainer.addEventListener('click', e => {
  let target = e.target

  if (target.matches('.item-empty__btn__icon')) {
    target = target.parentElement.parentElement
  }

  if (target.matches('.item.empty')) {
    const activeBoard = target.parentElement.parentElement
    _boards.forEach(board => {
      if (board === activeBoard) {
        board.classList.toggle('active')
      } else {
        board.classList.remove('active')
      }
    })

    _registerInput.focus()
  }
})

/* Todo를 드래그하여 다른 Board로 옮길 수 있다 */
_boardsContainer.addEventListener(
  'dragstart',
  e => {
    _dragged = e.target
    e.target.style.opacity = 0.5
  },
  false
)

_boardsContainer.addEventListener(
  'dragend',
  e => {
    e.target.style.opacity = ''
  },
  false
)

_boardsContainer.addEventListener(
  'dragover',
  e => {
    e.preventDefault()
  },
  false
)

_boardsContainer.addEventListener(
  'dragenter',
  e => {
    e.preventDefault()
    console.log('dragenter1', e.target)
    const target = getDropZone(e.target)
    console.log('dragenter2', target)

    if (!target || target === _dragged.parentElement) {
      _dropzone?.classList.remove('dragging')
      _dropzone = null
      return
    }

    _dropzone?.classList.remove('dragging')
    _dropzone = target
    target.classList.add('dragging')
  },
  false
)

_boardsContainer.addEventListener(
  'dragleave',
  e => {
    e.preventDefault()
  },
  false
)

_boardsContainer.addEventListener(
  'drop',
  e => {
    e.preventDefault()
    console.log('drop')
    _dropzone?.classList.remove('dragging')
    if (!_dropzone) {
      return
    }

    insertTodoIntoBoard(_dropzone, _dragged)
    saveSnapshot()
    _dragged = null
    _dropzone = null
  },
  false
)

/* 사이트를 떠날 때 현재 snapshot을 localStorage에 저장합니다 */
document.addEventListener('visibilitychange', function () {
  if (document.visibilityState === 'hidden') {
    saveSnapshotIntoLocalStorage()
  }
})

function insertTodoIntoBoard (board, todo) {
  const item = typeof todo === 'string' ? createTodoItem(todo) : todo
  const boardItems = board.querySelector('.board__items')
  const emptyItem = boardItems.querySelector('.item.empty')
  boardItems.insertBefore(item, emptyItem)
  setTimeout(() => {
    item.classList.remove('create')
  }, 100)
}

function createTodoItem (todo) {
  const item = document.createElement('div')
  item.classList.add('item')
  item.classList.add('create')
  item.draggable = true
  item.innerHTML = `
    <span class="item__content" contenteditable="true">${todo}</span>
    <span class="item__check"><i class="item__check__icon fas fa-check"></i></span>
    <span class="item__remove"><i class="item__remove__icon far fa-trash-alt"></i></span>
  `
  return item
}

function addTodo () {
  const todo = _registerInput.value
  if (todo === '') {
    return
  }

  const activeBoard = getActiveBoard()
  insertTodoIntoBoard(activeBoard, todo)
  _registerInput.value = ''
}

function getActiveBoard () {
  let activeBoard = document.querySelector('.board.active')

  if (activeBoard == null) {
    activeBoard = document.querySelector('.board')
  }

  return activeBoard
}

function getDropZone (target) {
  let dropZone = null

  if (target.matches('.board')) {
    dropZone = target
  } else if (target.matches('.board__items')) {
    dropZone = target.parentElement
  } else if (target.matches('.item')) {
    dropZone = target.parentElement.parentElement
  } else if (
    target.matches('.item__content') ||
    target.matches('.item__remove')
  ) {
    dropZone = target.parentElement.parentElement.parentElement
  } else if (target.matches('.fa-trash-alt')) {
    dropZone = target.parentElement.parentElement.parentElement.parentElement
  }

  return dropZone
}

function addBoard () {
  const board = document.createElement('div')
  board.classList.add('board')
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
  `

  _boardsContainer.insertBefore(board, _boardPlus)
}

function removeBoard () {
  const activeBoard = document.querySelector('.board.active')
  if (activeBoard == null) {
    return
  }
  _boardsContainer.removeChild(activeBoard)
}

function updateGlobalVariable () {
  _boards = document.querySelectorAll('.board')
}

function saveSnapshotIntoLocalStorage () {
  window.localStorage.setItem(
    'snapshot',
    JSON.stringify(_snapshot[_currentSnapshotIdx])
  )
}

function loadSnapshotFromLocalStorage () {
  const snapshot = JSON.parse(window.localStorage.getItem('snapshot'))
  _currentSnapshotIdx = 0
  _snapshot[_currentSnapshotIdx] = snapshot
  loadSnapshot(_currentSnapshotIdx)
  _snapshot = []
  _currentSnapshotIdx = -1
}

function saveSnapshot () {
  console.log('--------------saveSnapshot START---------------')
  const currentSnapshot = []
  _boards.forEach(board => {
    const data = { title: '', items: [] }
    data.title = board.querySelector('.header__title').textContent
    const items = board.querySelectorAll('.item:not(.empty)')
    items.forEach(item => {
      data.items.push({
        content: item.firstElementChild.textContent,
        finished: item.firstElementChild.classList.contains('finished')
      })
    })
    currentSnapshot.push(data)
  })

  console.log('before', _snapshot)
  _snapshot.splice(_currentSnapshotIdx + 1, _snapshot.length, currentSnapshot)
  console.log('after', _snapshot)
  _currentSnapshotIdx = _snapshot.length - 1
  console.log('_currentSnapshotIdx', _currentSnapshotIdx)
  console.log('--------------END saveSnapshot--------------------')
}

function loadSnapshot (idx) {
  console.log('--------------loadSnapshot START---------------')
  if (idx >= _snapshot.length || idx < 0) {
    return
  }

  _currentSnapshotIdx = idx
  console.log('_currentSnapshotIdx', idx)

  const snapshot = _snapshot[_currentSnapshotIdx]
  _boardsContainer.innerHTML = `
    ${snapshot
      .map(
        board => `
      <div class="board">
          <div class="board__header"><span class="header__title" contenteditable="true">${
            board.title
          }</span><button class="header__remove"><i class="fas fa-times"></i></button></div>
          <div class="board__items">
            ${board.items
              .map(
                item => `
            <div class="item" draggable="true">
              <span class="item__content ${
                item.finished ? 'finished' : ''
              }" contenteditable="true">${item.content}</span>
              <span class="item__check"><i class="item__check__icon fas fa-check"></i></span>
              <span class="item__remove"><i class="item__remove__icon far fa-trash-alt"></i></span>
            </div>  
            `
              )
              .join('')}
            <div class="item empty" >
              <button class="item-empty__btn">
                <i class="item-empty__btn__icon fas fa-plus-circle"></i>
              </button>
            </div>
          </div>
        </div>
    `
      )
      .join('')}
    <div class="board-plus">
      <button class="board-plus__btn">
        <i class="fas fa-plus-circle"></i>
      </button>
    </div>
  `

  updateAllGlobalVariable()

  console.log('--------------END loadSnapshot--------------------')
}

function updateAllGlobalVariable () {
  _boardsContainer = document.querySelector('.boards__container')
  _boardsBtns = document.querySelector('.boards__btns')
  _boards = document.querySelectorAll('.board')
  _boardPlus = document.querySelector('.board-plus')
}
