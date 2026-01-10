'use client';

import { useState, useEffect } from 'react';
import { useEmployees, useShifts, useRoster } from '@/hooks/useHR';
import { Calendar, Users, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ShiftRoster() {
    const { data: employees } = useEmployees();
    const { data: shifts } = useShifts();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
    const [selectedShift, setSelectedShift] = useState<string | null>(null);
    const [selectedDates, setSelectedDates] = useState<number[]>([]); // Day of month

    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDay = monthStart.getDay();
    const daysInMonth = monthEnd.getDate();

    const { data: roster, assign } = useRoster(
        monthStart.toISOString().split('T')[0],
        monthEnd.toISOString().split('T')[0]
    );

    const handleDateClick = (day: number) => {
        setSelectedDates(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
    };

    const handleAssign = async () => {
        if (!selectedShift || selectedEmployees.length === 0 || selectedDates.length === 0) {
            alert('Please select employees, dates, and a shift.');
            return;
        }

        const assignments = [];
        for (const empId of selectedEmployees) {
            for (const day of selectedDates) {
                const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                date.setHours(0, 0, 0, 0);
                assignments.push({ employeeId: empId, shiftId: selectedShift, date: date.toISOString() });
            }
        }

        try {
            await assign.mutateAsync(assignments);
            alert('Roster updated successfully!');
            setSelectedDates([]);
        } catch (err) {
            alert('Assignment failed');
        }
    };

    const getShiftForDay = (empId: string, day: number) => {
        const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0];
        const entry = roster?.find((r: any) => r.employeeId === empId && r.date.startsWith(dateStr));
        return entry?.shift;
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border border-secondary-100 shadow-sm">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className="p-2 hover:bg-secondary-50 rounded-xl"><ChevronLeft size={20} /></button>
                        <h3 className="text-xl font-black text-secondary-900 min-w-[200px] text-center uppercase tracking-tighter">
                            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </h3>
                        <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className="p-2 hover:bg-secondary-50 rounded-xl"><ChevronRight size={20} /></button>
                    </div>
                </div>
                <div className="flex gap-4">
                    <select
                        className="select bg-secondary-50 border-secondary-200 font-bold text-xs"
                        onChange={(e) => setSelectedShift(e.target.value)}
                        value={selectedShift || ''}
                    >
                        <option value="">Select Shift to Assign</option>
                        {shifts?.map((s: any) => (
                            <option key={s.id} value={s.id}>{s.name} ({s.startTime}-{s.endTime})</option>
                        ))}
                    </select>
                    <button
                        onClick={handleAssign}
                        disabled={!selectedShift || selectedDates.length === 0 || selectedEmployees.length === 0}
                        className="btn bg-primary-600 hover:bg-primary-700 text-white px-8 rounded-xl font-bold uppercase text-[10px] tracking-widest disabled:opacity-50 transition-all shadow-lg shadow-primary-100 flex items-center gap-2"
                    >
                        Apply Roster <CheckCircle2 size={16} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[700px]">
                {/* Employee Multi-Select */}
                <div className="lg:col-span-1 card-premium p-0 flex flex-col h-full bg-white">
                    <div className="p-6 border-b border-secondary-50 bg-secondary-50/30">
                        <h4 className="flex items-center gap-2 font-black text-secondary-900 uppercase tracking-tighter text-sm">
                            <Users className="text-primary-600" size={18} /> Staff Selection
                        </h4>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-1">
                        {employees?.map((emp: any) => (
                            <label key={emp.id} className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all ${selectedEmployees.includes(emp.id) ? 'bg-primary-50 border border-primary-200 shadow-sm' : 'hover:bg-secondary-50 border border-transparent'}`}>
                                <input
                                    type="checkbox"
                                    checked={selectedEmployees.includes(emp.id)}
                                    onChange={() => setSelectedEmployees(prev => prev.includes(emp.id) ? prev.filter(id => id !== emp.id) : [...prev, emp.id])}
                                    className="checkbox checkbox-primary checkbox-sm rounded-md"
                                />
                                <div className="text-left overflow-hidden">
                                    <p className="font-bold truncate text-sm text-secondary-900">{emp.user?.name || emp.user?.email.split('@')[0]}</p>
                                    <p className="text-[10px] uppercase font-bold tracking-widest text-secondary-400">{emp.designation}</p>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Calendar View */}
                <div className="lg:col-span-3 card-premium p-0 flex flex-col h-full overflow-hidden bg-white">
                    <div className="p-6 border-b border-secondary-50 flex justify-between items-center bg-secondary-50/30">
                        <h4 className="flex items-center gap-2 font-black text-secondary-900 uppercase tracking-tighter text-sm">
                            <Calendar className="text-primary-600" size={18} /> Schedule Grid
                        </h4>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 bg-primary-100 border border-primary-200 rounded"></span>
                                <span className="text-[10px] font-bold text-secondary-500">Selected</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 bg-secondary-900 rounded"></span>
                                <span className="text-[10px] font-bold text-secondary-500">Assigned</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto p-6 scrollbar-hide">
                        <div className="grid grid-cols-7 gap-px bg-secondary-100 rounded-3xl overflow-hidden border border-secondary-100 ring-4 ring-secondary-50 shadow-inner">
                            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                                <div key={day} className="bg-secondary-50 p-4 text-center text-[10px] font-black text-secondary-400 tracking-widest">{day}</div>
                            ))}
                            {Array.from({ length: startDay }).map((_, i) => (
                                <div key={`empty-${i}`} className="bg-white/50 h-32 opacity-20 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"></div>
                            ))}
                            {Array.from({ length: daysInMonth }).map((_, i) => {
                                const day = i + 1;
                                const isSelected = selectedDates.includes(day);
                                return (
                                    <div
                                        key={day}
                                        onClick={() => handleDateClick(day)}
                                        className={`bg-white h-32 p-3 flex flex-col gap-2 transition-all cursor-pointer relative group ${isSelected ? 'ring-2 ring-inset ring-primary-500 bg-primary-50/50 z-10 shadow-lg' : 'hover:bg-secondary-50/50'}`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className={`text-xs font-black ${isSelected ? 'text-primary-700' : 'text-secondary-400'}`}>{day < 10 ? `0${day}` : day}</span>
                                        </div>

                                        <div className="flex-1 overflow-y-auto space-y-1">
                                            {selectedEmployees.map(empId => {
                                                const shift = getShiftForDay(empId, day);
                                                if (!shift) return null;
                                                return (
                                                    <div key={empId} className="px-2 py-0.5 bg-secondary-900 text-white rounded text-[8px] font-bold truncate tracking-tight shadow-sm">
                                                        {shift.name}: {shift.startTime}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {isSelected && (
                                            <div className="absolute top-2 right-2">
                                                <div className="w-4 h-4 bg-primary-600 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in-50 duration-200">
                                                    <CheckCircle2 className="text-white" size={10} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="p-6 bg-secondary-50/50 border-t border-secondary-100 flex items-center gap-4">
                        <AlertCircle className="text-secondary-400" size={20} />
                        <p className="text-[10px] font-bold text-secondary-500 uppercase tracking-widest leading-relaxed">
                            Click dates to toggle selection. Select employees from left and a shift from top, then click &quot;Apply Roster&quot; to bulk assign.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
