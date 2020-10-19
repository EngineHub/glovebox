import "whatwg-fetch";
import React from "react";
import ReactDOM from "react-dom";
import {App} from "./components/app/App";

function main(): void {
    ReactDOM.render(
        <App/>,
        document.getElementById("app-container")
    );
}

main();
