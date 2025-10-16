import * as ReactRouter from 'react-router';
const { useLocation, useNavigate } = ReactRouter;
import { useEffect, useCallback } from 'react';

export const useNavigationGuard = (shouldBlock, message) => {
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(()=>{
    if(!shouldBlock) return;
    const handleClick = (e) => {
      const link = e.target.closest('a');
      if (!link) return;
      const url = link.getAttribute('href');
      if (!url || url.startsWith('http') || url.startsWith('mailto:')) return;
      if (shouldBlock && !window.confirm(message)) e.preventDefault();
    };
    window.addEventListener('click', handleClick);
    return ()=> window.removeEventListener('click', handleClick);
  },[shouldBlock, message, location]);
  useEffect(()=>{
    const handleBeforeUnload = (e)=>{ if(shouldBlock){ e.preventDefault(); e.returnValue = message; return message; } };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return ()=> window.removeEventListener('beforeunload', handleBeforeUnload);
  },[shouldBlock, message]);
  return useCallback((to)=>{ if(!shouldBlock) return true; return window.confirm(message); },[shouldBlock, message]);
};

export default useNavigationGuard;
