import React, { useRef, useState } from "react";
import { UploadCloud, ScanLine, Check, Trash2, Pencil } from "lucide-react";
import Card from "../shared/ui/Card";
import Button from "../shared/ui/Button";
import Input from "../shared/ui/Input";
import { prescriptionApi } from "../entities/medicineApi";

const emptyManualEntry = { name: "", dosage: "", frequency: "" };

export default function PrescriptionScanner({ onConfirmMedicines }) {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState("");
  const [scanMessage, setScanMessage] = useState("");
  const [extracted, setExtracted] = useState([]);
  const [manualEntry, setManualEntry] = useState(emptyManualEntry);

  function handleFileSelect(e) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setExtracted([]);
    setScanError("");
    setScanMessage("");
  }

  async function handleScan() {
    if (!file) return;
    setScanning(true);
    setScanError("");
    try {
      const result = await prescriptionApi.scan(file);
      setExtracted(result.extracted.map((e) => ({ ...e, selected: true })));
      setScanMessage(result.message);
    } catch (err) {
      setScanError(err.response?.data?.message || "Couldn't scan this image. Please try again or add manually.");
    } finally {
      setScanning(false);
    }
  }

  function toggleExtracted(index) {
    setExtracted((prev) => prev.map((e, i) => (i === index ? { ...e, selected: !e.selected } : e)));
  }

  function removeExtracted(index) {
    setExtracted((prev) => prev.filter((_, i) => i !== index));
  }

  function updateExtractedField(index, field, value) {
    setExtracted((prev) => prev.map((e, i) => (i === index ? { ...e, [field]: value } : e)));
  }

  function handleAddSelected() {
    const selected = extracted.filter((e) => e.selected);
    if (selected.length === 0) return;
    onConfirmMedicines(selected);
    setExtracted((prev) => prev.filter((e) => !e.selected));
  }

  function handleManualAdd(e) {
    e.preventDefault();
    if (!manualEntry.name.trim()) return;
    onConfirmMedicines([manualEntry]);
    setManualEntry(emptyManualEntry);
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card>
        <h3 className="text-lg mb-1 flex items-center gap-2">
          <ScanLine size={18} className="text-teal-600" /> Scan a prescription
        </h3>
        <p className="text-sm text-muted mb-4">
          Upload a clear photo of your prescription. Our AI will try to read the medicine names, dosages and
          frequency — you always get to review before anything is saved.
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/webp"
          className="hidden"
          onChange={handleFileSelect}
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full border-2 border-dashed border-teal-200 rounded-xl2 py-10 flex flex-col items-center gap-2 text-teal-600 hover:bg-teal-50 transition-colors"
        >
          <UploadCloud size={28} />
          <span className="text-sm font-medium">{file ? file.name : "Click to choose a photo"}</span>
        </button>

        {preview && (
          <div className="mt-4">
            <img src={preview} alt="Prescription preview" className="rounded-xl border border-teal-100 max-h-64 w-full object-contain bg-paper" />
          </div>
        )}

        {scanError && <p className="text-clay-600 text-sm mt-3">{scanError}</p>}

        <Button className="mt-4 w-full" onClick={handleScan} disabled={!file || scanning}>
          {scanning ? "Reading prescription…" : "Scan with AI"}
        </Button>

        {scanMessage && !scanError && <p className="text-sm text-muted mt-3">{scanMessage}</p>}
      </Card>

      <div className="flex flex-col gap-6">
        {extracted.length > 0 && (
          <Card>
            <h3 className="text-lg mb-3">Review detected medicines</h3>
            <ul className="flex flex-col gap-3">
              {extracted.map((entry, i) => (
                <li key={i} className="border border-teal-50 rounded-xl p-3">
                  <div className="flex items-start justify-between gap-2">
                    <label className="flex items-start gap-2 flex-1">
                      <input
                        type="checkbox"
                        checked={entry.selected}
                        onChange={() => toggleExtracted(i)}
                        className="mt-1.5 accent-teal-500"
                      />
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <input
                          className="input-field py-1.5 text-sm col-span-2"
                          value={entry.name}
                          onChange={(e) => updateExtractedField(i, "name", e.target.value)}
                          placeholder="Medicine name"
                        />
                        <input
                          className="input-field py-1.5 text-sm"
                          value={entry.dosage}
                          onChange={(e) => updateExtractedField(i, "dosage", e.target.value)}
                          placeholder="Dosage"
                        />
                        <input
                          className="input-field py-1.5 text-sm"
                          value={entry.frequency}
                          onChange={(e) => updateExtractedField(i, "frequency", e.target.value)}
                          placeholder="Frequency"
                        />
                      </div>
                    </label>
                    <button
                      onClick={() => removeExtracted(i)}
                      className="w-8 h-8 shrink-0 rounded-full hover:bg-clay-500/10 text-clay-600 flex items-center justify-center"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <Button className="mt-4 w-full" onClick={handleAddSelected}>
              <Check size={16} /> Add selected to my medicines
            </Button>
          </Card>
        )}

        <Card>
          <h3 className="text-lg mb-1 flex items-center gap-2">
            <Pencil size={16} className="text-teal-600" /> Or add manually
          </h3>
          <p className="text-sm text-muted mb-4">Prefer to type it in yourself? That works too.</p>
          <form onSubmit={handleManualAdd} className="flex flex-col gap-3">
            <Input
              placeholder="Medicine name"
              value={manualEntry.name}
              onChange={(e) => setManualEntry({ ...manualEntry, name: e.target.value })}
            />
            <Input
              placeholder="Dosage (e.g. 500mg)"
              value={manualEntry.dosage}
              onChange={(e) => setManualEntry({ ...manualEntry, dosage: e.target.value })}
            />
            <Input
              placeholder="Frequency (e.g. Twice daily)"
              value={manualEntry.frequency}
              onChange={(e) => setManualEntry({ ...manualEntry, frequency: e.target.value })}
            />
            <Button type="submit" variant="secondary">
              Add to my medicines
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
