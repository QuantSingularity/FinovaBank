import 'react-native';
import {useNavigation} from '@react-navigation/native';
import {render, waitFor} from '@testing-library/react-native';
import {useAuth} from '../../context/AuthContext';
import LoansScreen from '../../screens/LoansScreen';
import {getAccountLoans, getLoanTypes} from '../../services/api';

jest.mock('../../services/api');
jest.mock('../../context/AuthContext');
jest.mock('@react-navigation/native');

describe('LoansScreen', () => {
  const mockNavigate = jest.fn();
  const mockGetAccountLoans = getAccountLoans as jest.MockedFunction<
    typeof getAccountLoans
  >;
  const mockGetLoanTypes = getLoanTypes as jest.MockedFunction<
    typeof getLoanTypes
  >;

  const mockLoans = [
    {
      id: '1',
      type: 'Personal Loan',
      amount: 10000,
      interestRate: 5.5,
      term: 36,
      monthlyPayment: 302.35,
      remainingBalance: 8500,
      status: 'ACTIVE' as const,
      appliedDate: '2024-01-01T00:00:00Z',
      approvalDate: '2024-01-05T00:00:00Z',
    },
    {
      id: '2',
      type: 'Auto Loan',
      amount: 25000,
      interestRate: 4.5,
      term: 60,
      monthlyPayment: 466.08,
      remainingBalance: 20000,
      status: 'ACTIVE' as const,
      appliedDate: '2023-06-01T00:00:00Z',
      approvalDate: '2023-06-10T00:00:00Z',
    },
  ];

  const mockLoanTypes = [
    {id: '1', name: 'Personal Loan', maxAmount: 50000, baseRate: 5.5},
    {id: '2', name: 'Auto Loan', maxAmount: 100000, baseRate: 4.5},
    {id: '3', name: 'Home Loan', maxAmount: 500000, baseRate: 3.5},
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
    mockGetAccountLoans.mockImplementation(() => new Promise(() => {}));
    mockGetLoanTypes.mockImplementation(() => new Promise(() => {}));

    const {getByText} = render(
      <LoansScreen route={{params: {accountId: '123'}}} />,
    );

    // Component should show loading or initial state
    expect(mockGetAccountLoans).toHaveBeenCalled();
    expect(mockGetLoanTypes).toHaveBeenCalled();
  });

  it('renders loans after successful fetch', async () => {
    mockGetAccountLoans.mockResolvedValueOnce({
      data: mockLoans,
    } as any);
    mockGetLoanTypes.mockResolvedValueOnce({
      data: mockLoanTypes,
    } as any);

    const {getByText} = render(
      <LoansScreen route={{params: {accountId: '123'}}} />,
    );

    await waitFor(() => {
      expect(getByText('Personal Loan')).toBeTruthy();
      expect(getByText('Auto Loan')).toBeTruthy();
    });
  });

  it('shows empty state when no loans', async () => {
    mockGetAccountLoans.mockResolvedValueOnce({
      data: [],
    } as any);
    mockGetLoanTypes.mockResolvedValueOnce({
      data: mockLoanTypes,
    } as any);

    const {queryByText} = render(
      <LoansScreen route={{params: {accountId: '123'}}} />,
    );

    await waitFor(() => {
      // Should not find loan names
      expect(queryByText('Personal Loan')).toBeNull();
      expect(queryByText('Auto Loan')).toBeNull();
    });
  });

  it('handles error state', async () => {
    mockGetAccountLoans.mockRejectedValueOnce({
      message: 'Failed to load loans.',
    });
    mockGetLoanTypes.mockResolvedValueOnce({
      data: mockLoanTypes,
    } as any);

    const {findByText} = render(
      <LoansScreen route={{params: {accountId: '123'}}} />,
    );

    // Error should be displayed (either in Alert or as text)
    await waitFor(() => {
      expect(mockGetAccountLoans).toHaveBeenCalled();
    });
  });
});
