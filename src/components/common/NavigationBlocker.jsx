import React from 'react';
import { useNavigate, useLocation, UNSAFE_NavigationContext } from 'react-router';
import { useCallback, useContext, useEffect } from 'react';

const useBlocker = (blocker, when = true) => {
  const { navigator } = useContext(UNSAFE_NavigationContext);
  const location = useLocation();

  useEffect(() => {
    if (!when) return;

    const unblock = navigator.block((tx) => {
      const autoUnblockingTx = {
        ...tx,
        retry() {
          unblock();
          tx.retry();
        },
      };

      blocker(autoUnblockingTx);
    });

    return unblock;
  }, [navigator, blocker, when]);
};

const NavigationBlocker = ({ when, message = '' }) => {
  const navigate = useNavigate();

  const handleBlockedNavigation = useCallback(
    (tx) => {
      if (window.confirm(message)) {
        tx.retry();
      }
    },
    [message]
  );

  useBlocker(handleBlockedNavigation, when);

  return null;
};

export default NavigationBlocker;