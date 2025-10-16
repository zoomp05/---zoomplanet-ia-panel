import React from 'react';
import { Navigate } from 'react-router';

export default function MarketingRedirect() {
  return <Navigate to="/crm/marketing/campaigns" replace />;
}
