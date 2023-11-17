import {
  BLOCK_SIZE,
  BOARD_WIDTH,
  BOARD_HEIGHT,
  EVENT_MOVEMENTS
} from './consts'
import './style.css'

// 1 - Inicializar el Canvas
const canvas = document.querySelector('canvas')
const $score = document.querySelector('span')
const $start = document.querySelector('section')
const context = canvas.getContext('2d')

canvas.width = BLOCK_SIZE * BOARD_WIDTH
canvas.height = BLOCK_SIZE * BOARD_HEIGHT

context.scale(BLOCK_SIZE, BLOCK_SIZE)

let score = 0

const createBoard = (width, height) => {
  return Array(height)
    .fill()
    .map(() => Array(width).fill(0))
}

// 3 - board
const board = createBoard(BOARD_WIDTH, BOARD_HEIGHT)

// 9 - random pieces
const PIECES = [
  [
    [1, 1],
    [1, 1]
  ],
  [[1, 1, 1, 1]],
  [
    [1, 0, 0],
    [1, 1, 1]
  ],
  [
    [0, 0, 1],
    [1, 1, 1]
  ],
  [
    [0, 1, 1],
    [1, 1, 0]
  ],
  [
    [0, 1, 0],
    [1, 1, 1]
  ],
  [
    [1, 1, 0],
    [0, 1, 1]
  ]
]

const PIECES_COLORS = [
  '#E0E722',
  '#4D4DFF',
  '#C724B1',
  '#FFAD00',
  '#44D62C',
  '#DB3EB1',
  '#D22730'
]

let shape = Math.floor(Math.random() * PIECES.length)

// 4  pieza player
const piece = {
  position: { x: 5, y: 5 },
  shape: PIECES[shape]
}

let pieceColor = PIECES_COLORS[shape]

// 2 - game loop
let dropCounter = 0
let lastTime = 0

const update = (time = 0) => {
  const deltaTime = time - lastTime
  lastTime = time

  dropCounter += deltaTime

  if (dropCounter > 1000) {
    piece.position.y++
    dropCounter = 0

    if (checkCollision()) {
      piece.position.y--
      solidifyPiece()
      removeRows()
    }
  }

  draw()
  window.requestAnimationFrame(update)
}

const draw = () => {
  context.fillStyle = '#24243e'
  context.fillRect(0, 0, canvas.width, canvas.height)

  board.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value === 1) {
        context.fillStyle = '#78ffd6'
        context.fillRect(x, y, 1, 1)
      }
    })
  })

  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        context.fillStyle = pieceColor
        context.fillRect(x + piece.position.x, y + piece.position.y, 1, 1)
      }
    })
  })

  $score.innerText = score
}

document.addEventListener('keydown', (event) => {
  if (event.key === EVENT_MOVEMENTS.LEFT) {
    piece.position.x--
    if (checkCollision()) {
      piece.position.x++
    }
  }
  if (event.key === EVENT_MOVEMENTS.RIGHT) {
    piece.position.x++
    if (checkCollision()) {
      piece.position.x--
    }
  }
  if (event.key === EVENT_MOVEMENTS.DOWN) {
    piece.position.y++
    if (checkCollision()) {
      piece.position.y--
      solidifyPiece()
      removeRows()
    }
  }
  if (event.key === EVENT_MOVEMENTS.UP) {
    const rotated = []

    for (let i = 0; i < piece.shape[0].length; i++) {
      const row = []

      for (let j = piece.shape.length - 1; j >= 0; j--) {
        row.push(piece.shape[j][i])
      }

      rotated.push(row)
    }

    const previusShape = piece.shape
    piece.shape = rotated

    if (checkCollision()) {
      piece.shape = previusShape
    }
  }
})

const checkCollision = () => {
  return piece.shape.find((row, y) => {
    return row.find((value, x) => {
      return (
        value !== 0 && board[y + piece.position.y]?.[x + piece.position.x] !== 0
      )
    })
  })
}

const solidifyPiece = () => {
  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value === 1) {
        board[y + piece.position.y][x + piece.position.x] = 1
      }
    })
  })

  // get random shape
  shape = Math.floor(Math.random() * PIECES.length)
  piece.shape = PIECES[shape]
  pieceColor = PIECES_COLORS[shape]

  // reset position
  piece.position.x = Math.floor(BOARD_WIDTH / 2 - 2)
  piece.position.y = 0

  if (checkCollision()) {
    score = 0
    window.alert('Game Over')
    board.forEach((row) => row.fill(0))
  }
}

const removeRows = () => {
  const rowsToRemove = []

  board.forEach((row, y) => {
    if (row.every((value) => value === 1)) {
      rowsToRemove.push(y)
    }
  })

  rowsToRemove.forEach((y) => {
    board.splice(y, 1)
    const newRow = Array(BOARD_WIDTH).fill(0)
    board.unshift(newRow)
    score += 10
  })
}

$start.addEventListener('click', () => {
  update()
  $start.remove()
})
