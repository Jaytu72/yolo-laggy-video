let express = require("express");
let app = express();

app.use(function(req, res, next) {
	next();
});

app.use(express.static("../static"));

app.listen(9000, function() {
	console.log("Serving yolo on 9000");
});