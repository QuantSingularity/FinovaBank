import React from 'react';
import {useNavigation} from '@react-navigation/native';
import {fireEvent, render, waitFor} from '@testing-library/react-native';
import {Alert} from 'react-native';
import {useAuth} from '../../context/AuthContext';
import RegisterScreen from '../../screens/RegisterScreen';

jest.mock('../../context/AuthContext');
jest.mock('@react-navigation/native');
jest.spyOn(Alert, 'alert');

describe('RegisterScreen', () => {
  const mockRegister = jest.fn();
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      register: mockRegister,
      isLoading: false,
    });
    (useNavigation as jest.Mock).mockReturnValue({
      navigate: mockNavigate,
    });
  });

  it('renders correctly', () => {
    const {getByText, getByPlaceholderText} = render(<RegisterScreen />);
    expect(getByText('Create Account')).toBeTruthy();
    expect(getByPlaceholderText('John')).toBeTruthy();
    expect(getByPlaceholderText('Doe')).toBeTruthy();
    expect(getByPlaceholderText('you@example.com')).toBeTruthy();
    expect(getByPlaceholderText('Min. 8 characters')).toBeTruthy();
    expect(getByPlaceholderText('Re-enter your password')).toBeTruthy();
    expect(getByText('Create Account')).toBeTruthy();
  });

  it('shows error when required fields are empty', async () => {
    const {getByText} = render(<RegisterScreen />);
    fireEvent.press(getByText('Create Account'));
    await waitFor(() => {
      expect(getByText('Please fill in all fields.')).toBeTruthy();
    });
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('shows error for invalid email', async () => {
    const {getByPlaceholderText, getByText} = render(<RegisterScreen />);
    fireEvent.changeText(getByPlaceholderText('John'), 'John');
    fireEvent.changeText(getByPlaceholderText('Doe'), 'Doe');
    fireEvent.changeText(getByPlaceholderText('you@example.com'), 'bad-email');
    fireEvent.changeText(
      getByPlaceholderText('Min. 8 characters'),
      'Password1',
    );
    fireEvent.changeText(
      getByPlaceholderText('Re-enter your password'),
      'Password1',
    );
    fireEvent.press(getByText('Create Account'));
    await waitFor(() => {
      expect(getByText('Please enter a valid email address.')).toBeTruthy();
    });
  });

  it('shows error when password is too short (min 8)', async () => {
    const {getByPlaceholderText, getByText} = render(<RegisterScreen />);
    fireEvent.changeText(getByPlaceholderText('John'), 'John');
    fireEvent.changeText(getByPlaceholderText('Doe'), 'Doe');
    fireEvent.changeText(
      getByPlaceholderText('you@example.com'),
      'test@example.com',
    );
    fireEvent.changeText(getByPlaceholderText('Min. 8 characters'), 'abc123');
    fireEvent.changeText(
      getByPlaceholderText('Re-enter your password'),
      'abc123',
    );
    fireEvent.press(getByText('Create Account'));
    await waitFor(() => {
      expect(
        getByText('Password must be at least 8 characters long.'),
      ).toBeTruthy();
    });
  });

  it('shows error when passwords do not match', async () => {
    const {getByPlaceholderText, getByText} = render(<RegisterScreen />);
    fireEvent.changeText(getByPlaceholderText('John'), 'John');
    fireEvent.changeText(getByPlaceholderText('Doe'), 'Doe');
    fireEvent.changeText(
      getByPlaceholderText('you@example.com'),
      'test@example.com',
    );
    fireEvent.changeText(
      getByPlaceholderText('Min. 8 characters'),
      'Password123',
    );
    fireEvent.changeText(
      getByPlaceholderText('Re-enter your password'),
      'Password456',
    );
    fireEvent.press(getByText('Create Account'));
    await waitFor(() => {
      expect(getByText('Passwords do not match.')).toBeTruthy();
    });
  });

  it('calls register with normalized data on success', async () => {
    mockRegister.mockResolvedValueOnce(undefined);
    const {getByPlaceholderText, getByText} = render(<RegisterScreen />);
    fireEvent.changeText(getByPlaceholderText('John'), 'John');
    fireEvent.changeText(getByPlaceholderText('Doe'), 'Doe');
    fireEvent.changeText(
      getByPlaceholderText('you@example.com'),
      'TEST@Example.com',
    );
    fireEvent.changeText(
      getByPlaceholderText('Min. 8 characters'),
      'Password123',
    );
    fireEvent.changeText(
      getByPlaceholderText('Re-enter your password'),
      'Password123',
    );
    fireEvent.press(getByText('Create Account'));
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
      });
    });
    expect(Alert.alert).toHaveBeenCalledWith(
      'Success',
      'Account created successfully! Welcome to FinovaBank.',
    );
  });

  it('shows error message on registration failure', async () => {
    const errorMessage = 'Email already exists';
    mockRegister.mockRejectedValueOnce({
      response: {data: {message: errorMessage}},
    });
    const {getByPlaceholderText, getByText} = render(<RegisterScreen />);
    fireEvent.changeText(getByPlaceholderText('John'), 'John');
    fireEvent.changeText(getByPlaceholderText('Doe'), 'Doe');
    fireEvent.changeText(
      getByPlaceholderText('you@example.com'),
      'existing@example.com',
    );
    fireEvent.changeText(
      getByPlaceholderText('Min. 8 characters'),
      'Password123',
    );
    fireEvent.changeText(
      getByPlaceholderText('Re-enter your password'),
      'Password123',
    );
    fireEvent.press(getByText('Create Account'));
    await waitFor(() => {
      expect(getByText(errorMessage)).toBeTruthy();
    });
  });

  it('navigates to login screen', () => {
    const {getByText} = render(<RegisterScreen />);
    fireEvent.press(getByText('Sign in'));
    expect(mockNavigate).toHaveBeenCalledWith('Login');
  });

  it('disables inputs while loading', () => {
    (useAuth as jest.Mock).mockReturnValue({
      register: mockRegister,
      isLoading: true,
    });
    const {getByPlaceholderText} = render(<RegisterScreen />);
    expect(getByPlaceholderText('you@example.com').props.editable).toBe(false);
    expect(getByPlaceholderText('Min. 8 characters').props.editable).toBe(
      false,
    );
  });
});
