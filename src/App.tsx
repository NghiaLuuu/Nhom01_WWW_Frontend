import { useState } from 'react';
import { LoginPage, RegisterPage } from './features/auth';

function App() {
  const [isLoginView, setIsLoginView] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50">
      {isLoginView ? (
        <LoginPage onToggleView={() => setIsLoginView(false)} />
      ) : (
        <RegisterPage onToggleView={() => setIsLoginView(true)} />
      )}
    </div>
  );
}

export default App;
