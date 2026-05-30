import { useState } from 'react';
import { Input, Textarea } from '../ui/FormFields';
import Button from '../ui/Button';

export default function SplitForm({ initial, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    person: initial?.person ?? '',
    amount: initial?.amount ?? '',
    date: initial?.date || new Date().toISOString().slice(0, 10),
    notes: initial?.notes ?? '',
  });

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
      className="space-y-4"
    >
      <Input
        label="Person Name *"
        name="person"
        value={form.person}
        onChange={handleChange}
        required
      />
      <Input
        label="Amount *"
        name="amount"
        type="number"
        min="0"
        step="0.01"
        value={form.amount}
        onChange={handleChange}
        required
      />
      <Input
        label="Date *"
        name="date"
        type="date"
        value={form.date}
        onChange={handleChange}
        required
      />
      <Textarea label="Notes" name="notes" value={form.notes} onChange={handleChange} />
      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={loading}>
          {initial ? 'Update Split' : 'Add Split'}
        </Button>
      </div>
    </form>
  );
}
