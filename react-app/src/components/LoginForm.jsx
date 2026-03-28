import { useState } from "react";
import "./css files/LoginForm.css";
import { useNavigate } from "react-router-dom";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [responseMessage, setResponseMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
   const response = await fetch("http://localhost:3001/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });

    const data = await response.json();
    setResponseMessage(data.message);
    if(response.ok){
      navigate('/dashboard');
      localStorage.setItem('isLoggedIn', 'true');
    }
  };

  return (
    <div className="login-card">
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="login-field">
          <label className="login-label" htmlFor="login-email">
            Email
          </label>
          <input
            className="login-input"
            id="login-email"
            type="email"
            placeholder="sample@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="login-field">
          <label className="login-label" htmlFor="login-password">
            Password
          </label>
          <input
            className="login-input"
            id="login-password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button className="login-btn" type="submit">
          Login
        </button>

        {responseMessage && <p>{responseMessage}</p>}
      </form>
    </div>
  );
}
