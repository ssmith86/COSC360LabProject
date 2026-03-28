import { useState } from "react";
import "./css files/SignUpForm.css";
import { useNavigate } from "react-router-dom";

export default function SignUpForm() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    userName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [responseMessage, setResponseMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if(!form.firstName || !form.lastName || !form.password || !form.confirmPassword || !form.userName ||!form.email){
      setResponseMessage("All fields must be filled");
      return;
    }

    if(form.password !== form.confirmPassword){
      setResponseMessage("Passwords must match");
      return;
    }

    if(form.password.length < 8){
      setResponseMessage("Password must contain at least 8 characters");
      return;
    }

    const response = await fetch("http://localhost:3001/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: form.firstName,
        lastName: form.lastName,
        userName: form.userName,
        email: form.email,
        password: form.password,
      }),
    });

    const data = await response.json();
    setResponseMessage(data.message);
    
    if(response.ok){
      navigate('/login');
    }
  };

  return (
    <div className="signup-card">
      <form className="signup-form" onSubmit={handleSubmit}>
        <div className="signup-field">
          <label className="signup-label" htmlFor="signup-firstname">
            First Name
          </label>
          <input
            className="signup-input"
            id="signup-firstname"
            name="firstName"
            type="text"
            placeholder="Please enter your first name"
            value={form.firstName}
            onChange={handleChange}
          />
        </div>

        <div className="signup-field">
          <label className="signup-label" htmlFor="signup-lastname">
            Last Name
          </label>
          <input
            className="signup-input"
            id="signup-lastname"
            name="lastName"
            type="text"
            placeholder="Please enter your last name"
            value={form.lastName}
            onChange={handleChange}
          />
        </div>
        <div className="signup-field">
          <label className="signup-label" htmlFor="signup-username">
            User Name
          </label>
          <input
            className="signup-input"
            id="signup-username"
            name="userName"
            type="text"
            placeholder="Please enter a username"
            value={form.userName}
            onChange={handleChange}
          />
        </div>
        <div className="signup-field">
          <label className="signup-label" htmlFor="signup-email">
            Email
          </label>
          <input
            className="signup-input"
            id="signup-email"
            name="email"
            type="email"
            placeholder="e.g. johndoe@gmail.com"
            value={form.email}
            onChange={handleChange}
          />
        </div>

        <div className="signup-field">
          <label className="signup-label" htmlFor="signup-password">
            Password
          </label>
          <input
            className="signup-input"
            id="signup-password"
            name="password"
            type="password"
            placeholder="Please enter your password"
            value={form.password}
            onChange={handleChange}
          />
        </div>

        <div className="signup-field">
          <label className="signup-label" htmlFor="signup-confirm">
            Re-enter Password
          </label>
          <input
            className="signup-input"
            id="signup-confirm"
            name="confirmPassword"
            type="password"
            placeholder="Please enter your password again"
            value={form.confirmPassword}
            onChange={handleChange}
          />
        </div>

        <button className="signup-btn" type="submit">
          Save
        </button>
        {responseMessage && (
          <p className="signup-response">{responseMessage}</p>
        )}
      </form>
    </div>
  );
}
