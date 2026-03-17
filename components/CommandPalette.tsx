import React, { useState, useEffect, useRef } from 'react';
import { Search, User, Moon, Sun, LogOut, Plus, Users, LayoutGrid, FileText } from 'lucide-react';
import { TeamMember } from '../types';

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
    members: TeamMember[];
    onSelectMember: (member: TeamMember) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, members, onSelectMember }) => {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    // Filter Items
    const memberItems = members.filter(m => m.name.toLowerCase().includes(query.toLowerCase())).map(m => ({
        type: 'member',
        id: m.id,
        label: m.name,
        subLabel: m.role,
        icon: <img src={m.avatarUrl} className="w-5 h-5 rounded-full" alt="" />,
        action: () => onSelectMember(m)
    }));

    const commandItems = [
        { type: 'command', id: 'add-member', label: 'Add New Member', icon: <Plus className="w-4 h-4" />, action: () => document.getElementById('add-member-trigger')?.click() },
        { type: 'command', id: 'toggle-theme', label: 'Toggle Theme', icon: <Sun className="w-4 h-4" />, action: () => document.documentElement.classList.toggle('dark') },
    ].filter(c => c.label.toLowerCase().includes(query.toLowerCase()));

    const allItems = [...memberItems, ...commandItems];

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
            setQuery('');
            setSelectedIndex(0);
        }
    }, [isOpen]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % allItems.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + allItems.length) % allItems.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const item = allItems[selectedIndex];
            if (item) {
                item.action();
                onClose();
            }
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[15vh] sm:pt-[20vh] px-4" onClick={onClose}>
            <div 
                className="w-full max-w-xl bg-zinc-900 rounded-xl shadow-2xl border border-amber-900/40 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center gap-3 px-4 py-4 border-b border-amber-900/30">
                    <Search className="w-5 h-5 text-amber-600/60 shrink-0" />
                    <input 
                        ref={inputRef}
                        type="text" 
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a command or search..."
                        className="flex-1 bg-transparent text-base sm:text-lg outline-none text-slate-200 placeholder-slate-500"
                    />
                    <div className="flex gap-1 shrink-0">
                        <kbd className="px-2 py-1 text-xs font-semibold text-amber-600 bg-zinc-800 rounded border border-zinc-700">ESC</kbd>
                    </div>
                </div>
                
                <div className="max-h-[300px] overflow-y-auto p-2">
                    {allItems.length === 0 ? (
                        <div className="p-4 text-center text-slate-500 text-sm">No results found.</div>
                    ) : (
                        <div className="space-y-1">
                            {memberItems.length > 0 && <div className="px-2 py-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">Members</div>}
                            {memberItems.map((item, idx) => (
                                <button
                                    key={item.id}
                                    onClick={() => { item.action(); onClose(); }}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${idx === selectedIndex ? 'bg-amber-600 text-black' : 'hover:bg-zinc-800 text-slate-300'}`}
                                    onMouseEnter={() => setSelectedIndex(idx)}
                                >
                                    {item.icon}
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium truncate">{item.label}</div>
                                        <div className={`text-xs truncate ${idx === selectedIndex ? 'text-black/70' : 'text-slate-500'}`}>{item.subLabel}</div>
                                    </div>
                                    {idx === selectedIndex && <span className="text-xs opacity-70 shrink-0">Jump to</span>}
                                </button>
                            ))}
                            
                            {commandItems.length > 0 && <div className="px-2 py-1 mt-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Commands</div>}
                            {commandItems.map((item, idx) => {
                                const realIdx = idx + memberItems.length;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => { item.action(); onClose(); }}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${realIdx === selectedIndex ? 'bg-amber-600 text-black' : 'hover:bg-zinc-800 text-slate-300'}`}
                                        onMouseEnter={() => setSelectedIndex(realIdx)}
                                    >
                                        <div className={`w-5 h-5 flex items-center justify-center rounded shrink-0 ${realIdx === selectedIndex ? 'text-black' : 'text-amber-600'}`}>{item.icon}</div>
                                        <div className="flex-1 text-sm font-medium">{item.label}</div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
                
                <div className="px-4 py-2 bg-black/40 border-t border-amber-900/30 flex justify-between items-center text-xs text-slate-500">
                    <div>
                        <span className="font-semibold text-amber-600/70">ProTip:</span> Use arrow keys to navigate
                    </div>
                    <div className="text-amber-800">Aureus Tasking</div>                </div>
            </div>
        </div>
    );
};