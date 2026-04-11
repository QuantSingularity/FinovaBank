import React from 'react';
import {useNavigation} from '@react-navigation/native';
import {fireEvent, render, waitFor} from '@testing-library/react-native';
import {useAuth} from '../../context/AuthContext';
import LoginScreen from '../../screens/LoginScreen';

jest.mock('../../context/AuthContext');
jest.mock('@react-navigation/native');

describe('LoginScreen', () => {
  const mockLogin = jest.fn();
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
      isLoading: false,
    });
    (useNavigation as jest.Mock).mockReturnValue({
      navigate: mockNavigate,
    });
  });

  it('renders correctly', () => {
    const {getByText, getByPlaceholderText} = render(<LoginScreen />);
    expect(getByText('Welcome back')).toBeTruthy();
    expect(getByText('Sign in to your account')).toBeTruthy();
    expect(getByPlaceholderText('you@example.com')).toBeTruthy();
    expect(getByPlaceholderText('Enter your password')).toBeTruthy();
    expect(getByText('Sign In')).toBeTruthy();
  });

  it('shows error when fields are empty', async () => {
    const {getByText} = render(<LoginScreen />);
    fireEvent.press(getByText('Sign In'));
    await waitFor(() => {
      expect(getByText('Please enter both email and password.')).toBeTruthy();
    });
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('shows error for invalid email format', async () => {
    const {getByPlaceholderText, getByText} = render(<LoginScreen />);
    fireEvent.changeText(getByPlaceholderText('you@example.com'), 'notanemail');
    fireEvent.changeText(
      getByPlaceholderText('Enter your password'),
      'password123',
    );
    fireEvent.press(getByText('Sign In'));
    await waitFor(() => {
      expect(getByText('Please enter a valid email address.')).toBeTruthy();
    });
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('calls login function with trimmed, lowercased credentials', async () => {
    mockLogin.mockResolvedValueOnce(undefined);
    const {getByPlaceholderText, getByText} = render(<LoginScreen />);
    fireEvent.changeText(
      getByPlaceholderText('you@example.com'),
      '  Test@Example.com  ',
    );
    fireEvent.changeText(
      getByPlaceholderText('Enter your password'),
      'password123',
    );
    fireEvent.press(getByText('Sign In'));
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('shows error message on login failure', async () => {
    const errorMessage = 'Invalid credentials';
    mockLogin.mockRejectedValueOnce({
      response: {data: {error: {message: errorMessage}}},
    });
    const {getByPlaceholderText, getByText} = render(<LoginScreen />);
    fireEvent.changeText(
      getByPlaceholderText('you@example.com'),
      'test@example.com',
    );
    fireEvent.changeText(
      getByPlaceholderText('Enter your password'),
      'wrongpassword',
    );
    fireEvent.press(getByText('Sign In'));
    await waitFor(() => {
      expect(getByText(errorMessage)).toBeTruthy();
    });
  });

  it('shows api message error as fallback', async () => {
    mockLogin.mockRejectedValueOnce({message: 'Network timeout'});
    const {getByPlaceholderText, getByText} = render(<LoginScreen />);
    fireEvent.changeText(
      getByPlaceholderText('you@example.com'),
      'test@example.com',
    );
    fireEvent.changeText(
      getByPlaceholderText('Enter your password'),
      'pass123',
    );
    fireEvent.press(getByText('Sign In'));
    await waitFor(() => {
      expect(getByText('Network timeout')).toBeTruthy();
    });
  });

  it('navigates to register screen', () => {
    const {getByText} = render(<LoginScreen />);
    fireEvent.press(getByText('Create one'));
    expect(mockNavigate).toHaveBeenCalledWith('Register');
  });

  it('disables inputs and button while loading', () => {
    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
      isLoading: true,
    });
    const {getByPlaceholderText} = render(<LoginScreen />);
    expect(getByPlaceholderText('you@example.com').props.editable).toBe(false);
    expect(getByPlaceholderText('Enter your password').props.editable).toBe(
      false,
    );
  });
});
