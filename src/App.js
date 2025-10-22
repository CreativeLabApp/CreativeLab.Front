import React from "react";
import HomePage from "./pages/HomePage/HomePage"
import { Routes, Route } from "react-router-dom";
import "./styles/variables.css";
import "./styles/global.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage/>}/>
    </Routes>
  );
}

export default App;