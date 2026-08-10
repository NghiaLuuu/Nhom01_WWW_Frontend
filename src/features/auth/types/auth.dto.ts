export interface LoginContentProps {
  title: string;
  subtitle: string;
  emailLabel: string;
  emailPlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  submitButtonText: string;
  forgotPasswordText: string;
}

export interface LoginFormProps {
  content: LoginContentProps;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}
