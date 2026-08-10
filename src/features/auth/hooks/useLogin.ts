import { useState } from 'react';

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);

  const login = async (credentials: any) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('Logged in successfully', credentials);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return { login, isLoading };
};
