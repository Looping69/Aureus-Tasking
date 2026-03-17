import React from 'react';
import { TeamMember } from '../types';
import { CheckCircle2, ListTodo, TrendingUp, Trophy, Award, Medal, Target, Clock, Activity } from 'lucide-react';

interface DashboardProps {
    members: TeamMember[];
}

export const Dashboard: React.FC<DashboardProps> = ({ members }) => {
    // Calculate Global Stats
    let totalTasks = 0;
    let completedTasks = 0;
    
    members.forEach(m => {
        const mTasks = m.tasks || [];
        totalTasks += mTasks.length;
        completedTasks += mTasks.filter(t => t.completed).length;
    });

    const pendingTasks = totalTasks - completedTasks;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Sort members for leaderboard (Most completed tasks)
    const sortedByCompletion = [...members].sort((a, b) => {
        const aDone = (a.tasks || []).filter(t => t.completed).length;
        const bDone = (b.tasks || []).filter(t => t.completed).length;
        return bDone - aDone;
    });

    const getMedal = (index: number) => {
        if (index === 0) return <Trophy className="w-5 h-5 text-yellow-500" />;
        if (index === 1) return <Medal className="w-5 h-5 text-slate-400" />;
        if (index === 2) return <Award className="w-5 h-5 text-amber-700" />;
        return <span className="text-sm font-bold text-slate-400 w-5 text-center">{index + 1}</span>;
    };

    // Calculate Heatmap Data (0-23h)
    const heatmapData = Array.from({ length: 24 }, (_, hour) => {
        const activeCount = members.filter(m => {
            // Simple availability logic simulation for stats (ignoring complex overrides for simplicity of aggregate chart)
            // Convert hour to member's local time
            // For stats, we just want a rough estimate. Let's use the member's timezone offset vs UTC
            // To do this accurately without a heavy library, we simulate a date at that UTC hour
            const dateAtHour = new Date();
            dateAtHour.setUTCHours(hour, 0, 0, 0);
            
            const localDateStr = dateAtHour.toLocaleString("en-US", { timeZone: m.timezone });
            const localDate = new Date(localDateStr);
            const localHour = localDate.getHours();

            if (m.workStartHour < m.workEndHour) {
                return localHour >= m.workStartHour && localHour < m.workEndHour;
            } else {
                return localHour >= m.workStartHour || localHour < m.workEndHour;
            }
        }).length;
        return { hour, count: activeCount };
    });

    const maxAvailability = Math.max(...heatmapData.map(d => d.count), 1);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold text-amber-400">Aureus Tasking</h2>
            
            {/* Key Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-zinc-900 p-6 rounded-2xl border border-amber-900/40 shadow-sm flex items-center gap-4">
                    <div className="p-3 rounded-full bg-amber-950/40 text-amber-500">
                        <ListTodo className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Tasks</p>
                        <h3 className="text-3xl font-bold text-white">{totalTasks}</h3>
                    </div>
                </div>

                <div className="bg-zinc-900 p-6 rounded-2xl border border-amber-900/40 shadow-sm flex items-center gap-4">
                    <div className="p-3 rounded-full bg-emerald-900/30 text-emerald-400">
                        <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Completed</p>
                        <h3 className="text-3xl font-bold text-white">{completedTasks}</h3>
                    </div>
                </div>

                <div className="bg-zinc-900 p-6 rounded-2xl border border-amber-900/40 shadow-sm flex items-center gap-4">
                    <div className="p-3 rounded-full bg-amber-950/40 text-amber-500">
                        <TrendingUp className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Completion Rate</p>
                        <h3 className="text-3xl font-bold text-white">{completionRate}%</h3>
                    </div>
                </div>
            </div>

            {/* Heatmap Section */}
            <div className="bg-zinc-900 rounded-2xl border border-amber-900/40 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-lg text-slate-200 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-amber-500" />
                        24h Team Availability Heatmap (UTC)
                    </h3>
                </div>
                <div className="h-32 sm:h-40 flex items-end gap-0.5 sm:gap-1">
                    {heatmapData.map((d) => {
                        const heightPercent = (d.count / maxAvailability) * 100;
                        const isHigh = d.count === maxAvailability;
                        return (
                            <div key={d.hour} className="flex-1 flex flex-col items-center gap-2 group relative">
                                <div 
                                    className={`w-full rounded-t-sm transition-all duration-500 ${isHigh ? 'bg-amber-500' : 'bg-amber-900/40'} hover:bg-amber-400`}
                                    style={{ height: `${Math.max(heightPercent, 5)}%` }}
                                >
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10">
                                        {d.count} Available @ {d.hour}:00 UTC
                                    </div>
                                </div>
                                <span className="text-[9px] sm:text-[10px] text-slate-500 font-mono hidden sm:block">
                                    {d.hour}
                                </span>
                            </div>
                        );
                    })}
                </div>
                <div className="flex justify-between text-xs text-slate-500 border-t border-amber-900/30 pt-2 mt-1">
                    <span>00:00 UTC</span>
                    <span>12:00 UTC</span>
                    <span>23:00 UTC</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Task Distribution Column */}
                <div className="lg:col-span-2 bg-zinc-900 rounded-2xl border border-amber-900/40 shadow-sm overflow-hidden">
                    <div className="p-4 sm:p-6 border-b border-amber-900/30 flex justify-between items-center">
                        <h3 className="font-bold text-base sm:text-lg text-slate-200 flex items-center gap-2">
                            <Target className="w-5 h-5 text-amber-500" />
                            Team Workload
                        </h3>
                        <span className="text-xs text-amber-600 bg-amber-950/40 px-2 py-1 rounded-full border border-amber-900/40">
                            {pendingTasks} Pending
                        </span>
                    </div>
                    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                        {members.map(member => {
                            const mTasks = member.tasks || [];
                            const mTotal = mTasks.length;
                            const mDone = mTasks.filter(t => t.completed).length;
                            const percent = mTotal > 0 ? (mDone / mTotal) * 100 : 0;

                            return (
                                <div key={member.id}>
                                    <div className="flex justify-between items-end mb-2">
                                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                            <img src={member.avatarUrl} alt="" className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-amber-900/40 shrink-0" />
                                            <div className="min-w-0">
                                                <h4 className="text-sm font-semibold text-slate-300 truncate">{member.name}</h4>
                                                <p className="text-[10px] text-slate-500 truncate">{member.role}</p>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0 ml-2">
                                            <span className="text-sm font-bold text-amber-400">{mDone}</span>
                                            <span className="text-xs text-slate-500 mx-1">/</span>
                                            <span className="text-xs text-slate-500">{mTotal}</span>
                                        </div>
                                    </div>
                                    <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-amber-500 transition-all duration-700 rounded-full" 
                                            style={{ width: `${percent}%` }} 
                                            title={`${mDone} Completed`}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                        {members.length === 0 && (
                            <p className="text-center text-slate-500 py-8">No team members yet.</p>
                        )}
                    </div>
                </div>

                {/* Leaderboard Column */}
                <div className="bg-zinc-900 rounded-2xl border border-amber-900/40 shadow-sm overflow-hidden">
                    <div className="p-4 sm:p-6 border-b border-amber-900/30 bg-gradient-to-br from-amber-950/40 to-zinc-900">
                        <h3 className="font-bold text-base sm:text-lg text-amber-400 flex items-center gap-2">
                            <Trophy className="w-5 h-5" />
                            Top Performers
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">Based on completed tasks</p>
                    </div>
                    <div className="p-0">
                        {sortedByCompletion.map((member, index) => {
                             const mDone = (member.tasks || []).filter(t => t.completed).length;
                             return (
                                <div key={member.id} className="flex items-center gap-3 p-3 sm:p-4 border-b border-amber-900/20 last:border-0 hover:bg-zinc-800/50 transition-colors">
                                    <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 bg-zinc-800 rounded-full shrink-0">
                                        {getMedal(index)}
                                    </div>
                                    <img src={member.avatarUrl} alt="" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border border-amber-900/40 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-semibold text-slate-200 truncate">{member.name}</h4>
                                        <p className="text-xs text-slate-500 truncate">{member.role}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <div className="text-lg font-bold text-amber-400">{mDone}</div>
                                        <div className="text-[10px] text-slate-500 uppercase">Done</div>
                                    </div>
                                </div>
                             );
                        })}
                         {members.length === 0 && (
                            <p className="text-center text-slate-500 py-8">No data available.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};