import React, { useState } from 'react';
import axios from 'axios';  // Import axios to make HTTP requests

const RegisterPage = ({ onRegisterSubmit }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [twitterHandle, setTwitterHandle] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newUser = {
      username,
      password,
      twitterHandle,
    };

    try {
      // Make a POST request to the backend to register the user
      const response = await axios.post('/api/auth/register', newUser);

      if (response.status === 201) {
        console.log('User registered successfully');
        onRegisterSubmit();
      }
    } catch (err) {
      console.error('Error registering user:', err.response?.data?.message || err.message);
    }
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
