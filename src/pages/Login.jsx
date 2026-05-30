import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Input } from '../components/ui/FormFields';
import Button from '../components/ui/Button';

export default function Login() {
  const { login, error } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch {
      /* error in store */
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border-light bg-card-light p-8 shadow-lg dark:border-border-dark dark:bg-card-dark">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome back</h2>
      <p className="mt-1 text-sm text-slate-500">Sign in to your BizTrack account</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20">
            {error.replace('Firebase: ', '').replace(/\(auth\/.*\)\.?/, '').trim()}
          </p>
        )}
        <Button type="submit" className="w-full" loading={loading}>
          Sign In
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="font-medium text-brand-600 hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}
