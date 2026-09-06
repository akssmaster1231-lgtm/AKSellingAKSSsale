import React, { useState } from 'react';
import { X, Ruler, Check } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({ isOpen, onClose }) => {
  const [unit, setUnit] = useState<'inches' | 'cm'>('inches');

  if (!isOpen) return null;

  const sizeData = unit === 'inches' ? [
    { size: 'S', chest: '38"', length: '27.5"', shoulder: '18.5"', sleeve: '8.5"' },
    { size: 'M', chest: '40"', length: '28.5"', shoulder: '19.5"', sleeve: '9.0"' },
    { size: 'L', chest: '42"', length: '29.5"', shoulder: '20.5"', sleeve: '9.5"' },
    { size: 'XL', chest: '44"', length: '30.5"', shoulder: '21.5"', sleeve: '10.0"' },
    { size: 'XXL', chest: '46"', length: '31.5"', shoulder: '22.5"', sleeve: '10.5"' },
    { size: '3XL', chest: '48"', length: '32.5"', shoulder: '23.5"', sleeve: '11.0"' },
  ] : [
    { size: 'S', chest: '96 cm', length: '70 cm', shoulder: '47 cm', sleeve: '22 cm' },
    { size: 'M', chest: '102 cm', length: '72 cm', shoulder: '49 cm', sleeve: '23 cm' },
    { size: 'L', chest: '107 cm', length: '75 cm', shoulder: '52 cm', sleeve: '24 cm' },
    { size: 'XL', chest: '112 cm', length: '77 cm', shoulder: '55 cm', sleeve: '25 cm' },
    { size: 'XXL', chest: '117 cm', length: '80 cm', shoulder: '57 cm', sleeve: '27 cm' },
    { size: '3XL', chest: '122 cm', length: '83 cm', shoulder: '60 cm', sleeve: '28 cm' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Ruler className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-slate-900 text-base">AK Oversized T-Shirt Size Guide</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Unit Toggle */}
        <div className="flex items-center justify-between my-4">
          <span className="text-xs text-slate-500 font-medium">Measurements for relaxed streetwear drop-shoulder fit:</span>
          <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-bold">
            <button
              onClick={() => setUnit('inches')}
              className={`px-3 py-1 rounded-md transition-all ${
                unit === 'inches' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500'
              }`}
            >
              Inches
            </button>
            <button
              onClick={() => setUnit('cm')}
              className={`px-3 py-1 rounded-md transition-all ${
                unit === 'cm' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500'
              }`}
            >
              CM
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl mb-4">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-2.5">Size</th>
                <th className="p-2.5">Chest</th>
                <th className="p-2.5">Length</th>
                <th className="p-2.5">Shoulder</th>
                <th className="p-2.5">Sleeve</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {sizeData.map((row) => (
                <tr key={row.size} className="hover:bg-slate-50/80">
                  <td className="p-2.5 font-bold font-sans text-slate-900">{row.size}</td>
                  <td className="p-2.5 text-slate-600">{row.chest}</td>
                  <td className="p-2.5 text-slate-600">{row.length}</td>
                  <td className="p-2.5 text-slate-600">{row.shoulder}</td>
                  <td className="p-2.5 text-slate-600">{row.sleeve}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-amber-50 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2">
          <Check className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p>
            <strong>Pro Tip:</strong> If you want standard regular fit, choose your normal size. For authentic baggy streetwear drape, go 1 size up!
          </p>
        </div>
      </div>
    </div>
  );
};
