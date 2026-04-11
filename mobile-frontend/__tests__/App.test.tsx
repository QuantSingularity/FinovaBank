import React from 'react';
import {it, describe, expect, beforeEach, jest} from '@jest/globals';
import {render} from '@testing-library/react-native';
import App from '../App';

jest.mock('../src/context/AuthContext', () => ({
  AuthProvider: ({children}: {children: React.ReactNode}) => children,
  useAuth: () => ({
    userToken: null,
    userData: null,
    isLoading: false,
    isAuthenticated: false,
    login: jest.fn(),
    logout: jest.fn(),
    register: jest.fn(),
  }),
}));

jest.mock('../src/navigation/AppNavigator', () => {
  const {View, Text} = require('react-native');
  return () => (
    <View>
      <Text>AppNavigator</Text>
    </View>
  );
});

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const {getByText} = render(<App />);
    expect(getByText('AppNavigator')).toBeTruthy();
  });

  it('wraps content in AuthProvider', () => {
    expect(() => render(<App />)).not.toThrow();
  });
});
