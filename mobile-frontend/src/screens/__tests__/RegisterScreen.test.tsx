import 'react-native';
import {useNavigation} from '@react-navigation/native';
import {fireEvent, render, waitFor} from '@testing-library/react-native';
import {Alert} from 'react-native';
import {useAuth} from '../../context/AuthContext';
import RegisterScreen from '../../screens/RegisterScreen';

// Mock the useAuth hook
jest.mock('../../context/AuthContext');
jest.mock('@react-navigation/native');

// Mock Alert
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
    expect(getByText('Join FinovaBank today!')).toBeTruthy();
    expect(getByPlaceholderText('First Name')).toBeTruthy();
    expect(getByPlaceholderText('Last Name')).toBeTruthy();
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password (min. 6 characters)')).toBeTruthy();
    expect(getByPlaceholderText('Confirm Password')).toBeTruthy();
    expect(getByText('Register')).toBeTruthy();
  });

  it('shows error when fields are empty', async () => {
    const {getByText} = render(<RegisterScreen />);
    const registerButton = getByText('Register');

    fireEvent.press(registerButton);

    await waitFor(() => {
      expect(getByText('Please fill in all fields.')).toBeTruthy();
    });

    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('shows error for invalid email', async () => {
    const {getByPlaceholderText, getByText} = render(<RegisterScreen />);
    const firstNameInput = getByPlaceholderText('First Name');
    const lastNameInput = getByPlaceholderText('Last Name');
    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password (min. 6 characters)');
    const confirmPasswordInput = getByPlaceholderText('Confirm Password');
    const registerButton = getByText('Register');

    fireEvent.changeText(firstNameInput, 'John');
    fireEvent.changeText(lastNameInput, 'Doe');
    fireEvent.changeText(emailInput, 'invalid-email');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.changeText(confirmPasswordInput, 'password123');
    fireEvent.press(registerButton);

    await waitFor(() => {
      expect(getByText('Please enter a valid email address.')).toBeTruthy();
    });

    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('shows error when password is too short', async () => {
    const {getByPlaceholderText, getByText} = render(<RegisterScreen />);
    const firstNameInput = getByPlaceholderText('First Name');
    const lastNameInput = getByPlaceholderText('Last Name');
    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password (min. 6 characters)');
    const confirmPasswordInput = getByPlaceholderText('Confirm Password');
    const registerButton = getByText('Register');

    fireEvent.changeText(firstNameInput, 'John');
    fireEvent.changeText(lastNameInput, 'Doe');
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, '12345');
    fireEvent.changeText(confirmPasswordInput, '12345');
    fireEvent.press(registerButton);

    await waitFor(() => {
      expect(
        getByText('Password must be at least 6 characters long.'),
      ).toBeTruthy();
    });

    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('shows error when passwords do not match', async () => {
    const {getByPlaceholderText, getByText} = render(<RegisterScreen />);
    const firstNameInput = getByPlaceholderText('First Name');
    const lastNameInput = getByPlaceholderText('Last Name');
    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password (min. 6 characters)');
    const confirmPasswordInput = getByPlaceholderText('Confirm Password');
    const registerButton = getByText('Register');

    fireEvent.changeText(firstNameInput, 'John');
    fireEvent.changeText(lastNameInput, 'Doe');
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.changeText(confirmPasswordInput, 'password456');
    fireEvent.press(registerButton);

    await waitFor(() => {
      expect(getByText('Passwords do not match.')).toBeTruthy();
    });

    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('calls register function with correct data', async () => {
    mockRegister.mockResolvedValueOnce(undefined);

    const {getByPlaceholderText, getByText} = render(<RegisterScreen />);
    const firstNameInput = getByPlaceholderText('First Name');
    const lastNameInput = getByPlaceholderText('Last Name');
    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password (min. 6 characters)');
    const confirmPasswordInput = getByPlaceholderText('Confirm Password');
    const registerButton = getByText('Register');

    fireEvent.changeText(firstNameInput, 'John');
    fireEvent.changeText(lastNameInput, 'Doe');
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.changeText(confirmPasswordInput, 'password123');
    fireEvent.press(registerButton);

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Success',
      'Registration successful! Please log in.',
    );
    expect(mockNavigate).toHaveBeenCalledWith('Login');
  });

  it('shows error message on registration failure', async () => {
    const errorMessage = 'Email already exists';
    mockRegister.mockRejectedValueOnce({
      response: {data: {message: errorMessage}},
    });

    const {getByPlaceholderText, getByText} = render(<RegisterScreen />);
    const firstNameInput = getByPlaceholderText('First Name');
    const lastNameInput = getByPlaceholderText('Last Name');
    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password (min. 6 characters)');
    const confirmPasswordInput = getByPlaceholderText('Confirm Password');
    const registerButton = getByText('Register');

    fireEvent.changeText(firstNameInput, 'John');
    fireEvent.changeText(lastNameInput, 'Doe');
    fireEvent.changeText(emailInput, 'existing@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.changeText(confirmPasswordInput, 'password123');
    fireEvent.press(registerButton);

    await waitFor(() => {
      expect(getByText(errorMessage)).toBeTruthy();
    });
  });

  it('navigates to login screen when login button is pressed', () => {
    const {getByText} = render(<RegisterScreen />);
    const loginButton = getByText('Already have an account? Login');

    fireEvent.press(loginButton);

    expect(mockNavigate).toHaveBeenCalledWith('Login');
  });
});
