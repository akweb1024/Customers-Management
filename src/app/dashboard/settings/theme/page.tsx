'use client';

import React from 'react';
import { useTheme } from '@/components/theme/ThemeProvider';

const themes = [
    { id: 'light', name: 'Original Light', desc: 'Clean and modern blue/slate' },
    { id: 'dark', name: 'Midnight Neon', desc: 'High contrast dark with neon accents' },
    { id: 'eco', name: 'Eco Sage', desc: 'Natural forest greens and wood tones' },
    { id: 'luxury', name: 'Royal Gold', desc: 'Premium navy and polished gold' },
    { id: 'industrial', name: 'Steel Works', desc: 'Industrial greys with vibrant red' },
    { id: 'minimal', name: 'Stark Minimal', desc: 'Pure black and white aesthetics' }
];

export default function ThemeSettingsPage() {
    const { theme: currentTheme, setTheme } = useTheme();

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Appearance</h1>
                <p className="text-muted-foreground">
                    Customize how your dashboard looks. Choose the aesthetic that best fits your workflow.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {themes.map((theme) => (
                    <button
                        key={theme.id}
                        onClick={() => setTheme(theme.id as any)}
                        className={`group relative text-left card-premium overflow-hidden border-2 transition-all ${currentTheme === theme.id ? 'ring-2 ring-primary-500 ring-offset-2' : 'hover:border-primary-500'
                            }`}
                    >
                        {/* Theme Preview */}
                        <div className={`h-24 -mt-6 -mx-6 mb-4 relative overflow-hidden theme-preview-${theme.id}`}>
                            {/* Visual representation of the theme colors */}
                            <div className="absolute inset-0 flex">
                                <div className={`w-1/3 h-full theme-bg-${theme.id}`}></div>
                                <div className={`w-1/3 h-full theme-primary-${theme.id}`}></div>
                                <div className={`w-1/3 h-full theme-surface-${theme.id}`}></div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-lg">{theme.name}</span>
                                {currentTheme === theme.id && (
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-500 text-white text-xs">
                                        ✓
                                    </span>
                                )}
                            </div>
                            <p className="text-sm opacity-70">{theme.desc}</p>
                        </div>

                        <style jsx>{`
              .theme-bg-light { background-color: #f8fafc; }
              .theme-primary-light { background-color: #2563eb; }
              .theme-surface-light { background-color: #ffffff; }

              .theme-bg-dark { background-color: #121212; }
              .theme-primary-dark { background-color: #00ff9d; }
              .theme-surface-dark { background-color: #1e1e1e; }

              .theme-bg-eco { background-color: #f4f7f0; }
              .theme-primary-eco { background-color: #4a6c40; }
              .theme-surface-eco { background-color: #e8ede4; }

              .theme-bg-luxury { background-color: #0f172a; }
              .theme-primary-luxury { background-color: #d4af37; }
              .theme-surface-luxury { background-color: #1e293b; }

              .theme-bg-industrial { background-color: #2b2d42; }
              .theme-primary-industrial { background-color: #ef233c; }
              .theme-surface-industrial { background-color: #3d405b; }

              .theme-bg-minimal { background-color: #ffffff; }
              .theme-primary-minimal { background-color: #000000; }
              .theme-surface-minimal { background-color: #eeeeee; }
            `}</style>
                    </button>
                ))}
            </div>

            <div className="card-premium">
                <h2 className="text-xl font-bold mb-4">Preview Customization</h2>
                <div className="space-y-6">
                    <div className="flex gap-4">
                        <button className="btn btn-primary">Primary Button</button>
                        <button className="btn btn-outline">Outline Button</button>
                        <button className="btn btn-secondary">Secondary</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="label">Sample Input</label>
                            <input type="text" className="input" placeholder="Type something..." defaultValue="Sample text" />
                        </div>
                        <div className="p-4 rounded border border-dashed border-current opacity-30">
                            <p>Muted text example for checking visibility.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
