import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navbar, Nav } from "react-bootstrap";
import Generate from "../pages/Generate";
import About from "../pages/About";
import LoadingIndicator from "./LoadingIndicator";

class BootstrapNavbar extends React.Component {
  render() {
    return (
      <div>
        <Router>
          <Navbar bg="dark" variant="dark" sticky="top">
            <Navbar.Brand href="/">
              <div className="padded-sm" color="lightblue">
                The Interactive Behavior Analyzer
              </div>
            </Navbar.Brand>
            <Nav>
              {/*  <div className="padded-sm">
                  <Nav.Link href="/">Visualize</Nav.Link>
                </div>
                <div className="padded-sm">
                  <Nav.Link href="/compare">Compare</Nav.Link>
                </div> */}
              <div className="padded-sm">
                <Nav.Link href="/about">About</Nav.Link>
              </div>
            </Nav>
            <Nav className="ms-auto">
              <Nav.Link>
                <LoadingIndicator />
              </Nav.Link>
            </Nav>
          </Navbar>
          <br />
          <Routes>
            <Route path="/" element={<Generate />} />
            {/* <Route path="/compare" element={<Compare />} /> */}
            <Route path="/about" element={<About />} />
          </Routes>
        </Router>
      </div>
    );
  }
}
export default BootstrapNavbar;
