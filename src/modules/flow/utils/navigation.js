// Actualizamos para usar el patrón de namespace para React Router
import * as ReactRouter from 'react-router';
const { useNavigate } = ReactRouter;

export const navigate = (path) => {
  const navigate = useNavigate();
  return navigate(path);
};