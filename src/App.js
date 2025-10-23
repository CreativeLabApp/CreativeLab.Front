import React from "react";
import HomePage from "./pages/HomePage/HomePage"
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout/Layout"
import "./styles/variables.css";
import "./styles/global.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
      </Route>
    </Routes>
  );
}

export default App;