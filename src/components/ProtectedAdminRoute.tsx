import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { isAdminEmail } from '@/lib/adminAuth';
import { Loader2 } from 'lucide-react';

const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<'loading' | 'authorized' | 'unauthorized'>('loading');

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user && isAdminEmail(session.user.email)) {
        setState('authorized');
      } else {
        setState('unauthorized');
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user && isAdminEmail(session.user.email)) {
        setState('authorized');
      } else {
        setState('unauthorized');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (state === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (state === 'unauthorized') {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedAdminRoute;
