function update_answer() {
    const a = document.getElementById("a").value;
    const b = document.getElementById("b").value;

    const req = new XMLHttpRequest();

    req.onreadystatechange = () => {
        if (req.readyState != XMLHttpRequest.DONE)
            return;
        if (req.status != 200) {
            window.alert("ERROR: check the console");
            console.log(req);
            return;
        }

        // if I get here, all is OK

        let ans = document.getElementById("answer");
        ans.textContent = req.responseText;
    };

    let url = `/calculate/add/${a}/${b}`;
    req.open("GET", url);
    req.send();
}