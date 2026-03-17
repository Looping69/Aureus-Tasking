import React from 'react';
import { X, Star, Clock, ArrowRight } from 'lucide-react';
import { TeamMember } from '../types';

interface OverlapFinderModalProps {
    isOpen: boolean;
    onClose: () => void;
    members: TeamMember[];
    onSelectTime: (date: Date) => void;
}

export const OverlapFinderModal: React.FC<OverlapFinderModalProps> = ({ isOpen, onClose, members, onSelectTime }) => {
    if (!isOpen) return null;

    // Logic to find best slots
    const findBestSlots = () => {
        const scores: { hour: number, count: number, isUnhealthy: boolean }[] = [];

        // Check every hour 0-23
        for (let i = 0; i < 24; i++) {
            let workingCount = 0;
            let unhealthyCount = 0;

            members.forEach(m => {
                // Check status at UTC hour 'i'
                const dateAtHour = new Date();
                dateAtHour.setUTCHours(i, 0, 0, 0);
                
                const localDateStr = dateAtHour.toLocaleString("en-US", { timeZone: m.timezone });
                const localDate = new Date(localDateStr);
                const localHour = localDate.getHours();

                // Check if working
                let isWorking = false;
                if (m.workStartHour < m.workEndHour) {
                    isWorking = localHour >= m.workStartHour && localHour < m.workEndHour;
                } else {
                    isWorking = localHour >= m.workStartHour || localHour < m.workEndHour;
                }

                // Check if unhealthy (late night)
                const isUnhealthy = localHour < 6 || localHour >= 22;

                if (isWorking) workingCount++;
                if (isUnhealthy && isWorking) unhealthyCount++;
            });

            scores.push({ hour: i, count: workingCount, isUnhealthy: unhealthyCount > 0 });
        }

        // Sort by count desc, then by isUnhealthy asc
        return scores.sort((a, b) => {
            if (b.count !== a.count) return b.count - a.count;
            return (a.isUnhealthy ? 1 : 0) - (b.isUnhealthy ? 1 : 0);
        }).slice(0, 3); // Top 3
    };

    const bestSlots = findBestSlots();

    const handleApply = (utcHour: number) => {
        const now = new Date();
        now.setUTCHours(utcHour, 0, 0, 0);
        onSelectTime(now);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-zinc-900 border border-amber-900/40 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-5 sm:p-6 border-b border-amber-900/30 flex justify-between items-center">
                    <h2 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
                        <Star className="w-5 h-5 text-amber-500" />
                        Best Meeting Times
                    </h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-amber-400 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="p-5 sm:p-6 space-y-4">
                    <p className="text-sm text-slate-500">
                        Based on everyone's working hours, here are the best times to meet (UTC).
                    </p>

                    <div className="space-y-3">
                        {bestSlots.map((slot, idx) => (
                            <button 
                                key={slot.hour} 
                                onClick={() => handleApply(slot.hour)}
                                className="w-full flex items-center justify-between p-4 rounded-xl border border-amber-900/30 bg-zinc-800/50 hover:bg-zinc-800 hover:border-amber-700/50 transition-all group"
                            >
                                <div className="flex items-center gap-3 sm:gap-4">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${idx === 0 ? 'bg-amber-500 text-black' : 'bg-zinc-700 text-slate-400'}`}>
                                        {idx + 1}
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold text-slate-200 flex items-center gap-2 flex-wrap">
                                            {slot.hour}:00 UTC
                                            {slot.isUnhealthy && <span className="text-[10px] px-1.5 py-0.5 bg-red-950/50 text-red-400 rounded-full border border-red-900/40">Late for some</span>}
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            {slot.count} / {members.length} members available
                                        </div>
                                    </div>
                                </div>
                                <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-amber-500 transition-colors shrink-0" />
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};