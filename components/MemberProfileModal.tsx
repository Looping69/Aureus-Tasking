
import React, { useState, useRef } from 'react';
import { X, MapPin, Clock, Briefcase, Mail, Github, Linkedin, Edit2, Save, Plus, Tag, Trash2, Camera } from 'lucide-react';
import { TeamMember } from '../types';
import * as d3 from 'd3';

interface MemberProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    member: TeamMember;
    onUpdate: (id: string, updates: Partial<TeamMember>) => void;
    onDelete: (id: string) => void;
}

export const MemberProfileModal: React.FC<MemberProfileModalProps> = ({ isOpen, onClose, member, onUpdate, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    
    // Edit State
    const [bio, setBio] = useState(member.bio || '');
    const [skills, setSkills] = useState<string[]>(member.skills || []);
    const [newSkill, setNewSkill] = useState('');
    const [email, setEmail] = useState(member.email || '');
    const [github, setGithub] = useState(member.githubHandle || '');
    const [linkedin, setLinkedin] = useState(member.linkedinHandle || '');
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const [showConfirmDelete, setShowConfirmDelete] = useState(false);

    const handleSave = () => {
        onUpdate(member.id, {
            bio,
            skills,
            email,
            githubHandle: github,
            linkedinHandle: linkedin,
            ...(avatarPreview ? { avatarUrl: avatarPreview } : {})
        });
        setIsEditing(false);
        setAvatarPreview(null);
    };
    
    const handleDelete = () => {
        setShowConfirmDelete(true);
    };

    const confirmDelete = () => {
        onDelete(member.id);
        onClose();
    };

    const cancelDelete = () => {
        setShowConfirmDelete(false);
    };

    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) return;
        if (file.size > 5 * 1024 * 1024) {
            alert('Image must be smaller than 5 MB.');
            return;
        }
        const reader = new FileReader();
        reader.onload = (ev) => {
            const result = ev.target?.result;
            if (typeof result === 'string') {
                setAvatarPreview(result);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleAddSkill = (e: React.FormEvent) => {
        e.preventDefault();
        if (newSkill.trim() && !skills.includes(newSkill.trim())) {
            setSkills([...skills, newSkill.trim()]);
            setNewSkill('');
        }
    };

    const removeSkill = (skillToRemove: string) => {
        setSkills(skills.filter(s => s !== skillToRemove));
    };

    // Calculate local time
    let localTime = "";
    try {
        localTime = new Date().toLocaleString("en-US", { timeZone: member.timezone, hour: 'numeric', minute: '2-digit' });
    } catch (e) { localTime = "Unknown"; }

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
            <div className="bg-zinc-900 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 border border-amber-900/40 flex flex-col max-h-[95vh] sm:max-h-[90vh]">
                
                {/* Cover & Header */}
                <div className="relative h-24 sm:h-32 bg-gradient-to-r from-amber-700 to-yellow-500 shrink-0">
                    <button onClick={onClose} className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full backdrop-blur-sm transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="px-4 sm:px-8 pb-4 sm:pb-8 flex-1 overflow-y-auto">
                    <div className="relative z-10 flex flex-wrap justify-between items-end -mt-10 sm:-mt-12 mb-4 sm:mb-6 gap-2">
                        {/* Avatar with optional upload overlay */}
                        <div className="relative shrink-0">
                            <img 
                                src={avatarPreview || member.avatarUrl} 
                                alt={member.name}
                                className="w-20 h-20 sm:w-32 sm:h-32 rounded-full border-4 border-zinc-900 shadow-lg object-cover bg-zinc-800" 
                            />
                            {isEditing && (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                                        title="Upload photo"
                                    >
                                        <Camera className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                                    </button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleAvatarUpload}
                                    />
                                </>
                            )}
                        </div>
                        {!isEditing ? (
                            <button 
                                onClick={() => setIsEditing(true)}
                                className="mb-2 flex items-center gap-2 px-3 sm:px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-full text-sm font-medium text-slate-300 transition-colors border border-zinc-700"
                            >
                                <Edit2 className="w-4 h-4" /> Edit Profile
                            </button>
                        ) : (
                            <div className="flex gap-2 mb-2">
                                <button 
                                    onClick={() => { setIsEditing(false); setAvatarPreview(null); }}
                                    className="px-3 sm:px-4 py-2 text-slate-500 hover:text-slate-300 text-sm"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleSave}
                                    className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-amber-600 hover:bg-amber-500 text-black rounded-full text-sm font-bold shadow-lg shadow-amber-500/20"
                                >
                                    <Save className="w-4 h-4" /> Save
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                        {/* Left Col: Info */}
                        <div className="space-y-4 sm:space-y-6">
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold text-slate-100 leading-tight">{member.name}</h1>
                                <p className="text-slate-500 font-medium flex items-center gap-1 mt-1 text-sm">
                                    <Briefcase className="w-4 h-4" /> {member.role}
                                </p>
                            </div>

                            <div className="space-y-3 pt-3 sm:pt-4 border-t border-amber-900/20">
                                <div className="flex items-center gap-3 text-slate-400">
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-zinc-800 flex items-center justify-center text-amber-600/60 shrink-0">
                                        <MapPin className="w-4 h-4" />
                                    </div>
                                    <div className="text-sm min-w-0">
                                        <div className="font-medium text-slate-300 truncate">{member.location}</div>
                                        <div className="text-xs text-slate-500 truncate">{member.timezone}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-slate-400">
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-zinc-800 flex items-center justify-center text-amber-600/60 shrink-0">
                                        <Clock className="w-4 h-4" />
                                    </div>
                                    <div className="text-sm">
                                        <div className="font-medium text-slate-300">{localTime}</div>
                                        <div className="text-xs text-slate-500">Local Time</div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 pt-3 sm:pt-4 border-t border-amber-900/20">
                                <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Connect</h3>
                                
                                {isEditing ? (
                                    <div className="space-y-2">
                                        <input 
                                            type="text" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
                                            className="w-full text-sm p-2 rounded bg-zinc-800 border border-zinc-700 text-slate-300 placeholder-slate-500 outline-none focus:ring-1 focus:ring-amber-500"
                                        />
                                        <input 
                                            type="text" placeholder="GitHub Username" value={github} onChange={e => setGithub(e.target.value)}
                                            className="w-full text-sm p-2 rounded bg-zinc-800 border border-zinc-700 text-slate-300 placeholder-slate-500 outline-none focus:ring-1 focus:ring-amber-500"
                                        />
                                        <input 
                                            type="text" placeholder="LinkedIn Username" value={linkedin} onChange={e => setLinkedin(e.target.value)}
                                            className="w-full text-sm p-2 rounded bg-zinc-800 border border-zinc-700 text-slate-300 placeholder-slate-500 outline-none focus:ring-1 focus:ring-amber-500"
                                        />
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {member.email && (
                                            <a href={`mailto:${member.email}`} className="flex items-center gap-2 text-sm text-slate-400 hover:text-amber-400 transition-colors">
                                                <Mail className="w-4 h-4 shrink-0" /> <span className="truncate">{member.email}</span>
                                            </a>
                                        )}
                                        {member.githubHandle && (
                                            <a href={`https://github.com/${member.githubHandle}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-slate-400 hover:text-amber-400 transition-colors">
                                                <Github className="w-4 h-4 shrink-0" /> {member.githubHandle}
                                            </a>
                                        )}
                                        {member.linkedinHandle && (
                                            <a href={`https://linkedin.com/in/${member.linkedinHandle}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-slate-400 hover:text-amber-400 transition-colors">
                                                <Linkedin className="w-4 h-4 shrink-0" /> {member.linkedinHandle}
                                            </a>
                                        )}
                                        {!member.email && !member.githubHandle && !member.linkedinHandle && (
                                            <p className="text-sm text-slate-500 italic">No contact info added.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                            
                            
                        </div>

                        {/* Right Col: Bio & Skills */}
                        <div className="md:col-span-2 space-y-6 sm:space-y-8">
                            <div>
                                <h3 className="text-base sm:text-lg font-bold text-slate-200 mb-3">About</h3>
                                {isEditing ? (
                                    <textarea 
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        placeholder="Write a short bio..."
                                        className="w-full h-28 sm:h-32 p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-amber-500 outline-none resize-none"
                                    />
                                ) : (
                                    <p className="text-slate-400 leading-relaxed text-sm sm:text-base">
                                        {member.bio || "No biography yet."}
                                    </p>
                                )}
                            </div>

                            <div>
                                <h3 className="text-base sm:text-lg font-bold text-slate-200 mb-3 flex items-center gap-2">
                                    <Tag className="w-5 h-5 text-amber-500" /> Skills
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {(isEditing ? skills : member.skills || []).map(skill => (
                                        <span key={skill} className="px-3 py-1 rounded-full bg-amber-950/30 text-amber-500 text-sm font-medium border border-amber-800/40 flex items-center gap-1">
                                            {skill}
                                            {isEditing && (
                                                <button onClick={() => removeSkill(skill)} className="hover:text-red-400">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            )}
                                        </span>
                                    ))}
                                    {isEditing && (
                                        <form onSubmit={handleAddSkill} className="flex items-center">
                                            <input 
                                                type="text" 
                                                value={newSkill}
                                                onChange={(e) => setNewSkill(e.target.value)}
                                                placeholder="Add skill..."
                                                className="px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-sm text-slate-300 placeholder-slate-500 w-28 sm:w-32 focus:w-40 sm:focus:w-48 transition-all outline-none"
                                            />
                                            <button type="submit" className="ml-1 p-1 text-amber-500 hover:bg-amber-950/30 rounded-full">
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </form>
                                    )}
                                    {(!member.skills || member.skills.length === 0) && !isEditing && (
                                        <span className="text-slate-500 italic text-sm">No skills listed.</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Always visible delete button in footer */}
                <div className="px-4 sm:px-8 py-3 sm:py-4 border-t border-amber-900/20 flex justify-end">
                    {showConfirmDelete ? (
                        <div className="flex items-center gap-2 flex-wrap justify-end">
                            <span className="text-sm text-slate-400 mr-2">Are you sure?</span>
                            <button 
                                onClick={cancelDelete}
                                className="px-3 sm:px-4 py-2 text-slate-500 hover:bg-zinc-800 rounded-lg transition-colors text-sm font-medium"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={confirmDelete}
                                className="px-3 sm:px-4 py-2 bg-red-900/50 hover:bg-red-900/70 text-red-400 rounded-lg transition-colors text-sm font-medium border border-red-800/40"
                            >
                                Delete
                            </button>
                        </div>
                    ) : (
                        <button 
                            onClick={handleDelete}
                            className="flex items-center gap-2 px-3 sm:px-4 py-2 text-red-500 hover:bg-red-950/20 rounded-lg transition-colors text-sm font-medium"
                        >
                            <Trash2 className="w-4 h-4" /> Delete Member
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
