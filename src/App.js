import React, { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import RegisterPage from './pages/RegisterPage';
import BattleArena from './components/BattleArena';  
import connectDB from './db';  // Import the MongoDB connection

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    connectDB();  // Connect to MongoDB when the app starts
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleRegister = () => {
    setShowRegister(true);
  };

  const handleRegisterSubmit = () => {
    setShowRegister(false); // After registration, navigate back to the landing page or log in
  };

  return (
    <div className="App">
      {isLoggedIn ? (
        <BattleArena />  
      ) : showRegister ? (
        <RegisterPage onRegisterSubmit={handleRegisterSubmit} />
      ) : (
        <LandingPage onLogin={handleLogin} onRegister={handleRegister} />
      )}
    </div>
  );
}

export default App;
