"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var react_dom_1 = require("react-dom");
var react_router_dom_1 = require("react-router-dom");
var index_1 = require("./index");
react_dom_1.render(React.createElement(react_router_dom_1.BrowserRouter, null,
    React.createElement("div", null,
        React.createElement("div", null,
            React.createElement(react_router_dom_1.Link, { to: "/" }, "home"),
            React.createElement("br", null),
            React.createElement(react_router_dom_1.Link, { to: "/about" }, "about"),
            React.createElement("br", null),
            React.createElement(react_router_dom_1.Link, { to: "/detail" }, "detail"),
            React.createElement("br", null)),
        React.createElement("br", null),
        React.createElement("br", null),
        React.createElement(index_1.StackSwitch, { routes: [
                { path: "/about", render: function () { return React.createElement("div", null, "about"); } },
                { path: "/detail", render: function () { return React.createElement("div", null, "detail"); } },
                { path: "/", render: function () { return React.createElement("div", null, "home"); } }
            ] }))), document.querySelector("#root"));
