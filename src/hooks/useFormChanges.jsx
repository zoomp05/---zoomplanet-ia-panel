// src/hooks/useFormChanges.jsx
import { useState, useCallback } from 'react';
import { Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const { confirm: modalConfirm } = Modal;

/**
 * Hook simplificado para detectar cambios en formularios basado en eventos
 * @param {boolean} isEditing - Si está en modo edición
 * @returns {Object} - { formChanged, markAsChanged, confirmClose, resetChanges }
 */
export const useFormChanges = (isEditing = false) => {
  const [formChanged, setFormChanged] = useState(false);

  /**
   * Marca el formulario como modificado (llamar desde onValuesChange)
   */
  const markAsChanged = useCallback(() => {
    if (isEditing && !formChanged) {
      console.log('📝 Formulario marcado como modificado');
      setFormChanged(true);
    }
  }, [isEditing, formChanged]);

  /**
   * Confirma el cierre del modal si hay cambios
   */
  const confirmClose = useCallback((onConfirm) => {
    return new Promise((resolve) => {
      if (!formChanged) {
        console.log('✅ No hay cambios, cerrando directamente');
        if (onConfirm) onConfirm();
        resolve(true);
        return;
      }

      console.log('⚠️ Hay cambios sin guardar, mostrando confirmación');

      modalConfirm({
        title: '¿Descartar cambios?',
        icon: <ExclamationCircleOutlined />,
        content: (
          <div>
            <p>Has realizado cambios que no se han guardado.</p>
            <p>¿Estás seguro de que deseas cerrar sin guardar?</p>
          </div>
        ),
        okText: 'Sí, descartar',
        okType: 'danger',
        cancelText: 'Cancelar',
        onOk: () => {
          console.log('✅ Usuario confirmó descartar cambios');
          setFormChanged(false);
          if (onConfirm) onConfirm();
          resolve(true);
        },
        onCancel: () => {
          console.log('❌ Usuario canceló el descarte');
          resolve(false);
        },
      });
    });
  }, [formChanged]);

  /**
   * Resetea el estado de cambios (llamar después de guardar o al abrir)
   */
  const resetChanges = useCallback(() => {
    console.log('🔄 Reseteando estado de cambios');
    setFormChanged(false);
  }, []);

  return {
    formChanged,
    markAsChanged,
    confirmClose,
    resetChanges,
  };
};

export default useFormChanges;
