const express = require("express"),
	bodyParser = require("body-parser"),
	cors = require("cors"),
	app = express(),
	calculator = require("./calc");

// host the public folder
app.use(express.static("public"));

// disable cors (REQUIRED, DO NOT DELETE)
app.use(cors());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// respond to get requests
// this displays the webview
app.get("/", function(req, res) {
	// this sends the index.html file
	res.sendFile(__dirname + "/public/index.html");
});

// respond to post requests to the /calculate path
app.post("/calculate", async function(req, res) {
	res.status(200);
	if (req.body.question) {
		req.body.text = req.body.question;
		delete req.body.question;
	}
	/* FOR DEBUGGING */
	// /*
	console.log("Question: " + req.body.text);
	const startTime = performance.now();
	const result = String(await calculator(req.body));
	const endTime = performance.now();
	console.log("Our answer: " + result + "\nIt took us", (endTime - startTime).toFixed(5) + "ms to get this solution.\n");
	res.send(result);
	// */
	// res.send(await calculator(req.body));
});

// this starts the server
app.listen();

/* FOR DEBUGGING */
// /*
(async function() {
	const tests = require("./tests");
	for (let i = 0; i < tests.length; i++) {
		console.log("Question:", tests[i]);
		const startTime = performance.now();
		const result = await calculator({ text: tests[i] });
		const endTime = performance.now();
		console.log("Our answer: " + result + "\nIt took us", (endTime - startTime).toFixed(5) + "ms to get this solution.\n");
	}
})();
// */