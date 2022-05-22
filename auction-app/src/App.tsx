import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from "./components/Home";

function App() {
  return (
      <div className="App">
        <Router>
          <div>
            <Routes>
              <Route path="*" element={<Home/>}/>
            </Routes>
          </div>
        </Router>
      </div>
  );
}

export default App;
