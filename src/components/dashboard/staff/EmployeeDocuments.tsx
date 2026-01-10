'use client';

import { useState } from 'react';
import { useDigitalDocuments, useDigitalDocumentMutations } from '@/hooks/useHR';
import { FileText, CheckCircle2, Clock, ShieldCheck, Download, Eye, X } from 'lucide-react';

export default function EmployeeDocuments() {
    const { data: documents, isLoading } = useDigitalDocuments();
    const { sign } = useDigitalDocumentMutations();
    const [viewingDoc, setViewingDoc] = useState<any>(null);
    const [isSigning, setIsSigning] = useState(false);

    const handleSign = async () => {
        try {
            await sign.mutateAsync({ id: viewingDoc.id });
            alert('Document signed successfully!');
            setViewingDoc(null);
            setIsSigning(false);
        } catch (err) {
            alert('Failed to sign document');
        }
    };

    if (isLoading) return <div className="p-10 text-center font-bold text-secondary-400">Loading your documents...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                {documents?.map((doc: any) => (
                    <div
                        key={doc.id}
                        className={`card-premium p-6 group transition-all duration-300 ${doc.status === 'PENDING' ? 'border-l-4 border-l-warning-500 hover:shadow-xl' : 'border-l-4 border-l-success-500 opacity-80'}`}
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-3 rounded-2xl ${doc.status === 'PENDING' ? 'bg-warning-50 text-warning-600' : 'bg-success-50 text-success-600'}`}>
                                <FileText size={20} />
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${doc.status === 'PENDING' ? 'bg-warning-50 text-warning-700' : 'bg-success-50 text-success-700'}`}>
                                {doc.status}
                            </span>
                        </div>

                        <h4 className="text-xl font-black text-secondary-900 tracking-tight leading-tight">{doc.title}</h4>
                        <div className="mt-2 flex items-center gap-2 text-[10px] font-bold text-secondary-400 uppercase tracking-widest">
                            <Clock size={12} /> Issued {new Date(doc.createdAt).toLocaleDateString()}
                        </div>

                        <div className="mt-8 flex gap-3">
                            <button
                                onClick={() => setViewingDoc(doc)}
                                className="flex-1 btn bg-secondary-900 text-white py-3 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2"
                            >
                                <Eye size={14} /> {doc.status === 'PENDING' ? 'View & Sign' : 'View Snapshot'}
                            </button>
                            <button className="p-3 bg-secondary-100 text-secondary-600 rounded-xl hover:bg-secondary-200 transition-colors">
                                <Download size={16} />
                            </button>
                        </div>
                    </div>
                ))}

                {documents?.length === 0 && (
                    <div className="col-span-full py-40 text-center card-premium border-dashed border-4 border-secondary-100 bg-secondary-50/20">
                        <ShieldCheck size={64} className="mx-auto text-secondary-200 mb-6" />
                        <h3 className="text-2xl font-black text-secondary-900 tracking-tight">No documents for signing.</h3>
                        <p className="text-secondary-500 font-medium mt-2">All your compliance paperwork is up to date.</p>
                    </div>
                )}
            </div>

            {viewingDoc && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-secondary-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-secondary-50 flex justify-between items-center bg-secondary-50/30">
                            <div>
                                <h3 className="text-xl font-black text-secondary-900 tracking-tight uppercase tracking-widest text-sm">{viewingDoc.title}</h3>
                                <p className="text-[10px] font-black text-secondary-400 uppercase tracking-widest mt-1">Ref ID: {viewingDoc.id.slice(0, 8)}</p>
                            </div>
                            <button onClick={() => { setViewingDoc(null); setIsSigning(false); }} className="p-2 hover:bg-white rounded-full transition-colors text-secondary-400 hover:text-secondary-900 shadow-sm border border-transparent hover:border-secondary-100">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-12 bg-[#fcfcfc]">
                            <div className="bg-white shadow-sm border border-secondary-100 p-16 min-h-screen text-secondary-800 leading-relaxed font-serif" dangerouslySetInnerHTML={{ __html: viewingDoc.content }} />
                        </div>

                        <div className="p-8 bg-white border-t border-secondary-50">
                            {viewingDoc.status === 'PENDING' ? (
                                <div className="flex flex-col items-center gap-6">
                                    {!isSigning ? (
                                        <button
                                            onClick={() => setIsSigning(true)}
                                            className="btn bg-primary-600 hover:bg-primary-700 text-white px-16 py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-primary-100 animate-in slide-in-from-bottom duration-500"
                                        >
                                            Sign Digitally
                                        </button>
                                    ) : (
                                        <div className="w-full flex flex-col items-center gap-6 animate-in zoom-in-95 duration-300">
                                            <div className="bg-primary-50 p-6 rounded-[2rem] border border-primary-100 text-center max-w-md">
                                                <p className="text-sm font-bold text-primary-900 mb-4">By clicking confirm, you agree that your digital signature holds the same legal value as a physical signature.</p>
                                                <p className="text-[10px] font-black text-primary-400 uppercase">IP Address and Timestamp will be recorded.</p>
                                            </div>
                                            <div className="flex gap-4">
                                                <button onClick={() => setIsSigning(false)} className="btn bg-secondary-100 text-secondary-600 px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest">Cancel</button>
                                                <button onClick={handleSign} className="btn bg-success-600 hover:bg-success-700 text-white px-12 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-success-100 flex items-center gap-2">
                                                    <CheckCircle2 size={16} /> Confirm Signature
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2">
                                    <div className="flex items-center gap-3 text-success-600">
                                        <ShieldCheck size={28} />
                                        <p className="text-2xl font-black tracking-tight">Digitally Signed</p>
                                    </div>
                                    <p className="text-[10px] font-black text-secondary-400 uppercase tracking-[0.2em] mt-2">
                                        Verified on {new Date(viewingDoc.signedAt).toLocaleString()} • IP: {viewingDoc.signatureIp}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
