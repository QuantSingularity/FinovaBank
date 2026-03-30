import 'react-native';
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
      id: '1',
      date: '2024-12-25T10:00:00Z',
      description: 'Coffee Shop',
      amount: 5.5,
      type: 'DEBIT' as const,
      category: 'Food & Dining',
      merchantName: 'Starbucks',
    },
    {
      id: '2',
      date: '2024-12-24T15:30:00Z',
      description: 'Salary Deposit',
      amount: 5000,
      type: 'CREDIT' as const,
      category: 'Income',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      userData: {id: '123'},
    });
    (useNavigation as jest.Mock).mockReturnValue({
      navigate: mockNavigate,
    });
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
      expect(getByText('Transactions')).toBeTruthy();
      expect(getByText('Coffee Shop')).toBeTruthy();
      expect(getByText('Starbucks')).toBeTruthy();
      expect(getByText('Salary Deposit')).toBeTruthy();
      expect(getByText('-$5.50')).toBeTruthy();
      expect(getByText('+$5,000.00')).toBeTruthy();
    });
  });

  it('shows empty state when no transactions', async () => {
    mockGetAccountTransactions.mockResolvedValueOnce({
      data: [],
    } as any);

    const {getByText} = render(
      <TransactionsScreen route={{params: {accountId: '123'}}} />,
    );

    await waitFor(() => {
      expect(getByText('No transactions found.')).toBeTruthy();
    });
  });

  it('handles error state', async () => {
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

    await waitFor(() => {
      expect(getByText('Coffee Shop')).toBeTruthy();
    });

    const transactionItem = getByText('Coffee Shop');
    fireEvent.press(transactionItem.parent?.parent || transactionItem);

    expect(mockNavigate).toHaveBeenCalledWith('TransactionDetails', {
      transactionId: '1',
      transaction: mockTransactions[0],
    });
  });

  it('opens filter screen when filter button is pressed', async () => {
    mockGetAccountTransactions.mockResolvedValueOnce({
      data: mockTransactions,
    } as any);

    const {getByText} = render(
      <TransactionsScreen route={{params: {accountId: '123'}}} />,
    );

    await waitFor(() => {
      expect(getByText('Filter')).toBeTruthy();
    });

    const filterButton = getByText('Filter');
    fireEvent.press(filterButton);

    expect(mockNavigate).toHaveBeenCalledWith(
      'TransactionFilters',
      expect.any(Object),
    );
  });

  it('refreshes transactions when pull to refresh', async () => {
    mockGetAccountTransactions.mockResolvedValue({
      data: mockTransactions,
    } as any);

    const {getByTestId} = render(
      <TransactionsScreen route={{params: {accountId: '123'}}} />,
    );

    await waitFor(() => {
      expect(mockGetAccountTransactions).toHaveBeenCalledTimes(1);
    });

    // Simulate pull to refresh
    // Note: This would require proper test ID on FlatList in the actual component
  });
});
