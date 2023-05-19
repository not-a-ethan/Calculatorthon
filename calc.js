const Tesseract = require("tesseract.js");

// get the text from a url
function getText(url, type) {
	if (type === "image") {
		return Tesseract.recognize(url, "eng").then(function(res) { return res.data.text; });
	}
}

// not the most accurate
getText("https://coding398.dev/calc/probableDeath.png", "image").then(console.log);

// get my tokeniser
const Tokeniser = require("./Tokeniser");

const digits = "0123456789";

function solveStandardEquation(equation) {
	// parenthesis: this finds any parenthesis and uses recursion to solve them, then replace the parenthesis with the solution
	let openBracket = equation.indexOf("(");
	while (openBracket !== -1) {
		const closeBracket = equation.indexOf(")");
		equation = equation.substring(0, openBracket) + solveStandardEquation(equation.substr(openBracket + 1, closeBracket - openBracket - 1)) + equation.substr(closeBracket + 1);
		openBracket = equation.indexOf("(");
	}
	// this'll split up the equation into parts for us
	const stack = Tokeniser.parseString(equation);
	// convert number tokens to numbers
	for (let i = 0; i < stack.length; i++) {
		// if the token includes a number
		if (/[0-9]/.test(stack[i])) {
			// convert it to a number
			stack[i] = Number(stack[i]);
		}
	}
	// indices
	for (let i = 0; i < stack.length; i++) {
		if (stack[i] === "**") {
			if (i === 0 || stack.length - 1) {
				stack.splice(i, 1);
				i--;
				continue;
			}
			stack[i - 1] = stack[i - 1] ** stack[i + 1];
			stack.splice(i, 2);
			i--;
		} else if (stack[i] === "√") {
			if (i === stack.length - 1) {
				stack.splice(i, 1);
				i--;
				continue;
			}
			stack[i + 1] = Math.sqrt(stack[i + 1]);
			stack.splice(i, 1);
		} else if (stack[i] === "∛") {
			if (i === stack.length - 1) {
				stack.splice(i, 1);
				i--;
				continue;
			}
			stack[i + 1] = Math.cbrt(stack[i + 1]);
			stack.splice(i, 1);
		}
	}
	// multiplication and division
	for (let i = 0; i < stack.length; i++) {

		if (stack[i] === "*") {
			if (i === 0 || i === stack.length - 1) {
				stack.splice(i, 1);
				i--;
				continue;
			}
			stack[i - 1] *= stack[i + 1];
			stack.splice(i, 2);
			i--;
		} else if (stack[i] === "/") {
			if (i === 0 || i === stack.length - 1) {
				stack.splice(i, 1);
				i--;
				continue;
			}
			stack[i - 1] /= stack[i + 1];
			stack.splice(i, 2);
			i--;
		}
	}
	// addition and subtraction
	for (let i = 0; i < stack.length; i++) {
		if (stack[i] === "+") {
			if (i === 0 || i === stack.length - 1) {
				stack.splice(i, 1);
				i--;
				continue;
			}
			stack[i - 1] += stack[i + 1];
			stack.splice(i, 2);
			i--;
		} else if (stack[i] === "-") {
			if (i === 0 || i === stack.length - 1) {
				stack.splice(i, 1);
				i--;
				continue;
			}
			stack[i - 1] -= stack[i + 1];
			stack.splice(i, 2);
			i--;
		}
	}
	// return the last token (if all has gone well, it should be the only token left in the tokens array)
	return stack[0];
}

// these are the replacements we make to our question
const questionReplacements = [
	[["multiplied by", "times", "x", "×", "by"], "*"],
	[["divided by", "over"], "/"],
	[["sum", "sum of", "add", "plus", "and"], "+"],
	[["subtract", "subtracted from", "minus"], "-"],
	[["to the power of"], "**"],
	[["square root"], "√"],
	[["of"], ""],
];

// word versions of numbers
const numbers = [
	"zero",
	"one",
	"two",
	"three",
	"four",
	"five",
	"six",
	"seven",
	"eight",
	"nine",
	"ten",
	"eleven",
	"twelve",
	"thirteen",
	"fourteen",
	"fifteen",
	"sixteen",
	"seventeen",
	"eighteen",
	"nineteen",
	"twenty",
	"twenty-one",
	"twenty-two",
	"twenty-three",
	"twenty-four",
	"twenty-five"
];

const operators = Tokeniser.settings.operators;
const separators = Tokeniser.settings.separators;

module.exports = async function(question) {
	// if it's a url
	if (question.text.substr(0, 4) === "http") {
		const extension = question.text.split(".").at(-1);
		// if it's an image
		if (extension === "png" || extension === "webp") {
			return 0; // as of right now, we don't want to waste time attempting to read the text from the image since we can't do that accurately enough
			question.text = await getText(question.text, "image");
		}
		// if it's audio
		if (extension === "mp3") {
			return 0;
		}
	}

	// if it's algebra
	if (question.text.includes("=")) {
		console.log(question.name);
		return 0;
	}

	// some replacements to help us understand our question
	const tokens = Tokeniser.parseString(question.text);
	tokens:
	for (let i = 0; i < tokens.length; i++) {
		// if the question is potentially related to PI
		if (tokens[i].toLowerCase() === "pi") {
			return Math.PI;
		}
		const idx = numbers.indexOf(tokens[i]);
		if (idx !== -1) {
			tokens[i] = idx.toString();
			continue;
		}
		replacements:
		for (let j = 0; j < questionReplacements.length; j++) {
			// this is some pretty horific code...
			const idx1 = questionReplacements[j][0].indexOf(tokens[i].toLowerCase());
			const idx2 = i < tokens.length - 1 ? questionReplacements[j][0].indexOf(tokens[i].toLowerCase() + " " + tokens[i + 1].toLowerCase()) : -1;
			const idx3 = i < tokens.length - 2 ? questionReplacements[j][0].indexOf(tokens[i].toLowerCase() + " " + tokens[i + 1].toLowerCase() + " " + tokens[i + 2].toLowerCase()) : -1;
			const idx4 = i < tokens.length - 3 ? questionReplacements[j][0].indexOf(tokens[i].toLowerCase() + " " + tokens[i + 1].toLowerCase() + " " + tokens[i + 2].toLowerCase() + " " + tokens[i + 2].toLowerCase()) : -1;
			if (idx1 !== -1) {
				tokens[i] = questionReplacements[j][1];
				break replacements;
			} else if (idx2 !== -1) {
				tokens[i] = questionReplacements[j][1];
				tokens.splice(i + 1, 1);
				break replacements;
			} else if (idx3 !== -1) {
				tokens[i] = questionReplacements[j][1];
				tokens.splice(i + 1, 2);
				break replacements;
			} else if (idx4 !== -1) {
				tokens[i] = questionReplacements[j][1];
				tokens.splice(i + 1, 3);
				break replacements;
			}
		}
		// if the token is somehow empty now
		if (tokens[i] === "") {
			tokens.splice(i, 1);
			continue
		}
	}
	while (!Number(tokens[0]) && !operators.includes(tokens[0]) && !separators.includes(tokens[0])) {
		tokens.shift();
	}
	while (!Number(tokens[tokens.length - 1]) && !operators.includes(tokens[tokens.length - 1]) && !separators.includes(tokens[tokens.length - 1])) {
		tokens.pop();
	}
	question.text = tokens.join(" ");

	// this'll solve any basic equation that's just numbers and operators
	let answer = solveStandardEquation(question.text.replace(/[[a-zA-Z?'"]/g, ""));
	let idx = question.text.toLowerCase().indexOf("simplified to");
	if (idx !== -1) {
		let n = "";
		while (!digits.includes(question.text[idx])) {
			idx++;
		}
		while (digits.includes(question.text[idx])) {
			n += question.text[idx];
			idx++;
		}
		answer = Number(answer).toFixed(Number(n));
	}
	/* DEBUGGING */
	// /*
	if (question.name === "Garbage disposal") {
		console.log(question.name);
		console.log(answer + "\n");
	}
	// */
	return (Number(answer) || 0).toString();
};