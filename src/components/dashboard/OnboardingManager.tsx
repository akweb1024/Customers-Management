'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash, BookOpen, CheckSquare } from 'lucide-react';

export default function OnboardingManager() {
    const [modules, setModules] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [activeTab, setActiveTab] = useState<'BASIC' | 'CONTENT' | 'QUIZ'>('BASIC');
    const [saving, setSaving] = useState(false);

    // Initial State
    const initialModuleState = {
        title: '',
        type: 'COMPANY',
        description: '',
        content: '',
        departmentId: '',
        requiredForDesignation: '',
        order: 1,
        questions: [{ question: '', options: ['', '', '', ''], correctAnswer: 0 }]
    };

    const [newModule, setNewModule] = useState<any>(initialModuleState);

    useEffect(() => {
        fetchModules();
        fetchDepartments();
    }, []);

    const fetchModules = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/hr/onboarding/modules', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setModules(data);
                setNewModule((prev: any) => ({ ...prev, order: data.length + 1 }));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchDepartments = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/hr/departments', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setDepartments(await res.json());
        } catch (error) {
            console.error(error);
        }
    };

    // Form Handlers
    const handleQuestionAdd = () => {
        setNewModule({
            ...newModule,
            questions: [...newModule.questions, { question: '', options: ['', '', '', ''], correctAnswer: 0 }]
        });
    };

    const handleQuestionRemove = (idx: number) => {
        const updated = newModule.questions.filter((_: any, i: number) => i !== idx);
        setNewModule({ ...newModule, questions: updated });
    };

    const handleQuestionChange = (idx: number, field: string, value: any) => {
        const updated = [...newModule.questions];
        updated[idx] = { ...updated[idx], [field]: value };
        setNewModule({ ...newModule, questions: updated });
    };

    const handleOptionChange = (qIdx: number, oIdx: number, value: string) => {
        const updated = [...newModule.questions];
        updated[qIdx].options[oIdx] = value;
        setNewModule({ ...newModule, questions: updated });
    };

    const validateForm = () => {
        if (!newModule.title.trim()) return 'Title is required';
        if (!newModule.content.trim()) return 'Study material content is required';
        if (newModule.type === 'DEPARTMENT' && !newModule.departmentId) return 'Please select a department';
        if (newModule.type === 'ROLE' && !newModule.requiredForDesignation) return 'Please specify a designation';

        for (let i = 0; i < newModule.questions.length; i++) {
            const q = newModule.questions[i];
            if (!q.question.trim()) return `Question ${i + 1} cannot be empty`;
            if (q.options.some((o: string) => !o.trim())) return `All options for Question ${i + 1} must be filled`;
        }
        return null;
    };

    const saveModule = async () => {
        const error = validateForm();
        if (error) {
            alert(error); // Ideally use toast
            return;
        }

        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/hr/onboarding/modules', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(newModule)
            });

            if (res.ok) {
                setIsCreating(false);
                fetchModules();
                setNewModule({ ...initialModuleState, order: modules.length + 2 });
                setActiveTab('BASIC');
            } else {
                const errData = await res.json();
                alert(`Failed to save: ${errData.error || 'Unknown error'}`);
            }
        } catch (err) {
            console.error(err);
            alert('Network error occurred');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black text-secondary-900 tracking-tighter">Training Modules</h2>
                    <p className="text-secondary-500 font-medium">Create and manage onboarding content and assessments.</p>
                </div>
                {!isCreating && (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="btn btn-primary flex items-center gap-2 px-6 py-3 rounded-2xl shadow-lg shadow-primary-200"
                    >
                        <Plus size={18} strokeWidth={3} /> <span className="font-black text-xs uppercase tracking-widest">New Module</span>
                    </button>
                )}
            </div>

            {isCreating ? (
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-secondary-100">
                    {/* Header Steps */}
                    <div className="bg-secondary-50 border-b border-secondary-100 p-2 flex gap-1">
                        {['BASIC', 'CONTENT', 'QUIZ'].map((step, idx) => (
                            <button
                                key={step}
                                onClick={() => setActiveTab(step as any)}
                                className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === step ? 'bg-white text-primary-600 shadow-sm' : 'text-secondary-400 hover:bg-secondary-100'
                                    }`}
                            >
                                {idx + 1}. {step}
                            </button>
                        ))}
                    </div>

                    <div className="p-8">
                        {activeTab === 'BASIC' && (
                            <div className="space-y-6 animate-scale-in">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-secondary-400 uppercase tracking-widest">Module Title</label>
                                        <input
                                            type="text"
                                            className="input w-full font-bold text-lg"
                                            value={newModule.title}
                                            onChange={(e) => setNewModule({ ...newModule, title: e.target.value })}
                                            placeholder="e.g. IT Security Protocols"
                                            autoFocus
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-secondary-400 uppercase tracking-widest">Module Type</label>
                                        <select
                                            className="input w-full font-bold"
                                            value={newModule.type}
                                            onChange={(e) => setNewModule({ ...newModule, type: e.target.value })}
                                        >
                                            <option value="COMPANY">Company Wide (All Employees)</option>
                                            <option value="ROLE">Role Specific</option>
                                            <option value="DEPARTMENT">Department Specific</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-secondary-400 uppercase tracking-widest">Short Description</label>
                                    <input
                                        type="text"
                                        className="input w-full font-medium"
                                        value={newModule.description}
                                        onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
                                        placeholder="Brief overview of what this module covers..."
                                    />
                                </div>

                                {newModule.type === 'DEPARTMENT' && (
                                    <div className="space-y-2 animate-fade-in">
                                        <label className="text-[10px] font-black text-secondary-400 uppercase tracking-widest">Target Department</label>
                                        <select
                                            className="input w-full font-bold"
                                            value={newModule.departmentId}
                                            onChange={(e) => setNewModule({ ...newModule, departmentId: e.target.value })}
                                        >
                                            <option value="">Select Department</option>
                                            {departments.map((d: any) => (
                                                <option key={d.id} value={d.id}>{d.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {newModule.type === 'ROLE' && (
                                    <div className="space-y-2 animate-fade-in">
                                        <label className="text-[10px] font-black text-secondary-400 uppercase tracking-widest">Target Designation</label>
                                        <input
                                            type="text"
                                            className="input w-full font-bold"
                                            placeholder="e.g. Senior Software Engineer"
                                            value={newModule.requiredForDesignation}
                                            onChange={(e) => setNewModule({ ...newModule, requiredForDesignation: e.target.value })}
                                        />
                                    </div>
                                )}
                                <div className="flex justify-end pt-4">
                                    <button onClick={() => setActiveTab('CONTENT')} className="btn btn-primary px-8 rounded-xl font-bold">Next: Add Content →</button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'CONTENT' && (
                            <div className="space-y-4 animate-scale-in">
                                <div className="space-y-2 h-[500px] flex flex-col">
                                    <label className="text-[10px] font-black text-secondary-400 uppercase tracking-widest">Study Material (Markdown Supported)</label>
                                    <textarea
                                        className="input w-full flex-1 font-mono text-sm leading-relaxed p-4 bg-secondary-50"
                                        placeholder="# Introduction\n\nWrite your training content here. You can use markdown for formatting."
                                        value={newModule.content}
                                        onChange={(e) => setNewModule({ ...newModule, content: e.target.value })}
                                    />
                                </div>
                                <div className="flex justify-between pt-4">
                                    <button onClick={() => setActiveTab('BASIC')} className="btn btn-ghost px-6 font-bold text-secondary-500">← Back</button>
                                    <button onClick={() => setActiveTab('QUIZ')} className="btn btn-primary px-8 rounded-xl font-bold">Next: Create Quiz →</button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'QUIZ' && (
                            <div className="space-y-6 animate-scale-in">
                                <div className="flex justify-between items-center bg-blue-50 p-4 rounded-xl border border-blue-100">
                                    <div>
                                        <h4 className="font-bold text-blue-900">Assessment Configuration</h4>
                                        <p className="text-xs text-blue-600">Define the questions to test employee understanding.</p>
                                    </div>
                                    <span className="text-2xl font-black text-blue-300">{newModule.questions.length} Qs</span>
                                </div>

                                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                    {newModule.questions.map((q: any, idx: number) => (
                                        <div key={idx} className="bg-secondary-50 p-6 rounded-2xl border border-secondary-100 group">
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="w-8 h-8 rounded-full bg-secondary-200 text-secondary-600 flex items-center justify-center font-black text-sm">
                                                    {idx + 1}
                                                </div>
                                                <input
                                                    type="text"
                                                    className="input flex-1 font-bold text-secondary-900 bg-white"
                                                    placeholder="Enter question text here..."
                                                    value={q.question}
                                                    onChange={(e) => handleQuestionChange(idx, 'question', e.target.value)}
                                                />
                                                <button onClick={() => handleQuestionRemove(idx)} className="text-danger-400 hover:text-danger-600 p-2 opacity-0 group-hover:opacity-100 transition-all">
                                                    <Trash size={16} />
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-12">
                                                {q.options.map((opt: string, oIdx: number) => (
                                                    <div key={oIdx} className={`flex items-center gap-3 p-2 rounded-lg border transition-colors ${q.correctAnswer === oIdx ? 'bg-green-50 border-green-200' : 'bg-white border-transparent'}`}>
                                                        <input
                                                            type="radio"
                                                            name={`correct-${idx}`}
                                                            checked={q.correctAnswer === oIdx}
                                                            onChange={() => handleQuestionChange(idx, 'correctAnswer', oIdx)}
                                                            className="w-4 h-4 text-green-600 focus:ring-green-500"
                                                        />
                                                        <input
                                                            type="text"
                                                            className="flex-1 bg-transparent text-sm font-medium focus:outline-none"
                                                            placeholder={`Option ${oIdx + 1}`}
                                                            value={opt}
                                                            onChange={(e) => handleOptionChange(idx, oIdx, e.target.value)}
                                                        />
                                                        {q.correctAnswer === oIdx && <span className="text-[10px] font-bold text-green-600 uppercase">Correct</span>}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <button onClick={handleQuestionAdd} className="w-full py-4 border-2 border-dashed border-primary-200 rounded-2xl text-primary-600 font-bold hover:bg-primary-50 hover:border-primary-300 transition-all">
                                    + Add Another Question
                                </button>

                                <div className="flex justify-between pt-8 border-t border-secondary-100">
                                    <button onClick={() => setActiveTab('CONTENT')} className="btn btn-ghost px-6 font-bold text-secondary-500">← Back</button>

                                    <div className="flex gap-2">
                                        <button onClick={() => setIsCreating(false)} className="btn btn-secondary px-6 rounded-xl font-bold">Cancel</button>
                                        <button
                                            onClick={saveModule}
                                            disabled={saving}
                                            className="btn btn-primary px-8 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-primary-200 disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            {saving ? 'Saving...' : '💾 Save Module'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {modules.length === 0 ? (
                        <div className="col-span-full py-20 text-center text-secondary-400">
                            <div className="text-6xl mb-4">📚</div>
                            <p className="font-bold">No training modules found.</p>
                            <p className="text-sm mt-2">Create one to get started.</p>
                        </div>
                    ) : (
                        modules.map((m: any) => (
                            <div key={m.id} className="card-premium group hover:border-primary-500 transition-all border-l-4 border-l-secondary-200">
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded bg-secondary-100 text-secondary-600 tracking-wider`}>{m.type}</span>
                                    <BookOpen size={20} className="text-secondary-300 group-hover:text-primary-500 transition-colors" />
                                </div>
                                <h3 className="font-bold text-lg text-secondary-900 mb-2 line-clamp-2 min-h-[56px]">{m.title}</h3>
                                <p className="text-secondary-500 text-xs mb-6 line-clamp-3 leading-relaxed">{m.description || 'No description provided.'}</p>

                                <div className="flex items-center justify-between pt-4 border-t border-secondary-50">
                                    <div className="flex items-center gap-2 text-xs font-bold text-secondary-500">
                                        <CheckSquare size={14} />
                                        <span>{m.questions?.length || 0} Questions</span>
                                    </div>
                                    <span className="text-[10px] font-black text-secondary-300 uppercase">Order: {m.order}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
