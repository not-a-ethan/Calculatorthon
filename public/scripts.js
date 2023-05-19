const buttons = document.querySelector(".buttons").children;
const inputOutput = document.querySelector(".input-output");

for (let i = 0; i < buttons.length; i++) {
	// btn = the text in the button
	const btn = buttons[i].children[0].textContent;
	buttons[i].addEventListener("click", function() {
		const input = inputOutput.textContent;
		if (btn === "=") {
			fetch("https://calculatorthon-template.not-ethan.repl.co/calculate", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: "Calculator",
					type: 1,
					question: input,
					answer: null
				})
			}).then(function(res) { return res.text(); }).then(function(res) {
				inputOutput.textContent = res;
			});
		} else {
			inputOutput.textContent += btn;
		}
	});
}