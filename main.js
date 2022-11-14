const gameOverBanner = document.getElementById("game-over-banner")

const cellLength = 106   // TODO: make this constant adapt to the particular board dimensions

const swipeSpeed = 150

const COLORS = {
    "1" : "lightgreen",
    "2" : "green",
    "4" : "#61c900",
    "8" : "#F8F658",
    "16": "#FFBB00",
    "32": "#ED8111",
    "64": "#611C07",
    "128": "#510000",
    "256": "#810000",
    "512": "#f13200",
    "1024" : "#ff0000",
    "2048" : "#ff0044",
    "4096" : "#ff009f",
    "8192" : "#ff40ff"
}

// The object COLORS defines the color of a number depending on it's value

// The NumberSquare class represents numbers on the board

class NumberSquare {
    constructor(cellX, cellY, value, board) {
        this.board = board
        this.squareElement = document.createElement("div")
        this.squareElement.style.backgroundColor = this.backgroundColor = COLORS[value.toString()]
        this.squareElement.setAttribute("class", "number")
        this.squareElement.style.top = `${cellY * cellLength}px`
        this.squareElement.style.left = `${cellX * cellLength}px`
        this.squareElement.style.opacity = "0"
        this.x = cellX
        this.y = cellY
        this.value = value
        this.valueElement = document.createElement("h1")
        this.valueElement.innerText = `${value}`
        this.squareElement.appendChild(this.valueElement)
        this.board.origin.appendChild(this.squareElement)
        this.animateAppearing()
    }

    animateAppearing = async () => {
        const translationTiming = {
            duration: swipeSpeed, iterations: 1
        }
        const translationKeyFrames = [
            {
                opacity: "0"
            },
            {
                opacity: "1"
            }
        ]

        await this.squareElement.animate(translationKeyFrames, translationTiming)

        this.squareElement.style.opacity = "1"
    }

    setValueTo = (newValue) => {
        this.valueElement.innerText = newValue.toString()
        this.value = newValue
        this.squareElement.style.backgroundColor = this.backgroundColor = COLORS[this.value.toString()]
    }

    moveTo = async (destinationX, destinationY) => {
        const previousSquare = this.board.currentStateTable[destinationX][destinationY]
        const newSquare = this

        // now check if the number just stays on it's own cell:

        if (newSquare.x === destinationX && newSquare.y === destinationY) {
            return
        }

        const translationTiming = {
            duration: swipeSpeed, iterations: 1
        }
        const translationKeyFrames = [
            {
                top: this.squareElement.style.top,
                left: this.squareElement.style.left
            },
            {
                top: `${destinationY * this.board.cellLength}px`,
                left: `${destinationX * this.board.cellLength}px`
            }
        ]
        
        await this.squareElement.animate(translationKeyFrames, translationTiming)

        /* TODO: Now this isn't good: as soon as one number starts moving, the previous one
        is already disappeared. I can do the following: let the moving one just sit on 
        top of the previous one, and save the reminder that I have to delete the number 
        underneath by the next moveTo. */

        if (previousSquare) {
            previousSquare.delete()
        }

        this.squareElement.style.top = `${destinationY * cellLength}px`
        this.squareElement.style.left = `${destinationX * cellLength}px`
        this.board.currentStateTable[newSquare.x][newSquare.y] = undefined
        this.board.currentStateTable[destinationX][destinationY] = newSquare
        this.x = destinationX
        this.y = destinationY
    }

    delete = () => {
        this.board.currentStateTable[this.x][this.y] = undefined
        this.valueElement.parentElement.removeChild(this.valueElement)
        this.board.origin.removeChild(this.squareElement)
        
    }
}

class Board {
    constructor() {
        this.cellLength = 106
        this.origin = document.getElementById("origin")
        this.scoreElement = document.getElementById("score")
        this.highscoreElement = document.getElementById("highscore")
        this.score = 0
        this.highscore = 0
        this.setScore(0)
        this.updateHighscore()
        this.currentStateTable = [
            [undefined, undefined, undefined, undefined],
            [undefined, undefined, undefined, undefined],
            [undefined, undefined, undefined, undefined],
            [undefined, undefined, undefined, undefined]
        ]
        this.gameOverFlag = false

        // Initial setup:
        
        this.addNumberSquare(0, 0, 1)
        this.addNumberSquare(0, 3, 4)
        this.addNumberSquare(3, 1, 2)

        // Adding the arrow keys handler for controls

        window.addEventListener("keydown", this.arrowKeysHandler)

    }

    setScore = (value) => {
        this.score = value
        this.scoreElement.innerText = value.toString()
        this.updateHighscore()
        return value
    }

    increaseScore = (addedScore) => {
        this.score += addedScore
        this.scoreElement.innerText = this.score.toString()
        this.updateHighscore()
    } 

    updateHighscore = () => {
        this.highscore = Math.max(this.score, this.highscore)
        this.highscoreElement.innerText = this.highscore.toString()

    }

    addNumberSquare = (initialX, initialY, value) => {
        this.currentStateTable[initialX][initialY] = new NumberSquare
    (initialX, initialY, value, this)
    }

    swipeRight = async () => {
        for (let i = 0; i <= 3; ++i) {
            let columnToCompare = 3;
            for (let j = 2; j >= 0; --j) {
                let current = this.currentStateTable[j][i]
                let main    = this.currentStateTable[columnToCompare][i]

                if (current === undefined) {
                    continue
                } else if (main === undefined) {
                    await current.moveTo(columnToCompare, i)
                    continue
                }
                let currentNumberValue = this.currentStateTable[j][i].value
                let mainNumberValue = this.currentStateTable[columnToCompare][i].value
                
                if (mainNumberValue === currentNumberValue) {
                    current.setValueTo(2 * mainNumberValue)
                    await current.moveTo(columnToCompare, i)
                    mainNumberValue *= 2
                    current.setValueTo(mainNumberValue)
                    columnToCompare--
                    this.increaseScore(mainNumberValue)
                } else {
                    columnToCompare--
                    await current.moveTo(columnToCompare, i)
                }
            }
        }
        this.spawnRandomNumber()
    }

    swipeLeft = async () => {
        for (let i = 0; i <= 3; ++i) {
            let columnToCompare = 0;
            for (let j = 1; j <= 3; ++j) {
                let current = this.currentStateTable[j][i]
                let main    = this.currentStateTable[columnToCompare][i]

                if (current === undefined) {
                    continue
                } else if (main === undefined) {
                    await current.moveTo(columnToCompare, i)
                    continue
                }
                let currentNumberValue = this.currentStateTable[j][i].value
                let mainNumberValue = this.currentStateTable[columnToCompare][i].value
                
                if (mainNumberValue === currentNumberValue) {
                    current.setValueTo(2 * mainNumberValue)
                    await current.moveTo(columnToCompare, i)
                    mainNumberValue *= 2
                    current.setValueTo(mainNumberValue)
                    columnToCompare++
                    this.increaseScore(mainNumberValue)
                } else {
                    columnToCompare++
                    await current.moveTo(columnToCompare, i)
                }
            }
        }
        this.spawnRandomNumber()
    }

    swipeUp = async () => {
        for (let j = 0; j <= 3; ++j) {
            let rowToCompare = 0;
            for (let i = 1; i <= 3; ++i) {
                let current = this.currentStateTable[j][i]
                let main    = this.currentStateTable[j][rowToCompare]

                if (current === undefined) {
                    continue
                } else if (main === undefined) {
                    await current.moveTo(j, rowToCompare)
                    continue
                }
                let currentNumberValue = this.currentStateTable[j][i].value
                let mainNumberValue = this.currentStateTable[j][rowToCompare].value
                
                if (mainNumberValue === currentNumberValue) {
                    current.setValueTo(2 * mainNumberValue)
                    await current.moveTo(j, rowToCompare)
                    mainNumberValue *= 2
                    current.setValueTo(mainNumberValue)
                    rowToCompare++
                    this.increaseScore(mainNumberValue)
                } else {
                    rowToCompare++
                    await current.moveTo(j, rowToCompare)
                }
            }
        }
        this.spawnRandomNumber()
    }

    swipeDown = async () => {
        for (let j = 0; j <= 3; ++j) {
            let rowToCompare = 3;
            for (let i = 2; i >= 0; --i) {
                let current = this.currentStateTable[j][i]
                let main    = this.currentStateTable[j][rowToCompare]

                if (current === undefined) {
                    continue
                } else if (main === undefined) {
                    await current.moveTo(j, rowToCompare)
                    continue
                }
                let currentNumberValue = this.currentStateTable[j][i].value
                let mainNumberValue = this.currentStateTable[j][rowToCompare].value
                
                if (mainNumberValue === currentNumberValue) {
                    current.setValueTo(2 * mainNumberValue)
                    await current.moveTo(j, rowToCompare)
                    mainNumberValue *= 2
                    current.setValueTo(mainNumberValue)
                    rowToCompare--
                    this.increaseScore(mainNumberValue)
                } else {
                    rowToCompare--
                    await current.moveTo(j, rowToCompare)
                }
            }
        }
        this.spawnRandomNumber()
    }

    spawnRandomNumber = () => {
        function getRandomNatural(max) {
            if (max < 1) {
                throw new RangeError("getRandomNatural takes a number > 1 as argument")
            }
            return 1 + Math.round((max - 1) * Math.random())
        }

        const emptyCells = []
        for (let i = 0; i <= 3; i++) {
            for (let j = 0; j <= 3; j++) {
                if (!this.currentStateTable[i][j]) {
                    emptyCells.push([i, j])
                }
            }
        }
        if (this.isGameOver()) {
            this.openGameOverBanner()
        } else if (this.isFull()) {
            return
        } else {
            const newSquareCoordinates = emptyCells[getRandomNatural(emptyCells.length) - 1]
            this.addNumberSquare(newSquareCoordinates[0], newSquareCoordinates[1], getRandomNatural(2))
        }
    }

    // .isFull() returns true iff every cell of the board is occupied with a NumberSquare


    isFull = () => {
        for (let i = 0; i <= 3; i++) {
            for (let j = 0; j <= 3; j++) {
                if (this.currentStateTable[i][j] === undefined) {
                    return false
                }
            }
        }
        return true
    }

    // .isGameOver() returns true iff no more moves are possible

    isGameOver = () => {
        if (!this.isFull()) {
            return false
        }
        for (let i = 0; i <= 3; i++) {
            for (let j = 0; j <= 3; j++) {
                const currentNumber = this.currentStateTable[i][j]
                const adjacentPositions = [
                    [i, j + 1],
                    [i, j - 1],
                    [i + 1, j],
                    [i - 1, j],
                ]
                for (let adjacentPosition of adjacentPositions) {
                    const adjacentX = adjacentPosition[0]
                    const adjacentY = adjacentPosition[1]
                    if (adjacentX > 3 || adjacentX < 0 || adjacentY > 3 || adjacentY < 0) {
                        continue
                    }
                    const adjacentNumber = this.currentStateTable[adjacentX][adjacentY]
                    if (adjacentNumber != undefined && adjacentNumber.value === currentNumber.value) {
                        return false
                    }
                }
            }
        }
        this.gameOverFlag = true
        return true
    }

    openGameOverBanner = () => {
        gameOverBanner.classList.add("active")
    }

    closeGameOverBanner = () => {
        gameOverBanner.classList.remove("active")
    }

    arrowKeysHandler = ((e) => {
        if (this.gameOverFlag) {
            return
        }
        switch (e.key) {
            case 'ArrowUp':
                this.swipeUp();
                break;
            case 'ArrowDown':
                this.swipeDown();
                break;
            case 'ArrowLeft':
                this.swipeLeft();
                break;
            case 'ArrowRight':
                this.swipeRight();
                break;
            default:
                break
        }
    })

    reset = () => {
        for (let i = 0; i <= 3; i++) {
            for (let j = 0; j <= 3; j++) {
                if (this.currentStateTable[i][j])
                    this.currentStateTable[i][j].delete()
                }
            }
        this.setScore(0)
        this.gameOverFlag = false
        this.closeGameOverBanner()

        // here actually some random setup should appear, but I just coded it for now

        this.addNumberSquare(0, 0, 1)
        this.addNumberSquare(0, 1, 4)
        this.addNumberSquare(0, 2, 2)
    }
 }

const mainBoard = new Board
   