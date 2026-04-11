import React from 'react';
import {useNavigation} from '@react-navigation/native';
import {fireEvent, render, waitFor} from '@testing-library/react-native';
import {Alert} from 'react-native';
import {useAuth} from '../../context/AuthContext';
import LoansScreen from '../../screens/LoansScreen';
import {applyForLoan, getAccountLoans, getLoanTypes} from '../../services/api';

jest.mock('../../services/api');
jest.mock('../../context/AuthContext');
jest.mock('@react-navigation/native');
jest.spyOn(Alert, 'alert');

describe('LoansScreen', () => {
  const mockNavigate = jest.fn();
  const mockGetAccountLoans = getAccountLoans as jest.MockedFunction<
    typeof getAccountLoans
  >;
  const mockGetLoanTypes = getLoanTypes as jest.MockedFunction<
    typeof getLoanTypes
  >;
  const mockApplyForLoan = applyForLoan as jest.MockedFunction<
    typeof applyForLoan
  >;

  const mockLoans = [
    {
      id: 'loan-1',
      type: 'Personal Loan',
      amount: 10000,
      interestRate: 5.5,
      term: 36,
      monthlyPayment: 302.35,
      remainingBalance: 8500,
      status: 'ACTIVE' as const,
      appliedDate: '2024-01-01T00:00:00Z',
    },
    {
      id: 'loan-2',
      type: 'Auto Loan',
      amount: 25000,
      interestRate: 4.5,
      term: 60,
      monthlyPayment: 466.08,
      remainingBalance: 20000,
      status: 'PENDING' as const,
      appliedDate: '2023-06-01T00:00:00Z',
    },
  ];

  const mockLoanTypes = [
    {id: 'lt-1', name: 'Personal Loan', maxAmount: 50000, baseRate: 5.5},
    {id: 'lt-2', name: 'Auto Loan', maxAmount: 100000, baseRate: 4.5},
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({userData: {id: '123'}});
    (useNavigation as jest.Mock).mockReturnValue({navigate: mockNavigate});
    mockGetLoanTypes.mockResolvedValue({data: mockLoanTypes} as any);
  });

  it('renders loading state initially', () => {
    mockGetAccountLoans.mockImplementation(() => new Promise(() => {}));
    const {getByText} = render(
      <LoansScreen route={{params: {accountId: '123'}}} />,
    );
    expect(getByText('Loading Loans...')).toBeTruthy();
  });

  it('renders loans after successful fetch', async () => {
    mockGetAccountLoans.mockResolvedValueOnce({data: mockLoans} as any);
    const {getByText} = render(
      <LoansScreen route={{params: {accountId: '123'}}} />,
    );
    await waitFor(() => {
      expect(getByText('Personal Loan')).toBeTruthy();
      expect(getByText('Auto Loan')).toBeTruthy();
      expect(getByText('ACTIVE')).toBeTruthy();
      expect(getByText('PENDING')).toBeTruthy();
    });
  });

  it('shows apply button', async () => {
    mockGetAccountLoans.mockResolvedValueOnce({data: mockLoans} as any);
    const {getByText} = render(
      <LoansScreen route={{params: {accountId: '123'}}} />,
    );
    await waitFor(() => expect(getByText('+ Apply')).toBeTruthy());
  });

  it('shows loan form when apply button is pressed', async () => {
    mockGetAccountLoans.mockResolvedValueOnce({data: mockLoans} as any);
    const {getByText} = render(
      <LoansScreen route={{params: {accountId: '123'}}} />,
    );
    await waitFor(() => expect(getByText('+ Apply')).toBeTruthy());
    fireEvent.press(getByText('+ Apply'));
    await waitFor(() => {
      expect(getByText('Apply for a Loan')).toBeTruthy();
    });
  });

  it('shows empty state when no loans', async () => {
    mockGetAccountLoans.mockResolvedValueOnce({data: []} as any);
    const {getByText} = render(
      <LoansScreen route={{params: {accountId: '123'}}} />,
    );
    await waitFor(() => {
      expect(getByText('No Loans Yet')).toBeTruthy();
    });
  });

  it('shows error state when fetch fails', async () => {
    mockGetAccountLoans.mockRejectedValueOnce({
      message: 'Failed to load loans.',
    });
    const {getByText} = render(
      <LoansScreen route={{params: {accountId: '123'}}} />,
    );
    await waitFor(() => {
      expect(getByText('Unable to Load Loans')).toBeTruthy();
    });
  });

  it('shows progress bar for active loans', async () => {
    mockGetAccountLoans.mockResolvedValueOnce({data: mockLoans} as any);
    const {getByText} = render(
      <LoansScreen route={{params: {accountId: '123'}}} />,
    );
    await waitFor(() => {
      expect(getByText('Repayment Progress')).toBeTruthy();
    });
  });

  it('fetches loans and loan types in parallel', async () => {
    mockGetAccountLoans.mockResolvedValueOnce({data: []} as any);
    render(<LoansScreen route={{params: {accountId: '123'}}} />);
    await waitFor(() => {
      expect(mockGetAccountLoans).toHaveBeenCalledWith('123');
      expect(mockGetLoanTypes).toHaveBeenCalled();
    });
  });
});
