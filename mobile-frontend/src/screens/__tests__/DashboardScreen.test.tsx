import 'react-native';
import {useNavigation} from '@react-navigation/native';
import {fireEvent, render} from '@testing-library/react-native';
import DashboardScreen from '../../screens/DashboardScreen';

jest.mock('@react-navigation/native');

describe('DashboardScreen', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigation as jest.Mock).mockReturnValue({
      navigate: mockNavigate,
    });
  });

  it('renders correctly', () => {
    const {getByText} = render(<DashboardScreen />);

    expect(getByText('Welcome Back!')).toBeTruthy();
    expect(getByText('Account Summary')).toBeTruthy();
    expect(getByText('Quick Actions')).toBeTruthy();
    // The balance is split across multiple Text components, so we check for the number part
    expect(getByText('5420.50')).toBeTruthy();
    expect(getByText('Account: **** **** **** 1234')).toBeTruthy();
  });

  it('renders all quick action buttons', () => {
    const {getByText} = render(<DashboardScreen />);

    expect(getByText('View Transactions')).toBeTruthy();
    expect(getByText('Apply for Loan')).toBeTruthy();
    expect(getByText('Manage Savings')).toBeTruthy();
    expect(getByText('Account Details')).toBeTruthy();
  });

  it('navigates to Transactions screen when View Transactions is pressed', () => {
    const {getByText} = render(<DashboardScreen />);
    const transactionsButton = getByText('View Transactions');

    fireEvent.press(transactionsButton);

    expect(mockNavigate).toHaveBeenCalledWith('Transactions', undefined);
  });

  it('navigates to Loans screen when Apply for Loan is pressed', () => {
    const {getByText} = render(<DashboardScreen />);
    const loansButton = getByText('Apply for Loan');

    fireEvent.press(loansButton);

    expect(mockNavigate).toHaveBeenCalledWith('Loans', undefined);
  });

  it('navigates to SavingsGoals screen when Manage Savings is pressed', () => {
    const {getByText} = render(<DashboardScreen />);
    const savingsButton = getByText('Manage Savings');

    fireEvent.press(savingsButton);

    expect(mockNavigate).toHaveBeenCalledWith('SavingsGoals', undefined);
  });

  it('navigates to AccountDetails screen with accountId when Account Details is pressed', () => {
    const {getByText} = render(<DashboardScreen />);
    const accountDetailsButton = getByText('Account Details');

    fireEvent.press(accountDetailsButton);

    expect(mockNavigate).toHaveBeenCalledWith('AccountDetails', {
      accountId: '1',
    });
  });
});
