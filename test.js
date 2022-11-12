const origin = document.getElementById("origin")

const undef = undefined     // TODO: think what to do with this thing

                            // maybe define some empty number...

const cellLengthStr = `106`   // TODO: make this constant adapt to the particular board dimensions

const COLORS = {
    "1" : "green",
    "2" : "brown",
    "4" : "blue",
    "8" : "yellow"
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
        this.x = cellX
        this.y = cellY
        this.value = value
        this.valueElement = document.createElement("h1")
        this.valueElement.innerText = `${value}`
        this.body.appendChild(this.valueElement)
        origin.appendChild(this.body)
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
            duration: 500, iterations: 1
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

    swipeRight = async () => {
        for (let i = 0; i <= 3; ++i) {
            let columnToCompare = 3;
            for (let j = 2; j >= 0; --j) {
                let current = this.structure[j][i]
                let main    = this.structure[columnToCompare][i]

                if (current === undef) {
                    continue
                } else if (main === undef) {
                    // console.log(`I am in the 2 clause. The number moving is ${current.value} from (${current.x}, ${current.y}). Main is at (${columnToCompare}, ${i})`)
                    await current.move(columnToCompare, i)
                    continue
                }
                let currentNumberValue = this.structure[j][i].value
                let mainNumberValue = this.structure[columnToCompare][i].value
                
                if (mainNumberValue === currentNumberValue) {
                    //console.log(`I am in the 3 clause. The number moving is ${current.value} from (${current.x}, ${current.y}`)

                    current.setValue(2 * mainNumberValue)
                    await current.move(columnToCompare, i)
                    mainNumberValue *= 2
                    current.setValue(mainNumberValue)
                    console.log(this.structure[columnToCompare][i])
                    columnToCompare--
                } else {
                    //console.log(`I am in the 4 clause. The number moving is ${current.value} from (${current.x}, ${current.y})`)

                    columnToCompare--
                    await current.move(columnToCompare, i)
                }
            }
        }
        // spawnRandomNumbers()
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
                    // console.log(`I am in the 2 clause. The number moving is ${current.value} from (${current.x}, ${current.y}). Main is at (${columnToCompare}, ${i})`)
                    await current.move(columnToCompare, i)
                    continue
                }
                let currentNumberValue = this.structure[j][i].value
                let mainNumberValue = this.structure[columnToCompare][i].value
                
                if (mainNumberValue === currentNumberValue) {
                    //console.log(`I am in the 3 clause. The number moving is ${current.value} from (${current.x}, ${current.y}`)

                    current.setValue(2 * mainNumberValue)
                    await current.move(columnToCompare, i)
                    mainNumberValue *= 2
                    current.setValue(mainNumberValue)
                    console.log(this.structure[columnToCompare][i])
                    columnToCompare++
                } else {
                    //console.log(`I am in the 4 clause. The number moving is ${current.value} from (${current.x}, ${current.y})`)

                    columnToCompare++
                    await current.move(columnToCompare, i)
                }
            }
        }
        // spawnRandomNumbers()
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
                    // console.log(`I am in the 2 clause. The number moving is ${current.value} from (${current.x}, ${current.y}). Main is at (${columnToCompare}, ${i})`)
                    await current.move(j, rowToCompare)
                    continue
                }
                let currentNumberValue = this.structure[j][i].value
                let mainNumberValue = this.structure[j][rowToCompare].value
                
                if (mainNumberValue === currentNumberValue) {
                    //console.log(`I am in the 3 clause. The number moving is ${current.value} from (${current.x}, ${current.y}`)

                    current.setValue(2 * mainNumberValue)
                    await current.move(j, rowToCompare)
                    mainNumberValue *= 2
                    current.setValue(mainNumberValue)
                    rowToCompare++
                } else {
                    //console.log(`I am in the 4 clause. The number moving is ${current.value} from (${current.x}, ${current.y})`)

                    rowToCompare++
                    await current.move(j, rowToCompare)
                }
            }
        }
        // spawnRandomNumbers()
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
                    // console.log(`I am in the 2 clause. The number moving is ${current.value} from (${current.x}, ${current.y}). Main is at (${columnToCompare}, ${i})`)
                    await current.move(j, rowToCompare)
                    continue
                }
                let currentNumberValue = this.structure[j][i].value
                let mainNumberValue = this.structure[j][rowToCompare].value
                
                if (mainNumberValue === currentNumberValue) {
                    //console.log(`I am in the 3 clause. The number moving is ${current.value} from (${current.x}, ${current.y}`)

                    current.setValue(2 * mainNumberValue)
                    await current.move(j, rowToCompare)
                    mainNumberValue *= 2
                    current.setValue(mainNumberValue)
                    console.log(this.structure[j][rowToCompare])
                    rowToCompare--
                } else {
                    //console.log(`I am in the 4 clause. The number moving is ${current.value} from (${current.x}, ${current.y})`)

                    rowToCompare--
                    await current.move(j, rowToCompare)
                }
            }
        }
        // spawnRandomNumbers()
    }
}

// experimental initial setup of the board

const mainBoard = new Board

mainBoard.addNumber(0, 0, 2)
mainBoard.addNumber(1, 0, 2)
mainBoard.addNumber(3, 0, 4)
mainBoard.addNumber(2, 2, 2)
mainBoard.addNumber(1, 2, 2)
mainBoard.addNumber(0, 2, 2)
mainBoard.addNumber(3, 2, 2)
mainBoard.addNumber(3, 3, 2)
mainBoard.addNumber(0, 3, 4)
mainBoard.addNumber(1, 3, 4)
mainBoard.addNumber(2, 3, 4)
mainBoard.addNumber(2, 0, 8)
mainBoard.addNumber(1, 1, 8)

console.log(mainBoard.structure)














