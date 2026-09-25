import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../context/AuthProvider';
import LoginPage from '../pages/LoginPage';
import { authApi } from '../services/api';

vi.mock('../services/api', () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    me: vi.fn(),
  },
  taskApi: { list: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn() },
  userApi: { list: vi.fn(), remove: vi.fn() },
  default: {},
}));

function renderAtLogin() {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<div>Dashboard placeholder</div>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authApi.login.mockResolvedValue({
      data: { token: 'jwt-token', user: { email: 'nilay@example.com', role: 'USER' } },
    });
  });

  it('renders the email, password inputs and the sign-in button', () => {
    renderAtLogin();
    expect(screen.getByLabelText('Email address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('shows client-side required-field errors on an empty submit', async () => {
    const user = userEvent.setup();
    renderAtLogin();

    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
    expect(authApi.login).not.toHaveBeenCalled();
  });

  it('calls the login API with the credentials and navigates to the dashboard', async () => {
    const user = userEvent.setup();
    renderAtLogin();

    await user.type(screen.getByLabelText('Email address'), 'nilay@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Dashboard placeholder')).toBeInTheDocument();
    expect(authApi.login).toHaveBeenCalledWith({
      email: 'nilay@example.com',
      password: 'password123',
    });
  });

  it('surface API errors in an alert banner', async () => {
    authApi.login.mockRejectedValue({
      response: { data: { success: false, message: 'Invalid email or password' } },
    });
    const user = userEvent.setup();
    renderAtLogin();

    await user.type(screen.getByLabelText('Email address'), 'nilay@example.com');
    await user.type(screen.getByLabelText('Password'), 'wrongpass');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password');
  });
});