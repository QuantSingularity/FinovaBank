import React from 'react';
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
      goBack: jest.fn(),
    });
  });

  it('renders loading state initially', () => {
    mockGetAccountDetails.mockImplementation(() => new Promise(() => {}));
    const {getByText} = render(<AccountDetailsScreen />);
    expect(getByText('Loading Account Details...')).toBeTruthy();
  });

  it('renders account details after successful fetch', async () => {
    mockGetAccountDetails.mockResolvedValueOnce({data: mockAccountData} as any);
    const {getByText} = render(<AccountDetailsScreen />);
    await waitFor(() => {
      expect(getByText('****1234')).toBeTruthy();
      expect(getByText('123456789')).toBeTruthy();
      expect(getByText('Checking')).toBeTruthy();
      expect(getByText('Active')).toBeTruthy();
      expect(getByText('0.50% APY')).toBeTruthy();
      expect(getByText('$5,420.50')).toBeTruthy();
      expect(getByText('John Doe')).toBeTruthy();
      expect(getByText('john@example.com')).toBeTruthy();
    });
  });

  it('renders error state when fetch fails', async () => {
    const errorMessage = 'Failed to load account details.';
    mockGetAccountDetails.mockRejectedValueOnce({message: errorMessage});
    const {getByText} = render(<AccountDetailsScreen />);
    await waitFor(() => {
      expect(getByText('Something went wrong')).toBeTruthy();
      expect(getByText(errorMessage)).toBeTruthy();
    });
  });

  it('shows retry button that refetches', async () => {
    mockGetAccountDetails.mockRejectedValueOnce({message: 'Error'});
    mockGetAccountDetails.mockResolvedValueOnce({data: mockAccountData} as any);
    const {getByText} = render(<AccountDetailsScreen />);
    await waitFor(() => expect(getByText('Try Again')).toBeTruthy());
    fireEvent.press(getByText('Try Again'));
    await waitFor(() => {
      expect(mockGetAccountDetails).toHaveBeenCalledTimes(2);
    });
  });

  it('navigates to Transactions screen', async () => {
    mockGetAccountDetails.mockResolvedValueOnce({data: mockAccountData} as any);
    const {getByText} = render(<AccountDetailsScreen />);
    await waitFor(() => expect(getByText('Transactions')).toBeTruthy());
    fireEvent.press(getByText('Transactions'));
    expect(mockNavigate).toHaveBeenCalledWith('Transactions', {
      accountId: '123',
    });
  });

  it('navigates to SavingsGoals screen', async () => {
    mockGetAccountDetails.mockResolvedValueOnce({data: mockAccountData} as any);
    const {getByText} = render(<AccountDetailsScreen />);
    await waitFor(() => expect(getByText('Savings Goals')).toBeTruthy());
    fireEvent.press(getByText('Savings Goals'));
    expect(mockNavigate).toHaveBeenCalledWith('SavingsGoals', {
      accountId: '123',
    });
  });

  it('navigates to Loans screen', async () => {
    mockGetAccountDetails.mockResolvedValueOnce({data: mockAccountData} as any);
    const {getByText} = render(<AccountDetailsScreen />);
    await waitFor(() => expect(getByText('Loans')).toBeTruthy());
    fireEvent.press(getByText('Loans'));
    expect(mockNavigate).toHaveBeenCalledWith('Loans', {accountId: '123'});
  });

  it('handles missing optional fields gracefully', async () => {
    const minimalData = {
      ...mockAccountData,
      routingNumber: undefined,
      interestRate: undefined,
    };
    mockGetAccountDetails.mockResolvedValueOnce({data: minimalData} as any);
    const {getByText, queryByText} = render(<AccountDetailsScreen />);
    await waitFor(() => {
      expect(getByText('****1234')).toBeTruthy();
      expect(queryByText('Routing Number')).toBeNull();
      expect(queryByText('Interest Rate')).toBeNull();
    });
  });

  it('shows correct status styling for INACTIVE status', async () => {
    mockGetAccountDetails.mockResolvedValueOnce({
      data: {...mockAccountData, status: 'INACTIVE' as const},
    } as any);
    const {getByText} = render(<AccountDetailsScreen />);
    await waitFor(() => {
      expect(getByText('Inactive')).toBeTruthy();
    });
  });

  it('shows correct status styling for FROZEN status', async () => {
    mockGetAccountDetails.mockResolvedValueOnce({
      data: {...mockAccountData, status: 'FROZEN' as const},
    } as any);
    const {getByText} = render(<AccountDetailsScreen />);
    await waitFor(() => {
      expect(getByText('Frozen')).toBeTruthy();
    });
  });
});
