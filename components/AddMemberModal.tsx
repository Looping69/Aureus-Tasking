
import React, { useState } from 'react';
import { X, Loader2, Sparkles, UserPlus, Clock } from 'lucide-react';
import { resolveLocationToTimezone } from '../services/geminiService';
import { isAIAvailable } from '../services/geminiService';
import { TeamMember } from '../types';

interface AddMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (member: TeamMember) => void;
}

// Build timezone list from the browser's Intl API (sorted alphabetically)
const TIMEZONES: string[] = (() => {
    const intlWithExtras = Intl as typeof Intl & { supportedValuesOf?: (key: string) => string[] };
    if (typeof intlWithExtras.supportedValuesOf === 'function') {
        try {
            return intlWithExtras.supportedValuesOf('timeZone').sort();
        } catch {
            // fall through to the static list below
        }
    }
    // Fallback for environments that don't support supportedValuesOf
    return [
        'Africa/Cairo', 'Africa/Johannesburg', 'Africa/Lagos', 'America/Chicago',
        'America/Denver', 'America/Los_Angeles', 'America/New_York', 'America/Sao_Paulo',
        'America/Toronto', 'Asia/Calcutta', 'Asia/Dubai', 'Asia/Hong_Kong',
        'Asia/Jakarta', 'Asia/Jerusalem', 'Asia/Karachi', 'Asia/Kolkata',
        'Asia/Seoul', 'Asia/Shanghai', 'Asia/Singapore', 'Asia/Tokyo',
        'Australia/Melbourne', 'Australia/Sydney', 'Europe/Amsterdam',
        'Europe/Berlin', 'Europe/Istanbul', 'Europe/London', 'Europe/Madrid',
        'Europe/Moscow', 'Europe/Paris', 'Europe/Rome', 'Pacific/Auckland',
        'Pacific/Honolulu', 'UTC'
    ];
})();

export const AddMemberModal: React.FC<AddMemberModalProps> = ({ isOpen, onClose, onAdd }) => {
    const [name, setName] = useState('');
    const [role, setRole] = useState('');
    const [locationQuery, setLocationQuery] = useState('');
    const [workStart, setWorkStart] = useState(9);
    const [workEnd, setWorkEnd] = useState(17);
    
    // Manual timezone state (used when no AI key available)
    const [manualTimezone, setManualTimezone] = useState(
        Intl.DateTimeFormat().resolvedOptions().timeZone
    );

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const aiAvailable = isAIAvailable();

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            let location: string;
            let timezone: string;
            let lat: number | undefined;
            let lng: number | undefined;

            if (aiAvailable) {
                const locationData = await resolveLocationToTimezone(locationQuery);
                location = `${locationData.city}, ${locationData.country}`;
                timezone = locationData.timezone;
                lat = locationData.lat;
                lng = locationData.lng;
            } else {
                location = locationQuery;
                timezone = manualTimezone;
            }

            const newMember: TeamMember = {
                id: Date.now().toString(),
                name,
                role,
                location,
                timezone,
                avatarUrl: `https://picsum.photos/seed/${Date.now()}/200/200`,
                workStartHour: Number(workStart),
                workEndHour: Number(workEnd),
                lat,
                lng,
                tasks: []
            };

            onAdd(newMember);
            onClose();
            // Reset form
            setName('');
            setRole('');
            setLocationQuery('');
            setWorkStart(9);
            setWorkEnd(17);
            setManualTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
        } catch (err: any) {
            setError(err.message || "Failed to resolve location");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-zinc-900 border border-amber-900/40 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-5 sm:p-6 border-b border-amber-900/30 flex justify-between items-center">
                    <h2 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-amber-500" />
                        Add Team Member
                    </h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-amber-400 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Full Name</label>
                        <input 
                            type="text" 
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-colors"
                            placeholder="e.g. Jane Doe"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Role</label>
                        <input 
                            type="text" 
                            required
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-colors"
                            placeholder="e.g. Senior Engineer"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1 flex justify-between">
                            Location
                            {aiAvailable && (
                                <span className="text-xs text-amber-500 flex items-center gap-1"><Sparkles className="w-3 h-3"/> AI Auto-detect</span>
                            )}
                        </label>
                        <input 
                            type="text" 
                            required
                            value={locationQuery}
                            onChange={(e) => setLocationQuery(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
                            placeholder="e.g. Berlin, Germany"
                        />
                        {aiAvailable && (
                            <p className="text-xs text-slate-500 mt-1">AI will automatically detect the timezone.</p>
                        )}
                    </div>

                    {!aiAvailable && (
                        <div>
                            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Timezone</label>
                            <select
                                required
                                value={manualTimezone}
                                onChange={(e) => setManualTimezone(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
                            >
                                {TIMEZONES.map(tz => (
                                    <option key={tz} value={tz}>{tz}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1 flex items-center gap-1">
                                <Clock className="w-3 h-3"/> Start Hour (0-23)
                            </label>
                            <input 
                                type="number" 
                                min="0" 
                                max="23"
                                required
                                value={workStart}
                                onChange={(e) => setWorkStart(Math.min(23, Math.max(0, parseInt(e.target.value) || 0)))}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-slate-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-colors text-center font-mono"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                                <Clock className="w-3 h-3"/> End Hour (0-23)
                            </label>
                            <input 
                                type="number" 
                                min="0" 
                                max="23"
                                required
                                value={workEnd}
                                onChange={(e) => setWorkEnd(Math.min(23, Math.max(0, parseInt(e.target.value) || 0)))}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors text-center font-mono"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-950/20 border border-red-900/40 rounded-lg text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="pt-4">
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full bg-amber-600 hover:bg-amber-500 text-black font-bold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    {aiAvailable ? 'Detecting & Adding...' : 'Adding...'}
                                </>
                            ) : (
                                'Add Member'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
