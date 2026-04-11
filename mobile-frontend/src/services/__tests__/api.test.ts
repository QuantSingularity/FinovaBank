jest.mock('@react-native-async-storage/async-storage');
jest.mock('axios', () => {
  const mockAxiosInstance = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: {use: jest.fn()},
      response: {use: jest.fn()},
    },
  };
  return {
    create: jest.fn(() => mockAxiosInstance),
  };
});

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('exports all required API functions', () => {
    const api = require('../../services/api');
    const expectedFunctions = [
      'loginUser',
      'registerUser',
      'logoutUser',
      'resetPassword',
      'verifyEmail',
      'getUserAccounts',
      'getAccountDetails',
      'updateAccountDetails',
      'createAccount',
      'getAccountTransactions',
      'createTransaction',
      'getTransactionDetails',
      'getAccountLoans',
      'applyForLoan',
      'getLoanTypes',
      'getLoanDetails',
      'calculateLoanPayment',
      'getAccountSavingsGoals',
      'createSavingsGoal',
      'updateSavingsGoal',
      'deleteSavingsGoal',
      'contributeTosavingsGoal',
      'getUserProfile',
      'updateUserProfile',
      'changePassword',
    ];
    expectedFunctions.forEach(fn => {
      expect(typeof api[fn]).toBe('function');
    });
  });

  it('creates axios instance with correct timeout', () => {
    const axios = require('axios');
    require('../../services/api');
    expect(axios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        timeout: 30000,
        headers: {'Content-Type': 'application/json'},
      }),
    );
  });
});
