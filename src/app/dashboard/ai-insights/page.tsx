'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function AIPredictionPage() {
    // This is a mockup of the AI prediction page
    const [selectedMetric, setSelectedMetric] = useState('revenue');

    return (
        <DashboardLayout userRole="SUPER_ADMIN">
            {/* Note: In real app, userRole should come from auth context/prop */}

            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-secondary-900">AI Insights & Predictions</h1>
                    <p className="text-secondary-600 mt-1">
                        Predictive analytics powered by machine learning algorithms
                    </p>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="card-premium">
                        <h3 className="text-secondary-600 font-medium text-sm">Projected Revenue (Q1 2026)</h3>
                        <p className="text-3xl font-bold text-secondary-900 mt-2">$1.2M</p>
                        <p className="text-success-600 text-sm mt-1">↑ 12% vs previous quarter</p>
                    </div>
                    <div className="card-premium">
                        <h3 className="text-secondary-600 font-medium text-sm">Churn Risk</h3>
                        <p className="text-3xl font-bold text-secondary-900 mt-2">4.2%</p>
                        <p className="text-success-600 text-sm mt-1">↓ 1.5% improvement</p>
                    </div>
                    <div className="card-premium">
                        <h3 className="text-secondary-600 font-medium text-sm">Growth Opportunity</h3>
                        <p className="text-3xl font-bold text-secondary-900 mt-2">$350k</p>
                        <p className="text-secondary-600 text-sm mt-1">Potential upsells identified</p>
                    </div>
                </div>

                {/* Chart Area Mockup */}
                <div className="card-premium h-96 flex items-center justify-center bg-secondary-50 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <div className="text-6xl mb-4">📈</div>
                            <h3 className="text-xl font-bold text-secondary-900">Predictive Sales Trend</h3>
                            <p className="text-secondary-600">Model: LSTM-based Time Series Forecasting</p>
                            <p className="text-xs text-secondary-400 mt-2 uppercase tracking-widest">(Mockup Visualization)</p>
                        </div>
                    </div>
                    {/* Simplified graph lines visualization */}
                    <svg viewBox="0 0 800 300" className="w-full h-full opacity-20 absolute bottom-0">
                        <path d="M0,250 C150,200 300,280 400,150 S600,0 800,50" fill="none" stroke="#2563eb" strokeWidth="4" />
                        <path d="M0,280 C150,260 300,290 400,200 S600,100 800,80" fill="none" stroke="#dc2626" strokeWidth="4" strokeDasharray="10,10" />
                    </svg>
                </div>

                {/* Insights List */}
                <div className="card-premium">
                    <h2 className="text-xl font-bold text-secondary-900 mb-4">Key Insights</h2>
                    <div className="space-y-4">
                        <div className="flex items-start space-x-3 p-4 bg-primary-50 rounded-lg border border-primary-100">
                            <div className="text-2xl">🤖</div>
                            <div>
                                <h4 className="font-bold text-primary-900">Upsell Opportunity Detected</h4>
                                <p className="text-primary-700">Based on usage patterns, <strong>MIT Libraries</strong> is likely to upgrade to the 'Premium Bundle' next quarter.</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3 p-4 bg-warning-50 rounded-lg border border-warning-100">
                            <div className="text-2xl">⚠️</div>
                            <div>
                                <h4 className="font-bold text-warning-900">Engagement Drop</h4>
                                <p className="text-warning-700">Customer <strong>Oxford University</strong> has shown 20% less login activity this month. Recommended action: Schedule a check-in call.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
