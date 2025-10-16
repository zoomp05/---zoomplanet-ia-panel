import React from 'react';
import { Navigate } from 'react-router';

export default function NewsletterRedirect() {
  return <Navigate to="/crm/newsletter" replace />;
}
