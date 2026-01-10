'use client';

import { useKPIs } from '@/hooks/useHR';
import { Target, TrendingUp, BarChart3 } from 'lucide-react';

export default function EmployeeKPIView() {
    const { data: kpis, isLoading } = useKPIs();

    if (isLoading) return <div className="p-10 text-center font-bold text-secondary-400">Loading metrics...</div>;

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-black text-secondary-900 tracking-tight">Active Performance Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                {kpis?.map((kpi: any) => {
                    const percentage = (kpi.current / kpi.target) * 100;
                    return (
                        <div key={kpi.id} className="card-premium p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-primary-50 text-primary-600 rounded-lg">
                                    <BarChart3 size={20} />
                                </div>
                                <h4 className="font-bold text-secondary-900">{kpi.title}</h4>
                            </div>

                            <div className="flex justify-between items-end mb-2">
                                <div className="text-2xl font-black text-secondary-900">
                                    {kpi.current.toLocaleString()} <span className="text-[10px] text-secondary-400 uppercase font-black">{kpi.unit}</span>
                                </div>
                                <div className="text-right">
                                    <div className={`flex items-center gap-1 font-black text-xs ${percentage >= 100 ? 'text-success-600' : 'text-primary-600'}`}>
                                        {percentage.toFixed(0)}% <TrendingUp size={12} />
                                    </div>
                                    <div className="text-[9px] font-bold text-secondary-400 uppercase">Target: {kpi.target.toLocaleString()}</div>
                                </div>
                            </div>

                            <div className="w-full h-2 bg-secondary-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-1000 ${percentage >= 100 ? 'bg-success-500' : 'bg-primary-500'}`}
                                    style={{ width: `${Math.min(percentage, 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    );
                })}

                {kpis?.length === 0 && (
                    <div className="col-span-full py-20 text-center card-premium border-dashed border-2 border-secondary-100">
                        <Target size={48} className="mx-auto text-secondary-200 mb-4" />
                        <p className="font-bold text-secondary-400">No active KPIs assigned by manager.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
