'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function CourseDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [course, setCourse] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState<string>('');

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (user) setUserRole(JSON.parse(user).role);
        fetchCourse();
    }, [id]);

    const fetchCourse = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/courses/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setCourse(await res.json());
            } else {
                router.push('/dashboard/courses');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handlePublishToggle = async () => {
        if (!confirm(`Are you sure you want to ${course.isPublished ? 'unpublish' : 'publish'} this course?`)) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/courses/${id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ isPublished: !course.isPublished })
            });

            if (res.ok) {
                fetchCourse();
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <div className="p-8 text-center text-secondary-500">Loading course details...</div>;
    if (!course) return null;

    const isInstructor = ['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(userRole);
    const enrolled = course.enrollments && course.enrollments.length > 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-3xl p-8 border border-secondary-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-500 to-secondary-500"></div>
                <div className="flex flex-col md:flex-row gap-8">
                    <div className="w-full md:w-1/3 aspect-video bg-secondary-100 rounded-2xl overflow-hidden relative">
                        {course.thumbnailUrl ? (
                            <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-6xl opacity-20">🎓</div>
                        )}
                    </div>
                    <div className="flex-1 space-y-4">
                        <div className="flex justify-between items-start">
                            <h1 className="text-3xl font-black text-secondary-900">{course.title}</h1>
                            {isInstructor && (
                                <button
                                    onClick={handlePublishToggle}
                                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${course.isPublished ? 'bg-success-100 text-success-700' : 'bg-warning-100 text-warning-700'}`}
                                >
                                    {course.isPublished ? 'Published' : 'Draft'}
                                </button>
                            )}
                        </div>
                        <p className="text-secondary-600 leading-relaxed">{course.description}</p>

                        <div className="flex items-center gap-6 text-sm text-secondary-500">
                            <span>👤 {course.instructor?.email?.split('@')[0] || 'Unknown Instructor'}</span>
                            <span>💳 {course.price === 0 ? 'Free' : `${course.currency} ${course.price}`}</span>
                            <span>📅 Created: {new Date(course.createdAt).toLocaleDateString()}</span>
                        </div>

                        <div className="pt-4">
                            {enrolled ? (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold text-secondary-600">
                                        <span>Your Progress</span>
                                        <span>{Math.round(course.enrollments[0].progress)}%</span>
                                    </div>
                                    <div className="w-full bg-secondary-100 rounded-full h-2">
                                        <div className="bg-success-500 h-2 rounded-full" style={{ width: `${course.enrollments[0].progress}%` }}></div>
                                    </div>
                                    <button className="btn btn-primary w-full mt-4">Continue Learning</button>
                                </div>
                            ) : (
                                <button className="btn btn-primary w-full md:w-1/2 py-3 text-lg font-bold">
                                    {course.price === 0 ? 'Enroll Now for Free' : `Buy Course for ${course.currency} ${course.price}`}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Curriculum */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-secondary-900">Course Curriculum</h2>
                        {isInstructor && (
                            <button className="text-primary-600 text-sm font-bold hover:underline">+ Add Module</button>
                        )}
                    </div>

                    <div className="space-y-4">
                        {course.modules && course.modules.length > 0 ? (
                            course.modules.map((module: any) => (
                                <div key={module.id} className="bg-white rounded-2xl border border-secondary-200 overflow-hidden">
                                    <div className="p-4 bg-secondary-50 border-b border-secondary-100 flex justify-between items-center">
                                        <h3 className="font-bold text-secondary-800">{module.title}</h3>
                                        {isInstructor && <button className="text-xs text-primary-600 font-bold hover:underline">+ Lesson</button>}
                                    </div>
                                    <div className="divide-y divide-secondary-50">
                                        {module.lessons.map((lesson: any) => (
                                            <div key={lesson.id} className="p-4 flex justify-between items-center hover:bg-secondary-50 transition-colors cursor-pointer group">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${lesson.progress?.length > 0 && lesson.progress[0].isCompleted ? 'bg-success-100 text-success-600' : 'bg-secondary-200 text-secondary-500'}`}>
                                                        {lesson.progress?.length > 0 && lesson.progress[0].isCompleted ? '✓' : (lesson.type === 'VIDEO' ? '▶' : '📄')}
                                                    </div>
                                                    <span className="text-sm font-medium text-secondary-700 group-hover:text-primary-600">{lesson.title}</span>
                                                </div>
                                                <span className="text-xs text-secondary-400">{lesson.duration ? `${Math.floor(lesson.duration / 60)}m` : 'Text'}</span>
                                            </div>
                                        ))}
                                        {module.lessons.length === 0 && (
                                            <div className="p-4 text-center text-xs text-secondary-400 italic">No lessons in this module yet.</div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 bg-secondary-50 rounded-2xl border border-dashed border-secondary-200">
                                <p className="text-secondary-500">No content added yet.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar (Instructor Tools / Stats) */}
                <div className="space-y-6">
                    {isInstructor && (
                        <div className="card-premium p-6 space-y-4">
                            <h3 className="font-bold text-secondary-900 border-b border-secondary-100 pb-2">Instructor Tools</h3>
                            <div className="space-y-2">
                                <button className="w-full text-left px-4 py-2 bg-secondary-50 hover:bg-secondary-100 rounded-xl text-sm font-medium transition-colors">
                                    ⚙️ Course Settings
                                </button>
                                <button className="w-full text-left px-4 py-2 bg-secondary-50 hover:bg-secondary-100 rounded-xl text-sm font-medium transition-colors">
                                    👥 Manage Students
                                </button>
                                <button className="w-full text-left px-4 py-2 bg-secondary-50 hover:bg-secondary-100 rounded-xl text-sm font-medium transition-colors">
                                    📊 Course Analytics
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
