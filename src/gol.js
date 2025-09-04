import { produce } from "immer";
import * as R from "ramda";

const randomGrid = (rows, cols) => {
	const alive = R.filter(() => Math.random() >= 0.5, R.range(0, rows * cols));
	return { alive, rows, cols };
};

const wrap = ([row, col], cols) => row * cols + col;
const unwrap = (index, cols) => [Math.floor(index / cols), index % cols];
const next = produce((draft) => {
	const neighbors = (index) => {
		const [row, col] = unwrap(index, draft.cols);
		const deltas = [-1, 0, 1];
		const ds = R.chain((dr) => R.map((dc) => [dr, dc], deltas), deltas);
		const f = R.pipe(
			R.filter(([dr, dc]) => dr !== 0 || dc !== 0),
			R.map(([dr, dc]) => [row + dr, col + dc]),
			R.filter(
				([r, c]) => r >= 0 && r < draft.rows && c >= 0 && c < draft.cols,
			),
			R.map((coord) => wrap(coord, draft.cols)),
		);
		return f(ds);
	};

	const f = R.map(
		R.pipe(
			neighbors,
			R.filter((idx) => draft.alive.includes(idx)),
			R.length,
		),
	);
	const aliveNeighborsCounts = f(R.range(0, draft.rows * draft.cols));

	const pred = (idx) =>
		(R.includes(idx, draft.alive) &&
			R.includes(aliveNeighborsCounts[idx], [2, 3])) ||
		(!R.includes(idx, draft.alive) && aliveNeighborsCounts[idx] === 3);
	draft.alive = R.filter(pred, R.range(0, draft.rows * draft.cols));
});

const setAttributes = (dom, attrs) =>
	Object.entries(attrs).reduce((d, [k, v]) => (d.setAttribute(k, v), d), dom);

const appendChildren = (dom, kids) =>
	kids.reduce(
		(d, c) => (
			d.appendChild(typeof c === "string" ? document.createTextNode(c) : c), d
		),
		dom,
	);

const elt = (name, attributes, ...children) =>
	appendChildren(
		setAttributes(document.createElement(name), attributes),
		children,
	);

const render = (element, { alive, rows, cols }) => {
	const cells = R.times((idx) => {
		const elem = elt("div", {
			class: R.includes(idx, alive) ? "cell alive" : "cell",
		});
		elem.addEventListener("click", function () {
			elem.classList.toggle("alive");
		});
		return elem;
	}, rows * cols);

	const rowNodes = R.times(
		(i) =>
			elt("div", { class: "row" }, ...cells.slice(i * cols, (i + 1) * cols)),
		rows,
	);

	element.replaceChildren(...rowNodes);
};

export { render, next, randomGrid };
