import 'react-native';
import {render, waitFor} from '@testing-library/react-native';
import {useAuth} from '../../context/AuthContext';
import SavingsGoalsScreen from '../../screens/SavingsGoalsScreen';
import {getAccountSavingsGoals} from '../../services/api';

jest.mock('../../services/api');
jest.mock('../../context/AuthContext');

describe('SavingsGoalsScreen', () => {
  const mockGetAccountSavingsGoals =
    getAccountSavingsGoals as jest.MockedFunction<
      typeof getAccountSavingsGoals
    >;

  const mockSavingsGoals = [
    {
      id: '1',
      name: 'Vacation Fund',
      targetAmount: 5000,
      currentAmount: 2500,
      progress: 50,
      createdDate: '2024-01-01T00:00:00Z',
      targetDate: '2024-12-31',
    },
    {
      id: '2',
      name: 'Emergency Fund',
      targetAmount: 10000,
      currentAmount: 7500,
      progress: 75,
      createdDate: '2023-06-01T00:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      userData: {id: '123'},
    });
  });

  it('renders loading state initially', () => {
    mockGetAccountSavingsGoals.mockImplementation(() => new Promise(() => {}));

    const {getByText} = render(
      <SavingsGoalsScreen route={{params: {accountId: '123'}}} />,
    );

    expect(mockGetAccountSavingsGoals).toHaveBeenCalled();
  });

  it('renders savings goals after successful fetch', async () => {
    mockGetAccountSavingsGoals.mockResolvedValueOnce({
      data: mockSavingsGoals,
    } as any);

    const {getByText} = render(
      <SavingsGoalsScreen route={{params: {accountId: '123'}}} />,
    );

    await waitFor(() => {
      expect(getByText('Vacation Fund')).toBeTruthy();
      expect(getByText('Emergency Fund')).toBeTruthy();
    });
  });

  it('shows empty state when no savings goals', async () => {
    mockGetAccountSavingsGoals.mockResolvedValueOnce({
      data: [],
    } as any);

    const {queryByText} = render(
      <SavingsGoalsScreen route={{params: {accountId: '123'}}} />,
    );

    await waitFor(() => {
      expect(queryByText('Vacation Fund')).toBeNull();
      expect(queryByText('Emergency Fund')).toBeNull();
    });
  });

  it('handles error state', async () => {
    mockGetAccountSavingsGoals.mockRejectedValueOnce({
      message: 'Failed to load savings goals.',
    });

    const {findByText} = render(
      <SavingsGoalsScreen route={{params: {accountId: '123'}}} />,
    );

    await waitFor(() => {
      expect(mockGetAccountSavingsGoals).toHaveBeenCalled();
    });
  });
});
