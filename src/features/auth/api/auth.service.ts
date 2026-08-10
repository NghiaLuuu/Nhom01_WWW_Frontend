export const authService = {
  login: async (_credentials: any) => {
    // API call using Axios/Fetch goes here
    return Promise.resolve({ token: 'dummy_token' });
  },
  logout: async () => {
    // Logout API call goes here
    return Promise.resolve();
  }
};
