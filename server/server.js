const exp = require("constants");
const express = require("express");
const app  = express();
const port = 3000;
const host = "localhost";


app.get("/calculate/add/:num1/:num2", (req,res) => {
    console.log("ADD received");
    let num1 = Number(req.params.num1);
    let num2 = Number(req.params.num2);
    res.send(`${num1+num2}`)
});

app.get("/calculate/sub/:num1/:num2", (req,res) => {
    console.log("SUB received");
    let num1 = Number(req.params.num1);
    let num2 = Number(req.params.num2);
    res.send(`${num1-num2}`)
});

app.get("/", (req,res) => {
    res.send(`<html>
    <body>

        <p>This is an example website.
        <p>Here is your randome number: ${Math.floor(Math.random()*100)}</p>

        <p><b>A:</b> <input id=a oninput="update_answer();">
        <p><b>B:</b> <input id=b oninput="update_answer();">

        <p><b>A+B:</b> <span id=answer></span>

    </body>
    <script src="scripts/client.js"></script>
</html>`)
});




app.listen(port,host, () =>
 console.log(`Example app listening at http://${host}:${port}`))
