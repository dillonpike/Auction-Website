import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from "./components/Home";
import AuctionPage from "./components/AuctionPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CreateAuctionPage from "./pages/CreateAuctionPage";
import {Alert, AlertColor, Snackbar} from "@mui/material";
import NavigationBar from "./components/NavigationBar";
import ProfilePage from "./pages/ProfilePage";

function App() {

    const [snackOpen, setSnackOpen] = React.useState(false)
    const [snackMessage, setSnackMessage] = React.useState("")
    const [snackSeverity, setSnackSeverity] = React.useState<AlertColor>("error")

    const handleSnackClose = (event?: React.SyntheticEvent | Event,
                              reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackOpen(false);
    };

    const handleSnackError = (message: string) => {
        setSnackMessage(message)
        setSnackOpen(true)
        setSnackSeverity("error")
    }

    const handleSnackSuccess = (message: string) => {
        setSnackMessage(message)
        setSnackOpen(true)
        setSnackSeverity("success")
    }

    const snackbar = () => {
        return (
            <Snackbar
                autoHideDuration={6000}
                open={snackOpen}
                onClose={handleSnackClose}
                key={snackMessage}
            >
                <Alert onClose={handleSnackClose} severity={snackSeverity} sx={{
                    width: '100%' }}>
                    {snackMessage}
                </Alert>
            </Snackbar>
        )
    }

  return (
      <div className="App">
        {snackbar()}
        <Router>
          <div>
            <Routes>
              <Route path="*" element={<Home/>}/>
              <Route path="/auction/:id" element={<AuctionPage handleSnackSuccess={handleSnackSuccess} handleSnackError={handleSnackError}/>}/>
              <Route path="/login" element={<LoginPage/>}/>
              <Route path="/register" element={<RegisterPage/>}/>
              <Route path="/create-auction" element={<CreateAuctionPage handleSnackSuccess={handleSnackSuccess} handleSnackError={handleSnackError}/>}/>
              <Route path="/edit-auction/:id" element={<CreateAuctionPage handleSnackSuccess={handleSnackSuccess} handleSnackError={handleSnackError}/>}/>
              <Route path="/profile" element={<ProfilePage handleSnackSuccess={handleSnackSuccess} handleSnackError={handleSnackError}/>}/>
            </Routes>
          </div>
        </Router>
      </div>
  );
}

export default App;
