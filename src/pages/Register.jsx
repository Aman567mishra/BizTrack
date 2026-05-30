import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Input } from '../components/ui/FormFields';
import Button from '../components/ui/Button';

export default function Register() {
  const { register, error } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(email, password, name);
      navigate('/dashboard');
    } catch {
      /* handled in store */
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border-light bg-card-light p-8 shadow-lg dark:border-border-dark dark:bg-card-dark">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Create account</h2>
      <p className="mt-1 text-sm text-slate-500">Start managing your business projects</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <Input
          label="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20">
            {error.replace('Firebase: ', '').replace(/\(auth\/.*\)\.?/, '').trim()}
          </p>
        )}
        <Button type="submit" className="w-full" loading={loading}>
          Create Account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-brand-600 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
