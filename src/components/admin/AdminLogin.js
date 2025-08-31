import React, { useState } from 'react';
import axios from 'axios';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [token, setToken] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Make POST request to the backend
      const response = await axios.post('http://localhost/appartment/api/login.php', {
        username,
        password
      });

      // Check the response and save the token if login is successful
      if (response.data.token) {
        // Save JWT token in localStorage (or in-memory state)
        localStorage.setItem('jwt', response.data.token);
        setToken(response.data.token);
        setError('');
        alert('Login successful!');
      } else {
        setError('Invalid credentials!');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred during login.');
    }
  };

  return (
    <div className="login-container">
      <h2>Admin Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
