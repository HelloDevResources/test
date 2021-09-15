((window, document, undefined) => {
  let grid = [],
    rows = 10,
    cols = 10,
    bombCount = Math.floor((rows * cols) / 6),
    firstClick = true,
    minesVisited = 0,
    minesFlagged = 0;

  class Mine {
    visited = false;
    flagged = false;
    constructor(bomb) {
      this.bomb = bomb;
    }
  }

  grid.length = rows;
  for (let i = 0; i < rows; i++) {
    grid[i] = [];
    grid[i].length = cols;
    for (let j = 0; j < cols; j++) {
      const id = i * cols + j;
      if (id < bombCount) {
        grid[i][j] = new Mine(true);
      } else {
        grid[i][j] = new Mine(false);
      }
    }
  }

  const getRowAndCol = (id) => {
    const row = Math.floor(id / cols),
      col = id % cols;
    return { row, col };
  };

  const shuffle = () => {
    const lastIndex = rows * cols - 1;
    for (let i = lastIndex; i > 0; i--) {
      const randomIndex = Math.floor(Math.random() * (i + 1)),
        { row: r1, col: c1 } = getRowAndCol(i),
        { row: r2, col: c2 } = getRowAndCol(randomIndex),
        temp = grid[r1][c1];

      grid[r1][c1] = grid[r2][c2];
      grid[r2][c2] = temp;
    }
  };

  const appendGrid = () => {
    shuffle();
    const gridDiv = document.getElementById("grid");
    gridDiv.style.gridTemplateColumns = `repeat(${cols}, 40px)`;
    gridDiv.style.gridTemplateRows = `repeat(${rows}, 40px)`;
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const mineDiv = document.createElement("div");
        mineDiv.id = i * cols + j;
        mineDiv.className = "mine";
        mineDiv.dataset.visited = "false";
        mineDiv.addEventListener("click", handleLeftClick);
        mineDiv.addEventListener("contextmenu", handleRightClick);
        gridDiv.appendChild(mineDiv);
      }
    }
  };

  const handleLeftClick = (e) => {
    countBombs(Number(e.target.id));
    if (firstClick) {
      firstClick = false;
    }
  };

  const handleRightClick = (e) => {
    e.preventDefault();
    postFlag(Number(e.target.id));
  };

  const countBombs = (id) => {
    const { row, col } = getRowAndCol(id);
    if (grid[row][col].bomb) {
      if (firstClick) {
        grid[row][col].bomb = false;
        shiftBomb();
      } else {
        gameOver(false);
        return;
      }
    }
    if (grid[row][col].visited) {
      return;
    }
    const currDiv = document.getElementById(id);
    currDiv.dataset.visited = "true";
    grid[row][col].visited = true;
    minesVisited++;
    if (grid[row][col].flagged) {
      currDiv.innerText = "";
      minesFlagged--;
    }

    let bombs = 0,
      leftEdge = col === 0,
      topEdge = row === 0,
      rightEdge = col === cols - 1,
      bottomEdge = row === rows - 1;

    for (let i = -1; i <= 1; i++) {
      if (topEdge && i === -1) {
        continue;
      }
      if (bottomEdge && i === 1) {
        continue;
      }
      for (let j = -1; j <= 1; j++) {
        if (leftEdge && j === -1) {
          continue;
        }
        if (rightEdge && j === 1) {
          continue;
        }
        if (grid[row + i][col + j].bomb) {
          bombs++;
        }
      }
    }

    if (bombs === 0) {
      for (let i = -1; i <= 1; i++) {
        if (topEdge && i === -1) {
          continue;
        }
        if (bottomEdge && i === 1) {
          continue;
        }
        for (let j = -1; j <= 1; j++) {
          if (leftEdge && j === -1) {
            continue;
          }
          if (rightEdge && j === 1) {
            continue;
          }
          countBombs((row + i) * cols + col + j);
        }
      }
    } else {
    currDiv.innerText = bombs;
    }
    if (minesVisited === rows * cols - bombCount) {
      gameOver(true);
    }
  };

  const postFlag = (id) => {
    const { row, col } = getRowAndCol(id);
    if (grid[row][col].visited) {
      return;
    }
    const currDiv = document.getElementById(id);
    if (grid[row][col].flagged) {
      currDiv.innerText = "";
      grid[row][col].flagged = false;
      minesFlagged--;
    } else {
      currDiv.innerText = "🚩";
      grid[row][col].flagged = true;
      minesFlagged++;
    }
    if (minesFlagged === bombCount) {
      gameOver(false);
    }
  };

  const shiftBomb = () => {
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (!grid[i][j].bomb) {
          grid[i][j].bomb = true;
          return;
        }
      }
    }
  };

  const gameOver = (skipCheck) => {
    let victory = true;
    if (!skipCheck) {
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          const id = i * cols + j;
          const mineDiv = document.getElementById(id);
          mineDiv.removeEventListener("click", handleLeftClick);
          mineDiv.removeEventListener("contextmenu", handleRightClick);
          if (grid[i][j].bomb) {
            mineDiv.className = "bomb";
            if (victory && !grid[i][j].flagged) {
              victory = false;
            }
          }
        }
      }
    }
    if (victory) {
      document.querySelector("body > h1").innerText = "You win!";
    } else {
      document.querySelector("body > h1").innerText = "You lose T_T";
    }
  };

  appendGrid();
})(window, document);
