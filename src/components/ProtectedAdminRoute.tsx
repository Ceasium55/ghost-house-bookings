import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { isAnyAdmin, canAccessActivity, type AdminActivity } from '@/lib/adminAuth';
import { Loader2 } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  activity?: AdminActivity;
}

const ProtectedAdminRoute = ({ children, activity }: Props) => {
  const [state, setState] = useState<'loading' | 'authorized' | 'unauthorized'>('loading');

  useEffect(() => {
    let cancelled = false;

    const check = async (email: string | undefined) => {
      const allowed = activity
        ? await canAccessActivity(email, activity)
        : await isAnyAdmin(email);
      if (!cancelled) setState(allowed ? 'authorized' : 'unauthorized');
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      check(session?.user?.email);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      check(session?.user?.email);
    });

    return () => { cancelled = true; subscription.unsubscribe(); };
  }, [activity]);

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
