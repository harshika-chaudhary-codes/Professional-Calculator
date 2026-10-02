let currentExpression = "";

let lastAnswer = 0;

let angleMode = "DEG";


const expressionDisplay =
    document.getElementById("expression");

const resultDisplay =
    document.getElementById("result");

const historyList =
    document.getElementById("historyList");


/* =========================
   BUTTON EVENTS
========================= */

document.querySelectorAll(
    "[data-value]"
).forEach(button => {

    button.addEventListener(
        "click",
        () => {

            insertValue(
                button.dataset.value
            );

        }
    );

});


/* =========================
   SPECIAL BUTTONS
========================= */

document.getElementById(
    "equals"
).addEventListener(
    "click",
    calculate
);


document.getElementById(
    "clear"
).addEventListener(
    "click",
    clearAll
);


document.getElementById(
    "delete"
).addEventListener(
    "click",
    deleteLast
);


document.getElementById(
    "backspace"
).addEventListener(
    "click",
    backspace
);


document.getElementById(
    "angleMode"
).addEventListener(
    "click",
    toggleAngleMode
);


document.getElementById(
    "clearHistory"
).addEventListener(
    "click",
    clearHistory
);


/* =========================
   DISPLAY
========================= */

function updateDisplay() {

    expressionDisplay.textContent =
        currentExpression || "";

    resultDisplay.textContent =
        currentExpression || "0";
}


/* =========================
   INSERT
========================= */

function insertValue(value) {

    currentExpression += value;

    updateDisplay();
}


/* =========================
   DELETE
========================= */

function deleteLast() {

    currentExpression =
        currentExpression.slice(0, -1);

    updateDisplay();
}


/* =========================
   BACKSPACE
========================= */

function backspace() {

    const functions = [
        "asin(",
        "acos(",
        "atan(",
        "sqrt(",
        "sin(",
        "cos(",
        "tan(",
        "log(",
        "ln(",
        "abs(",
        "exp(",
        "floor(",
        "ceil(",
        "round(",
        "factorial(",
        "cbrt("
    ];


    for (let func of functions) {

        if (
            currentExpression.endsWith(func)
        ) {

            currentExpression =
                currentExpression.slice(
                    0,
                    -func.length
                );

            updateDisplay();

            return;
        }
    }


    deleteLast();
}


/* =========================
   CLEAR
========================= */

function clearAll() {

    currentExpression = "";

    expressionDisplay.textContent = "";

    resultDisplay.textContent = "0";
}


/* =========================
   ANGLE MODE
========================= */

function toggleAngleMode() {

    angleMode =
        angleMode === "DEG"
            ? "RAD"
            : "DEG";


    document.getElementById(
        "angleMode"
    ).textContent = angleMode;
}


/* =========================
   TRIG FUNCTIONS
========================= */

function sin(x) {

    return angleMode === "DEG"
        ? Math.sin(
            x * Math.PI / 180
        )
        : Math.sin(x);
}


function cos(x) {

    return angleMode === "DEG"
        ? Math.cos(
            x * Math.PI / 180
        )
        : Math.cos(x);
}


function tan(x) {

    return angleMode === "DEG"
        ? Math.tan(
            x * Math.PI / 180
        )
        : Math.tan(x);
}


function asin(x) {

    let value = Math.asin(x);

    return angleMode === "DEG"
        ? value * 180 / Math.PI
        : value;
}


function acos(x) {

    let value = Math.acos(x);

    return angleMode === "DEG"
        ? value * 180 / Math.PI
        : value;
}


function atan(x) {

    let value = Math.atan(x);

    return angleMode === "DEG"
        ? value * 180 / Math.PI
        : value;
}


/* =========================
   FACTORIAL
========================= */

function factorial(n) {

    if (
        n < 0 ||
        !Number.isInteger(n)
    ) {

        throw new Error(
            "Factorial requires a non-negative integer"
        );
    }


    let result = 1;


    for (
        let i = 2;
        i <= n;
        i++
    ) {

        result *= i;
    }


    return result;
}


/* =========================
   PREPARE EXPRESSION
========================= */

function prepareExpression(expression) {

    let exp = expression;


    exp = exp.replace(
        /π/g,
        "Math.PI"
    );


    exp = exp.replace(
        /\be\b/g,
        "Math.E"
    );


    exp = exp.replace(
        /Ans/g,
        `(${lastAnswer})`
    );


    exp = exp.replace(
        /÷/g,
        "/"
    );


    exp = exp.replace(
        /×/g,
        "*"
    );


    exp = exp.replace(
        /\^/g,
        "**"
    );


    exp = exp.replace(
        /(\d+(?:\.\d+)?)%/g,
        "($1/100)"
    );


    return exp;
}


/* =========================
   CALCULATE
========================= */

function calculate() {

    if (!currentExpression) {
        return;
    }


    try {

        const original =
            currentExpression;


        const expression =
            prepareExpression(
                currentExpression
            );


        const functions = {

            sin,
            cos,
            tan,

            asin,
            acos,
            atan,

            sqrt: Math.sqrt,

            cbrt: Math.cbrt,

            abs: Math.abs,

            log: Math.log10,

            ln: Math.log,

            exp: Math.exp,

            floor: Math.floor,

            ceil: Math.ceil,

            round: Math.round,

            factorial,

            max: Math.max,

            min: Math.min

        };


        const names =
            Object.keys(functions);

        const values =
            Object.values(functions);


        const evaluator =
            new Function(
                ...names,
                `"use strict"; return (${expression});`
            );


        let answer =
            evaluator(...values);


        if (!Number.isFinite(answer)) {

            throw new Error(
                "Invalid mathematical result"
            );
        }


        if (
            Math.abs(answer) < 1e-12
        ) {

            answer = 0;

        } else {

            answer =
                Number(
                    answer.toPrecision(12)
                );
        }


        lastAnswer = answer;


        addHistory(
            original,
            answer
        );


        expressionDisplay.textContent =
            original;


        resultDisplay.textContent =
            formatNumber(answer);


        currentExpression =
            String(answer);

    }


    catch (error) {

        expressionDisplay.textContent =
            error.message;

        resultDisplay.textContent =
            "Error";
    }
}


/* =========================
   FORMAT NUMBER
========================= */

function formatNumber(number) {

    if (
        Math.abs(number) >= 1e12 ||
        (
            Math.abs(number) > 0 &&
            Math.abs(number) < 1e-9
        )
    ) {

        return number.toExponential(8);
    }


    return number.toLocaleString(
        "en-US",
        {
            maximumFractionDigits: 10
        }
    );
}


/* =========================
   HISTORY
========================= */

function addHistory(
    expression,
    result
) {

    const empty =
        document.querySelector(
            ".empty-history"
        );


    if (empty) {
        empty.remove();
    }


    const item =
        document.createElement("div");


    item.className =
        "history-item";


    item.innerHTML = `
        <div class="history-expression">
            ${escapeHTML(expression)}
        </div>

        <div class="history-result">
            = ${escapeHTML(
                formatNumber(result)
            )}
        </div>
    `;


    item.addEventListener(
        "click",
        () => {

            currentExpression =
                String(result);

            updateDisplay();
        }
    );


    historyList.prepend(item);
}


/* =========================
   CLEAR HISTORY
========================= */

function clearHistory() {

    historyList.innerHTML = `
        <div class="empty-history">
            No calculations yet
        </div>
    `;
}


/* =========================
   SECURITY
========================= */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================
   KEYBOARD SUPPORT
========================= */

document.addEventListener(
    "keydown",
    function(event) {

        const key = event.key;


        if (
            /[0-9+\-*/().]/.test(key)
        ) {

            let value = key;


            if (key === "*") {
                value = "×";
            }


            if (key === "/") {
                value = "÷";
            }


            insertValue(value);

            return;
        }


        if (
            key === "Enter" ||
            key === "="
        ) {

            event.preventDefault();

            calculate();

            return;
        }


        if (
            key === "Backspace"
        ) {

            backspace();

            return;
        }


        if (
            key === "Escape"
        ) {

            clearAll();

            return;
        }


        if (key === "%") {

            insertValue("%");
        }

    }
);


/* =========================
   INITIAL DISPLAY
========================= */

updateDisplay();
