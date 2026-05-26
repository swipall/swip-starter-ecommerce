import { getAuthToken } from '@/lib/auth';

const SWIPALL_API_URL = process.env.SWIPALL_SHOP_API_URL || process.env.NEXT_PUBLIC_SWIPALL_SHOP_API_URL;
const SWIPALL_AUTH_TOKEN_HEADER = process.env.SWIPALL_AUTH_TOKEN_HEADER || 'Authorization';
const IS_BUILD_TIME = process.env.NEXT_PHASE === 'phase-production-build' || process.env.NODE_ENV === 'production' && !process.env.SWIPALL_SHOP_API_URL && !process.env.NEXT_PUBLIC_SWIPALL_SHOP_API_URL;

interface SwipallRequestOptions {
    token?: string;
    useAuthToken?: boolean;
    fetch?: RequestInit;
    tags?: string[];
}

interface SwipallResponse<T> {
    error?: {
        message: string;
        code?: string;
        [key: string]: unknown;
    };
    errors?: Array<{ message: string;[key: string]: unknown }>;
}

interface SwipallErrorContext {
    status?: number;
    method?: string;
    endpoint?: string;
    errorData?: any;
    message: string;
}

class SwipallAPIError extends Error {
    public status?: number;
    public method?: string;
    public endpoint?: string;
    public errorData?: any;

    constructor(context: SwipallErrorContext) {
        super(context.message);
        this.name = 'SwipallAPIError';
        this.status = context.status;
        this.method = context.method;
        this.endpoint = context.endpoint;
        this.errorData = context.errorData;
        Object.setPrototypeOf(this, SwipallAPIError.prototype);
    }
}

/**
 * Extract the Swipall JWT token from response headers (if returned)
 */
function extractAuthToken(headers: Headers): string | null {
    const authHeader = headers.get(SWIPALL_AUTH_TOKEN_HEADER);
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }
    return authHeader;
}

/**
 * Execute a GET request against the Swipall REST API
 */
export async function get<TResult>(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined> | any,
    options?: SwipallRequestOptions
): Promise<TResult> {
    // Build query string from params
    let url = endpoint;
    if (params) {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
                queryParams.append(key, String(value));
            }
        });
        const queryString = queryParams.toString();
        if (queryString) {
            url = `${endpoint}?${queryString}`;
        }
    }
    return request<TResult>('GET', url, undefined, options);
}

/**
 * Execute a POST request against the Swipall REST API
 */
export async function post<TResult, TBody = unknown>(
    endpoint: string,
    body?: TBody,
    options?: SwipallRequestOptions
): Promise<TResult> {
    return request<TResult>('POST', endpoint, body, options);
}

/**
 * Execute a PUT request against the Swipall REST API
 */
export async function put<TResult, TBody = unknown>(
    endpoint: string,
    body?: TBody,
    options?: SwipallRequestOptions
): Promise<TResult> {
    return request<TResult>('PUT', endpoint, body, options);
}

/**
 * Execute a PATCH request against the Swipall REST API
 */
export async function patch<TResult, TBody = unknown>(
    endpoint: string,
    body?: TBody,
    options?: SwipallRequestOptions
): Promise<TResult> {
    return request<TResult>('PATCH', endpoint, body, options);
}

/**
 * Execute a DELETE request against the Swipall REST API
 */
export async function remove<TResult>(
    endpoint: string,
    options?: SwipallRequestOptions
): Promise<TResult> {
    return request<TResult>('DELETE', endpoint, undefined, options);
}

function emptyDataFor<TResult>(endpoint: string): TResult {
    const listPatterns = ['/items', '/search', '/posts', '/taxonomies', '/addresses', '/shipping-methods', '/payment-methods'];
    if (listPatterns.some(p => endpoint.includes(p))) {
        return { results: [], count: 0, next: null, previous: null } as TResult;
    }
    return {} as TResult;
}

/**
 * Generic request function for Swipall REST API
 */
async function request<TResult>(
    method: string,
    endpoint: string,
    body?: unknown,
    options?: SwipallRequestOptions
): Promise<TResult> {
    // Return empty data during build time if API URL is not configured
    if (!SWIPALL_API_URL) {
        if (process.env.NODE_ENV === 'production' && !IS_BUILD_TIME) {
            throw new Error('SWIPALL_SHOP_API_URL or NEXT_PUBLIC_SWIPALL_SHOP_API_URL environment variable is not set');
        }
        // During build, return minimal safe data
        return {} as TResult;
    }

    const {
        token,
        useAuthToken,
        fetch: fetchOptions,
        tags,
    } = options || {};

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(fetchOptions?.headers as Record<string, string>),
    };

    // Use the explicitly provided token, or fetch from cookies if useAuthToken is true
    let authToken = token;
    if (useAuthToken && !authToken) {
        authToken = await getAuthToken();
    }

    if (authToken) {
        // Support both "Bearer token" and plain token formats
        if (authToken.startsWith('Bearer ')) {
            headers[SWIPALL_AUTH_TOKEN_HEADER] = authToken;
        } else {
            headers[SWIPALL_AUTH_TOKEN_HEADER] = `Bearer ${authToken}`;
        }
    }

    const url = `${SWIPALL_API_URL}${endpoint}`;
    const requestInit: RequestInit = {
        ...fetchOptions,
        method,
        headers,
        ...(tags ? { next: { tags } } : {}),
    };
    if (body !== undefined) {
        requestInit.body = JSON.stringify(body);
    }

    let response;
    try {
        response = await fetch(url, requestInit);
    } catch (fetchError: any) {
        console.warn(`[Swipall API] Network error for ${method} ${endpoint}:`, fetchError?.message);
        return emptyDataFor<TResult>(endpoint);
    }

    let result: SwipallResponse<TResult>;
    try {
        const text = await response.text();
        if (!text || !text.trim()) {
            return emptyDataFor<TResult>(endpoint);
        }
        result = JSON.parse(text);
    } catch (parseError: any) {
        if (parseError instanceof SwipallAPIError) throw parseError;
        console.warn(`[Swipall API] Could not parse response for ${method} ${endpoint} (HTTP ${response.status})`);
        return emptyDataFor<TResult>(endpoint);
    }

    if (!response.ok) {
        const errorMessage = transformError(result) || `API request failed with status ${response.status} for ${method} ${endpoint}`;
        console.error(`[Swipall API] Request failed - ${method} ${endpoint}:`, {
            status: response.status,
            statusText: response.statusText,
            error: result.error || result.errors,
        });

        throw new SwipallAPIError({
            status: response.status,
            method,
            endpoint,
            message: errorMessage,
            errorData: result.error || result.errors || {},
        });
    }

    if (result.error) {
        const errorMessage = result.error.message || 'Unknown API error';
        console.error(`[Swipall API] API error response for ${method} ${endpoint}:`, {
            status: response.status,
            error: result.error,
        });

        throw new SwipallAPIError({
            status: response.status,
            method,
            endpoint,
            message: errorMessage,
            errorData: result.error,
        });
    }

    if (result.errors && result.errors.length > 0) {
        const errorMessage = result.errors.map(e => e.message).join(', ');
        console.error(`[Swipall API] Multiple errors for ${method} ${endpoint}:`, {
            status: response.status,
            errors: result.errors,
        });

        throw new SwipallAPIError({
            status: response.status,
            method,
            endpoint,
            message: errorMessage,
            errorData: result.errors,
        });
    }

    // Return the result directly (which is already typed as TResult)
    // (which will be InterfaceApiListResponse<T> or InterfaceApiDetailResponse<T>)
    return result as TResult;
}

/**
 * Legacy compatibility exports for query/mutate (maps to REST endpoints)
 * These are here to help with gradual migration from GraphQL
 */
export async function query<TResult>(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined>,
    options?: SwipallRequestOptions
): Promise<TResult> {
    return get<TResult>(endpoint, params, options);
}

export async function mutate<TResult>(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined>,
    options?: SwipallRequestOptions
): Promise<TResult> {
    // For REST, mutations are POST/PUT/PATCH requests
    return post<TResult>(endpoint, params, options);
}

export { SwipallAPIError };

export function transformError(error: any): string | null {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === 'object' && error !== null) {
        if ('message' in error && typeof error.message === 'string') {
            return error.message;
        }
        if ('errors' in error && Array.isArray(error.errors)) {
            return error.errors.map((e: any) => (typeof e === 'string' ? e : JSON.stringify(e))).join(', ');
        }
        const firstKey = Object.keys(error)[0];
        if (!firstKey) {
            return null;
        }
        if (Array.isArray(error[firstKey])) {
            return error[firstKey].map((e: any) => (typeof e === 'string' ? e : JSON.stringify(e))).join(', ');
        }
        return JSON.stringify(error);
    }
    return String(error);
}

