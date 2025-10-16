import React from 'react';
import * as ReactRouter from 'react-router';
import FlowEditor from '../components/FlowEditor';
import FlowList from '../components/FlowList';

const Flow = () => {
  const { useLocation } = ReactRouter;
  const location = useLocation();
  const isForm = location.pathname.includes('/create') || location.pathname.includes('/edit');

  return isForm ? <FlowEditor /> : <FlowList />;
};

export default Flow;