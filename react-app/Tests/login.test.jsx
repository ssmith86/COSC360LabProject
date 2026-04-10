
//to run tests, cd into react-app and run `npm test` in the terminal

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import LoginForm from '../src/components/LoginForm';
import { UserAvatarContext } from '../src/context/UserAvatarContext';

// Mock useNavigate from react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockRefreshAvatar = vi.fn();

function renderLoginForm() {
  return render(
    <UserAvatarContext.Provider value={{ refreshAvatar: mockRefreshAvatar }}>
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    </UserAvatarContext.Provider>
  );
}

describe('Login Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  test('renders email and password fields and a login button', () => {
    renderLoginForm();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  test('updates email and password fields when typed into', () => {
    renderLoginForm();
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    fireEvent.change(emailInput, { target: { value: 'test@email.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password' } });

    expect(emailInput.value).toBe('test@email.com');
    expect(passwordInput.value).toBe('password');
  });

  test('navigates to /dashboard on successful regular user login', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        message: 'Login successful',
        userId: '42',
        firstName: 'Bob',
        isAdmin: false,
        isBanned: false,
      }),
    }));

    renderLoginForm();
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/dashboard'));
    expect(localStorage.getItem('isLoggedIn')).toBe('true');
    expect(localStorage.getItem('isAdmin')).toBe('false');
    expect(localStorage.getItem('userId')).toBe('42');
  });

  test('navigates to /admin on successful admin login', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        message: 'Login successful',
        userId: '1',
        firstName: 'Admin',
        isAdmin: true,
        isBanned: false,
      }),
    }));

    renderLoginForm();
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'admin@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'adminpass' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/admin'));
    expect(localStorage.getItem('isAdmin')).toBe('true');
  });

  test('shows error message on failed login', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'Invalid email or password' }),
    }));

    renderLoginForm();
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'wrong@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() =>
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument()
    );
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
