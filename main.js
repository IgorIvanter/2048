const rows = document.getElementsByClassName("row")

const PLACEHOLDER = '*'

let table = []

for(let row of rows) {
    let cells = []
    for(let cell of row.children) {
        cells.push(cell)
        cell.innerText = PLACEHOLDER
    }
    table.push(cells)
}

table[1][2].innerText = "2"
table[3][2].innerText = "1"
table[0][2].innerText = "2"
table[3][3].innerText = "1"

function getRandomNatural(max) {
    if (max < 1) {
        throw new RangeError("getRandomNatural takes a number > 1 as argument")
    }
    return 1 + Math.round((max - 1) * Math.random())
}

function spawnRandomNumbers() {
    for (let i = 0; i <= 3; ++i) {
        for (let j = 0; j <= 3; ++j) {
            if (table[i][j].innerText === PLACEHOLDER) {
                table[i][j].innerText = getRandomNatural(2)
                return 0
            }
        }
    }
    console.log("Game Over")
    return 1
}

function swipeRight() {
    for (let i = 0; i <= 3; ++i) {
        let columnToCompare = 3;
        for (let j = 2; j >= 0; --j) {
            if (table[i][j].innerText === PLACEHOLDER) {
                continue
            } else if (table[i][columnToCompare].innerText === PLACEHOLDER) {
                table[i][columnToCompare].innerText = table[i][j].innerText
                table[i][j].innerText = PLACEHOLDER
                continue
            }
            let currentNumber = parseInt(table[i][j].innerText)
            let mainInTheRow = parseInt(table[i][columnToCompare].innerText)
            if (mainInTheRow === currentNumber) {
                table[i][j].innerText = PLACEHOLDER
                mainInTheRow *= 2
                table[i][columnToCompare].innerText = mainInTheRow.toString()
                columnToCompare--
            } else {
                table[i][j].innerText = PLACEHOLDER
                columnToCompare--
                table[i][columnToCompare].innerText = currentNumber.toString()
            }
        }
    }
    spawnRandomNumbers()
}

function swipeLeft() {
    for (let i = 0; i <= 3; ++i) {
        let columnToCompare = 0;
        for (let j = 1; j <= 3; ++j) {
            if (table[i][j].innerText === PLACEHOLDER) {
                continue
            } else if (table[i][columnToCompare].innerText === PLACEHOLDER) {
                table[i][columnToCompare].innerText = table[i][j].innerText
                table[i][j].innerText = PLACEHOLDER
                continue
            }
            let currentNumber = parseInt(table[i][j].innerText)
            let mainInTheRow = parseInt(table[i][columnToCompare].innerText)
            if (mainInTheRow === currentNumber) {
                table[i][j].innerText = PLACEHOLDER
                mainInTheRow *= 2
                table[i][columnToCompare].innerText = mainInTheRow.toString()
                columnToCompare++
            } else {
                table[i][j].innerText = PLACEHOLDER
                columnToCompare++
                table[i][columnToCompare].innerText = currentNumber.toString()
            }
        }
    }
    spawnRandomNumbers()
}

function swipeUp() {
    for (let j = 0; j <= 3; ++j) {
        let rowToCompare = 0;
        for (let i = 1; i <= 3; ++i) {
            if (table[i][j].innerText === PLACEHOLDER) {
                continue
            } else if (table[rowToCompare][j].innerText === PLACEHOLDER) {
                table[rowToCompare][j].innerText = table[i][j].innerText
                table[i][j].innerText = PLACEHOLDER
                continue
            }
            let currentNumber = parseInt(table[i][j].innerText)
            let mainInTheRow = parseInt(table[rowToCompare][j].innerText)
            if (mainInTheRow === currentNumber) {
                table[i][j].innerText = PLACEHOLDER
                mainInTheRow *= 2
                table[rowToCompare][j].innerText = mainInTheRow.toString()
                rowToCompare++
            } else {
                table[i][j].innerText = PLACEHOLDER
                rowToCompare++
                table[rowToCompare][j].innerText = currentNumber.toString()
            }
        }
    }
    spawnRandomNumbers()
}

function swipeDown() {
    for (let j = 0; j <= 3; ++j) {
        let rowToCompare = 3;
        for (let i = 2; i >= 0; --i) {
            if (table[i][j].innerText === PLACEHOLDER) {
                continue
            } else if (table[rowToCompare][j].innerText === PLACEHOLDER) {
                table[rowToCompare][j].innerText = table[i][j].innerText
                table[i][j].innerText = PLACEHOLDER
                continue
            }
            let currentNumber = parseInt(table[i][j].innerText)
            let mainInTheRow = parseInt(table[rowToCompare][j].innerText)
            if (mainInTheRow === currentNumber) {
                table[i][j].innerText = PLACEHOLDER
                mainInTheRow *= 2
                table[rowToCompare][j].innerText = mainInTheRow.toString()
                rowToCompare--
            } else {
                table[i][j].innerText = PLACEHOLDER
                rowToCompare--
                table[rowToCompare][j].innerText = currentNumber.toString()
            }
        }
    }
    spawnRandomNumbers()
}
