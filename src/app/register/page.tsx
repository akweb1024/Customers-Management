'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type CustomerType = 'INDIVIDUAL' | 'INSTITUTION' | 'AGENCY';

export default function RegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState(1);

    const [formData, setFormData] = useState({
        // Step 1: Account Type
        customerType: '' as CustomerType | '',

        // Step 2: Account Details
        email: '',
        password: '',
        confirmPassword: '',

        // Step 3: Profile Details
        name: '',
        organizationName: '',
        primaryPhone: '',
        country: '',

        // Institution-specific
        category: '',

        // Agency-specific
        territory: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (step < 3) {
            // Validation for each step
            if (step === 1 && !formData.customerType) {
                setError('Please select an account type');
                return;
            }

            if (step === 2) {
                if (!formData.email || !formData.password) {
                    setError('Please fill in all required fields');
                    return;
                }
                if (formData.password !== formData.confirmPassword) {
                    setError('Passwords do not match');
                    return;
                }
                if (formData.password.length < 8) {
                    setError('Password must be at least 8 characters');
                    return;
                }
            }

            setStep(step + 1);
            return;
        }

        // Final submission
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            // Success - redirect to login
            router.push('/login?registered=true');
        } catch (err: any) {
            setError(err.message || 'An error occurred during registration');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block mb-4">
                        <h1 className="text-3xl font-bold text-gradient">STM Customer</h1>
                    </Link>
                    <h2 className="text-3xl font-bold text-secondary-900 mb-2">Create Your Account</h2>
                    <p className="text-secondary-600">Join our platform and manage your subscriptions</p>
                </div>

                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-center space-x-4">
                        <div className={`flex items-center ${step >= 1 ? 'text-primary-600' : 'text-secondary-400'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-primary-600 text-white' : 'bg-secondary-200'
                                }`}>
                                1
                            </div>
                            <span className="ml-2 hidden sm:inline">Type</span>
                        </div>
                        <div className="w-16 h-0.5 bg-secondary-300"></div>
                        <div className={`flex items-center ${step >= 2 ? 'text-primary-600' : 'text-secondary-400'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-primary-600 text-white' : 'bg-secondary-200'
                                }`}>
                                2
                            </div>
                            <span className="ml-2 hidden sm:inline">Account</span>
                        </div>
                        <div className="w-16 h-0.5 bg-secondary-300"></div>
                        <div className={`flex items-center ${step >= 3 ? 'text-primary-600' : 'text-secondary-400'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 3 ? 'bg-primary-600 text-white' : 'bg-secondary-200'
                                }`}>
                                3
                            </div>
                            <span className="ml-2 hidden sm:inline">Profile</span>
                        </div>
                    </div>
                </div>

                {/* Form Card */}
                <div className="card-premium">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        {/* Step 1: Account Type Selection */}
                        {step === 1 && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-secondary-900">Select Account Type</h3>

                                <div className="grid md:grid-cols-3 gap-4">
                                    <label className={`cursor-pointer ${formData.customerType === 'INDIVIDUAL' ? 'ring-2 ring-primary-500' : ''
                                        }`}>
                                        <input
                                            type="radio"
                                            name="customerType"
                                            value="INDIVIDUAL"
                                            checked={formData.customerType === 'INDIVIDUAL'}
                                            onChange={handleChange}
                                            className="sr-only"
                                        />
                                        <div className="card-premium text-center hover:shadow-lg transition-shadow p-6">
                                            <div className="text-4xl mb-3">👤</div>
                                            <h4 className="font-bold text-lg mb-2">Individual</h4>
                                            <p className="text-sm text-secondary-600">Personal subscription management</p>
                                        </div>
                                    </label>

                                    <label className={`cursor-pointer ${formData.customerType === 'INSTITUTION' ? 'ring-2 ring-primary-500' : ''
                                        }`}>
                                        <input
                                            type="radio"
                                            name="customerType"
                                            value="INSTITUTION"
                                            checked={formData.customerType === 'INSTITUTION'}
                                            onChange={handleChange}
                                            className="sr-only"
                                        />
                                        <div className="card-premium text-center hover:shadow-lg transition-shadow p-6">
                                            <div className="text-4xl mb-3">🏛️</div>
                                            <h4 className="font-bold text-lg mb-2">Institution</h4>
                                            <p className="text-sm text-secondary-600">University, library, or company</p>
                                        </div>
                                    </label>

                                    <label className={`cursor-pointer ${formData.customerType === 'AGENCY' ? 'ring-2 ring-primary-500' : ''
                                        }`}>
                                        <input
                                            type="radio"
                                            name="customerType"
                                            value="AGENCY"
                                            checked={formData.customerType === 'AGENCY'}
                                            onChange={handleChange}
                                            className="sr-only"
                                        />
                                        <div className="card-premium text-center hover:shadow-lg transition-shadow p-6">
                                            <div className="text-4xl mb-3">🤝</div>
                                            <h4 className="font-bold text-lg mb-2">Agency</h4>
                                            <p className="text-sm text-secondary-600">Subscription agency partner</p>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Account Credentials */}
                        {step === 2 && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-secondary-900">Account Credentials</h3>

                                <div>
                                    <label className="label">Email Address *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="input"
                                        placeholder="your@email.com"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="label">Password *</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="input"
                                        placeholder="Min. 8 characters"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="label">Confirm Password *</label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="input"
                                        placeholder="Re-enter password"
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 3: Profile Details */}
                        {step === 3 && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-secondary-900">Profile Information</h3>

                                <div>
                                    <label className="label">
                                        {formData.customerType === 'INDIVIDUAL' ? 'Full Name' : 'Primary Contact Name'} *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="input"
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>

                                {(formData.customerType === 'INSTITUTION' || formData.customerType === 'AGENCY') && (
                                    <div>
                                        <label className="label">Organization Name *</label>
                                        <input
                                            type="text"
                                            name="organizationName"
                                            value={formData.organizationName}
                                            onChange={handleChange}
                                            className="input"
                                            placeholder="Organization name"
                                            required
                                        />
                                    </div>
                                )}

                                {formData.customerType === 'INSTITUTION' && (
                                    <div>
                                        <label className="label">Institution Category *</label>
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleChange}
                                            className="input"
                                            required
                                        >
                                            <option value="">Select category</option>
                                            <option value="University">University</option>
                                            <option value="College">College</option>
                                            <option value="Library">Library</option>
                                            <option value="Company">Company/Corporate</option>
                                            <option value="Government">Government</option>
                                            <option value="Research">Research Institution</option>
                                        </select>
                                    </div>
                                )}

                                {formData.customerType === 'AGENCY' && (
                                    <div>
                                        <label className="label">Territory/Region *</label>
                                        <input
                                            type="text"
                                            name="territory"
                                            value={formData.territory}
                                            onChange={handleChange}
                                            className="input"
                                            placeholder="e.g., North America"
                                            required
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="label">Phone Number *</label>
                                    <input
                                        type="tel"
                                        name="primaryPhone"
                                        value={formData.primaryPhone}
                                        onChange={handleChange}
                                        className="input"
                                        placeholder="+1 234 567 8900"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="label">Country *</label>
                                    <input
                                        type="text"
                                        name="country"
                                        value={formData.country}
                                        onChange={handleChange}
                                        className="input"
                                        placeholder="Country"
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between pt-4">
                            {step > 1 && (
                                <button
                                    type="button"
                                    onClick={() => setStep(step - 1)}
                                    className="btn btn-secondary"
                                >
                                    ← Back
                                </button>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className={`btn btn-primary ml-auto ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'Creating Account...' : step === 3 ? 'Create Account' : 'Continue →'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center text-sm text-secondary-600">
                        Already have an account?{' '}
                        <Link href="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
                            Sign in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
