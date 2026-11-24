import React, { useEffect, useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import Input from "../shared/ui/Input";
import Button from "../shared/ui/Button";

const FREQUENCY_OPTIONS = ["Once daily", "Twice daily", "Three times daily", "Four times daily", "As needed"];

const emptyForm = {
  name: "",
  dosage: "",
  frequency: "Once daily",
  times: ["08:00"],
  startDate: new Date().toISOString().slice(0, 10),
  endDate: "",
  notes: "",
};

export default function AddMedicineModal({ open, onClose, onSave, initialData }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        dosage: initialData.dosage || "",
        frequency: initialData.frequency || "Once daily",
        times: initialData.times?.length ? initialData.times : ["08:00"],
        startDate: initialData.startDate || new Date().toISOString().slice(0, 10),
        endDate: initialData.endDate || "",
        notes: initialData.notes || "",
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
  }, [initialData, open]);

  if (!open) return null;

  function updateTime(index, value) {
    const next = [...form.times];
    next[index] = value;
    setForm({ ...form, times: next });
  }

  function addTimeSlot() {
    setForm({ ...form, times: [...form.times, "08:00"] });
  }

  function removeTimeSlot(index) {
    setForm({ ...form, times: form.times.filter((_, i) => i !== index) });
  }

  function validate() {
    const next = {};
    if (!form.name.trim()) next.name = "Please enter the medicine name.";
    if (!form.times.length) next.times = "Add at least one reminder time.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await onSave({ ...form, endDate: form.endDate || null });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-xl2 shadow-soft w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 animate-fadeUp">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl">{initialData ? "Edit medicine" : "Add a medicine"}</h3>
          <button onClick={onClose} aria-label="Close" className="text-muted hover:text-ink">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <Input
            label="Medicine name"
            placeholder="e.g. Metformin"
            value={form.name}
            error={errors.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <Input
            label="Dosage"
            placeholder="e.g. 500mg"
            value={form.dosage}
            onChange={(e) => setForm({ ...form, dosage: e.target.value })}
          />

          <div className="mb-4">
            <label className="label-text">Frequency</label>
            <select
              className="input-field"
              value={form.frequency}
              onChange={(e) => setForm({ ...form, frequency: e.target.value })}
            >
              {FREQUENCY_OPTIONS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="label-text">Reminder times</label>
            <div className="flex flex-col gap-2">
              {form.times.map((t, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="time"
                    value={t}
                    onChange={(e) => updateTime(i, e.target.value)}
                    className="input-field"
                  />
                  {form.times.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTimeSlot(i)}
                      className="w-9 h-9 shrink-0 rounded-full hover:bg-clay-500/10 text-clay-600 flex items-center justify-center"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {errors.times && <p className="text-clay-600 text-sm mt-1">{errors.times}</p>}
            <button
              type="button"
              onClick={addTimeSlot}
              className="mt-2 text-sm text-teal-600 flex items-center gap-1 hover:text-teal-700"
            >
              <Plus size={14} /> Add another time
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start date"
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
            <Input
              label="End date (optional)"
              type="date"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            />
          </div>

          <div className="mb-2">
            <label className="label-text">Notes (optional)</label>
            <textarea
              rows={2}
              className="input-field"
              placeholder="e.g. Take with food"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 mt-5">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save medicine"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
