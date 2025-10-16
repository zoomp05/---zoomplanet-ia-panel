import React from 'react';
import { useLocation } from 'react-router';
import NewsletterList from '../components/newsletter/newsletterList';
import NewsletterForm from '../components/newsletter/newsletterForm';

const Newsletter = () => {
  const location = useLocation();
  const isForm = location.pathname.includes('/create') || location.pathname.includes('/edit');

  return isForm ? <NewsletterForm /> : <NewsletterList />;
};

export default Newsletter;