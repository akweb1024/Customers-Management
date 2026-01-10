'use client';

import { useState, useEffect } from 'react';
import { useTaxDeclarations } from '@/hooks/useHR';
import { ShieldCheck, Info, Upload, Save, CheckCircle, Clock, XCircle, IndianRupee } from 'lucide-react';

export default function TaxDeclarationPortal() {
    const { data: declaration, submit, uploadProof } = useTaxDeclarations();
    const [formData, setFormData] = useState<any>({
        fiscalYear: "2023-24",
        regime: 'NEW',
        section80C: 0,
        section80D: 0,
        nps: 0,
        hraRentPaid: 0,
        homeLoanInterest: 0,
        otherIncome: 0,
    });
    const [uploading, setUploading] = useState<string | null>(null);

    useEffect(() => {
        if (declaration && declaration.id) {
            setFormData(declaration);
        }
    }, [declaration]);

    const handleSave = async (status: string) => {
        try {
            await submit.mutateAsync({ ...formData, status });
            alert(`Declaration ${status === 'SUBMITTED' ? 'submitted' : 'saved as draft'}!`);
        } catch (err) {
            alert('Failed to save declaration');
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, category: string) => {
        const file = e.target.files?.[0];
        if (!file || !declaration?.id) return;

        setUploading(category);
        const fd = new FormData();
        fd.append('file', file);
        fd.append('category', category);
        fd.append('taxDeclarationId', declaration.id);

        try {
            await uploadProof.mutateAsync(fd);
            alert('Proof uploaded successfully!');
        } catch (err) {
            alert('Upload failed');
        } finally {
            setUploading(null);
        }
    };

    const StatusBadge = ({ status }: { status: string }) => {
        switch (status) {
            case 'APPROVED': return <span className="flex items-center gap-1.5 px-3 py-1 bg-success-50 text-success-700 rounded-full text-[10px] font-black uppercase"><CheckCircle size={12} /> Approved</span>;
            case 'SUBMITTED': return <span className="flex items-center gap-1.5 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-[10px] font-black uppercase"><Clock size={12} /> Pending Review</span>;
            case 'REJECTED': return <span className="flex items-center gap-1.5 px-3 py-1 bg-danger-50 text-danger-700 rounded-full text-[10px] font-black uppercase"><XCircle size={12} /> Rejected</span>;
            default: return <span className="flex items-center gap-1.5 px-3 py-1 bg-secondary-100 text-secondary-600 rounded-full text-[10px] font-black uppercase">Draft</span>;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="bg-white rounded-3xl p-8 border border-secondary-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                    <ShieldCheck size={120} />
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-3xl font-black text-secondary-900 tracking-tight">Tax Investment Declaration</h3>
                            <StatusBadge status={declaration?.status || 'DRAFT'} />
                        </div>
                        <p className="text-secondary-500 text-sm font-medium">Declare your planned investments for fiscal year <span className="text-primary-600 font-bold">{formData.fiscalYear}</span></p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => handleSave('DRAFT')}
                            className="btn bg-secondary-100 hover:bg-secondary-200 text-secondary-700 px-6 py-3 rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all"
                        >
                            Save Draft
                        </button>
                        <button
                            onClick={() => handleSave('SUBMITTED')}
                            className="btn bg-primary-600 hover:bg-primary-700 text-white px-10 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-primary-200 transition-all font-bold uppercase tracking-widest text-[10px]"
                        >
                            <Upload size={16} /> Submit for Approval
                        </button>
                    </div>
                </div>

                {declaration?.adminComment && (
                    <div className="mb-10 p-5 bg-danger-50 border border-danger-100 rounded-2xl flex gap-4 items-start">
                        <XCircle className="text-danger-500 mt-1" size={20} />
                        <div>
                            <p className="font-bold text-danger-900 text-sm italic">Admin Feedback:</p>
                            <p className="text-danger-800 text-xs mt-1 font-medium">{declaration.adminComment}</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-8">
                        <div>
                            <h4 className="text-[10px] font-black text-secondary-400 uppercase tracking-widest mb-6 py-2 border-b border-secondary-50">Tax Regime Preference</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setFormData({ ...formData, regime: 'OLD' })}
                                    className={`p-5 rounded-2xl border-2 transition-all text-left ${formData.regime === 'OLD' ? 'border-primary-600 bg-primary-50/50 ring-4 ring-primary-50' : 'border-secondary-100 hover:border-secondary-200'}`}
                                >
                                    <p className="font-black text-secondary-900 text-lg">OLD Regime</p>
                                    <p className="text-[10px] text-secondary-500 font-medium mt-1 leading-relaxed">Higher slabs but allows all exemptions (80C, HRA, Insurance).</p>
                                </button>
                                <button
                                    onClick={() => setFormData({ ...formData, regime: 'NEW' })}
                                    className={`p-5 rounded-2xl border-2 transition-all text-left ${formData.regime === 'NEW' ? 'border-primary-600 bg-primary-50/50 ring-4 ring-primary-50' : 'border-secondary-100 hover:border-secondary-200'}`}
                                >
                                    <p className="font-black text-secondary-900 text-lg">NEW Regime</p>
                                    <p className="text-[10px] text-secondary-500 font-medium mt-1 leading-relaxed">Lower tax rates but most exemptions are removed.</p>
                                </button>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h4 className="text-[10px] font-black text-secondary-400 uppercase tracking-widest mb-2 py-2 border-b border-secondary-50">Deductible Investments</h4>

                            {[
                                { id: 'section80C', label: 'Section 80C (LIC, PPF, ELSS)', info: 'Max limit ₹1,50,000' },
                                { id: 'section80D', label: 'Section 80D (Health Insurance)', info: 'Self, Spouse, Children' },
                                { id: 'nps', label: 'NPS (Additional)', info: 'Up to ₹50,000 extra under 80CCD' },
                                { id: 'hraRentPaid', label: 'Annual Rent Paid', info: 'Required for HRA exemption' },
                                { id: 'homeLoanInterest', label: 'Home Loan Interest (Section 24)', info: 'Self-occupied property' }
                            ].map(field => (
                                <div key={field.id} className="group">
                                    <div className="flex justify-between items-end mb-2">
                                        <label className="text-[11px] font-black text-secondary-700 uppercase tracking-wider">{field.label}</label>
                                        <span className="text-[9px] font-bold text-secondary-400 italic">{field.info}</span>
                                    </div>
                                    <div className="relative">
                                        <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-300" size={14} />
                                        <input
                                            type="number"
                                            value={formData[field.id]}
                                            onChange={e => setFormData({ ...formData, [field.id]: parseFloat(e.target.value) || 0 })}
                                            className="input w-full pl-10 bg-secondary-50 border-secondary-100 font-bold focus:bg-white focus:ring-4 focus:ring-primary-50 transition-all"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-[10px] font-black text-secondary-400 uppercase tracking-widest mb-6 py-2 border-b border-secondary-50">Investment Proofs (Upload)</h4>
                        <div className="space-y-4">
                            {!declaration?.id ? (
                                <div className="p-8 text-center bg-secondary-50 rounded-3xl border border-dashed border-secondary-200">
                                    <Clock className="mx-auto text-secondary-300 mb-4" size={32} />
                                    <p className="text-secondary-500 font-bold text-sm leading-relaxed">Save your declaration as a draft first to enable document uploads.</p>
                                </div>
                            ) : (
                                <>
                                    {[
                                        { category: '80C', label: 'LIC / PPF Receipts' },
                                        { category: '80D', label: 'Medical Policy' },
                                        { category: 'HRA', label: 'Rent Receipts / Agreement' },
                                        { category: 'HOUSING', label: 'Interest Certificate' }
                                    ].map(proof => (
                                        <div key={proof.category} className="p-5 flex items-center justify-between bg-secondary-50/50 hover:bg-white border border-secondary-100 rounded-2xl transition-all group">
                                            <div>
                                                <p className="font-bold text-secondary-900 text-sm">{proof.label}</p>
                                                <p className="text-[10px] text-secondary-400 font-medium">
                                                    {declaration.proofs?.find((p: any) => p.category === proof.category) ? (
                                                        <span className="text-success-600 font-black">✓ Document Uploaded</span>
                                                    ) : 'Required if investing'}
                                                </p>
                                            </div>
                                            <div className="relative h-10 w-32">
                                                <input
                                                    type="file"
                                                    onChange={e => handleFileUpload(e, proof.category)}
                                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                />
                                                <div className={`absolute inset-0 flex items-center justify-center gap-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${uploading === proof.category ? 'bg-secondary-200 text-secondary-500 animate-pulse' : 'bg-white text-primary-600 border border-secondary-200 shadow-sm group-hover:bg-primary-600 group-hover:text-white group-hover:border-primary-600'}`}>
                                                    <Upload size={14} /> {uploading === proof.category ? 'Wait...' : 'Upload'}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>

                        <div className="mt-12 p-6 bg-primary-50 rounded-3xl border border-primary-100 flex gap-4">
                            <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary-600 shrink-0">
                                <Info size={20} />
                            </div>
                            <div>
                                <h5 className="font-bold text-primary-900 text-sm">Pro Tip: Old vs New Regime</h5>
                                <p className="text-primary-700 text-[11px] mt-1 font-medium leading-relaxed">
                                    If your total deductions (80C + HRA + Standard Deduction) are less than ₹2.5 Lakhs annually, the <strong>NEW Regime</strong> is usually more beneficial for you.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
