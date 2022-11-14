export class NumberSquare {
    constructor(cellX, cellY, value, board) {
        this.board = board
        this.squareElement = document.createElement("div")
        this.squareElement.style.backgroundColor = this.backgroundColor = this.board.SquareColorByValue[value.toString()]
        this.squareElement.setAttribute("class", "number")
        this.squareElement.style.top = `${cellY * this.board.cellLength}px`
        this.squareElement.style.left = `${cellX * this.board.cellLength}px`
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
            duration: this.board.swipeTimeMS, iterations: 1
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
        this.squareElement.style.backgroundColor = this.backgroundColor = this.board.SquareColorByValue[this.value.toString()]
    }

    moveTo = async (destinationX, destinationY) => {
        const previousSquare = this.board.currentStateTable[destinationX][destinationY]
        const newSquare = this

        // now check if the number just stays on it's own cell:

        if (newSquare.x === destinationX && newSquare.y === destinationY) {
            return
        }

        const translationTiming = {
            duration: this.board.swipeTimeMS, iterations: 1
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
        if (previousSquare) {
            previousSquare.delete()
        }
        this.squareElement.style.top = `${destinationY * this.board.cellLength}px`
        this.squareElement.style.left = `${destinationX * this.board.cellLength}px`
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