'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { blogService, BlogPayload } from '@/services/blog.service';
import BlogForm from '@/app/blogs/components/sections/BlogForm'; // Adjust path if your BlogForm is located elsewhere

export default function EditBlogPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    const [blog, setBlog] = useState<BlogPayload | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        const loadBlog = async () => {
            try {
                setLoading(true);
                const data = await blogService.getAdminBlogById(id);
                setBlog(data);
            } catch (err: any) {
                setError(err.message || 'Failed to load blog details');
            } finally {
                setLoading(false);
            }
        };

        loadBlog();
    }, [id]);

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <div>
                <Link
                    href="/manageblogs"
                    className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Manage Blogs
                </Link>
            </div>

            {loading ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
                    <p className="text-sm font-mono text-slate-500 animate-pulse">
                        Loading blog data...
                    </p>
                </div>
            ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                    <p className="text-sm font-semibold text-red-700">{error}</p>
                </div>
            ) : (
                <BlogForm
                    initialData={blog}
                    onSuccess={() => router.push('/manageblogs')}
                />
            )}
        </div>
    );
}