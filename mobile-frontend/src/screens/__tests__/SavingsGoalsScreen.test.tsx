import React from 'react';
import {fireEvent, render, waitFor} from '@testing-library/react-native';
import {Alert} from 'react-native';
import {useAuth} from '../../context/AuthContext';
import SavingsGoalsScreen from '../../screens/SavingsGoalsScreen';
import {
  contributeTosavingsGoal,
  createSavingsGoal,
  deleteSavingsGoal,
  getAccountSavingsGoals,
} from '../../services/api';

jest.mock('../../services/api');
jest.mock('../../context/AuthContext');
jest.spyOn(Alert, 'alert');

describe('SavingsGoalsScreen', () => {
  const mockGetAccountSavingsGoals =
    getAccountSavingsGoals as jest.MockedFunction<
      typeof getAccountSavingsGoals
    >;
  const mockCreateSavingsGoal = createSavingsGoal as jest.MockedFunction<
    typeof createSavingsGoal
  >;
  const mockDeleteSavingsGoal = deleteSavingsGoal as jest.MockedFunction<
    typeof deleteSavingsGoal
  >;
  const mockContributeTosavingsGoal =
    contributeTosavingsGoal as jest.MockedFunction<
      typeof contributeTosavingsGoal
    >;

  const mockSavingsGoals = [
    {
      id: 'goal-1',
      name: 'Vacation Fund',
      targetAmount: 5000,
      currentAmount: 2500,
      progress: 50,
      createdDate: '2024-01-01T00:00:00Z',
      targetDate: '2024-12-31',
    },
    {
      id: 'goal-2',
      name: 'Emergency Fund',
      targetAmount: 10000,
      currentAmount: 7500,
      progress: 75,
      createdDate: '2023-06-01T00:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({userData: {id: '123'}});
  });

  it('renders loading state initially', () => {
    mockGetAccountSavingsGoals.mockImplementation(() => new Promise(() => {}));
    render(<SavingsGoalsScreen route={{params: {accountId: '123'}}} />);
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

  it('shows progress percentages', async () => {
    mockGetAccountSavingsGoals.mockResolvedValueOnce({
      data: mockSavingsGoals,
    } as any);
    const {getAllByText} = render(
      <SavingsGoalsScreen route={{params: {accountId: '123'}}} />,
    );
    await waitFor(() => {
      expect(getAllByText('50% complete').length).toBeGreaterThan(0);
      expect(getAllByText('75% complete').length).toBeGreaterThan(0);
    });
  });

  it('shows empty state when no savings goals', async () => {
    mockGetAccountSavingsGoals.mockResolvedValueOnce({data: []} as any);
    const {getByText} = render(
      <SavingsGoalsScreen route={{params: {accountId: '123'}}} />,
    );
    await waitFor(() => {
      expect(getByText('No Savings Goals')).toBeTruthy();
    });
  });

  it('shows error when fetch fails', async () => {
    mockGetAccountSavingsGoals.mockRejectedValueOnce({
      message: 'Network error',
    });
    const {getByText} = render(
      <SavingsGoalsScreen route={{params: {accountId: '123'}}} />,
    );
    await waitFor(() => {
      expect(getByText('Network error')).toBeTruthy();
    });
  });

  it('shows add goal form when New Goal is pressed', async () => {
    mockGetAccountSavingsGoals.mockResolvedValueOnce({data: []} as any);
    const {getByText} = render(
      <SavingsGoalsScreen route={{params: {accountId: '123'}}} />,
    );
    await waitFor(() => expect(getByText('Create First Goal')).toBeTruthy());
    fireEvent.press(getByText('Create First Goal'));
    await waitFor(() => {
      expect(getByText('New Goal')).toBeTruthy();
    });
  });

  it('shows contribute form when Contribute is pressed', async () => {
    mockGetAccountSavingsGoals.mockResolvedValueOnce({
      data: mockSavingsGoals,
    } as any);
    const {getAllByText, getByText} = render(
      <SavingsGoalsScreen route={{params: {accountId: '123'}}} />,
    );
    await waitFor(() =>
      expect(getAllByText('+ Contribute').length).toBeGreaterThan(0),
    );
    fireEvent.press(getAllByText('+ Contribute')[0]);
    await waitFor(() => {
      expect(getByText('Add Contribution')).toBeTruthy();
    });
  });

  it('validates goal name and amount before creating', async () => {
    mockGetAccountSavingsGoals.mockResolvedValueOnce({data: []} as any);
    const {getByText} = render(
      <SavingsGoalsScreen route={{params: {accountId: '123'}}} />,
    );
    await waitFor(() => expect(getByText('Create First Goal')).toBeTruthy());
    fireEvent.press(getByText('Create First Goal'));
    await waitFor(() => expect(getByText('Create Goal')).toBeTruthy());
    fireEvent.press(getByText('Create Goal'));
    await waitFor(() => {
      expect(getByText('Please enter a goal name.')).toBeTruthy();
    });
  });

  it('submits delete confirmation alert', async () => {
    mockGetAccountSavingsGoals.mockResolvedValueOnce({
      data: mockSavingsGoals,
    } as any);
    const {getAllByText} = render(
      <SavingsGoalsScreen route={{params: {accountId: '123'}}} />,
    );
    await waitFor(() =>
      expect(getAllByText('Delete').length).toBeGreaterThan(0),
    );
    fireEvent.press(getAllByText('Delete')[0]);
    expect(Alert.alert).toHaveBeenCalledWith(
      'Delete Goal',
      expect.stringContaining('Vacation Fund'),
      expect.any(Array),
    );
  });
});
