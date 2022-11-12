const origin = document.getElementById("origin")

const CELL_LENGTH = `106`   // TODO: make this constant adapt to the particular board dimensions

const COLORS = {
    "1" : "green",
    "2" : "brown",
    "4" : "blue"
}       

// The object COLORS defines the color of a number depending on it's value

// The Number class represents numbers on the board

class Number {
    constructor(cellX, cellY, value) {
        this.body = document.createElement("div")
        this.body.style.backgroundColor = this.backgroundColor = COLORS[value.toString()]
        this.body.setAttribute("class", "number")
        this.body.style.top = `${cellY * CELL_LENGTH}px`
        this.body.style.left = `${cellX * CELL_LENGTH}px`
        this.x = cellX
        this.y = cellY
        this.value = value
        this.valueElement = document.createElement("h1")
        this.valueElement.innerText = `${value}`
        this.body.appendChild(this.valueElement)
        origin.appendChild(this.body)

        

        this.body.addEventListener("click", () => {
            this.move(1, 0)
        })
    }

    move = async (destinationX, destinationY) => {
        const translationTiming = {
            duration: 500, iterations: 1
        }
        const numTranslation = [
            {
                top: this.body.style.top,
                left: this.body.style.left
            },
            {
                top: `${destinationY * CELL_LENGTH}px`,
                left: `${destinationX * CELL_LENGTH}px`
            }
        ]
        await this.body.animate(numTranslation, translationTiming)

        this.body.style.top = `${destinationY * CELL_LENGTH}px`
        this.body.style.left = `${destinationX * CELL_LENGTH}px`
    }
}

// experimental initial setup of the board

const someNum = new Number(3, 2, 1)

const num1 = new Number(1, 3, 2)

const num2 = new Number(3, 1, 4)




