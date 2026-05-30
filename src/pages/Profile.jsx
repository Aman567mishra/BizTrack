import { useState, useEffect } from 'react';
import { updateProfile } from 'firebase/auth';
import { auth } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';
import { updateUserProfile } from '../services/userService';
import { Input } from '../components/ui/FormFields';
import Button from '../components/ui/Button';

export default function Profile() {
  const { user, profile, refreshProfile } = useAuth();
  const [form, setForm] = useState({
    displayName: profile?.displayName || user?.displayName || '',
    businessName: profile?.businessName || '',
    phone: profile?.phone || '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setForm({
      displayName: profile?.displayName || user?.displayName || '',
      businessName: profile?.businessName || '',
      phone: profile?.phone || '',
    });
  }, [profile, user]);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      if (auth.currentUser && form.displayName) {
        await updateProfile(auth.currentUser, { displayName: form.displayName });
      }
      await updateUserProfile(user.uid, form);
      await refreshProfile();
      setMessage('Profile updated successfully.');
    } catch (err) {
      setMessage(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Profile</h1>
        <p className="text-slate-500">Manage your account and business details</p>
      </div>

      <div className="rounded-2xl border border-border-light bg-card-light p-6 dark:border-border-dark dark:bg-card-dark">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-2xl font-bold text-white">
            {(form.displayName || user?.email || 'U')[0].toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">
              {form.displayName || 'User'}
            </p>
            <p className="text-sm text-slate-500">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Display Name"
            name="displayName"
            value={form.displayName}
            onChange={handleChange}
          />
          <Input
            label="Business Name"
            name="businessName"
            value={form.businessName}
            onChange={handleChange}
            placeholder="Your business or trade name"
          />
          <Input
            label="Phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="+91 ..."
          />
          <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
            <p className="text-xs font-medium uppercase text-slate-500">Account Summary</p>
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
              <span>Projects: {profile?.totalProjects ?? 0}</span>
              <span>Profit: ₹{profile?.totalProfit ?? 0}</span>
            </div>
          </div>
          {message && (
            <p
              className={`text-sm ${message.includes('success') ? 'text-emerald-600' : 'text-red-500'}`}
            >
              {message}
            </p>
          )}
          <Button type="submit" loading={loading}>
            Save Changes
          </Button>
        </form>
      </div>
    </div>
  );
}
