import React from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';
import {render, waitFor} from '@testing-library/react-native';
import {Alert} from 'react-native';
import TransactionDetailsScreen from '../../screens/TransactionDetailsScreen';
import {getTransactionDetails} from '../../services/api';

jest.mock('../../services/api');
jest.mock('@react-navigation/native');
jest.spyOn(Alert, 'alert');

describe('TransactionDetailsScreen', () => {
  const mockGoBack = jest.fn();
  const mockGetTransactionDetails =
    getTransactionDetails as jest.MockedFunction<typeof getTransactionDetails>;

  const mockTransaction = {
    id: 'txn-001',
    date: '2024-12-25T10:00:00Z',
    description: 'Monthly Subscription',
    amount: 14.99,
    type: 'DEBIT' as const,
    status: 'COMPLETED' as const,
    accountId: 'acc-1',
    balance: 985.01,
    category: 'Entertainment',
    merchantName: 'Netflix',
    reference: 'REF-12345',
    createdAt: '2024-12-25T10:00:00Z',
    updatedAt: '2024-12-25T10:01:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigation as jest.Mock).mockReturnValue({goBack: mockGoBack});
    (useRoute as jest.Mock).mockReturnValue({
      params: {transactionId: 'txn-001', transaction: undefined},
    });
  });

  it('renders loading state initially', () => {
    mockGetTransactionDetails.mockImplementation(() => new Promise(() => {}));
    const {getByText} = render(<TransactionDetailsScreen />);
    expect(getByText('Loading Transaction Details...')).toBeTruthy();
  });

  it('renders transaction details after fetch', async () => {
    mockGetTransactionDetails.mockResolvedValueOnce({
      data: mockTransaction,
    } as any);
    const {getByText} = render(<TransactionDetailsScreen />);
    await waitFor(() => {
      expect(getByText('Monthly Subscription')).toBeTruthy();
      expect(getByText('Netflix')).toBeTruthy();
      expect(getByText('Entertainment')).toBeTruthy();
      expect(getByText('COMPLETED')).toBeTruthy();
    });
  });

  it('shows debit amount with minus sign', async () => {
    mockGetTransactionDetails.mockResolvedValueOnce({
      data: mockTransaction,
    } as any);
    const {getByText} = render(<TransactionDetailsScreen />);
    await waitFor(() => {
      expect(getByText('-$14.99')).toBeTruthy();
    });
  });

  it('shows credit amount with plus sign for credit transactions', async () => {
    mockGetTransactionDetails.mockResolvedValueOnce({
      data: {...mockTransaction, type: 'CREDIT' as const},
    } as any);
    const {getByText} = render(<TransactionDetailsScreen />);
    await waitFor(() => {
      expect(getByText('+$14.99')).toBeTruthy();
    });
  });

  it('renders error state when fetch fails', async () => {
    mockGetTransactionDetails.mockRejectedValueOnce({message: 'Not found'});
    const {getByText} = render(<TransactionDetailsScreen />);
    await waitFor(() => {
      expect(getByText('Transaction Not Found')).toBeTruthy();
    });
  });

  it('shows initial transaction data immediately if provided', () => {
    mockGetTransactionDetails.mockImplementation(() => new Promise(() => {}));
    (useRoute as jest.Mock).mockReturnValue({
      params: {transactionId: 'txn-001', transaction: mockTransaction},
    });
    const {getByText} = render(<TransactionDetailsScreen />);
    expect(getByText('Monthly Subscription')).toBeTruthy();
  });

  it('shows error when no transaction ID provided', async () => {
    (useRoute as jest.Mock).mockReturnValue({params: {transactionId: ''}});
    const {getByText} = render(<TransactionDetailsScreen />);
    await waitFor(() => {
      expect(getByText('Transaction Not Found')).toBeTruthy();
    });
  });

  it('renders balance after transaction', async () => {
    mockGetTransactionDetails.mockResolvedValueOnce({
      data: mockTransaction,
    } as any);
    const {getByText} = render(<TransactionDetailsScreen />);
    await waitFor(() => {
      expect(getByText('$985.01')).toBeTruthy();
    });
  });
});
