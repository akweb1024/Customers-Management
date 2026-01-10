'use client';

import { useState } from 'react';
import JobPostingManager from './JobPostingManager';
import ApplicantPipeline from './ApplicantPipeline';
import { Briefcase, Users, Layout, Search, Plus } from 'lucide-react';

export default function RecruitmentDashboard() {
    const [view, setView] = useState<'JOBS' | 'PIPELINE'>('JOBS');

    return (
        <div className="space-y-8 animate-in fade-in duration-500 h-[calc(100vh-140px)] flex flex-col">
            {/* Recruitment Header */}
            <div className="flex bg-white p-2 rounded-2xl shadow-sm border border-secondary-100 w-fit shrink-0">
                <button
                    onClick={() => setView('JOBS')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${view === 'JOBS' ? 'bg-secondary-900 text-white shadow-md' : 'text-secondary-500 hover:bg-secondary-50'}`}
                >
                    <Briefcase size={18} />
                    <span className="font-bold text-xs uppercase tracking-widest">Job Postings</span>
                </button>
                <button
                    onClick={() => setView('PIPELINE')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${view === 'PIPELINE' ? 'bg-secondary-900 text-white shadow-md' : 'text-secondary-500 hover:bg-secondary-50'}`}
                >
                    <Users size={18} />
                    <span className="font-bold text-xs uppercase tracking-widest">Candidate Pipeline</span>
                </button>
            </div>

            <div className="flex-1 min-h-0">
                {view === 'JOBS' ? <JobPostingManager /> : <ApplicantPipeline />}
            </div>
        </div>
    );
}
