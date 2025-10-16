import React, { useState } from 'react';
// Actualizado para usar el patrón de namespace para Apollo Client
import * as ApolloClient from '@apollo/client';
const { useMutation, gql } = ApolloClient;
// Actualizado para usar el patrón de namespace para React Router
import * as ReactRouter from 'react-router';
const { useNavigate } = ReactRouter;
import { toast } from 'react-hot-toast';
import MainLayout from '../layouts/MainLayout';
import '../css/CreateWorker.css';
import { CREATE_WORKER } from '../apollo/worker';

const WORKER_MODELS = {
  GPT_4: 'GPT-4',
  GPT_4_0: 'GPT-4.0',
  GPT_4_TURBO: 'GPT-4 Turbo',
  GPT_3_5_TURBO: 'GPT-3.5 Turbo'
};

const WORKER_TOOLS = {
  CODE_INTERPRETER: 'Code Interpreter',
  RETRIEVAL: 'Retrieval',
  FUNCTION_CALLING: 'Function Calling'
};

const CreateWorker = () => {
  const navigate = useNavigate();
  const [createWorker, { loading }] = useMutation(CREATE_WORKER);

  const [formData, setFormData] = useState({
    name: '',
    instructions: '',
    model: 'GPT_4',
    tools: ['CODE_INTERPRETER'],
    openai_id: '',
    openai_files_ids: []
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'El nombre es requerido';
    if (!formData.instructions.trim()) newErrors.instructions = 'Las instrucciones son requeridas';
    if (!formData.openai_id.trim()) newErrors.openai_id = 'El OpenAI ID es requerido';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleToolToggle = (tool) => {
    setFormData(prev => ({
      ...prev,
      tools: prev.tools.includes(tool)
        ? prev.tools.filter(t => t !== tool)
        : [...prev.tools, tool]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const { data } = await createWorker({
        variables: {
          input: formData
        }
      });

      toast.success('Worker creado exitosamente');
      navigate(`/workers/${data.createWorker.id}`);
    } catch (error) {
      console.error('Error creating worker:', error);
      setErrors(prev => ({
        ...prev,
        submit: error.message
      }));
      toast.error(error.message || 'Error al crear el worker');
    }
  };

  return (
    <MainLayout>
      <div className="create-worker-container">
        <div className="create-worker-header">
          <h1>Crear Nuevo Worker</h1>
          <p>Configure los detalles de su nuevo worker</p>
        </div>

        <form onSubmit={handleSubmit} className="create-worker-form">
          <div className="form-section">
            <h2>Información Básica</h2>
            
            <div className="form-group">
              <label htmlFor="name">Nombre *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? 'error' : ''}
                placeholder="Nombre del worker"
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="openai_id">OpenAI ID *</label>
              <input
                type="text"
                id="openai_id"
                name="openai_id"
                value={formData.openai_id}
                onChange={handleChange}
                className={errors.openai_id ? 'error' : ''}
                placeholder="ID del asistente en OpenAI"
              />
              {errors.openai_id && <span className="error-message">{errors.openai_id}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="instructions">Instrucciones *</label>
              <textarea
                id="instructions"
                name="instructions"
                value={formData.instructions}
                onChange={handleChange}
                className={errors.instructions ? 'error' : ''}
                placeholder="Instrucciones detalladas para el worker"
                rows={6}
              />
              {errors.instructions && <span className="error-message">{errors.instructions}</span>}
            </div>
          </div>

          <div className="form-section">
            <h2>Configuración</h2>
            
            <div className="form-group">
              <label htmlFor="model">Modelo</label>
              <select
                id="model"
                name="model"
                value={formData.model}
                onChange={handleChange}
              >
                {Object.entries(WORKER_MODELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Herramientas</label>
              <div className="tools-grid">
                {Object.entries(WORKER_TOOLS).map(([value, label]) => (
                  <label key={value} className="tool-checkbox">
                    <input
                      type="checkbox"
                      checked={formData.tools.includes(value)}
                      onChange={() => handleToolToggle(value)}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {errors.submit && (
            <div className="error-banner">
              {errors.submit}
            </div>
          )}

          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-button"
              onClick={() => navigate(-1)}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="submit-button"
              disabled={loading}
            >
              {loading ? 'Creando...' : 'Crear Worker'}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default CreateWorker;