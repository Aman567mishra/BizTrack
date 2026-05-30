import { useState } from 'react';
import { Input, Select, Textarea } from '../ui/FormFields';
import Button from '../ui/Button';
import { PROJECT_STATUSES, WORK_TYPES } from '../../utils/constants';

const empty = {
  projectName: '',
  customerName: '',
  workType: 'Electrical',
  dealAmount: '',
  initialReceived: '',
  initialPaymentDate: new Date().toISOString().slice(0, 10),
  initialPaymentNotes: 'Advance Payment',
  status: 'Open',
  startDate: '',
  completionDate: '',
  notes: '',
};

export default function ProjectForm({ initial, onSubmit, onCancel, loading, isEdit }) {
  const [form, setForm] = useState({ ...empty, ...initial });

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Project Name *"
          name="projectName"
          value={form.projectName}
          onChange={handleChange}
          required
        />
        <Input
          label="Customer Name *"
          name="customerName"
          value={form.customerName}
          onChange={handleChange}
          required
        />
        <Select label="Work Type" name="workType" value={form.workType} onChange={handleChange}>
          {WORK_TYPES.map((w) => (
            <option key={w} value={w}>
              {w}
            </option>
          ))}
        </Select>
        <Input
          label="Deal Amount *"
          name="dealAmount"
          type="number"
          min="0"
          step="0.01"
          value={form.dealAmount}
          onChange={handleChange}
          required
        />
        {!isEdit && (
          <>
            <Input
              label="Received Amount (Initial Advance)"
              name="initialReceived"
              type="number"
              min="0"
              step="0.01"
              value={form.initialReceived}
              onChange={handleChange}
            />
            <Input
              label="Advance Payment Date"
              name="initialPaymentDate"
              type="date"
              value={form.initialPaymentDate}
              onChange={handleChange}
            />
            <Input
              label="Advance Notes"
              name="initialPaymentNotes"
              value={form.initialPaymentNotes}
              onChange={handleChange}
              className="sm:col-span-2"
            />
          </>
        )}
        <Select label="Status" name="status" value={form.status} onChange={handleChange}>
          {PROJECT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
        <Input
          label="Start Date"
          name="startDate"
          type="date"
          value={form.startDate}
          onChange={handleChange}
        />
        <Input
          label="Completion Date"
          name="completionDate"
          type="date"
          value={form.completionDate}
          onChange={handleChange}
        />
      </div>
      <Textarea label="Notes" name="notes" value={form.notes} onChange={handleChange} />
      <div className="flex justify-end gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={loading}>
          {isEdit ? 'Update Project' : 'Create Project'}
        </Button>
      </div>
    </form>
  );
}
