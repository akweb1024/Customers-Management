import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchJson } from '@/lib/api-utils';

export function useJobPostings(params?: { status?: string, departmentId?: string }) {
    const queryKey = ['job-postings', params?.status, params?.departmentId];
    return useQuery<any[]>({
        queryKey,
        queryFn: () => {
            const searchParams = new URLSearchParams();
            if (params?.status) searchParams.append('status', params.status);
            if (params?.departmentId) searchParams.append('departmentId', params.departmentId);
            return fetchJson(`/api/recruitment/jobs?${searchParams.toString()}`);
        }
    });
}

export function useJobMutations() {
    const queryClient = useQueryClient();

    const createJob = useMutation({
        mutationFn: (data: any) => fetchJson('/api/recruitment/jobs', 'POST', data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['job-postings'] })
    });

    const updateJob = useMutation({
        mutationFn: (data: any) => fetchJson('/api/recruitment/jobs', 'PATCH', data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['job-postings'] })
    });

    return { createJob, updateJob };
}

export function useJobApplications(jobId?: string) {
    const queryKey = ['job-applications', jobId];
    return useQuery<any[]>({
        queryKey,
        queryFn: () => {
            const url = jobId ? `/api/recruitment/applications?jobId=${jobId}` : '/api/recruitment/applications';
            return fetchJson(url);
        }
    });
}

export function useApplicationMutations() {
    const queryClient = useQueryClient();

    const updateStatus = useMutation({
        mutationFn: (data: any) => fetchJson('/api/recruitment/applications', 'PATCH', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['job-applications'] });
            queryClient.invalidateQueries({ queryKey: ['job-postings'] }); // For count updates
        }
    });

    return { updateStatus };
}

export function useInterviews(applicationId?: string) {
    return useQuery<any[]>({
        queryKey: ['interviews', applicationId],
        queryFn: () => {
            const url = applicationId ? `/api/recruitment/interviews?applicationId=${applicationId}` : '/api/recruitment/interviews';
            return fetchJson(url);
        }
    });
}

export function useInterviewMutations() {
    const queryClient = useQueryClient();

    const scheduleInterview = useMutation({
        mutationFn: (data: any) => fetchJson('/api/recruitment/interviews', 'POST', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['interviews'] });
            queryClient.invalidateQueries({ queryKey: ['job-applications'] });
        }
    });

    const updateFeedback = useMutation({
        mutationFn: (data: any) => fetchJson('/api/recruitment/interviews', 'PATCH', data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['interviews'] })
    });

    return { scheduleInterview, updateFeedback };
}
