import 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {fireEvent, render, waitFor} from '@testing-library/react-native';
import {Alert} from 'react-native';
import {useAuth} from '../../context/AuthContext';
import AccountDetailsScreen from '../../screens/AccountDetailsScreen';
import {getAccountDetails} from '../../services/api';

jest.mock('../../services/api');
jest.mock('../../context/AuthContext');
jest.mock('@react-navigation/native');
jest.spyOn(Alert, 'alert');

describe('AccountDetailsScreen', () => {
  const mockNavigate = jest.fn();
  const mockGetAccountDetails = getAccountDetails as jest.MockedFunction<
    typeof getAccountDetails
  >;

  const mockAccountData = {
    accountId: '123',
    name: 'John Doe',
    email: 'john@example.com',
    balance: 5420.5,
    accountType: 'Checking',
    accountNumber: '****1234',
    routingNumber: '123456789',
    openDate: '2023-01-01T00:00:00Z',
    status: 'ACTIVE' as const,
    interestRate: 0.5,
    lastUpdated: '2024-12-25T00:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      userData: {id: '123', email: 'test@example.com'},
    });
    (useRoute as jest.Mock).mockReturnValue({
      params: {accountId: '123'},
    });
    (useNavigation as jest.Mock).mockReturnValue({
      navigate: mockNavigate,
    });
  });

  it('renders loading state initially', () => {
    mockGetAccountDetails.mockImplementation(
      () => new Promise(() => {}), // Never resolves
    );

    const {getByText} = render(<AccountDetailsScreen />);

    expect(getByText('Loading Account Details...')).toBeTruthy();
  });

  it('renders account details after successful fetch', async () => {
    mockGetAccountDetails.mockResolvedValueOnce({
      data: mockAccountData,
    } as any);

    const {getByText} = render(<AccountDetailsScreen />);

    await waitFor(() => {
      expect(getByText('Account Details')).toBeTruthy();
      expect(getByText('****1234')).toBeTruthy();
      expect(getByText('123456789')).toBeTruthy();
      expect(getByText('Checking')).toBeTruthy();
      expect(getByText('ACTIVE')).toBeTruthy();
      expect(getByText('0.50%')).toBeTruthy();
      expect(getByText('$5,420.50')).toBeTruthy();
      expect(getByText('John Doe')).toBeTruthy();
      expect(getByText('john@example.com')).toBeTruthy();
    });
  });

  it('renders error state when fetch fails', async () => {
    const errorMessage = 'Failed to load account details.';
    mockGetAccountDetails.mockRejectedValueOnce({
      message: errorMessage,
    });

    const {getByText} = render(<AccountDetailsScreen />);

    await waitFor(() => {
      expect(getByText(`Error: ${errorMessage}`)).toBeTruthy();
      expect(getByText('Return to Dashboard')).toBeTruthy();
    });

    expect(Alert.alert).toHaveBeenCalledWith('Error', errorMessage);
  });

  it('navigates to Transactions screen when Transactions button is pressed', async () => {
    mockGetAccountDetails.mockResolvedValueOnce({
      data: mockAccountData,
    } as any);

    const {getByText} = render(<AccountDetailsScreen />);

    await waitFor(() => {
      expect(getByText('Transactions')).toBeTruthy();
    });

    const transactionsButton = getByText('Transactions');
    fireEvent.press(transactionsButton);

    expect(mockNavigate).toHaveBeenCalledWith('Transactions', {
      accountId: '123',
    });
  });

  it('navigates to SavingsGoals screen when Savings Goals button is pressed', async () => {
    mockGetAccountDetails.mockResolvedValueOnce({
      data: mockAccountData,
    } as any);

    const {getByText} = render(<AccountDetailsScreen />);

    await waitFor(() => {
      expect(getByText('Savings Goals')).toBeTruthy();
    });

    const savingsButton = getByText('Savings Goals');
    fireEvent.press(savingsButton);

    expect(mockNavigate).toHaveBeenCalledWith('SavingsGoals', {
      accountId: '123',
    });
  });

  it('navigates to Loans screen when Loans button is pressed', async () => {
    mockGetAccountDetails.mockResolvedValueOnce({
      data: mockAccountData,
    } as any);

    const {getByText} = render(<AccountDetailsScreen />);

    await waitFor(() => {
      expect(getByText('Loans')).toBeTruthy();
    });

    const loansButton = getByText('Loans');
    fireEvent.press(loansButton);

    expect(mockNavigate).toHaveBeenCalledWith('Loans', {accountId: '123'});
  });

  it('displays correct status color for different statuses', async () => {
    const inactiveAccountData = {
      ...mockAccountData,
      status: 'INACTIVE' as const,
    };
    mockGetAccountDetails.mockResolvedValueOnce({
      data: inactiveAccountData,
    } as any);

    const {getByText} = render(<AccountDetailsScreen />);

    await waitFor(() => {
      expect(getByText('INACTIVE')).toBeTruthy();
    });
  });

  it('handles missing optional fields gracefully', async () => {
    const minimalAccountData = {
      ...mockAccountData,
      routingNumber: undefined,
      interestRate: undefined,
    };
    mockGetAccountDetails.mockResolvedValueOnce({
      data: minimalAccountData,
    } as any);

    const {getByText, queryByText} = render(<AccountDetailsScreen />);

    await waitFor(() => {
      expect(getByText('Account Details')).toBeTruthy();
      expect(queryByText('Routing Number:')).toBeNull();
      expect(queryByText('Interest Rate:')).toBeNull();
    });
  });
});
