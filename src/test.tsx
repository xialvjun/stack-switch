import * as React from "react";
import { Component } from "react";
import { render } from "react-dom";
import { BrowserRouter, Link } from "react-router-dom";
import { StackSwitch } from "./index";

render(
  <BrowserRouter>
    <div>
      <div>
        <Link to="/">home</Link>
        <br />
        <Link to="/about">about</Link>
        <br />
        <Link to="/detail">detail</Link>
        <br />
      </div>
      <br />
      <br />
      <StackSwitch
        routes={[
          { path: "/about", render: () => <div>about</div> },
          { path: "/detail", render: () => <div>detail</div> },
          { path: "/", render: () => <div>home</div> }
        ]}
      />
    </div>
  </BrowserRouter>,
  document.querySelector("#root")
);
