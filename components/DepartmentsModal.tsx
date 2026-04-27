
import React, { useState } from 'react';
import { X, Plus, Trash2, Building2, Pencil, Check } from 'lucide-react';
import { Department } from '../types';

interface DepartmentsModalProps {
    isOpen: boolean;
    onClose: () => void;
    departments: Department[];
    onAdd: (department: Department) => void;
    onUpdate: (id: string, updates: Partial<Department>) => void;
    onDelete: (id: string) => void;
}

const PRESET_COLORS = [
    '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6',
    '#ef4444', '#f97316', '#14b8a6', '#ec4899',
];

export const DepartmentsModal: React.FC<DepartmentsModalProps> = ({
    isOpen,
    onClose,
    departments,
    onAdd,
    onUpdate,
    onDelete,
}) => {
    const [newName, setNewName] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editColor, setEditColor] = useState('');

    if (!isOpen) return null;

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) return;
        onAdd({
            id: crypto.randomUUID(),
            name: newName.trim(),
            description: newDescription.trim() || undefined,
            color: newColor,
        });
        setNewName('');
        setNewDescription('');
        setNewColor(PRESET_COLORS[0]);
    };

    const startEdit = (dept: Department) => {
        setEditingId(dept.id);
        setEditName(dept.name);
        setEditDescription(dept.description || '');
        setEditColor(dept.color || PRESET_COLORS[0]);
    };

    const commitEdit = (id: string) => {
        if (!editName.trim()) return;
        onUpdate(id, {
            name: editName.trim(),
            description: editDescription.trim() || undefined,
            color: editColor,
        });
        setEditingId(null);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-zinc-900 border border-amber-900/40 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="p-5 border-b border-amber-900/30 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-amber-500" />
                        Manage Departments
                    </h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-amber-400 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Department List */}
                <div className="max-h-72 overflow-y-auto divide-y divide-amber-900/20">
                    {departments.length === 0 && (
                        <p className="text-center text-slate-500 py-8 text-sm">No departments yet. Create one below.</p>
                    )}
                    {departments.map(dept => (
                        <div key={dept.id} className="flex items-center gap-3 px-5 py-3 hover:bg-zinc-800/50 transition-colors group">
                            {editingId === dept.id ? (
                                <>
                                    <div className="flex-1 flex flex-col gap-2">
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={e => setEditName(e.target.value)}
                                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                                        />
                                        <input
                                            type="text"
                                            value={editDescription}
                                            onChange={e => setEditDescription(e.target.value)}
                                            placeholder="Description (optional)"
                                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-slate-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                                        />
                                        <div className="flex gap-2 flex-wrap">
                                            {PRESET_COLORS.map(c => (
                                                <button
                                                    key={c}
                                                    type="button"
                                                    onClick={() => setEditColor(c)}
                                                    className={`w-6 h-6 rounded-full border-2 transition-transform ${editColor === c ? 'border-white scale-110' : 'border-transparent'}`}
                                                    style={{ backgroundColor: c }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => commitEdit(dept.id)}
                                        className="p-1.5 text-emerald-500 hover:text-emerald-400 transition-colors shrink-0"
                                        title="Save"
                                    >
                                        <Check className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setEditingId(null)}
                                        className="p-1.5 text-slate-500 hover:text-amber-400 transition-colors shrink-0"
                                        title="Cancel"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <span
                                        className="w-3 h-3 rounded-full shrink-0"
                                        style={{ backgroundColor: dept.color || '#f59e0b' }}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-200 truncate">{dept.name}</p>
                                        {dept.description && (
                                            <p className="text-xs text-slate-500 truncate">{dept.description}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => startEdit(dept)}
                                            className="p-1.5 text-slate-500 hover:text-amber-400 transition-colors"
                                            title="Edit"
                                        >
                                            <Pencil className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => onDelete(dept.id)}
                                            className="p-1.5 text-slate-500 hover:text-red-500 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>

                {/* Add New Department Form */}
                <div className="p-5 border-t border-amber-900/30 bg-zinc-900/80">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">New Department</p>
                    <form onSubmit={handleAdd} className="space-y-3">
                        <input
                            type="text"
                            required
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            placeholder="Department name (e.g. Engineering)"
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-colors"
                        />
                        <input
                            type="text"
                            value={newDescription}
                            onChange={e => setNewDescription(e.target.value)}
                            placeholder="Description (optional)"
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-slate-400 placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-colors"
                        />
                        <div className="flex gap-2 flex-wrap">
                            {PRESET_COLORS.map(c => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setNewColor(c)}
                                    className={`w-6 h-6 rounded-full border-2 transition-transform ${newColor === c ? 'border-white scale-110' : 'border-transparent'}`}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-amber-600 hover:bg-amber-500 text-black font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
                        >
                            <Plus className="w-4 h-4" />
                            Add Department
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
