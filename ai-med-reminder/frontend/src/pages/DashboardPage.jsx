import React, { useCallback, useEffect, useState } from "react";
import { Plus, TrendingUp } from "lucide-react";
import Navbar from "../widgets/Navbar";
import TodaySchedule from "../widgets/TodaySchedule";
import MedicineList from "../widgets/MedicineList";
import ChatWidget from "../widgets/ChatWidget";
import AddMedicineModal from "../features/AddMedicineModal";
import Card from "../shared/ui/Card";
import Button from "../shared/ui/Button";
import { medicineApi } from "../entities/medicineApi";
import { todayLabel } from "../shared/lib/date";
import { useReminderNotifications } from "../shared/lib/useReminderNotifications";
import { useAuth } from "../app/providers/AuthProvider";

export default function DashboardPage() {
  const { user } = useAuth();
  const [medicines, setMedicines] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [adherence, setAdherence] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const loadAll = useCallback(async () => {
    const [meds, sched, stats] = await Promise.all([
      medicineApi.list(),
      medicineApi.todaySchedule(),
      medicineApi.adherence(),
    ]);
    setMedicines(meds);
    setSchedule(sched);
    setAdherence(stats);
  }, []);

  useEffect(() => {
    setLoading(true);
    loadAll().finally(() => setLoading(false));
  }, [loadAll]);

  // Refresh the schedule every 30s so "due now" states stay current.
  useEffect(() => {
    const interval = setInterval(() => {
      medicineApi.todaySchedule().then(setSchedule);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useReminderNotifications(schedule);

  async function handleLog(medicineId, time, status) {
    await medicineApi.logDose(medicineId, time, status);
    const [sched, stats] = await Promise.all([medicineApi.todaySchedule(), medicineApi.adherence()]);
    setSchedule(sched);
    setAdherence(stats);
  }

  async function handleSaveMedicine(payload) {
    if (editing) {
      await medicineApi.update(editing.id, payload);
    } else {
      await medicineApi.create(payload);
    }
    setEditing(null);
    await loadAll();
  }

  async function handleDelete(id) {
    if (!window.confirm("Remove this medicine and its reminders?")) return;
    await medicineApi.remove(id);
    await loadAll();
  }

  function openAddModal() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEditModal(medicine) {
    setEditing(medicine);
    setModalOpen(true);
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-sm text-teal-600 font-medium mb-1">{todayLabel()}</p>
            <h1 className="text-3xl">Hello, {user?.name?.split(" ")[0]} 👋</h1>
          </div>
          <Button onClick={openAddModal}>
            <Plus size={16} /> Add medicine
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <TodaySchedule schedule={schedule} onLog={handleLog} loading={loading} />
          </div>

          <Card className="flex flex-col justify-between">
            <div>
              <h3 className="text-lg mb-1 flex items-center gap-2">
                <TrendingUp size={18} className="text-teal-600" /> 7-day adherence
              </h3>
              <p className="text-sm text-muted mb-4">How consistently you've taken your medicines this week.</p>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-display text-teal-700">
                {adherence ? `${adherence.adherencePercent}%` : "—"}
              </span>
              {adherence && (
                <span className="text-sm text-muted mb-1.5">
                  {adherence.takenCount}/{adherence.totalCount} doses taken
                </span>
              )}
            </div>
          </Card>
        </div>

        <h2 className="text-xl mb-4">Your medicines</h2>
        <MedicineList medicines={medicines} onEdit={openEditModal} onDelete={handleDelete} />
      </main>

      <AddMedicineModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveMedicine}
        initialData={editing}
      />
      <ChatWidget />
    </div>
  );
}
