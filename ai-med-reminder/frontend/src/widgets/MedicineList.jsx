import React from "react";
import { Trash2, Pencil, Pill } from "lucide-react";
import Card from "../shared/ui/Card";
import { formatTime12h } from "../shared/lib/date";

export default function MedicineList({ medicines, onEdit, onDelete }) {
  if (!medicines || medicines.length === 0) {
    return (
      <Card>
        <h3 className="text-lg mb-1">No medicines yet</h3>
        <p className="text-muted text-sm">
          Use "Add medicine" or scan a prescription to build your medicine cabinet.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {medicines.map((m) => (
        <Card key={m.id} className="flex flex-col gap-3 animate-fadeUp">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-clay-500/10 text-clay-600 flex items-center justify-center">
                <Pill size={18} />
              </div>
              <div>
                <p className="font-medium text-ink">{m.name}</p>
                <p className="text-xs text-muted">{m.dosage || "Dosage not set"}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onEdit(m)}
                className="w-8 h-8 rounded-full hover:bg-teal-50 text-teal-600 flex items-center justify-center transition-colors"
                title="Edit"
              >
                <Pencil size={15} />
              </button>
              <button
                onClick={() => onDelete(m.id)}
                className="w-8 h-8 rounded-full hover:bg-clay-500/10 text-clay-600 flex items-center justify-center transition-colors"
                title="Delete"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {m.times.map((t) => (
              <span key={t} className="text-xs bg-teal-50 text-teal-700 px-2.5 py-1 rounded-full">
                {formatTime12h(t)}
              </span>
            ))}
          </div>

          <p className="text-xs text-muted">{m.frequency}</p>
          {m.notes && <p className="text-xs text-muted italic">"{m.notes}"</p>}
        </Card>
      ))}
    </div>
  );
}
