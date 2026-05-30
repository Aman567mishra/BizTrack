import { useState } from 'react';
import { Input } from '../ui/FormFields';
import Button from '../ui/Button';

export default function ExpenseForm({ initial, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    item: initial?.item ?? '',
    reason: initial?.reason ?? '',
    cost: initial?.cost ?? '',
    date: initial?.date || new Date().toISOString().slice(0, 10),
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
        label="Item Name *"
        name="item"
        value={form.item}
        onChange={handleChange}
        required
      />
      <Input
        label="Reason *"
        name="reason"
        value={form.reason}
        onChange={handleChange}
        placeholder="e.g. Electrical Wiring"
        required
      />
      <Input
        label="Cost *"
        name="cost"
        type="number"
        min="0"
        step="0.01"
        value={form.cost}
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
      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={loading}>
          {initial ? 'Update Expense' : 'Add Expense'}
        </Button>
      </div>
    </form>
  );
}
