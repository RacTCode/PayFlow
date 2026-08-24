import { useMutation, useQuery } from "@tanstack/react-query";
import {
  login,
  logout,
  register,
  getCurrentUser
} from "./auth.api";

export function useLogin() {
  return useMutation({
    mutationFn: login,
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: register,
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: logout,
  });
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ["current-user"],
    queryFn: getCurrentUser,
    retry: false,
  });
}