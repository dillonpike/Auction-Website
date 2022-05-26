import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from "./components/Home";
import AuctionPage from "./components/AuctionPage";

function App() {
  return (
      <div className="App">
        <Router>
          <div>
            <Routes>
              <Route path="*" element={<Home/>}/>
              <Route path="/auction/:id" element={<AuctionPage/>}/>
            </Routes>
          </div>
        </Router>
      </div>
  );
}

export default App;
