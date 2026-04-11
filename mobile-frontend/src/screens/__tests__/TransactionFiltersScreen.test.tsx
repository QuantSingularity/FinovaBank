import React from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';
import {fireEvent, render, waitFor} from '@testing-library/react-native';
import TransactionFiltersScreen from '../../screens/TransactionFiltersScreen';

jest.mock('@react-navigation/native');

describe('TransactionFiltersScreen', () => {
  const mockGoBack = jest.fn();
  const mockOnFilterApply = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigation as jest.Mock).mockReturnValue({goBack: mockGoBack});
    (useRoute as jest.Mock).mockReturnValue({
      params: {
        currentFilter: undefined,
        onFilterApply: mockOnFilterApply,
      },
    });
  });

  it('renders all filter sections', () => {
    const {getByText} = render(<TransactionFiltersScreen />);
    expect(getByText('Filter Transactions')).toBeTruthy();
    expect(getByText('Quick Select')).toBeTruthy();
    expect(getByText('Date Range')).toBeTruthy();
    expect(getByText('Transaction Type')).toBeTruthy();
  });

  it('renders quick filter chips', () => {
    const {getByText} = render(<TransactionFiltersScreen />);
    expect(getByText('Last 7 Days')).toBeTruthy();
    expect(getByText('Last 30 Days')).toBeTruthy();
    expect(getByText('Last 90 Days')).toBeTruthy();
  });

  it('renders transaction type options', () => {
    const {getByText} = render(<TransactionFiltersScreen />);
    expect(getByText('All Types')).toBeTruthy();
    expect(getByText('Credits Only')).toBeTruthy();
    expect(getByText('Debits Only')).toBeTruthy();
  });

  it('sets date range when quick filter is pressed', () => {
    const {getByText, getByPlaceholderText} = render(
      <TransactionFiltersScreen />,
    );
    fireEvent.press(getByText('Last 7 Days'));
    const startInput = getByPlaceholderText('YYYY-MM-DD');
    expect(startInput.props.value).toBeTruthy();
  });

  it('calls onFilterApply and goes back when Apply is pressed', async () => {
    const {getByText} = render(<TransactionFiltersScreen />);
    fireEvent.press(getByText('Apply Filters'));
    await waitFor(() => {
      expect(mockOnFilterApply).toHaveBeenCalled();
      expect(mockGoBack).toHaveBeenCalled();
    });
  });

  it('validates invalid date format', async () => {
    const {getByPlaceholderText, getByText} = render(
      <TransactionFiltersScreen />,
    );
    const [startInput] = getByPlaceholderText('YYYY-MM-DD').parent
      ? [getByPlaceholderText('YYYY-MM-DD')]
      : [];
    if (startInput) {
      fireEvent.changeText(startInput, 'not-a-date');
      fireEvent.press(getByText('Apply Filters'));
      await waitFor(() => {
        expect(
          getByText('Start date must be in YYYY-MM-DD format.'),
        ).toBeTruthy();
      });
    }
  });

  it('shows Cancel button that goes back without applying', () => {
    const {getByText} = render(<TransactionFiltersScreen />);
    fireEvent.press(getByText('Cancel'));
    expect(mockGoBack).toHaveBeenCalled();
    expect(mockOnFilterApply).not.toHaveBeenCalled();
  });

  it('selects CREDIT type when Credits Only is pressed', () => {
    const {getByText} = render(<TransactionFiltersScreen />);
    fireEvent.press(getByText('Credits Only'));
    fireEvent.press(getByText('Apply Filters'));
    expect(mockOnFilterApply).toHaveBeenCalledWith(
      expect.objectContaining({type: 'CREDIT'}),
    );
  });

  it('populates form with currentFilter when provided', () => {
    (useRoute as jest.Mock).mockReturnValue({
      params: {
        currentFilter: {
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          type: 'DEBIT',
        },
        onFilterApply: mockOnFilterApply,
      },
    });
    const {getAllByDisplayValue} = render(<TransactionFiltersScreen />);
    expect(getAllByDisplayValue('2024-01-01').length).toBeGreaterThan(0);
  });
});
