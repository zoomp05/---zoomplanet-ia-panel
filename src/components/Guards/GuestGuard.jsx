import { useEffect } from 'react';
import * as ReactRouter from 'react-router';
const { useNavigate } = ReactRouter;
import { useAuth } from '../../modules/auth/contexts/AuthContext.jsx';
import LoadingScreen from '../common/LoadingScreen';

const GuestGuard = ({ children }) => {
  const { token, isInitialized } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isInitialized && token) {
      navigate('/dashboard', { replace: true });
    }
  }, [isInitialized, token, navigate]);

  if (!isInitialized) {
    return <LoadingScreen />;
  }

  return !token ? children : null;
};

export default GuestGuard;