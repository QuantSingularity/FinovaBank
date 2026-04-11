import React from 'react';
import {useNavigation} from '@react-navigation/native';
import {fireEvent, render, waitFor} from '@testing-library/react-native';
import {useAuth} from '../../context/AuthContext';
import DashboardScreen from '../../screens/DashboardScreen';
import {getUserAccounts} from '../../services/api';

jest.mock('../../services/api');
jest.mock('../../context/AuthContext');
jest.mock('@react-navigation/native');

describe('DashboardScreen', () => {
  const mockNavigate = jest.fn();
  const mockLogout = jest.fn();
  const mockGetUserAccounts = getUserAccounts as jest.MockedFunction<
    typeof getUserAccounts
  >;

  const mockAccounts = [
    {
      id: 'acc-1',
      balance: 5420.5,
      accountNumber: '**** 1234',
      accountType: 'Checking',
      status: 'ACTIVE',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      userData: {
        id: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      },
      logout: mockLogout,
    });
    (useNavigation as jest.Mock).mockReturnValue({
      navigate: mockNavigate,
    });
    mockGetUserAccounts.mockResolvedValue({data: mockAccounts} as any);
  });

  it('renders loading state initially', () => {
    mockGetUserAccounts.mockImplementation(() => new Promise(() => {}));
    const {getByText} = render(<DashboardScreen />);
    expect(getByText('Loading your dashboard...')).toBeTruthy();
  });

  it('renders dashboard after successful fetch', async () => {
    const {getByText} = render(<DashboardScreen />);
    await waitFor(() => {
      expect(getByText('Total Balance')).toBeTruthy();
      expect(getByText('Quick Actions')).toBeTruthy();
    });
  });

  it('greets user by first name', async () => {
    const {getByText} = render(<DashboardScreen />);
    await waitFor(() => {
      expect(getByText('John')).toBeTruthy();
    });
  });

  it('displays total balance from accounts', async () => {
    const {getByText} = render(<DashboardScreen />);
    await waitFor(() => {
      expect(getByText('$5,420.50')).toBeTruthy();
    });
  });

  it('renders all quick action buttons', async () => {
    const {getByText} = render(<DashboardScreen />);
    await waitFor(() => {
      expect(getByText('Transactions')).toBeTruthy();
      expect(getByText('Loans')).toBeTruthy();
      expect(getByText('Savings')).toBeTruthy();
      expect(getByText('Account')).toBeTruthy();
    });
  });

  it('navigates to Transactions when pressed', async () => {
    const {getByText} = render(<DashboardScreen />);
    await waitFor(() => expect(getByText('Transactions')).toBeTruthy());
    fireEvent.press(getByText('Transactions'));
    expect(mockNavigate).toHaveBeenCalledWith(
      'Transactions',
      expect.any(Object),
    );
  });

  it('navigates to Loans when pressed', async () => {
    const {getByText} = render(<DashboardScreen />);
    await waitFor(() => expect(getByText('Loans')).toBeTruthy());
    fireEvent.press(getByText('Loans'));
    expect(mockNavigate).toHaveBeenCalledWith('Loans', expect.any(Object));
  });

  it('calls logout when Sign Out is pressed', async () => {
    mockLogout.mockResolvedValueOnce(undefined);
    const {getByText} = render(<DashboardScreen />);
    await waitFor(() => expect(getByText('Sign Out')).toBeTruthy());
    fireEvent.press(getByText('Sign Out'));
    expect(mockLogout).toHaveBeenCalled();
  });

  it('handles API error gracefully', async () => {
    mockGetUserAccounts.mockRejectedValueOnce(new Error('Network error'));
    const {getByText} = render(<DashboardScreen />);
    await waitFor(() => {
      expect(getByText('Total Balance')).toBeTruthy();
    });
  });

  it('shows $0.00 balance when no accounts returned', async () => {
    mockGetUserAccounts.mockResolvedValueOnce({data: []} as any);
    const {getByText} = render(<DashboardScreen />);
    await waitFor(() => {
      expect(getByText('$0.00')).toBeTruthy();
    });
  });
});
