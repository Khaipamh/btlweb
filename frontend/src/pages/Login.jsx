import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUiStore } from '@/stores/uiStore';

export default function Login() {
  const navigate = useNavigate();
  const openLoginModal = useUiStore((s) => s.openLoginModal);

  useEffect(() => {
    openLoginModal('login');
    navigate('/', { replace: true });
  }, [navigate, openLoginModal]);

  return null;
}
