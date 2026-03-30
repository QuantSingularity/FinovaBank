import 'react-native';
import {useNavigation} from '@react-navigation/native';
import {fireEvent, render, waitFor} from '@testing-library/react-native';
import {useAuth} from '../../context/AuthContext';
import LoginScreen from '../../screens/LoginScreen';

// Mock the useAuth hook
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

    expect(getByText('Welcome Back!')).toBeTruthy();
    expect(getByText('Login to your FinovaBank account')).toBeTruthy();
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByText('Login')).toBeTruthy();
  });

  it('shows error when fields are empty', async () => {
    const {getByText} = render(<LoginScreen />);
    const loginButton = getByText('Login');

    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(getByText('Please enter both email and password.')).toBeTruthy();
    });

    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('calls login function with correct credentials', async () => {
    mockLogin.mockResolvedValueOnce(undefined);

    const {getByPlaceholderText, getByText} = render(<LoginScreen />);
    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');
    const loginButton = getByText('Login');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(loginButton);

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
    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');
    const loginButton = getByText('Login');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'wrongpassword');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(getByText(errorMessage)).toBeTruthy();
    });
  });

  it('navigates to register screen when register button is pressed', () => {
    const {getByText} = render(<LoginScreen />);
    const registerButton = getByText("Don't have an account? Register");

    fireEvent.press(registerButton);

    expect(mockNavigate).toHaveBeenCalledWith('Register');
  });

  it('disables inputs and button while loading', () => {
    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
      isLoading: true,
    });

    const {getByPlaceholderText, getByText} = render(<LoginScreen />);
    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');
    const loginButton = getByText('Login').parent;

    expect(emailInput.props.editable).toBe(false);
    expect(passwordInput.props.editable).toBe(false);
    expect(loginButton?.props.accessibilityState?.disabled).toBe(true);
  });
});
