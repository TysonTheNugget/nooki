import React, { useState } from 'react';
import LandingPage from './pages/LandingPage';
import RegisterPage from './pages/RegisterPage';
import BattleArena from './components/NookiForest';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

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
