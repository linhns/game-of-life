import "./style.css";
import { enableMapSet } from "immer";

enableMapSet();

import { render, next, randomGrid } from "./gol.js";

document.querySelector("#app").innerHTML = `
  <div class="wrapper">
    <header>
        <h1 id="title">Conway's Game of Life</h1>
        <p id="tagline">With a functional twist</p>

        <p>Teal cells are alive.</p>
        <p>White cells are dead.</p>
        <p>Click a cell to change its status</p>
        <p>Read <a href="https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life"
                    title="Conway's Game of Life on Wikipedia">here</a> for more
        </p>
    </header>

    <main>
        <section id="controls">
            <form id="grid-size-settings">
                <label for="num-rows"> Rows:</label>
                <input id="num-rows" type="number" name="rows" min="2" max="20" value="8" required>
                <label for="num-cols"> Columns:</label>
                <input id="num-cols" type="number" name="rows" min="2" max="20" value="8" required>
                <button type="button" name="new" id="new-game">New</button>
            </form>
            <button type="button" name="next" id="next">Next</button>
            <button type="button" name="autopilot" id="autopilot">Autopilot</button>

        </section>

        <section id="grid">
        </section>
    </main>

    <footer>
        <p>Made with love by <a href="https://github.com/linhns">linhns</a></p>
    </footer>
  </div>
`;

function parseSettings() {
	const rowsEl = document.getElementById("num-rows");
	const colsEl = document.getElementById("num-cols");
	let rows = +rowsEl.value;
	let cols = +colsEl.value;

	return [rows, cols];
}

let [rows, cols] = parseSettings();

function parseGrid() {
	const cellEls = document.querySelectorAll(".cell");
	const alive = Array.from(cellEls)
		.map((cell, idx) => (cell.classList.contains("alive") ? idx : -1))
		.filter((idx) => idx !== -1);
	return { alive, rows, cols };
}

const turn = () => {
	render(document.querySelector("#grid"), next(parseGrid()));
};

// Add event listeners to the buttons
document.getElementById("next").addEventListener("click", turn);

let running = null;
let autopilotBtn = document.getElementById("autopilot");

function stopAutopilot() {
	autopilotBtn.classList.remove("active");
	clearInterval(running);
	running = null;
}

function newGame() {
	stopAutopilot();
	const [newRows, newCols] = parseSettings();
	rows = newRows;
	cols = newCols;
	render(document.querySelector("#grid"), randomGrid(rows, cols));
}

autopilotBtn.addEventListener("click", () => {
	if (running) {
		stopAutopilot();
	} else {
		autopilotBtn.classList.add("active");
		running = setInterval(turn, 400);
	}
});

let newGameEl = document.getElementById("new-game");
newGameEl.addEventListener("click", () => {
	newGame();
});

newGame();
