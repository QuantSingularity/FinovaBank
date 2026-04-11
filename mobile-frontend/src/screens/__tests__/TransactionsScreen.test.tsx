import React from 'react';
import {useNavigation} from '@react-navigation/native';
import {fireEvent, render, waitFor} from '@testing-library/react-native';
import {useAuth} from '../../context/AuthContext';
import TransactionsScreen from '../../screens/TransactionsScreen';
import {getAccountTransactions} from '../../services/api';

jest.mock('../../services/api');
jest.mock('../../context/AuthContext');
jest.mock('@react-navigation/native');

describe('TransactionsScreen', () => {
  const mockNavigate = jest.fn();
  const mockGetAccountTransactions =
    getAccountTransactions as jest.MockedFunction<
      typeof getAccountTransactions
    >;

  const mockTransactions = [
    {
      id: 'txn-1',
      date: '2024-12-25T10:00:00Z',
      description: 'Coffee Shop',
      amount: 5.5,
      type: 'DEBIT' as const,
      category: 'Food & Dining',
      merchantName: 'Starbucks',
    },
    {
      id: 'txn-2',
      date: '2024-12-24T15:30:00Z',
      description: 'Salary Deposit',
      amount: 5000,
      type: 'CREDIT' as const,
      category: 'Income',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({userData: {id: '123'}});
    (useNavigation as jest.Mock).mockReturnValue({navigate: mockNavigate});
  });

  it('renders loading state initially', () => {
    mockGetAccountTransactions.mockImplementation(() => new Promise(() => {}));
    const {getByText} = render(
      <TransactionsScreen route={{params: {accountId: '123'}}} />,
    );
    expect(getByText('Loading Transactions...')).toBeTruthy();
  });

  it('renders transactions after successful fetch', async () => {
    mockGetAccountTransactions.mockResolvedValueOnce({
      data: mockTransactions,
    } as any);
    const {getByText} = render(
      <TransactionsScreen route={{params: {accountId: '123'}}} />,
    );
    await waitFor(() => {
      expect(getByText('Coffee Shop')).toBeTruthy();
      expect(getByText('Starbucks')).toBeTruthy();
      expect(getByText('Salary Deposit')).toBeTruthy();
      expect(getByText('-$5.50')).toBeTruthy();
      expect(getByText('+$5,000.00')).toBeTruthy();
    });
  });

  it('shows transaction count', async () => {
    mockGetAccountTransactions.mockResolvedValueOnce({
      data: mockTransactions,
    } as any);
    const {getByText} = render(
      <TransactionsScreen route={{params: {accountId: '123'}}} />,
    );
    await waitFor(() => {
      expect(getByText('2 transactions')).toBeTruthy();
    });
  });

  it('shows empty state when no transactions', async () => {
    mockGetAccountTransactions.mockResolvedValueOnce({data: []} as any);
    const {getByText} = render(
      <TransactionsScreen route={{params: {accountId: '123'}}} />,
    );
    await waitFor(() => {
      expect(getByText('No Transactions')).toBeTruthy();
    });
  });

  it('handles error state with retry', async () => {
    mockGetAccountTransactions.mockRejectedValueOnce({
      message: 'Network error',
    });
    const {getByText} = render(
      <TransactionsScreen route={{params: {accountId: '123'}}} />,
    );
    await waitFor(() => {
      expect(getByText('Network error')).toBeTruthy();
      expect(getByText('Retry')).toBeTruthy();
    });
  });

  it('navigates to TransactionDetails when transaction is pressed', async () => {
    mockGetAccountTransactions.mockResolvedValueOnce({
      data: mockTransactions,
    } as any);
    const {getByText} = render(
      <TransactionsScreen route={{params: {accountId: '123'}}} />,
    );
    await waitFor(() => expect(getByText('Coffee Shop')).toBeTruthy());
    fireEvent.press(getByText('Coffee Shop'));
    expect(mockNavigate).toHaveBeenCalledWith('TransactionDetails', {
      transactionId: 'txn-1',
      transaction: expect.objectContaining({id: 'txn-1'}),
    });
  });

  it('opens filter screen when filter button is pressed', async () => {
    mockGetAccountTransactions.mockResolvedValueOnce({
      data: mockTransactions,
    } as any);
    const {getByText} = render(
      <TransactionsScreen route={{params: {accountId: '123'}}} />,
    );
    await waitFor(() => expect(getByText('⚡ Filter')).toBeTruthy());
    fireEvent.press(getByText('⚡ Filter'));
    expect(mockNavigate).toHaveBeenCalledWith(
      'TransactionFilters',
      expect.any(Object),
    );
  });

  it('shows error when no account ID available', async () => {
    (useAuth as jest.Mock).mockReturnValue({userData: null});
    const {getByText} = render(<TransactionsScreen route={{params: {}}} />);
    await waitFor(() => {
      expect(getByText('No account ID available')).toBeTruthy();
    });
  });

  it('calls API with limit and offset params', async () => {
    mockGetAccountTransactions.mockResolvedValueOnce({data: []} as any);
    render(<TransactionsScreen route={{params: {accountId: '456'}}} />);
    await waitFor(() => {
      expect(mockGetAccountTransactions).toHaveBeenCalledWith(
        '456',
        expect.objectContaining({limit: 50, offset: 0}),
      );
    });
  });
});
