'use client';

import { useState } from 'react';
import { Edit } from 'lucide-react';

interface EmployeeListProps {
    employees: any[];
    loading: boolean;
    onEdit: (emp: any) => void;
    onDelete: (id: string) => void;
    onPay: (emp: any) => void;
    onReview: (emp: any) => void;
    onViewProfile: (id: string) => void;
}

export default function EmployeeList({
    employees,
    loading,
    onEdit,
    onDelete,
    onPay,
    onReview,
    onViewProfile
}: EmployeeListProps) {
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <div className="bg-white p-1 rounded-lg border border-secondary-200 flex gap-1 shadow-sm">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-secondary-100 text-secondary-900' : 'text-secondary-400 hover:text-secondary-600'}`}
                        title="List View"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} /></svg>
                    </button>
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-secondary-100 text-secondary-900' : 'text-secondary-400 hover:text-secondary-600'}`}
                        title="Grid View"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} /></svg>
                    </button>
                </div>
            </div>

            {viewMode === 'list' ? (
                <div className="card-premium overflow-hidden">
                    <table className="table">
                        <thead>
                            <tr className="text-[10px] uppercase font-black text-secondary-400 border-b border-secondary-50">
                                <th className="pb-4">Staff Member</th>
                                <th className="pb-4">Role & Designation</th>
                                <th className="pb-4">Financials</th>
                                <th className="pb-4">Stats</th>
                                <th className="pb-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-secondary-50">
                            {loading ? (
                                <tr><td colSpan={5} className="text-center py-20 text-secondary-400 font-bold animate-pulse italic">Scanning workforce assets...</td></tr>
                            ) : employees.map(emp => (
                                <tr key={emp.id} className="hover:bg-secondary-50/50 transition-colors group">
                                    <td className="py-4">
                                        <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => onViewProfile(emp.id)}>
                                            <div className="w-10 h-10 bg-gradient-to-br from-secondary-100 to-secondary-200 rounded-xl flex items-center justify-center font-black text-secondary-600">
                                                {emp.user.email.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-secondary-900 hover:text-primary-600 transition-colors">{emp.user.email}</p>
                                                <div className="flex gap-2">
                                                    <p className="text-[10px] text-secondary-400 font-bold">Pan: {emp.panNumber || 'NOTSET'}</p>
                                                    <span className={`text-[10px] font-black px-1 rounded ${emp.user.isActive ? 'bg-success-100 text-success-700' : 'bg-danger-100 text-danger-700'}`}>{emp.user.isActive ? 'ACTIVE' : 'INACTIVE'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <span className="px-2 py-1 bg-primary-50 text-primary-700 text-[10px] font-black rounded uppercase">{emp.user.role}</span>
                                        <p className="text-xs font-bold text-secondary-600 mt-1">{emp.designation || 'Specialist'}</p>
                                    </td>
                                    <td className="py-4">
                                        <p className="text-sm font-black text-secondary-900">₹{parseFloat(emp.baseSalary || 0).toLocaleString()}</p>
                                        <p className="text-[10px] text-secondary-400 font-bold uppercase">{emp.bankName || 'No Bank Set'}</p>
                                    </td>
                                    <td className="py-4">
                                        <div className="flex gap-4">
                                            <div className="text-center">
                                                <p className="text-sm font-black text-secondary-900">{emp._count.attendance}</p>
                                                <p className="text-[9px] font-black text-secondary-400 uppercase">Days</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-black text-secondary-900">{emp._count.workReports}</p>
                                                <p className="text-[9px] font-black text-secondary-400 uppercase">Reports</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => onEdit(emp)}
                                                className="p-2 hover:bg-white rounded-lg text-primary-600"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} /></svg>
                                            </button>
                                            <button
                                                onClick={() => onReview(emp)}
                                                className="p-2 hover:bg-white rounded-lg text-warning-500 tooltip-left"
                                                title="Evaluate Performance"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} /></svg>
                                            </button>
                                            <button
                                                onClick={() => onPay(emp)}
                                                className="p-2 hover:bg-white rounded-lg text-success-600"
                                                title="Quick Pay"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} /></svg>
                                            </button>
                                            <button
                                                onClick={() => onDelete(emp.id)}
                                                className="p-2 hover:bg-white rounded-lg text-danger-500"
                                                title="Deactivate / Delete"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} /></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {employees.map(emp => (
                        <div key={emp.id} className="card-premium p-6 hover:shadow-xl transition-all group relative">
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => onEdit(emp)} className="p-2 bg-secondary-100 rounded-full hover:bg-primary-100 hover:text-primary-600">
                                    <Edit size={14} />
                                </button>
                            </div>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center font-black text-2xl text-primary-700 overflow-hidden border-2 border-white shadow-md">
                                    {emp.profilePicture ? (
                                        <img src={emp.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        emp.user.email[0].toUpperCase()
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-secondary-900 truncate max-w-[180px]" title={emp.user.email}>{emp.user.email.split('@')[0]}</h3>
                                    <p className="text-xs text-secondary-500 font-bold uppercase tracking-wider">{emp.designation || 'No Designation'}</p>
                                    <span className={`inline-block mt-1 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest ${emp.user.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                                        {emp.user.isActive ? 'Active Staff' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 border-t border-secondary-50 pt-4">
                                <div>
                                    <p className="text-[9px] text-secondary-400 font-bold uppercase">Role</p>
                                    <p className="text-xs font-bold text-secondary-900">{emp.user.role}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] text-secondary-400 font-bold uppercase">Department</p>
                                    <p className="text-xs font-bold text-secondary-900">{emp.department?.name || 'General'}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] text-secondary-400 font-bold uppercase">Reports</p>
                                    <p className="text-xs font-bold text-secondary-900">{emp._count.workReports}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] text-secondary-400 font-bold uppercase">Attendance</p>
                                    <p className="text-xs font-bold text-secondary-900">{emp._count.attendance} Days</p>
                                </div>
                            </div>
                            <button onClick={() => onViewProfile(emp.id)} className="w-full mt-4 btn btn-secondary text-xs uppercase font-black tracking-widest py-3 hover:bg-primary-50 hover:text-primary-700 hover:border-primary-100 border border-transparent">
                                View Full Profile
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
