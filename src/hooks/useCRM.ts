import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const fetchJson = async (url: string, method: string = 'GET', body?: any) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const res = await fetch(url, {
        method,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        ...(body ? { body: JSON.stringify(body) } : {})
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `API Error: ${res.statusText}`);
    }
    return res.json();
};

export const useCustomer = (id: string, enabled: boolean = true) => {
    return useQuery({
        queryKey: ['customer', id],
        queryFn: () => fetchJson(`/api/customers/${id}`),
        enabled: !!id && enabled
    });
};

export const useCRMMutations = () => {
    const queryClient = useQueryClient();

    const createCommunication = useMutation({
        mutationFn: (payload: any) => fetchJson('/api/communications', 'POST', payload),
        onSuccess: (data) => {
            // Invalidate customer queries to refresh the history
            queryClient.invalidateQueries({ queryKey: ['customer', data.customerProfileId] });
            queryClient.invalidateQueries({ queryKey: ['customers'] });
        }
    });

    return {
        createCommunication
    };
};

export const useCustomerMutations = () => {
    const queryClient = useQueryClient();

    const updateCustomer = useMutation({
        mutationFn: ({ id, ...payload }: any) => fetchJson(`/api/customers/${id}`, 'PATCH', payload),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['customer', data.id] });
            queryClient.invalidateQueries({ queryKey: ['customers'] });
        }
    });

    const updateCommunicationLog = useMutation({
        mutationFn: ({ id, ...payload }: any) => fetchJson(`/api/communications/${id}`, 'PATCH', payload),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['customer', data.customerProfileId] });
        }
    });

    return {
        updateCustomer,
        updateCommunicationLog
    };
};
