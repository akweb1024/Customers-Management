'use client';

import { useState, useEffect } from 'react';

export default function LogisticsPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [couriers, setCouriers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreatingOrder, setIsCreatingOrder] = useState(false);
    const [view, setView] = useState<'ORDERS' | 'COURIERS'>('ORDERS');
    const [userRole, setUserRole] = useState<string>('');

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (user) setUserRole(JSON.parse(user).role);
        fetchOrders();
        fetchCouriers();
    }, []);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/logistics/orders', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setOrders(await res.json());
        } catch (error) { console.error(error); }
    };

    const fetchCouriers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/logistics/couriers', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setCouriers(await res.json());
            else setLoading(false); // finish loading here if orders fail or success
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        const data: any = Object.fromEntries(formData);

        // Manual JSON items handling for demo
        data.items = { "description": "Journal Subscription Package", "qty": 1 };

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/logistics/orders', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (res.ok) {
                setIsCreatingOrder(false);
                fetchOrders();
            } else {
                alert('Failed to create order');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleAddCourier = async () => {
        const name = prompt("Courier Name:");
        if (!name) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/logistics/couriers', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name })
            });

            if (res.ok) fetchCouriers();
        } catch (error) { console.error(error); }
    };

    if (loading) return <div className="p-8 text-center text-secondary-500">Loading logistics...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-secondary-900">Dispatch & Logistics</h1>
                    <p className="text-secondary-500">Manage shipments and courier partners</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setView('ORDERS')}
                        className={`px-4 py-2 rounded-xl text-sm font-bold ${view === 'ORDERS' ? 'bg-primary-600 text-white' : 'bg-white text-secondary-500 hover:bg-secondary-50'}`}
                    >
                        Orders
                    </button>
                    <button
                        onClick={() => setView('COURIERS')}
                        className={`px-4 py-2 rounded-xl text-sm font-bold ${view === 'COURIERS' ? 'bg-primary-600 text-white' : 'bg-white text-secondary-500 hover:bg-secondary-50'}`}
                    >
                        Couriers
                    </button>
                </div>
            </div>

            {view === 'ORDERS' && (
                <>
                    <div className="flex justify-end">
                        <button
                            onClick={() => setIsCreatingOrder(true)}
                            className="btn btn-primary flex items-center gap-2"
                        >
                            <span>+</span> New Shipment
                        </button>
                    </div>

                    <div className="bg-white rounded-3xl border border-secondary-200 overflow-hidden">
                        <table className="w-full text-left text-sm text-secondary-600">
                            <thead className="bg-secondary-50 text-secondary-900 font-bold border-b border-secondary-200">
                                <tr>
                                    <th className="p-4">Recipient</th>
                                    <th className="p-4">Destination</th>
                                    <th className="p-4">Courier</th>
                                    <th className="p-4">Tracking #</th>
                                    <th className="p-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-secondary-100">
                                {orders.map(order => (
                                    <tr key={order.id} className="hover:bg-secondary-50">
                                        <td className="p-4 font-medium text-secondary-900">{order.recipientName}</td>
                                        <td className="p-4">{order.city}, {order.country}</td>
                                        <td className="p-4">{order.courier?.name || '-'}</td>
                                        <td className="p-4 text-xs font-mono">{order.trackingNumber || 'Pending'}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-lg text-xs font-bold uppercase ${order.status === 'DELIVERED' ? 'bg-success-100 text-success-700' : 'bg-secondary-100 text-secondary-700'}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {orders.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-secondary-400">No dispatch orders found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {view === 'COURIERS' && (
                <div className="space-y-4">
                    <div className="flex justify-end">
                        <button
                            onClick={handleAddCourier}
                            className="btn btn-primary flex items-center gap-2"
                        >
                            <span>+</span> Add Courier Partner
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {couriers.map(courier => (
                            <div key={courier.id} className="card-premium p-6 flex flex-col items-center text-center">
                                <div className="p-3 bg-secondary-100 rounded-full mb-3 text-2xl">🚚</div>
                                <h3 className="font-bold text-secondary-900">{courier.name}</h3>
                                {(courier.website) && <a href={courier.website} target="_blank" className="text-xs text-primary-600 hover:underline mt-1">Visit Website</a>}
                                <div className="mt-4 pt-4 border-t border-secondary-50 w-full flex justify-between text-xs text-secondary-500">
                                    <span>Status</span>
                                    <span className="text-success-600 font-bold">Active</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Create Order Modal */}
            {isCreatingOrder && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold mb-4">Create New Shipment</h3>
                        <form onSubmit={handleCreateOrder} className="space-y-4">
                            <div>
                                <label className="label">Recipient Name</label>
                                <input name="recipientName" className="input" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="label">Address</label>
                                    <textarea name="address" className="input" required rows={2} />
                                </div>
                                <div>
                                    <label className="label">City</label>
                                    <input name="city" className="input" required />
                                </div>
                                <div>
                                    <label className="label">State</label>
                                    <input name="state" className="input" required />
                                </div>
                                <div>
                                    <label className="label">Zip/Pincode</label>
                                    <input name="pincode" className="input" required />
                                </div>
                                <div>
                                    <label className="label">Country</label>
                                    <input name="country" className="input" required defaultValue="India" />
                                </div>
                            </div>
                            <div>
                                <label className="label">Phone</label>
                                <input name="phone" className="input" required />
                            </div>
                            <div>
                                <label className="label">Assign Courier</label>
                                <select name="courierId" className="input">
                                    <option value="">Select Courier</option>
                                    {couriers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="label">Tracking Number (Optional)</label>
                                <input name="trackingNumber" className="input" />
                            </div>

                            <div className="flex gap-2 pt-4">
                                <button type="submit" className="btn btn-primary flex-1">Create Order</button>
                                <button type="button" onClick={() => setIsCreatingOrder(false)} className="btn btn-secondary">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
