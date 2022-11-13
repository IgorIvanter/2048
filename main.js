const origin = document.getElementById("origin")
const body   = document.querySelector("body")
const main   = document.querySelector("main")
const gameOverBanner = document.getElementById("game-over-banner")

const undef  = undefined     // TODO: think what to do with this thing

                            // maybe define some empty number...

const cellLengthStr = `106`   // TODO: make this constant adapt to the particular board dimensions

const swipeSpeed = 300

const COLORS = {
    "-1" : "white",
    "1" : "lightgreen",
    "2" : "green",
    "4" : "brown",
    "8" : "darkred",
    "16": "red",
    "32": "cyan",
    "64": "aquamarine",
    "128": "blue",
    "256": "violet"
}       

// The object COLORS defines the color of a number depending on it's value

// The Number class represents numbers on the board

class Number {
    constructor(cellX, cellY, value, board) {
        this.board = board
        this.body = document.createElement("div")
        this.body.style.backgroundColor = this.backgroundColor = COLORS[value.toString()]
        this.body.setAttribute("class", "number")
        this.body.style.top = `${cellY * cellLengthStr}px`
        this.body.style.left = `${cellX * cellLengthStr}px`
        this.body.style.opacity = "0"
        this.x = cellX
        this.y = cellY
        this.value = value
        this.valueElement = document.createElement("h1")
        this.valueElement.innerText = `${value}`
        this.body.appendChild(this.valueElement)
        origin.appendChild(this.body)
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

        await this.body.animate(translationKeyFrames, translationTiming)

        this.body.style.opacity = "1"
    }

    setValue = (newValue) => {
        this.valueElement.innerText = newValue.toString()
        this.value = newValue
        this.body.style.backgroundColor = this.backgroundColor = COLORS[this.value.toString()]
    }

    move = async (destinationX, destinationY) => {
        const previous = this.board.structure[destinationX][destinationY]
        const current = this

        // now check if the number just stays on it's own cell:

        if (current.x === destinationX && current.y === destinationY) {
            return
        }

        const translationTiming = {
            duration: swipeSpeed, iterations: 1
        }
        const translationKeyFrames = [
            {
                top: this.body.style.top,
                left: this.body.style.left
            },
            {
                top: `${destinationY * cellLengthStr}px`,
                left: `${destinationX * cellLengthStr}px`
            }
        ]
        
        await this.body.animate(translationKeyFrames, translationTiming)

        /* TODO: Now this isn't good: as soon as one number starts moving, the previous one
        is already disappeared. I can do the following: let the moving one just sit on 
        top of the previous one, and save the reminder that I have to delete the number 
        underneath by the next move. */

        if (previous) {
            previous.delete()
        }

        this.body.style.top = `${destinationY * cellLengthStr}px`
        this.body.style.left = `${destinationX * cellLengthStr}px`
        this.board.structure[current.x][current.y] = undef
        this.board.structure[destinationX][destinationY] = current
        this.x = destinationX
        this.y = destinationY
    }

    delete = () => {
        this.board.structure[this.x][this.y] = undef
        this.valueElement.parentElement.removeChild(this.valueElement)
        origin.removeChild(this.body)
        
    }
}

// TODO: replace undef with an emptyNumber everywhere

class EmptyNumber extends Number {
    constructor(cellX, cellY, board) {
        super(cellX, cellY, -1, board)
       //  this.body.style.display = "none"
    }
    
    animateAppearing = () => {
        throw new TypeError("No .animateAppearing() method for an EmptyNumber")
    }

    setValue = () => {
        throw new TypeError("No .setValue() method for an EmptyNumber")
    }

    move = () => {
        throw new TypeError("No .move() method for an EmptyNumber")
    }

    delete = () => {
        throw new TypeError("No .delete() method for an EmptyNumber")
    }
 }

class Board {
    constructor() {
        this.cellLengthStr = `106`
        this.cellLength = 106
        this.origin = document.getElementById("origin")
        this.scoreElement = document.getElementById("score")
        this.highscoreElement = document.getElementById("highscore")
        this.score = 0
        this.highscore = 0
        this.setScore(0)
        this.updateHighscore()
        this.structure = [
            [undef, undef, undef, undef],
            [undef, undef, undef, undef],
            [undef, undef, undef, undef],
            [undef, undef, undef, undef]
        ]
        this.gameOverFlag = false
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

    addNumber = (initialX, initialY, value) => {
        this.structure[initialX][initialY] = new Number(initialX, initialY, value, this)
    }

    // It would be nice to unify these 4 very similar functions into one

    swipeRight = async () => {
        for (let i = 0; i <= 3; ++i) {
            let columnToCompare = 3;
            for (let j = 2; j >= 0; --j) {
                let current = this.structure[j][i]
                let main    = this.structure[columnToCompare][i]

                if (current === undef) {
                    continue
                } else if (main === undef) {
                    await current.move(columnToCompare, i)
                    continue
                }
                let currentNumberValue = this.structure[j][i].value
                let mainNumberValue = this.structure[columnToCompare][i].value
                
                if (mainNumberValue === currentNumberValue) {
                    current.setValue(2 * mainNumberValue)
                    await current.move(columnToCompare, i)
                    mainNumberValue *= 2
                    current.setValue(mainNumberValue)
                    columnToCompare--
                    this.increaseScore(mainNumberValue)
                } else {
                    columnToCompare--
                    await current.move(columnToCompare, i)
                }
            }
        }
        this.spawnRandomNumber()
    }

    swipeLeft = async () => {
        for (let i = 0; i <= 3; ++i) {
            let columnToCompare = 0;
            for (let j = 1; j <= 3; ++j) {
                let current = this.structure[j][i]
                let main    = this.structure[columnToCompare][i]

                if (current === undef) {
                    continue
                } else if (main === undef) {
                    await current.move(columnToCompare, i)
                    continue
                }
                let currentNumberValue = this.structure[j][i].value
                let mainNumberValue = this.structure[columnToCompare][i].value
                
                if (mainNumberValue === currentNumberValue) {
                    current.setValue(2 * mainNumberValue)
                    await current.move(columnToCompare, i)
                    mainNumberValue *= 2
                    current.setValue(mainNumberValue)
                    columnToCompare++
                    this.increaseScore(mainNumberValue)
                } else {
                    columnToCompare++
                    await current.move(columnToCompare, i)
                }
            }
        }
        this.spawnRandomNumber()
    }

    swipeUp = async () => {
        for (let j = 0; j <= 3; ++j) {
            let rowToCompare = 0;
            for (let i = 1; i <= 3; ++i) {
                let current = this.structure[j][i]
                let main    = this.structure[j][rowToCompare]

                if (current === undef) {
                    continue
                } else if (main === undef) {
                    await current.move(j, rowToCompare)
                    continue
                }
                let currentNumberValue = this.structure[j][i].value
                let mainNumberValue = this.structure[j][rowToCompare].value
                
                if (mainNumberValue === currentNumberValue) {
                    current.setValue(2 * mainNumberValue)
                    await current.move(j, rowToCompare)
                    mainNumberValue *= 2
                    current.setValue(mainNumberValue)
                    rowToCompare++
                    this.increaseScore(mainNumberValue)
                } else {
                    rowToCompare++
                    await current.move(j, rowToCompare)
                }
            }
        }
        this.spawnRandomNumber()
    }

    swipeDown = async () => {
        for (let j = 0; j <= 3; ++j) {
            let rowToCompare = 3;
            for (let i = 2; i >= 0; --i) {
                let current = this.structure[j][i]
                let main    = this.structure[j][rowToCompare]

                if (current === undef) {
                    continue
                } else if (main === undef) {
                    await current.move(j, rowToCompare)
                    continue
                }
                let currentNumberValue = this.structure[j][i].value
                let mainNumberValue = this.structure[j][rowToCompare].value
                
                if (mainNumberValue === currentNumberValue) {
                    current.setValue(2 * mainNumberValue)
                    await current.move(j, rowToCompare)
                    mainNumberValue *= 2
                    current.setValue(mainNumberValue)
                    rowToCompare--
                    this.increaseScore(mainNumberValue)
                } else {
                    rowToCompare--
                    await current.move(j, rowToCompare)
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


        const emptyNumbers = []
        for (let i = 0; i <= 3; i++) {
            for (let j = 0; j <= 3; j++) {
                if (!this.structure[i][j]) {
                    emptyNumbers.push([i, j])
                }
            }
        }
        if (this.isGameOver()) {
            this.openGameOverBanner()
        } else if (this.isFull()) {
            return
        } else {
            const newNumberCoordinates = emptyNumbers[getRandomNatural(emptyNumbers.length) - 1]
            this.addNumber(newNumberCoordinates[0], newNumberCoordinates[1], getRandomNatural(2))
        }
    }

    // .isFull() returns true iff every cell of the board is occupied with a Number

    isFull = () => {
        for (let i = 0; i <= 3; i++) {
            for (let j = 0; j <= 3; j++) {
                if (this.structure[i][j] === undef) {
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
                const currentNumber = this.structure[i][j]
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
                    const adjacentNumber = this.structure[adjacentX][adjacentY]
                    if (adjacentNumber != undef && adjacentNumber.value === currentNumber.value) {
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
            case '1':
                this.openGameOverBanner()
        }
    })

    reset = () => {
        for (let i = 0; i <= 3; i++) {
            for (let j = 0; j <= 3; j++) {
                if (this.structure[i][j])
                    this.structure[i][j].delete()
                }
            }
        this.setScore(0)
        this.gameOverFlag = false
        this.closeGameOverBanner()

        // here actually some random setup should appear, but I just coded it for now

        mainBoard.addNumber(0, 0, 1)
        mainBoard.addNumber(0, 1, 4)
        mainBoard.addNumber(0, 2, 2)
    }
 }

// experimental initial setup of the board

const mainBoard = new Board

mainBoard.addNumber(0, 0, 1)
mainBoard.addNumber(0, 1, 4)
mainBoard.addNumber(0, 2, 2)


// mainBoard.addNumber(0, 3, 4)
// mainBoard.addNumber(1, 0, 2)
// mainBoard.addNumber(1, 1, 8)
// mainBoard.addNumber(1, 2, 4)
// mainBoard.addNumber(1, 3, 16)
// mainBoard.addNumber(2, 0, 8)
// mainBoard.addNumber(2, 1, 1)
// mainBoard.addNumber(2, 2, 32)
// mainBoard.addNumber(2, 3, 4)
// mainBoard.addNumber(3, 0, 2)
// mainBoard.addNumber(3, 1, 16)
// mainBoard.addNumber(3, 2, 8)
// mainBoard.addNumber(3, 3, 0)