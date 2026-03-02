import { useState } from "react";
import "./SignUpForm.css";

export default function SignUpForm() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: connect to backend
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
      </form>
    </div>
  );
}
