import React, { useState } from 'react';
import './styles.css';  // Import the common styles

const RegisterPage = ({ onRegisterSubmit }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [twitterHandle, setTwitterHandle] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const newUser = { username, password, twitterHandle };
    console.log('User registered:', newUser);
    onRegisterSubmit();
  };

  return (
    <div className="container">
      <div className="form-container">
        <h1 className="title">Register</h1>
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
          <div className="input-group">
            <label className="label">Twitter Handle:</label>
            <input
              type="text"
              value={twitterHandle}
              onChange={(e) => setTwitterHandle(e.target.value)}
              className="input"
            />
          </div>
          <button type="submit" className="button">Register</button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
