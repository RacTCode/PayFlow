import { api } from "@/lib/api";
import type { ApiResponse, User } from "@/types/api";
import type {
  AuthResponse,
  LoginInput,
  RegisterInput,
} from "./auth.types";

export async function login(
  data: LoginInput,
): Promise<User> {
  const response = await api.post<
    ApiResponse<AuthResponse>
  >("/auth/login", data);

  return response.data.data.user;
}

export async function register(
  data: RegisterInput,
): Promise<User> {
  const response = await api.post<
    ApiResponse<AuthResponse>
  >("/auth/register", data);

  return response.data.data.user;
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout");
}

export async function getCurrentUser(): Promise<User> {
  const response = await api.get<
    ApiResponse<{ user: User }>
  >("/users/me");

  return response.data.data.user;
}