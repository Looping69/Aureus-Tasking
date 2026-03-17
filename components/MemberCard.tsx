
import React, { useState } from 'react';
import { TeamMember, Task } from '../types';
import * as d3 from 'd3';
import { Briefcase, MapPin, CheckCircle2, Clock, AlertTriangle, Zap, Settings, ListTodo, Check, Trash2, Plus, ChevronDown, Calendar, User as UserIcon, X, CheckCheck } from 'lucide-react';

interface MemberCardProps {
    member: TeamMember;
    referenceTime: Date;
    onUpdate: (updates: Partial<TeamMember>) => void;
    onViewProfile: () => void;
    onDelete: () => void;
}

export const MemberCard: React.FC<MemberCardProps> = ({ member, referenceTime, onUpdate, onViewProfile, onDelete }) => {
    // Task state
    const [showTasks, setShowTasks] = useState(false);
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [newTaskText, setNewTaskText] = useState('');
    const [newTaskDate, setNewTaskDate] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState<Task['priority']>('Medium');
    const [newTaskTags, setNewTaskTags] = useState('');
    const [newTaskProject, setNewTaskProject] = useState('');
    const [newTaskTimeSpent, setNewTaskTimeSpent] = useState('');
    
    // Task Editing State
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
    const [editingTaskText, setEditingTaskText] = useState('');
    const [editingTaskDate, setEditingTaskDate] = useState('');
    const [editingTaskPriority, setEditingTaskPriority] = useState<Task['priority']>('Medium');
    const [editingTaskTags, setEditingTaskTags] = useState('');
    const [editingTaskProject, setEditingTaskProject] = useState('');
    const [editingTaskTimeSpent, setEditingTaskTimeSpent] = useState('');

    const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());
    const [now, setNow] = useState(Date.now());

    // Update 'now' every minute to refresh tracking display
    React.useEffect(() => {
        if (member.isTracking) {
            const interval = setInterval(() => setNow(Date.now()), 60000);
            return () => clearInterval(interval);
        }
    }, [member.isTracking]);

    // Calculate local time
    const utcTimestamp = referenceTime.getTime();
    let localDate: Date;
    try {
        const localDateString = new Date(utcTimestamp).toLocaleString("en-US", { timeZone: member.timezone });
        localDate = new Date(localDateString);
    } catch (e) {
        localDate = new Date(utcTimestamp);
    }

    const hours = localDate.getHours();
    
    // Working State Logic
    const isScheduleWorking = member.workStartHour < member.workEndHour 
        ? (hours >= member.workStartHour && hours < member.workEndHour)
        : (hours >= member.workStartHour || hours < member.workEndHour);

    const isWorking = member.statusOverride 
        ? member.statusOverride === 'online'
        : isScheduleWorking;

    const isUnhealthyTime = hours < 6 || hours >= 22;
    const isBurnoutRisk = isWorking && isUnhealthyTime;

    // Visual Styles
    const getStatusColor = () => {
        if (member.statusOverride === 'offline') return "bg-slate-300 dark:bg-slate-700";
        if (isBurnoutRisk) return "bg-red-500";
        if (isWorking) return "bg-emerald-500";
        return "bg-slate-300 dark:bg-slate-700";
    };

    const pendingTasksCount = member.tasks?.filter(t => !t.completed).length || 0;
    const completedTasksCount = member.tasks?.filter(t => t.completed).length || 0;
    const displayTasks = [...(member.tasks || [])].sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        return b.id.localeCompare(a.id);
    });

    // Handlers
    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskText.trim()) return;
        const newTask: Task = {
            id: Date.now().toString(),
            text: newTaskText,
            completed: false,
            dueDate: newTaskDate || undefined,
            priority: newTaskPriority,
            tags: newTaskTags.split(',').map(t => t.trim()).filter(Boolean),
            project: newTaskProject || undefined,
            timeSpent: newTaskTimeSpent ? parseInt(newTaskTimeSpent) : undefined
        };
        onUpdate({ tasks: [...(member.tasks || []), newTask] });
        setNewTaskText('');
        setNewTaskDate('');
        setNewTaskPriority('Medium');
        setNewTaskTags('');
        setNewTaskProject('');
        setNewTaskTimeSpent('');
        setIsAddingTask(false);
    };

    const handleSaveTaskEdit = () => {
        if (!editingTaskId) return;
        const updatedTasks = (member.tasks || []).map(t => 
            t.id === editingTaskId ? { 
                ...t, 
                text: editingTaskText, 
                dueDate: editingTaskDate || undefined,
                priority: editingTaskPriority,
                tags: editingTaskTags.split(',').map(t => t.trim()).filter(Boolean),
                project: editingTaskProject || undefined,
                timeSpent: editingTaskTimeSpent ? parseInt(editingTaskTimeSpent) : undefined
            } : t
        );
        onUpdate({ tasks: updatedTasks });
        setEditingTaskId(null);
    };

    const handleToggleTask = (taskId: string) => {
        const updatedTasks = (member.tasks || []).map(t => 
            t.id === taskId ? { ...t, completed: !t.completed } : t
        );
        onUpdate({ tasks: updatedTasks });
    };

    const handleDeleteTask = (taskId: string) => {
        onUpdate({ tasks: (member.tasks || []).filter(t => t.id !== taskId) });
    };

    const toggleTaskSelection = (taskId: string) => {
        const newSelection = new Set(selectedTaskIds);
        if (newSelection.has(taskId)) {
            newSelection.delete(taskId);
        } else {
            newSelection.add(taskId);
        }
        setSelectedTaskIds(newSelection);
    };

    const handleBulkComplete = () => {
        const updatedTasks = (member.tasks || []).map(t => 
            selectedTaskIds.has(t.id) ? { ...t, completed: true } : t
        );
        onUpdate({ tasks: updatedTasks });
        setSelectedTaskIds(new Set());
    };

    const handleBulkDelete = () => {
        onUpdate({ tasks: (member.tasks || []).filter(t => !selectedTaskIds.has(t.id)) });
        setSelectedTaskIds(new Set());
    };

    const handleClearCompleted = () => {
        onUpdate({ tasks: (member.tasks || []).filter(t => !t.completed) });
    };

    const cycleStatus = () => {
        if (!member.statusOverride) onUpdate({ statusOverride: 'online' });
        else if (member.statusOverride === 'online') onUpdate({ statusOverride: 'offline' });
        else onUpdate({ statusOverride: undefined });
    };

    const isOverdue = (dateStr?: string) => {
        if (!dateStr) return false;
        return new Date(dateStr) < new Date(new Date().setHours(0,0,0,0));
    };

    return (
        <div className={`relative flex flex-col bg-zinc-900 rounded-2xl border border-amber-900/40 shadow-md hover:shadow-amber-900/20 hover:shadow-lg transition-all duration-300 overflow-hidden group
            ${isBurnoutRisk ? 'ring-2 ring-red-500/50' : ''}
        `}>
             {/* Status Indicator Bar */}
             <div className={`h-1.5 w-full ${isWorking ? (isBurnoutRisk ? 'bg-red-500' : 'bg-emerald-500') : 'bg-zinc-800'}`}></div>

            <div className="p-4 sm:p-6 flex flex-col gap-4 sm:gap-6">
                {/* Header: Avatar & Basic Info */}
                <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-3 cursor-pointer min-w-0" onClick={onViewProfile}>
                        <div className="relative shrink-0">
                            <img src={member.avatarUrl} alt={member.name} className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-amber-900/40" />
                            <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-2 border-zinc-900 ${getStatusColor()}`}></div>
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-bold text-base sm:text-lg text-slate-100 leading-tight group-hover:text-amber-400 transition-colors truncate">{member.name}</h3>
                            <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-1.5 mt-0.5"><Briefcase className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">{member.role}</span></p>
                        </div>
                    </div>
                    
                    {/* Time Display */}
                    <div className="text-right shrink-0">
                        <div className={`text-2xl sm:text-4xl font-bold font-mono tracking-tight ${isWorking ? 'text-amber-400' : 'text-slate-600'}`}>
                            {d3.timeFormat("%H:%M")(localDate)}
                        </div>
                        <div className="text-[10px] sm:text-xs text-slate-500 uppercase font-semibold tracking-wider mt-1">
                            {member.timezone.split('/')[1]?.replace(/_/g, ' ') || 'Local'}
                        </div>
                    </div>
                </div>

                {/* Status & Actions Bar */}
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-amber-900/20">
                    <div className="flex items-center gap-2 flex-wrap">
                         <button 
                            onClick={(e) => { e.stopPropagation(); cycleStatus(); }}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all flex items-center gap-1.5
                                ${!member.statusOverride ? 'bg-zinc-800 text-slate-400 border-zinc-700' : 
                                member.statusOverride === 'online' ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800/50' :
                                'bg-zinc-800 text-slate-400 border-zinc-700'
                                }`}
                        >
                             {isWorking ? (isBurnoutRisk ? <AlertTriangle className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5" />) : <Clock className="w-3.5 h-3.5" />}
                             {isWorking ? (isBurnoutRisk ? 'Overwork' : 'Working') : 'Off'}
                        </button>
                        <button
                            onClick={(e) => { 
                                e.stopPropagation(); 
                                if (member.isTracking) {
                                    const endTime = Date.now();
                                    const duration = Math.floor((endTime - (member.trackingStartTime || endTime)) / 60000);
                                    const newLog = { startTime: member.trackingStartTime || endTime, endTime, duration };
                                    onUpdate({
                                        isTracking: false,
                                        trackingStartTime: undefined,
                                        timeLogs: [...(member.timeLogs || []), newLog]
                                    });
                                } else {
                                    onUpdate({ isTracking: true, trackingStartTime: Date.now() });
                                }
                            }}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all flex items-center gap-1.5
                                ${member.isTracking ? 'bg-red-900/30 text-red-400 border-red-800/50' : 'bg-zinc-800 text-slate-400 border-zinc-700'}
                            `}
                        >
                            <Clock className="w-3.5 h-3.5" />
                            {member.isTracking ? 'Stop' : 'Start'}
                        </button>
                        {member.isTracking && member.trackingStartTime && (
                            <span className="text-xs font-mono text-amber-600">
                                {Math.floor((now - member.trackingStartTime) / 60000)}m
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button onClick={onViewProfile} className="p-1.5 text-slate-500 hover:text-amber-400 transition-colors rounded-lg hover:bg-zinc-800" title="View Profile">
                            <UserIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                        <button onClick={() => setShowTasks(!showTasks)} className={`p-1.5 transition-colors rounded-lg hover:bg-zinc-800 ${showTasks ? 'text-amber-400 bg-amber-950/30' : 'text-slate-500 hover:text-amber-400'}`} title="Tasks">
                            <ListTodo className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Task Section */}
            {(showTasks || pendingTasksCount > 0) && (
                <div className={`border-t border-amber-900/20 bg-zinc-950/50 transition-all duration-300 ${showTasks ? 'max-h-[600px]' : 'max-h-[50px] overflow-hidden'}`}>
                    <div 
                        className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between cursor-pointer hover:bg-zinc-800/40 transition-colors"
                        onClick={() => setShowTasks(!showTasks)}
                    >
                         <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-semibold text-slate-400 uppercase tracking-wide">
                            <ListTodo className="w-4 h-4 sm:w-5 sm:h-5" />
                            Tasks 
                            <span className={`px-2 py-0.5 rounded-full text-xs ${pendingTasksCount > 0 ? 'bg-amber-950/50 text-amber-500 border border-amber-800/40' : 'bg-zinc-800 text-slate-500'}`}>
                                {pendingTasksCount}
                            </span>
                        </div>
                        <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 text-slate-500 transition-transform ${showTasks ? 'rotate-180' : ''}`} />
                    </div>

                     <div className="px-4 sm:px-6 pb-4 sm:pb-6 overflow-y-auto max-h-[300px] space-y-2 sm:space-y-3">
                         {isAddingTask && (
                             <form onSubmit={handleAddTask} className="mb-2 p-3 bg-zinc-900 rounded-lg border border-amber-800/40 shadow-sm">
                                 <input 
                                     autoFocus
                                     className="w-full text-sm bg-transparent outline-none text-slate-200 placeholder-slate-500 mb-2"
                                     placeholder="Task description..."
                                     value={newTaskText}
                                     onChange={e => setNewTaskText(e.target.value)}
                                 />
                                 <div className="flex flex-col gap-2">
                                     <div className="flex items-center gap-1 border border-zinc-700 rounded p-1.5">
                                         <Calendar className="w-3 h-3 text-amber-600/60" />
                                         <input type="date" className="text-xs bg-transparent text-slate-400 outline-none flex-1" value={newTaskDate} onChange={e => setNewTaskDate(e.target.value)} />
                                     </div>
                                     <select className="text-xs bg-zinc-800 border border-zinc-700 rounded p-1.5 text-slate-300" value={newTaskPriority} onChange={e => setNewTaskPriority(e.target.value as Task['priority'])}>
                                         <option value="Low">Low</option>
                                         <option value="Medium">Medium</option>
                                         <option value="High">High</option>
                                     </select>
                                     <input className="text-xs bg-zinc-800 border border-zinc-700 rounded p-1.5 text-slate-300 placeholder-slate-500" placeholder="Tags (comma separated)" value={newTaskTags} onChange={e => setNewTaskTags(e.target.value)} />
                                     <input className="text-xs bg-zinc-800 border border-zinc-700 rounded p-1.5 text-slate-300 placeholder-slate-500" placeholder="Project" value={newTaskProject} onChange={e => setNewTaskProject(e.target.value)} />
                                     <input type="number" className="text-xs bg-zinc-800 border border-zinc-700 rounded p-1.5 text-slate-300 placeholder-slate-500" placeholder="Time Spent (mins)" value={newTaskTimeSpent} onChange={e => setNewTaskTimeSpent(e.target.value)} />
                                     <button type="submit" className="px-3 py-1.5 bg-amber-600 text-black text-xs font-bold rounded hover:bg-amber-500 transition-colors">Add</button>
                                 </div>
                             </form>
                         )}

                         {selectedTaskIds.size > 0 && (
                             <div className="flex items-center gap-2 p-2 bg-zinc-800 rounded mb-2 text-xs flex-wrap">
                                 <span className="text-slate-400">{selectedTaskIds.size} selected</span>
                                 <button onClick={handleBulkComplete} className="px-2 py-1 bg-zinc-700 text-slate-200 rounded hover:bg-zinc-600">Complete</button>
                                 <button onClick={handleBulkDelete} className="px-2 py-1 bg-red-950/50 text-red-400 rounded hover:bg-red-900/40">Delete</button>
                             </div>
                         )}

                         {displayTasks.map(task => (
                             <div key={task.id} className="group/task flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg hover:bg-zinc-900 transition-colors border border-transparent hover:border-amber-900/30">
                                 {editingTaskId === task.id ? (
                                       <div className="flex-1 space-y-2">
                                         <input className="w-full text-sm p-2 border rounded bg-zinc-800 border-zinc-700 text-slate-200" value={editingTaskText} onChange={e => setEditingTaskText(e.target.value)} />
                                         <div className="flex flex-col gap-2">
                                             <div className="flex items-center gap-2 border border-zinc-700 rounded p-2">
                                                 <Calendar className="w-4 h-4 text-amber-600/60" />
                                                 <input type="date" className="text-sm bg-transparent outline-none text-slate-300 flex-1" value={editingTaskDate} onChange={e => setEditingTaskDate(e.target.value)} />
                                             </div>
                                             <select className="text-sm bg-zinc-800 border border-zinc-700 rounded p-2 text-slate-300" value={editingTaskPriority} onChange={e => setEditingTaskPriority(e.target.value as Task['priority'])}>
                                                 <option value="Low">Low</option>
                                                 <option value="Medium">Medium</option>
                                                 <option value="High">High</option>
                                             </select>
                                             <input className="text-sm bg-zinc-800 border border-zinc-700 rounded p-2 text-slate-300 placeholder-slate-500" placeholder="Tags (comma separated)" value={editingTaskTags} onChange={e => setEditingTaskTags(e.target.value)} />
                                             <input className="text-sm bg-zinc-800 border border-zinc-700 rounded p-2 text-slate-300 placeholder-slate-500" placeholder="Project" value={editingTaskProject} onChange={e => setEditingTaskProject(e.target.value)} />
                                             <input type="number" className="text-sm bg-zinc-800 border border-zinc-700 rounded p-2 text-slate-300 placeholder-slate-500" placeholder="Time Spent (mins)" value={editingTaskTimeSpent} onChange={e => setEditingTaskTimeSpent(e.target.value)} />
                                             <button onClick={handleSaveTaskEdit} className="p-2 bg-emerald-900/30 text-emerald-400 rounded-lg hover:bg-emerald-900/50"><Check className="w-4 h-4"/></button>
                                         </div>
                                      </div>
                                 ) : (
                                     <>
                                        <input type="checkbox" checked={selectedTaskIds.has(task.id)} onChange={() => toggleTaskSelection(task.id)} className="mt-1.5 w-4 h-4 rounded border-zinc-600 accent-amber-500" />
                                        <button onClick={() => handleToggleTask(task.id)} className={`mt-1 w-5 h-5 sm:w-6 sm:h-6 rounded border flex items-center justify-center transition-colors shrink-0 ${task.completed ? 'bg-amber-500 border-amber-500 text-black' : 'border-zinc-600 hover:border-amber-500'}`}>
                                            {task.completed && <Check className="w-3 h-3 sm:w-4 sm:h-4" />}
                                        </button>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start gap-1.5 flex-wrap">
                                                <p className={`text-sm leading-snug break-words ${task.completed ? 'text-slate-500 line-through' : 'text-slate-300'}`}>{task.text}</p>
                                                {task.priority && (
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ${task.priority === 'High' ? 'bg-red-950/50 text-red-400' : task.priority === 'Medium' ? 'bg-yellow-950/50 text-yellow-500' : 'bg-emerald-950/50 text-emerald-500'}`}>
                                                        {task.priority}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                                                {task.project && <span className="text-xs bg-zinc-800 text-slate-400 px-1.5 py-0.5 rounded-full">{task.project}</span>}
                                                {task.tags?.map(tag => <span key={tag} className="text-xs bg-amber-950/40 text-amber-600 px-1.5 py-0.5 rounded-full">#{tag}</span>)}
                                                {task.timeSpent && <span className="text-xs text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" /> {task.timeSpent}m</span>}
                                            </div>
                                            {task.dueDate && (
                                                <div className={`flex items-center gap-1 mt-1.5 text-xs ${isOverdue(task.dueDate) && !task.completed ? 'text-red-400 font-bold' : 'text-slate-500'}`}>
                                                    <Calendar className="w-3 h-3" /> {new Date(task.dueDate).toLocaleDateString()}
                                                </div>
                                            )}
                                        </div>
                                        <button onClick={() => { 
                                            setEditingTaskId(task.id); 
                                            setEditingTaskText(task.text); 
                                            setEditingTaskDate(task.dueDate || ''); 
                                            setEditingTaskPriority(task.priority || 'Medium');
                                        }} className="opacity-0 group-hover/task:opacity-100 p-1.5 text-slate-500 hover:text-amber-400 rounded-lg hover:bg-zinc-800 transition-all shrink-0"><Settings className="w-4 h-4"/></button>
                                        <button onClick={() => handleDeleteTask(task.id)} className="opacity-0 group-hover/task:opacity-100 p-1.5 text-slate-500 hover:text-red-500 rounded-lg hover:bg-zinc-800 transition-all shrink-0"><Trash2 className="w-4 h-4"/></button>
                                     </>
                                 )}
                             </div>
                         ))}

                         {!isAddingTask && (
                             <div className="pt-2 flex gap-2">
                                <button onClick={() => setIsAddingTask(true)} className="flex-1 py-1.5 flex items-center justify-center gap-1 text-xs font-medium text-amber-500 bg-amber-950/20 rounded hover:bg-amber-950/40 transition-colors border border-amber-900/30">
                                    <Plus className="w-3 h-3" /> Add Task
                                </button>
                                {completedTasksCount > 0 && (
                                    <button onClick={handleClearCompleted} className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-red-400 hover:bg-red-950/20 rounded transition-colors" title="Clear Completed">
                                        <CheckCheck className="w-3 h-3" />
                                    </button>
                                )}
                             </div>
                         )}
                     </div>
                </div>
            )}
        </div>
    );
};