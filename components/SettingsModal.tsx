import React from 'react';
import { X, Download, Upload, Save } from 'lucide-react';
import { TeamMember, Meeting } from '../types';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    members: TeamMember[];
    meetings: Meeting[];
    onImport: (data: { members: TeamMember[], meetings: Meeting[] }) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, members, meetings, onImport }) => {
    if (!isOpen) return null;

    const handleExport = () => {
        const data = {
            members,
            meetings,
            timestamp: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `zappymeet-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target?.result as string);
                if (data.members && Array.isArray(data.members)) {
                    onImport({
                        members: data.members,
                        meetings: data.meetings || []
                    });
                    alert('Data imported successfully!');
                    onClose();
                } else {
                    alert('Invalid backup file format.');
                }
            } catch (err) {
                alert('Failed to parse JSON file.');
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-zinc-900 border border-amber-900/40 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-5 sm:p-6 border-b border-amber-900/30 flex justify-between items-center">
                    <h2 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
                        Data Settings
                    </h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-amber-400 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="p-5 sm:p-6 space-y-5 sm:space-y-6">
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-slate-200">Export Data</h3>
                        <p className="text-xs text-slate-500">Save your team configuration, tasks, and meeting notes to a JSON file.</p>
                        <button 
                            onClick={handleExport}
                            className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-slate-300 py-2.5 rounded-lg transition-colors text-sm font-medium border border-zinc-700"
                        >
                            <Download className="w-4 h-4" />
                            Export Backup
                        </button>
                    </div>

                    <div className="w-full h-px bg-amber-900/30"></div>

                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-slate-200">Import Data</h3>
                        <p className="text-xs text-slate-500">Restore from a previously exported backup file. This will overwrite current data.</p>
                        <label className="w-full flex items-center justify-center gap-2 bg-amber-950/20 hover:bg-amber-950/40 text-amber-500 py-2.5 rounded-lg transition-colors text-sm font-medium border border-dashed border-amber-800/50 cursor-pointer">
                            <Upload className="w-4 h-4" />
                            Select Backup File
                            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
};