const origin = document.getElementById("origin")
const body   = document.querySelector("body")
const main   = document.querySelector("main")

const undef  = undefined     // TODO: think what to do with this thing

                            // maybe define some empty number...

const cellLengthStr = `106`   // TODO: make this constant adapt to the particular board dimensions

const swipeSpeed = 300

const COLORS = {
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
    constructor(cellX, cellY, value, board = undefined) {
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
        this.board = board
        this.body = document.createElement("div")
        this.body.style.backgroundColor = this.backgroundColor = COLORS[value.toString()]
        this.body.setAttribute("class", "number")
        this.body.style.top = `${cellY * cellLengthStr}px`
        this.body.style.left = `${cellX * cellLengthStr}px`
        this.x = cellX
        this.y = cellY
        this.value = value
        this.valueElement = document.createElement("h1")
        this.valueElement.innerText = `${value}`
        this.body.appendChild(this.valueElement)
        origin.appendChild(this.body)
    }
}

class Board {
    constructor() {
        this.cellLengthStr = `106`
        this.cellLength = 106
        this.origin = document.getElementById("origin")
        this.structure = [
            [undef, undef, undef, undef],
            [undef, undef, undef, undef],
            [undef, undef, undef, undef],
            [undef, undef, undef, undef]
        ]
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
                    console.log(this.structure[columnToCompare][i])
                    columnToCompare--
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
                    console.log(this.structure[columnToCompare][i])
                    columnToCompare++
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
                    console.log(this.structure[j][rowToCompare])
                    rowToCompare--
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

        const emptyNumbers = []
        for (let i = 0; i <= 3; i++) {
            for (let j = 0; j <= 3; j++) {
                if (!this.structure[i][j]) {
                    emptyNumbers.push([i, j])
                }
            }
        }
        if (emptyNumbers.length == 0) {
            const gameOverHeading = document.createElement("h1")
            gameOverHeading.innerText = "Game Over!"
            main.appendChild(gameOverHeading)
            // FIX: this is not a game over yet. Other moves can be done.
            // here the game must reset
        } else {
            const newNumberCoordinates = emptyNumbers[getRandomNatural(emptyNumbers.length) - 1]
            this.addNumber(newNumberCoordinates[0], newNumberCoordinates[1], getRandomNatural(2))
        }
    }
}

// experimental initial setup of the board

const mainBoard = new Board

mainBoard.addNumber(0, 0, 1)
mainBoard.addNumber(0, 2, 1)
mainBoard.addNumber(3, 3, 2)

window.addEventListener("keydown", (e) => {
    switch (e.key) {
        case 'ArrowUp':
            mainBoard.swipeUp();
            break;
        case 'ArrowDown':
            mainBoard.swipeDown();
            break;
        case 'ArrowLeft':
            mainBoard.swipeLeft();
            break;
        case 'ArrowRight':
            mainBoard.swipeRight();
            break;
    }
})