'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    FileText, UserMinus, Calculator,
    AlertCircle, CheckCircle2, IndianRupee
} from 'lucide-react';
import { fetchJson } from '@/lib/api-utils';

export default function FinalSettlementManager() {
    const queryClient = useQueryClient();
    const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
    const [step, setStep] = useState(1);

    const { data: employees } = useQuery<any[]>({
        queryKey: ['employees'],
        queryFn: () => fetchJson('/api/hr/employees')
    });

    const [formData, setFormData] = useState({
        lastWorkingDay: '',
        noticeServed: true,
        leaveEncashmentDays: 0,
        bonus: 0,
        gratuity: 0,
        otherDues: 0,
        deductions: 0
    });

    const generateFF = useMutation({
        mutationFn: (data: any) => fetchJson('/api/hr/payroll/final-settlement', 'POST', {
            employeeId: selectedEmployeeId,
            ...data
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['salary-slips'] });
            setStep(3);
        }
    });

    const selectedEmployee = employees?.find(e => e.id === selectedEmployeeId);

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 mb-10">
                <div className="w-16 h-16 rounded-[2rem] bg-danger-50 text-danger-600 flex items-center justify-center text-3xl shadow-lg border border-danger-100">
                    <UserMinus />
                </div>
                <div>
                    <h3 className="text-3xl font-black text-secondary-900 tracking-tight">Full & Final Settlement</h3>
                    <p className="text-secondary-500 font-medium">Offboarding and financial clearance automation.</p>
                </div>
            </div>

            {/* Stepper */}
            <div className="flex items-center gap-4 mb-8">
                {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center gap-2">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black transition-all ${step >= s ? 'bg-primary-600 text-white shadow-lg' : 'bg-secondary-100 text-secondary-400'}`}>
                            {s}
                        </div>
                        {s < 3 && <div className={`w-20 h-1 rounded-full ${step > s ? 'bg-primary-600' : 'bg-secondary-100'}`}></div>}
                    </div>
                ))}
            </div>

            {step === 1 && (
                <div className="card-premium p-10 space-y-8 bg-white border-2 border-secondary-50 shadow-2xl rounded-[3rem]">
                    <div className="space-y-4">
                        <h4 className="text-xl font-black text-secondary-900">Select Employee for Exit</h4>
                        <div className="relative">
                            <select
                                className="w-full bg-secondary-50 border-none rounded-2xl p-5 font-black text-lg focus:ring-4 focus:ring-primary-500/10 appearance-none cursor-pointer"
                                value={selectedEmployeeId}
                                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                            >
                                <option value="">CHOOSE PERSONNEL...</option>
                                {employees?.filter(e => e.user?.isActive).map(e => (
                                    <option key={e.id} value={e.id}>{e.user?.name || e.employeeId} - {e.designation}</option>
                                ))}
                            </select>
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-secondary-400">▼</div>
                        </div>
                    </div>

                    {selectedEmployee && (
                        <div className="p-6 bg-primary-50/50 rounded-3xl border border-primary-100 flex items-center gap-6 animate-in fade-in zoom-in-95">
                            <div className="w-20 h-20 rounded-2xl bg-white shadow-lg flex items-center justify-center text-3xl">👤</div>
                            <div>
                                <p className="font-black text-secondary-900 text-2xl">{selectedEmployee.user?.name}</p>
                                <p className="text-primary-600 font-bold uppercase tracking-widest text-xs">{selectedEmployee.designation}</p>
                            </div>
                        </div>
                    )}

                    <button
                        disabled={!selectedEmployeeId}
                        onClick={() => setStep(2)}
                        className="w-full btn bg-secondary-900 text-white py-5 rounded-2xl font-black uppercase text-sm tracking-widest hover:bg-black transition-all shadow-xl disabled:opacity-50"
                    >
                        Configure Settlement
                    </button>
                </div>
            )}

            {step === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-right-4">
                    <div className="card-premium p-10 space-y-6">
                        <h4 className="text-xl font-black text-secondary-900 mb-6">Exit Parameters</h4>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-secondary-400 uppercase tracking-widest">Last Working Day</label>
                            <input
                                type="date"
                                className="w-full bg-secondary-50 border-none rounded-xl p-4 font-bold"
                                value={formData.lastWorkingDay}
                                onChange={(e) => setFormData({ ...formData, lastWorkingDay: e.target.value })}
                            />
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-secondary-50 rounded-xl">
                            <input
                                type="checkbox"
                                className="w-5 h-5 accent-primary-600"
                                checked={formData.noticeServed}
                                onChange={(e) => setFormData({ ...formData, noticeServed: e.target.checked })}
                            />
                            <span className="font-bold text-secondary-700">Notice Period Served fully?</span>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-secondary-400 uppercase tracking-widest">Leave Encashment (Days)</label>
                            <input
                                type="number"
                                className="w-full bg-secondary-50 border-none rounded-xl p-4 font-bold"
                                value={formData.leaveEncashmentDays}
                                onChange={(e) => setFormData({ ...formData, leaveEncashmentDays: parseInt(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div className="card-premium p-10 space-y-6 border-l-4 border-warning-500">
                        <h4 className="text-xl font-black text-secondary-900 mb-6">Dues & Deductions</h4>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary-400 uppercase tracking-widest">Bonus</label>
                                <input type="number" className="w-full bg-secondary-50 border-none rounded-xl p-4 font-bold" value={formData.bonus} onChange={(e) => setFormData({ ...formData, bonus: parseFloat(e.target.value) })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary-400 uppercase tracking-widest">Gratuity</label>
                                <input type="number" className="w-full bg-secondary-50 border-none rounded-xl p-4 font-bold" value={formData.gratuity} onChange={(e) => setFormData({ ...formData, gratuity: parseFloat(e.target.value) })} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-secondary-400 uppercase tracking-widest">Notice Recovery / Deductions</label>
                            <input type="number" className="w-full bg-danger-50 border-none rounded-xl p-4 font-bold text-danger-700" value={formData.deductions} onChange={(e) => setFormData({ ...formData, deductions: parseFloat(e.target.value) })} />
                        </div>

                        <div className="pt-6">
                            <button
                                onClick={() => generateFF.mutate(formData)}
                                className="w-full btn bg-primary-600 text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-xl shadow-primary-200"
                            >
                                Process Final Payout
                            </button>
                            <button onClick={() => setStep(1)} className="w-full mt-4 text-xs font-bold text-secondary-400 uppercase hover:text-secondary-600">Back</button>
                        </div>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="card-premium p-20 text-center space-y-8 bg-success-50 border-none animate-in zoom-in-95">
                    <div className="w-24 h-24 rounded-[2.5rem] bg-white text-success-600 flex items-center justify-center text-5xl mx-auto shadow-xl ring-8 ring-success-100">
                        <CheckCircle2 />
                    </div>
                    <div>
                        <h3 className="text-4xl font-black text-secondary-900 tracking-tight">F&F Processed!</h3>
                        <p className="text-secondary-500 font-medium max-w-md mx-auto mt-4 underline decoration-success-200 decoration-4">The final settlement slip has been generated and the account has been deactivated.</p>
                    </div>
                    <button
                        onClick={() => { setStep(1); setSelectedEmployeeId(''); }}
                        className="btn bg-secondary-900 text-white px-10 py-4 rounded-3xl font-black uppercase text-xs tracking-widest shadow-2xl"
                    >
                        Close & Finish
                    </button>
                </div>
            )}
        </div>
    );
}
