import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../widgets/Navbar";
import ChatWidget from "../widgets/ChatWidget";
import PrescriptionScanner from "../features/PrescriptionScanner";
import { medicineApi } from "../entities/medicineApi";

export default function PrescriptionsPage() {
  const navigate = useNavigate();
  const [toast, setToast] = useState("");

  async function handleConfirmMedicines(entries) {
    for (const entry of entries) {
      await medicineApi.create({
        name: entry.name,
        dosage: entry.dosage || "",
        frequency: entry.frequency || "Once daily",
        times: ["08:00"],
        startDate: new Date().toISOString().slice(0, 10),
        endDate: null,
        notes: "Added from prescription scan",
      });
    }
    setToast(`${entries.length} medicine${entries.length > 1 ? "s" : ""} added. Set reminder times on the dashboard.`);
    setTimeout(() => setToast(""), 5000);
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl mb-1">Prescription reader</h1>
          <p className="text-muted">
            Scan a prescription with AI, or type your medicines in yourself — either way, they'll show up on your{" "}
            <button onClick={() => navigate("/dashboard")} className="text-teal-600 underline">
              dashboard
            </button>
            .
          </p>
        </div>

        {toast && (
          <div className="mb-6 rounded-xl bg-success/10 text-success px-4 py-3 text-sm font-medium animate-fadeUp">
            {toast}
          </div>
        )}

        <PrescriptionScanner onConfirmMedicines={handleConfirmMedicines} />
      </main>
      <ChatWidget />
    </div>
  );
}
