import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from "./components/Home";
import AuctionPage from "./components/AuctionPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CreateAuctionPage from "./pages/CreateAuctionPage";

function App() {
  return (
      <div className="App">
        <Router>
          <div>
            <Routes>
              <Route path="*" element={<Home/>}/>
              <Route path="/auction/:id" element={<AuctionPage/>}/>
              <Route path="/login" element={<LoginPage/>}/>
              <Route path="/register" element={<RegisterPage/>}/>
              <Route path="/create-auction" element={<CreateAuctionPage/>}/>
            </Routes>
          </div>
        </Router>
      </div>
  );
}

export default App;
