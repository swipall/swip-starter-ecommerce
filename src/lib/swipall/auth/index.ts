import { post } from "../api";
import { LoginInput, LoginResponse, InterfaceApiDetailResponse, CurrentUser, RegisterInput } from "../types/types";

export async function login(credentials: LoginInput): Promise<LoginResponse> {
    return post<LoginResponse>('/api/v1/shop/login/', credentials);
}

export async function logout(options?: { useAuthToken?: boolean }): Promise<InterfaceApiDetailResponse<{ success: boolean }>> {
    return post<InterfaceApiDetailResponse<{ success: boolean }>>('/auth/logout', undefined, { useAuthToken: options?.useAuthToken });
}

// ============================================================================
// Registration & Password Reset Endpoints
// ============================================================================

export async function registerCustomer(input: RegisterInput): Promise<InterfaceApiDetailResponse<{ success: boolean }>> {
    return post<InterfaceApiDetailResponse<{ success: boolean }>>('/api/v1/shop/register/', input);
}

export async function requestPasswordReset(emailAddress: string): Promise<InterfaceApiDetailResponse<{ success: boolean }>> {
    return post<InterfaceApiDetailResponse<{ success: boolean }>>('/api/v1/auth/password/reset/', { email: emailAddress });
}

export async function resetPassword(token: string, password: string): Promise<InterfaceApiDetailResponse<{ user: CurrentUser }>> {
    return post<InterfaceApiDetailResponse<{ user: CurrentUser }>>('/auth/reset-password', { token, password });
}
