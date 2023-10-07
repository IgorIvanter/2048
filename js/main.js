class NumberSquare {
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

class Board {
    constructor(swipeTimeMS = 150) {
        this.cellLength = 106
        this.origin = document.getElementById("origin")
        this.scoreElement = document.getElementById("score")
        this.highscoreElement = document.getElementById("highscore")
        this.swipeTimeMS = swipeTimeMS
        this.score = 0
        this.highscore = 0
        this.setScoreTo(0)
        this.updateHighscore()

        this.currentStateTable = [
            [undefined, undefined, undefined, undefined],
            [undefined, undefined, undefined, undefined],
            [undefined, undefined, undefined, undefined],
            [undefined, undefined, undefined, undefined]
        ]

        this.SquareColorByValue = {
            "1": "lightgreen",
            "2": "green",
            "4": "#61c900",
            "8": "#F8F658",
            "16": "#FFBB00",
            "32": "#ED8111",
            "64": "#611C07",
            "128": "#510000",
            "256": "#810000",
            "512": "#f13200",
            "1024": "#ff0000",
            "2048": "#ff0044",
            "4096": "#ff009f",
            "8192": "#ff40ff"
        }

        this.gameOverBanner = document.getElementById("game-over-banner")
        this.gameOverFlag = false

        // Initial setup:

        this.addNumberSquare(0, 0, 1)
        this.addNumberSquare(0, 3, 4)
        this.addNumberSquare(3, 1, 2)

        // Adding the arrow/wasd keys handler

        window.addEventListener("keydown", this.arrowKeysHandler)

        // Adding click handlers to the four control buttons on mobile

        document.getElementById("btn-left").addEventListener("click", this.swipeLeft)
        document.getElementById("btn-right").addEventListener("click", this.swipeRight)
        document.getElementById("btn-up").addEventListener("click", this.swipeUp)
        document.getElementById("btn-down").addEventListener("click", this.swipeDown)
        document.getElementById("btn-leftTable").addEventListener("click", this.swipeLeft)
        document.getElementById("btn-rightTable").addEventListener("click", this.swipeRight)
        document.getElementById("btn-upTable").addEventListener("click", this.swipeUp)
        document.getElementById("btn-downTable").addEventListener("click", this.swipeDown)

        // Adding click handler to the restart button

        document.getElementById("restart-btn").addEventListener("click", this.reset)
        document.getElementById("color-btn").addEventListener("click", this.changeColors)
        document.getElementById("help-btn").addEventListener("click", this.helpPrompt)

    }

    setScoreTo = (value) => {
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
                let main = this.currentStateTable[columnToCompare][i]

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
        this.spawnRandomNumberSquare()
    }

    swipeLeft = async () => {
        for (let i = 0; i <= 3; ++i) {
            let columnToCompare = 0;
            for (let j = 1; j <= 3; ++j) {
                let current = this.currentStateTable[j][i]
                let main = this.currentStateTable[columnToCompare][i]

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
        this.spawnRandomNumberSquare()
    }

    swipeUp = async () => {
        for (let j = 0; j <= 3; ++j) {
            let rowToCompare = 0;
            for (let i = 1; i <= 3; ++i) {
                let current = this.currentStateTable[j][i]
                let main = this.currentStateTable[j][rowToCompare]

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
        this.spawnRandomNumberSquare()
    }

    swipeDown = async () => {
        for (let j = 0; j <= 3; ++j) {
            let rowToCompare = 3;
            for (let i = 2; i >= 0; --i) {
                let current = this.currentStateTable[j][i]
                let main = this.currentStateTable[j][rowToCompare]

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
        this.spawnRandomNumberSquare()
    }

    spawnRandomNumberSquare = () => {
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
                const currentSquare = this.currentStateTable[i][j]
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
                    const adjacentSquare = this.currentStateTable[adjacentX][adjacentY]
                    if (adjacentSquare != undefined && adjacentSquare.value === currentSquare.value) {
                        return false
                    }
                }
            }
        }
        this.gameOverFlag = true
        return true
    }

    openGameOverBanner = () => {
        this.gameOverBanner.classList.add("active")
    }

    closeGameOverBanner = () => {
        this.gameOverBanner.classList.remove("active")
    }

    arrowKeysHandler = ((e) => {
        if (this.gameOverFlag) {
            return
        }
        if (e.key == 'ArrowUp' || e.key == 'w' || e.key == 'W')
            this.swipeUp();
        else if (e.key == 'ArrowDown' || e.key == 's' || e.key == 'S')
            this.swipeDown();
        else if (e.key == 'ArrowLeft' || e.key == 'a' || e.key == 'A')
            this.swipeLeft();
        else if (e.key == 'ArrowRight' || e.key == 'd' || e.key == 'D')
            this.swipeRight();
    })

    changeColors = () => {
        if (document.querySelector("#input") == null) {
            const main = document.querySelector("main");

            const div = document.createElement("div");
            div.setAttribute('id', 'colorDiv');

            let input = document.createElement("input");
            input.setAttribute('id', 'input');
            input.type = "color";

            const ok = document.createElement("button");
            ok.setAttribute('id', 'okC-btn');
            ok.innerText = "Select";
            ok.style.fontFamily = "'Roboto', sans-serif";

            const reset = document.createElement("button");
            reset.setAttribute('id', 'resetC-btn');
            reset.innerText = "Reset";
            reset.style.fontFamily = "'Roboto', sans-serif";

            const p = document.createElement("p");
            p.innerText = "Pick Background color:  ";
            p.style.display = "inline";
            p.style.fontSize = "30px";
            p.style.backgroundColor = "white";
            p.style.fontFamily = "'Roboto', sans-serif";


            div.appendChild(p);
            div.appendChild(input);
            div.appendChild(ok);
            div.appendChild(reset);

            if (document.querySelector("#input2") == null) {
                const div2 = document.createElement("div");
                div2.setAttribute('id', 'colorDiv2');

                let input2 = document.createElement("input");
                input2.setAttribute('id', 'input2');
                input2.type = "color";

                const ok2 = document.createElement("button");
                ok2.setAttribute('id', 'okC-btn2');
                ok2.innerText = "Select";
                ok2.style.fontFamily = "'Roboto', sans-serif";

                const reset2 = document.createElement("button");
                reset2.setAttribute('id', 'resetC-btn2');
                reset2.innerText = "Reset";
                reset2.style.fontFamily = "'Roboto', sans-serif";

                const p2 = document.createElement("p");
                p2.innerText = "Pick Secondary color:  ";
                p2.style.display = "inline";
                p2.style.fontSize = "30px";
                p2.style.backgroundColor = "white";
                p2.style.fontFamily = "'Roboto', sans-serif";

                div2.appendChild(p2);
                div2.appendChild(input2);
                div2.appendChild(ok2);
                div2.appendChild(reset2);

                main.insertBefore(div2, main.firstChild);
            }
            main.insertBefore(div, main.firstChild);

            document.getElementById("okC-btn").addEventListener("click", this.changeBackgroundColors);
            document.getElementById("resetC-btn").addEventListener("click", this.resetBackgroundColors);
            document.getElementById("okC-btn2").addEventListener("click", this.changeSecondaryColors);
            document.getElementById("resetC-btn2").addEventListener("click", this.resetSecondaryColors);
        } else if (document.querySelector("#input2") == null) {
            const divToDelete = document.querySelector("#colorDiv");
            divToDelete.parentNode.removeChild(divToDelete);

            const main = document.querySelector("main");

            const div = document.createElement("div");
            div.setAttribute('id', 'colorDiv');

            let input = document.createElement("input");
            input.setAttribute('id', 'input');
            input.type = "color";

            const ok = document.createElement("button");
            ok.setAttribute('id', 'okC-btn');
            ok.innerText = "Select";
            ok.style.fontFamily = "'Roboto', sans-serif";

            const reset = document.createElement("button");
            reset.setAttribute('id', 'resetC-btn');
            reset.innerText = "Reset";
            reset.style.fontFamily = "'Roboto', sans-serif";

            const p = document.createElement("p");
            p.innerText = "Pick Background color:  ";
            p.style.display = "inline";
            p.style.fontSize = "30px";
            p.style.backgroundColor = "white";
            p.style.fontFamily = "'Roboto', sans-serif";


            div.appendChild(p);
            div.appendChild(input);
            div.appendChild(ok);
            div.appendChild(reset);

            if (document.querySelector("#input2") == null) {
                const div2 = document.createElement("div");
                div2.setAttribute('id', 'colorDiv2');

                let input2 = document.createElement("input");
                input2.setAttribute('id', 'input2');
                input2.type = "color";

                const ok2 = document.createElement("button");
                ok2.setAttribute('id', 'okC-btn2');
                ok2.innerText = "Select";
                ok2.style.fontFamily = "'Roboto', sans-serif";

                const reset2 = document.createElement("button");
                reset2.setAttribute('id', 'resetC-btn2');
                reset2.innerText = "Reset";
                reset2.style.fontFamily = "'Roboto', sans-serif";

                const p2 = document.createElement("p");
                p2.innerText = "Pick Secondary color:  ";
                p2.style.display = "inline";
                p2.style.fontSize = "30px";
                p2.style.backgroundColor = "white";
                p2.style.fontFamily = "'Roboto', sans-serif";

                div2.appendChild(p2);
                div2.appendChild(input2);
                div2.appendChild(ok2);
                div2.appendChild(reset2);

                main.insertBefore(div2, main.firstChild);
            }
            main.insertBefore(div, main.firstChild);

            document.getElementById("okC-btn").addEventListener("click", this.changeBackgroundColors);
            document.getElementById("resetC-btn").addEventListener("click", this.resetBackgroundColors);
            document.getElementById("okC-btn2").addEventListener("click", this.changeSecondaryColors);
            document.getElementById("resetC-btn2").addEventListener("click", this.resetSecondaryColors);

        } else {
            const divToDelete = document.querySelector("#colorDiv");
            divToDelete.parentNode.removeChild(divToDelete);

            const divToDelete2 = document.querySelector("#colorDiv2");
            divToDelete2.parentNode.removeChild(divToDelete2);
        }
    }

    resetBackgroundColors = () => {
        const body = document.querySelector("body");
        body.style.backgroundColor = '#2f4f4f';
        const divToDelete = document.querySelector("#colorDiv");
        divToDelete.parentNode.removeChild(divToDelete);
    }

    changeBackgroundColors = () => {
        let input = document.querySelector("#input");
        const body = document.querySelector("body");
        let pickedColor = input.value;
        body.style.backgroundColor = pickedColor;
        const divToDelete = document.querySelector("#colorDiv");
        divToDelete.parentNode.removeChild(divToDelete);
    }

    resetSecondaryColors = () => {
        const header = document.querySelector("header");

        header.style.color = "orange";

        document.querySelector(".game-over-banner > button").style.backgroundColor = "orange";
        document.querySelector("#color-btn").style.backgroundColor = "orange";
        document.querySelector("#help-btn").style.backgroundColor = "orange";
        document.querySelector("#btn-upTable").style.backgroundColor = "orange";
        document.querySelector("#btn-downTable").style.backgroundColor = "orange";
        document.querySelector("#btn-leftTable").style.backgroundColor = "orange";
        document.querySelector("#btn-rightTable").style.backgroundColor = "orange";
        document.querySelector("#btn-upTable").style.backgroundColor = "orange";

        const divToDelete = document.querySelector("#colorDiv2");
        divToDelete.parentNode.removeChild(divToDelete);
    }

    changeSecondaryColors = () => {
        let input2 = document.querySelector("#input2");
        const header = document.querySelector("header");
        let pickedColor = input2.value;

        header.style.color = pickedColor;

        document.querySelector(".game-over-banner > button").style.backgroundColor = pickedColor;
        document.querySelector("#color-btn").style.backgroundColor = pickedColor;
        document.querySelector("#help-btn").style.backgroundColor = pickedColor;
        document.querySelector("#btn-upTable").style.backgroundColor = pickedColor;
        document.querySelector("#btn-downTable").style.backgroundColor = pickedColor;
        document.querySelector("#btn-leftTable").style.backgroundColor = pickedColor;
        document.querySelector("#btn-rightTable").style.backgroundColor = pickedColor;
        document.querySelector("#btn-upTable").style.backgroundColor = pickedColor;


        const divToDelete = document.querySelector("#colorDiv2");
        divToDelete.parentNode.removeChild(divToDelete);
    }

    helpPrompt = () => {
        if (document.querySelector("#help") == null) {
            const main = document.querySelector("main");
            const div = document.createElement("div");
            div.setAttribute('id', 'help');
            const p = document.createElement("p");
            p.innerText = "Use WASD or the Arrow Keys!";
            p.style.backgroundColor = 'white';
            p.style.textAlign = "center";
            p.style.fontSize = "150%";
            div.appendChild(p);
            main.insertBefore(div, main.firstChild);
        } else {
            const divToDelete = document.querySelector("#help");
            divToDelete.parentNode.removeChild(divToDelete);
        }
    }

    reset = () => {
        for (let i = 0; i <= 3; i++) {
            for (let j = 0; j <= 3; j++) {
                if (this.currentStateTable[i][j])
                    this.currentStateTable[i][j].delete()
            }
        }
        this.setScoreTo(0)
        this.gameOverFlag = false
        this.closeGameOverBanner()

        // here actually some random setup should appear, but I just coded it for now

        this.addNumberSquare(0, 0, 1)
        this.addNumberSquare(0, 1, 4)
        this.addNumberSquare(0, 2, 2)
    }
}

const mainBoard = new Board
