import React from 'react';
import {render, act, waitFor} from '@testing-library/react-native';
import {Text} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AuthProvider, useAuth} from '../../context/AuthContext';
import {loginUser, logoutUser, registerUser} from '../../services/api';

jest.mock('../../services/api');
jest.mock('@react-native-async-storage/async-storage');

const mockLoginUser = loginUser as jest.MockedFunction<typeof loginUser>;
const mockLogoutUser = logoutUser as jest.MockedFunction<typeof logoutUser>;
const mockRegisterUser = registerUser as jest.MockedFunction<
  typeof registerUser
>;
const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

const mockAuthResponse = {
  token: 'test-token-abc123',
  user: {
    id: 'u1',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
  },
};

const TestConsumer = () => {
  const auth = useAuth();
  return (
    <>
      <Text testID="token">{auth.userToken ?? 'null'}</Text>
      <Text testID="authenticated">
        {auth.isAuthenticated ? 'true' : 'false'}
      </Text>
      <Text testID="loading">{auth.isLoading ? 'true' : 'false'}</Text>
      <Text testID="firstName">{auth.userData?.firstName ?? 'none'}</Text>
    </>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.multiSet.mockResolvedValue(undefined);
    mockAsyncStorage.multiRemove.mockResolvedValue(undefined);
  });

  it('starts with loading true then resolves to unauthenticated', async () => {
    const {getByTestId} = render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(getByTestId('authenticated').props.children).toBe('false');
      expect(getByTestId('loading').props.children).toBe('false');
    });
  });

  it('restores token from AsyncStorage on mount', async () => {
    mockAsyncStorage.getItem
      .mockResolvedValueOnce('restored-token')
      .mockResolvedValueOnce(JSON.stringify(mockAuthResponse.user));

    const {getByTestId} = render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(getByTestId('token').props.children).toBe('restored-token');
      expect(getByTestId('authenticated').props.children).toBe('true');
      expect(getByTestId('firstName').props.children).toBe('John');
    });
  });

  it('throws error when useAuth is used outside AuthProvider', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow(
      'useAuth must be used within an AuthProvider',
    );
    spy.mockRestore();
  });

  it('login sets token and user data', async () => {
    mockLoginUser.mockResolvedValueOnce({data: mockAuthResponse} as any);

    const LoginTrigger = () => {
      const {login, userToken} = useAuth();
      return (
        <>
          <Text testID="token">{userToken ?? 'null'}</Text>
          <Text
            testID="trigger"
            onPress={() => login({email: 'e@e.com', password: 'pw'})}>
            login
          </Text>
        </>
      );
    };

    const {getByTestId} = render(
      <AuthProvider>
        <LoginTrigger />
      </AuthProvider>,
    );

    await waitFor(() =>
      expect(getByTestId('token').props.children).toBe('null'),
    );

    await act(async () => {
      getByTestId('trigger').props.onPress();
    });

    await waitFor(() => {
      expect(getByTestId('token').props.children).toBe('test-token-abc123');
    });

    expect(mockAsyncStorage.multiSet).toHaveBeenCalledWith([
      ['finovabank_user_token', 'test-token-abc123'],
      ['finovabank_user_data', JSON.stringify(mockAuthResponse.user)],
    ]);
  });

  it('logout clears token and user data', async () => {
    mockAsyncStorage.getItem
      .mockResolvedValueOnce('existing-token')
      .mockResolvedValueOnce(JSON.stringify(mockAuthResponse.user));
    mockLogoutUser.mockResolvedValueOnce({} as any);

    const LogoutTrigger = () => {
      const {logout, userToken} = useAuth();
      return (
        <>
          <Text testID="token">{userToken ?? 'null'}</Text>
          <Text testID="trigger" onPress={logout}>
            logout
          </Text>
        </>
      );
    };

    const {getByTestId} = render(
      <AuthProvider>
        <LogoutTrigger />
      </AuthProvider>,
    );

    await waitFor(() =>
      expect(getByTestId('token').props.children).toBe('existing-token'),
    );

    await act(async () => {
      getByTestId('trigger').props.onPress();
    });

    await waitFor(() => {
      expect(getByTestId('token').props.children).toBe('null');
    });

    expect(mockAsyncStorage.multiRemove).toHaveBeenCalled();
  });

  it('register stores auth data after successful registration', async () => {
    mockRegisterUser.mockResolvedValueOnce({data: mockAuthResponse} as any);

    const RegisterTrigger = () => {
      const {register, userToken} = useAuth();
      return (
        <>
          <Text testID="token">{userToken ?? 'null'}</Text>
          <Text
            testID="trigger"
            onPress={() =>
              register({
                firstName: 'John',
                lastName: 'Doe',
                email: 'j@j.com',
                password: 'Password1',
              })
            }>
            register
          </Text>
        </>
      );
    };

    const {getByTestId} = render(
      <AuthProvider>
        <RegisterTrigger />
      </AuthProvider>,
    );

    await waitFor(() =>
      expect(getByTestId('token').props.children).toBe('null'),
    );

    await act(async () => {
      getByTestId('trigger').props.onPress();
    });

    await waitFor(() => {
      expect(getByTestId('token').props.children).toBe('test-token-abc123');
    });
  });

  it('login throws and does not set token on failure', async () => {
    mockLoginUser.mockRejectedValueOnce(new Error('Bad credentials'));

    const LoginTrigger = () => {
      const {login, userToken} = useAuth();
      return (
        <>
          <Text testID="token">{userToken ?? 'null'}</Text>
          <Text
            testID="trigger"
            onPress={() =>
              login({email: 'e@e.com', password: 'wrong'}).catch(() => {})
            }>
            login
          </Text>
        </>
      );
    };

    const {getByTestId} = render(
      <AuthProvider>
        <LoginTrigger />
      </AuthProvider>,
    );

    await waitFor(() =>
      expect(getByTestId('token').props.children).toBe('null'),
    );

    await act(async () => {
      getByTestId('trigger').props.onPress();
    });

    await waitFor(() => {
      expect(getByTestId('token').props.children).toBe('null');
    });
  });
});
