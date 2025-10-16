import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'react-hot-toast';

export const useFormWithValidation = (schema, onSubmit) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    control,
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onBlur',
  });

  const handleFormSubmit = async (data) => {
    const loadingToast = toast.loading('Procesando...');
    
    try {
      await onSubmit(data);
      toast.success('¡Operación exitosa!', {
        id: loadingToast,
      });
      reset();
    } catch (error) {
      toast.error(error.message || 'Ocurrió un error', {
        id: loadingToast,
      });
      throw error;
    }
  };

  return {
    register,
    handleSubmit: handleSubmit(handleFormSubmit),
    errors,
    reset,
    setValue,
    watch,
    control,
  };
};

// Esquemas de validación comunes
export const validationSchemas = {
  login: yup.object({
    email: yup
      .string()
      .email('Ingrese un email válido')
      .required('El email es requerido'),
    password: yup
      .string()
      .min(6, 'La contraseña debe tener al menos 6 caracteres')
      .required('La contraseña es requerida'),
  }),
  
  register: yup.object({
    name: yup
      .string()
      .required('El nombre es requerido')
      .min(2, 'El nombre debe tener al menos 2 caracteres'),
    email: yup
      .string()
      .email('Ingrese un email válido')
      .required('El email es requerido'),
    password: yup
      .string()
      .min(6, 'La contraseña debe tener al menos 6 caracteres')
      .required('La contraseña es requerida'),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref('password'), null], 'Las contraseñas deben coincidir')
      .required('Confirme su contraseña'),
  }),
  
  // Puedes agregar más esquemas según necesites
};