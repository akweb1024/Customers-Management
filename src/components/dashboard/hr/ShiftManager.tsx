'use client';

import { useState } from 'react';
import { useShifts } from '@/hooks/useHR';
import { Clock, Plus, Trash2, Edit2, Save, X, Moon, Sun } from 'lucide-react';

export default function ShiftManager() {
    const { data: shifts, create, update, remove } = useShifts();
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        startTime: '09:00',
        endTime: '18:00',
        gracePeriod: 15,
        isNightShift: false
    });

    const handleSave = async () => {
        try {
            if (editingId) {
                await update.mutateAsync({ id: editingId, ...formData });
                setEditingId(null);
            } else {
                await create.mutateAsync(formData);
                setIsAdding(false);
            }
            setFormData({ name: '', startTime: '09:00', endTime: '18:00', gracePeriod: 15, isNightShift: false });
        } catch (err) {
            alert('Failed to save shift');
        }
    };

    const handleEdit = (shift: any) => {
        setEditingId(shift.id);
        setFormData({
            name: shift.name,
            startTime: shift.startTime,
            endTime: shift.endTime,
            gracePeriod: shift.gracePeriod,
            isNightShift: shift.isNightShift
        });
        setIsAdding(true);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-2xl font-black text-secondary-900 tracking-tight">Shift Definitions</h3>
                    <p className="text-secondary-500 text-sm font-medium">Manage working hours and grace periods for your workforce.</p>
                </div>
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="btn bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-primary-100 transition-all font-bold uppercase tracking-widest text-[10px]"
                    >
                        <Plus size={16} /> Define New Shift
                    </button>
                )}
            </div>

            {isAdding && (
                <div className="card-premium p-8 border-2 border-primary-100 bg-primary-50/10">
                    <div className="flex justify-between items-center mb-8">
                        <h4 className="font-black text-secondary-900 uppercase tracking-widest text-xs flex items-center gap-2">
                            <Clock className="text-primary-600" size={18} />
                            {editingId ? 'Edit Shift' : 'New Shift Configuration'}
                        </h4>
                        <button onClick={() => { setIsAdding(false); setEditingId(null); }} className="text-secondary-400 hover:text-secondary-620">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-1 space-y-4">
                            <label className="label-text text-[10px] font-black text-secondary-400 uppercase tracking-widest">Shift Name</label>
                            <input
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="input w-full bg-white border-secondary-200 focus:ring-primary-500 font-bold"
                                placeholder="e.g. Morning Standard"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-4">
                                <label className="label-text text-[10px] font-black text-secondary-400 uppercase tracking-widest">Start Time</label>
                                <input
                                    type="time"
                                    value={formData.startTime}
                                    onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                                    className="input w-full bg-white border-secondary-200 focus:ring-primary-500 font-bold"
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="label-text text-[10px] font-black text-secondary-400 uppercase tracking-widest">End Time</label>
                                <input
                                    type="time"
                                    value={formData.endTime}
                                    onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                                    className="input w-full bg-white border-secondary-200 focus:ring-primary-500 font-bold"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-4">
                                <label className="label-text text-[10px] font-black text-secondary-400 uppercase tracking-widest">Grace (Mins)</label>
                                <input
                                    type="number"
                                    value={formData.gracePeriod}
                                    onChange={e => setFormData({ ...formData, gracePeriod: parseInt(e.target.value) || 0 })}
                                    className="input w-full bg-white border-secondary-200 focus:ring-primary-500 font-bold"
                                />
                            </div>
                            <div className="flex flex-col justify-center gap-2">
                                <label className="label-text text-[10px] font-black text-secondary-400 uppercase tracking-widest">Shift Type</label>
                                <button
                                    onClick={() => setFormData({ ...formData, isNightShift: !formData.isNightShift })}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all font-bold text-xs ${formData.isNightShift ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-orange-600 border-orange-200'}`}
                                >
                                    {formData.isNightShift ? <><Moon size={14} /> Night Shift</> : <><Sun size={14} /> Day Shift</>}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end mt-8 gap-4">
                        <button onClick={() => { setIsAdding(false); setEditingId(null); }} className="btn bg-secondary-100 text-secondary-600 px-8 rounded-xl font-bold uppercase text-[10px] tracking-widest">Cancel</button>
                        <button onClick={handleSave} className="btn bg-primary-600 text-white px-10 rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-lg shadow-primary-100 flex items-center gap-2">
                            <Save size={16} /> {editingId ? 'Update Shift' : 'Create Shift'}
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {shifts?.map((shift: any) => (
                    <div key={shift.id} className="card-premium group hover:border-primary-300 transition-all p-6 relative overflow-hidden">
                        <div className={`absolute top-0 right-0 p-4 opacity-[0.05] group-hover:opacity-10 transition-opacity ${shift.isNightShift ? 'text-indigo-600' : 'text-orange-500'}`}>
                            {shift.isNightShift ? <Moon size={80} /> : <Sun size={80} />}
                        </div>

                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h4 className="text-lg font-black text-secondary-900 tracking-tight">{shift.name}</h4>
                                <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase mt-1 ${shift.isNightShift ? 'bg-indigo-50 text-indigo-600' : 'bg-orange-50 text-orange-600'}`}>
                                    {shift.isNightShift ? 'Overnight' : 'Regular Day'}
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleEdit(shift)} className="p-2 text-secondary-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all">
                                    <Edit2 size={14} />
                                </button>
                                <button onClick={() => remove.mutate(shift.id)} className="p-2 text-secondary-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-all">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-6 justify-between border-t border-secondary-50 pt-6">
                            <div>
                                <p className="text-[10px] font-black text-secondary-400 uppercase tracking-widest mb-1">Time Range</p>
                                <p className="text-xl font-black text-secondary-900">{shift.startTime} – {shift.endTime}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-secondary-400 uppercase tracking-widest mb-1">Grace</p>
                                <p className="text-xl font-black text-primary-600">{shift.gracePeriod}m</p>
                            </div>
                        </div>
                    </div>
                ))}

                {shifts?.length === 0 && !isAdding && (
                    <div className="col-span-full py-20 bg-secondary-50/50 rounded-[2.5rem] border-4 border-dashed border-secondary-100 flex flex-col items-center text-center">
                        <Clock size={48} className="text-secondary-200 mb-4" />
                        <h4 className="text-xl font-black text-secondary-900 tracking-tight">No shifts defined yet.</h4>
                        <p className="text-secondary-500 max-w-xs mt-2 font-medium">Define your first shift to start assigning work schedules to your team.</p>
                        <button onClick={() => setIsAdding(true)} className="mt-6 text-primary-600 font-bold uppercase tracking-widest text-[10px] hover:underline">Add One Now</button>
                    </div>
                )}
            </div>
        </div>
    );
}
