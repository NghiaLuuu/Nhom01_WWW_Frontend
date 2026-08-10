
import { LoginForm } from '../components/LoginForm';
import { useLogin } from '../hooks/useLogin';

// Default content (this would typically come from a CMS or content API)
const defaultContent = {
  title: "Welcome Back",
  subtitle: "Please enter your details to sign in",
  emailLabel: "Email Address",
  emailPlaceholder: "Enter your email",
  passwordLabel: "Password",
  passwordPlaceholder: "Enter your password",
  submitButtonText: "Sign In",
  forgotPasswordText: "Forgot Password?"
};

export const LoginPage: React.FC = () => {
  const { login, isLoading } = useLogin();

  const handleLoginSubmit = (data: any) => {
    login(data);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 sm:px-6 lg:px-8">
      <LoginForm 
        content={defaultContent} 
        onSubmit={handleLoginSubmit} 
        isLoading={isLoading} 
      />
    </div>
  );
};
