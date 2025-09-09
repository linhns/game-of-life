import "./style.css";
import { IO } from "monio";
import {
	getElementById,
	querySelectorAll,
	prop,
	setProp,
	bindEvent,
	unbindEvent,
} from "./utils.js";
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

const parseSettings = IO.do(function* () {
	const rowsEl = yield getElementById("num-rows");
	const colsEl = yield getElementById("num-cols");
	const rows = +prop("value")(rowsEl);
	const cols = +prop("value")(colsEl);
	return [rows, cols];
});

const parseGrid = IO.do(function* () {
	const cellEls = yield querySelectorAll(".cell");
	const arr = Array.from(cellEls);
	const alive = arr
		.map((cell, idx) => (cell.classList.contains("alive") ? idx : -1))
		.filter((idx) => idx !== -1);

	const [rows, cols] = yield parseSettings;
	return { alive, rows, cols };
});

const turn = IO.do(function* () {
	const gridEl = yield getElementById("grid");
	const grid = yield parseGrid;
	return render(gridEl, next(grid));
});

let running = null;

const stopAutopilot = IO(() => {
	getElementById("autopilot").run().classList.remove("on-autopilot");
	clearInterval(running);
	running = null;
});

const toggleAutopilot = IO.do(function* () {
	const autopilotBtn = yield getElementById("autopilot");
	if (running) {
		yield stopAutopilot;
	} else {
		autopilotBtn.classList.add("on-autopilot");
		running = setInterval(() => turn.run(), 400);
	}
});

const newGame = IO.do(function* () {
	yield stopAutopilot;
	const [rows, cols] = yield parseSettings;
	const gridEl = yield getElementById("grid");
	return render(gridEl, randomGrid(rows, cols));
});

// Next button
getElementById("next")
	.chain((el) => bindEvent(el, "click", () => turn.run()))
	.run();

// Autopilot button
getElementById("autopilot")
	.chain((el) => bindEvent(el, "click", () => toggleAutopilot.run()))
	.run();

// New Game button
getElementById("new-game")
	.chain((el) => bindEvent(el, "click", () => newGame.run()))
	.run();

newGame.run();
