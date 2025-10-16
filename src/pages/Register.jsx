import React, { useState } from 'react';
import * as ReactRouter from 'react-router';
const { useNavigate } = ReactRouter;
const { Link } = ReactRouter;
import { useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { toast } from 'react-hot-toast';
import { useFormWithValidation, validationSchemas } from '../hooks/useForm';
import { useAuth } from '../modules/auth/contexts/AuthContext.jsx';
import { LoadingSpinner } from '../components/common/LoadingScreen';
import '../css/Register.css';

const CREATE_USER = gql`
  mutation CreateUser($input: UserInput!) {
    createUser(input: $input) {
      token
      user {
        id
        email
        name
        role
      }
    }
  }
`;

const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [createUser, { loading: mutationLoading }] = useMutation(CREATE_USER);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const onSubmit = async (formData) => {
    const loadingToast = toast.loading('Creando cuenta...');
    
    try {
      const { data } = await createUser({
        variables: {
          input: {
            email: formData.email,
            password: formData.password,
            name: formData.name,
            phone: formData.phone
          }
        }
      });

      login(data.createUser.user, data.createUser.token);
      
      toast.success('¡Cuenta creada exitosamente!', {
        id: loadingToast
      });
      
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error(err.message || 'Error al crear la cuenta', {
        id: loadingToast
      });
      throw err;
    }
  };

  const {
    register,
    handleSubmit,
    errors,
    isSubmitting
  } = useFormWithValidation(validationSchemas.login, onSubmit);

  const togglePasswordVisibility = (field) => {
    if (field === 'password') {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h1>Crear Cuenta</h1>
          <p>Únete a nuestra plataforma</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form" noValidate>
          <div className="form-group">
            <label htmlFor="name">Nombre completo</label>
            <div className="input-wrapper">
              <input
                type="text"
                id="name"
                autoComplete="name"
                placeholder="Tu nombre completo"
                className={errors.name ? 'error' : ''}
                {...register('name')}
                disabled={isSubmitting}
              />
              {errors.name && (
                <div className="error-message">
                  {errors.name.message}
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <div className="input-wrapper">
              <input
                type="email"
                id="email"
                autoComplete="email"
                placeholder="nombre@ejemplo.com"
                className={errors.email ? 'error' : ''}
                {...register('email')}
                disabled={isSubmitting}
              />
              {errors.email && (
                <div className="error-message">
                  {errors.email.message}
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="phone">Teléfono (opcional)</label>
            <div className="input-wrapper">
              <input
                type="tel"
                id="phone"
                autoComplete="tel"
                placeholder="Tu número de teléfono"
                className={errors.phone ? 'error' : ''}
                {...register('phone')}
                disabled={isSubmitting}
              />
              {errors.phone && (
                <div className="error-message">
                  {errors.phone.message}
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <div className="input-wrapper password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="new-password"
                placeholder="Crea una contraseña segura"
                className={errors.password ? 'error' : ''}
                {...register('password')}
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => togglePasswordVisibility('password')}
                tabIndex="-1"
              >
                {showPassword ? (
                  <span role="img" aria-label="ocultar">👁️</span>
                ) : (
                  <span role="img" aria-label="mostrar">👁️‍🗨️</span>
                )}
              </button>
              {errors.password && (
                <div className="error-message">
                  {errors.password.message}
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar contraseña</label>
            <div className="input-wrapper password-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                autoComplete="new-password"
                placeholder="Repite tu contraseña"
                className={errors.confirmPassword ? 'error' : ''}
                {...register('confirmPassword')}
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => togglePasswordVisibility('confirm')}
                tabIndex="-1"
              >
                {showConfirmPassword ? (
                  <span role="img" aria-label="ocultar">👁️</span>
                ) : (
                  <span role="img" aria-label="mostrar">👁️‍🗨️</span>
                )}
              </button>
              {errors.confirmPassword && (
                <div className="error-message">
                  {errors.confirmPassword.message}
                </div>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="submit-button"
              disabled={isSubmitting || mutationLoading}
            >
              {(isSubmitting || mutationLoading) ? (
                <LoadingSpinner size="small" />
              ) : (
                'Crear Cuenta'
              )}
            </button>
          </div>

          <div className="login-link">
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login">Inicia sesión aquí</Link>
          </div>
        </form>

        <div className="social-login">
          <div className="divider">
            <span>O regístrate con</span>
          </div>
          
          <div className="social-buttons">
            <button 
              type="button"
              className="social-button google-button"
              disabled={isSubmitting || mutationLoading}
            >
              <svg className="social-icon" viewBox="0 0 24 24">
                <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z"/>
              </svg>
              Continuar con Google
            </button>

            <button 
              type="button"
              className="social-button github-button"
              disabled={isSubmitting || mutationLoading}
            >
              <svg className="social-icon" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              Continuar con GitHub
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;