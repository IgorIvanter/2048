const origin = document.getElementById("origin")

const main = document.querySelector('main')

let board = [[-1, -1, -1, -1],
             [-1, -1, -1, -1],
             [-1, -1, -1, -1],
             [-1, -1, -1, -1]]


const colors = {
    "1" : "green",
    "2" : "brown",
    "4" : "blue"
}

const CELL_LENGTH = `106` 

// TODO: make this constant adapt to the particular board dimensions

async function spawnNumber (value, x, y) {
    // insert exception here
    let newNumber = document.createElement("div")
    newNumber.setAttribute("class", "number")
    newNumber.style.backgroundColor = colors[value.toString()]
    newNumber.addEventListener("click", () => {

        


    })
    newNumber.style.top = `${y * CELL_LENGTH}px`
    newNumber.style.left = `${x * CELL_LENGTH}px`
    const newNumberValue = document.createElement("h1")
    newNumberValue.innerText = `${value}`
    newNumber.appendChild(newNumberValue)
    origin.appendChild(newNumber)
    board[x][y] = value

    newNumber.addEventListener("click", () => {
        moveNumLeft(newNumber)
    })
    return newNumber
}


async function moveNumRight(num) {
    const translationTiming = {
        duration: 500, iterations: 1
    }
    const numTranslation = [
        { left: num.style.left},
        { left: '318px' }
      ];
    await num.animate(numTranslation, translationTiming)
    num.style.left = `${3 * CELL_LENGTH}px`
    console.log("click registered")
}

async function moveNumLeft(num) {
    const translationTiming = {
        duration: 500, iterations: 1
    }
    const numTranslation = [
        { right: num.style.right},
        { right: '0px' }
      ];
    await num.animate(numTranslation, translationTiming)
    num.style.right = "0px"
    console.log("click registered")
}



// initial settings for now

spawnNumber(2, 1, 3)

spawnNumber(1, 1, 2)

spawnNumber(4, 3, 1)






