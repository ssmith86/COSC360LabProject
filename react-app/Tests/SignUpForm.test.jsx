// to run tests, cd into react-app and run `npm test` in the terminal
// Tests for SignUpForm client-side validation

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SignUpForm from '../src/components/SignUpForm';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => vi.fn() };
});

function renderSignUpForm() {
  return render(
    <MemoryRouter>
      <SignUpForm />
    </MemoryRouter>
  );
}

describe('SignUpForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders all form fields and submit button', () => {
    renderSignUpForm();
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/user name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
  });

  test('shows error when any field is empty on submit', () => {
    renderSignUpForm();
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(screen.getByText('All fields must be filled')).toBeInTheDocument();
  });

  test('shows error when passwords do not match', () => {
    renderSignUpForm();
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { name: 'firstName', value: 'Bob' } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { name: 'lastName', value: 'Bobson' } });
    fireEvent.change(screen.getByLabelText(/user name/i), { target: { name: 'userName', value: 'BBobson' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { name: 'email', value: 'bob@email.com' } });
    fireEvent.change(screen.getByLabelText(/^password/i), { target: { name: 'password', value: 'Password1!' } });
    fireEvent.change(screen.getByLabelText(/re-enter password/i), { target: { name: 'confirmPassword', value: 'Different1!' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(screen.getByText('Passwords must match')).toBeInTheDocument();
  });

  test('shows error when password is shorter than 8 characters', () => {
    renderSignUpForm();
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { name: 'firstName', value: 'Bon' } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { name: 'lastName', value: 'Bobson' } });
    fireEvent.change(screen.getByLabelText(/user name/i), { target: { name: 'userName', value: 'BBobson' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { name: 'email', value: 'bob@email.com' } });
    fireEvent.change(screen.getByLabelText(/^password/i), { target: { name: 'password', value: 'short' } });
    fireEvent.change(screen.getByLabelText(/re-enter password/i), { target: { name: 'confirmPassword', value: 'short' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(screen.getByText('Password must contain at least 8 characters')).toBeInTheDocument();
  });

  test('shows error when first name contains invalid characters', () => {
    renderSignUpForm();
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { name: 'firstName', value: 'Bob123' } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { name: 'lastName', value: 'Bobson' } });
    fireEvent.change(screen.getByLabelText(/user name/i), { target: { name: 'userName', value: 'BBobson' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { name: 'email', value: 'bob@email.com' } });
    fireEvent.change(screen.getByLabelText(/^password/i), { target: { name: 'password', value: 'Password1!' } });
    fireEvent.change(screen.getByLabelText(/re-enter password/i), { target: { name: 'confirmPassword', value: 'Password1!' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(screen.getByText(/first name can only contain/i)).toBeInTheDocument();
  });
});
