import React, { useState } from 'react';
import './styles.css';  // Import the common styles

const LandingPage = ({ onLogin, onRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userCredentials = { username, password };

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userCredentials)
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token); // Store the JWT in localStorage
        onLogin();  // Notify parent component that login was successful
      } else {
        console.error('Login failed');
      }
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  return (
    <div className="container">
      <div className="form-container">
        <h1 className="title">Nooki Battle Arena</h1>
        <form onSubmit={handleSubmit} className="form">
          <div className="input-group">
            <label className="label">Username:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input"
              required
            />
          </div>
          <div className="input-group">
            <label className="label">Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              required
            />
          </div>
          <button type="submit" className="button">Login</button>
        </form>
        <button onClick={onRegister} className="register-button">Register</button>
      </div>
    </div>
  );
};

export default LandingPage;
