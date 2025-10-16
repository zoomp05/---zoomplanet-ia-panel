// components/MarketingErrorBoundary.jsx
import React, { Component } from 'react';
import { Result, Button } from 'antd';
import { Link } from 'react-router';

class MarketingErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Marketing Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Result
          status="500"
          title="Error en el módulo de Marketing"
          subTitle="Lo sentimos, ocurrió un error inesperado en el módulo de marketing."
          extra={
            <Link to="/dashboard">
              <Button type="primary">Volver al Dashboard</Button>
            </Link>
          }
        />
      );
    }

    return this.props.children;
  }
}

export default MarketingErrorBoundary;
