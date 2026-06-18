import { getAuthToken } from '@/lib/auth';
import { get as _get, post as _post, put as _put, patch as _patch, remove as _remove } from './api';

type RequestOptions = Parameters<typeof _get>[2];

async function resolveOptions(options?: RequestOptions): Promise<RequestOptions> {
    if (!options?.useAuthToken || options.token) return options;
    const token = await getAuthToken();
    return { ...options, token };
}

export async function get<TResult>(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined> | any,
    options?: RequestOptions
): Promise<TResult> {
    return _get<TResult>(endpoint, params, await resolveOptions(options));
}

export async function post<TResult, TBody = unknown>(
    endpoint: string,
    body?: TBody,
    options?: RequestOptions
): Promise<TResult> {
    return _post<TResult, TBody>(endpoint, body, await resolveOptions(options));
}

export async function put<TResult, TBody = unknown>(
    endpoint: string,
    body?: TBody,
    options?: RequestOptions
): Promise<TResult> {
    return _put<TResult, TBody>(endpoint, body, await resolveOptions(options));
}

export async function patch<TResult, TBody = unknown>(
    endpoint: string,
    body?: TBody,
    options?: RequestOptions
): Promise<TResult> {
    return _patch<TResult, TBody>(endpoint, body, await resolveOptions(options));
}

export async function remove<TResult>(
    endpoint: string,
    options?: RequestOptions
): Promise<TResult> {
    return _remove<TResult>(endpoint, await resolveOptions(options));
}
