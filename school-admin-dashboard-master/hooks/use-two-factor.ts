import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// Types
interface TwoFactorSecret {
  secret: string;
  qr_code_url: string;
}

interface TwoFactorStatus {
  enabled: boolean;
  confirmed_at: string | null;
}

interface TwoFactorEnableResponse {
  message: string;
  recovery_codes: string[];
}

interface TwoFactorVerifyResponse {
  message: string;
  verified: boolean;
  recovery_code_used?: boolean;
}

// API functions
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

const twoFactorApi = {
  generateSecret: async (): Promise<TwoFactorSecret> => {
    const response = await axios.post(
      `${API_BASE_URL}/2fa/generate`,
      {},
      {
        headers: getAuthHeaders(),
      },
    );
    return response.data;
  },

  enable: async (code: string): Promise<TwoFactorEnableResponse> => {
    const response = await axios.post(
      `${API_BASE_URL}/2fa/enable`,
      { code },
      {
        headers: getAuthHeaders(),
      },
    );
    return response.data;
  },

  disable: async (password: string) => {
    const response = await axios.post(
      `${API_BASE_URL}/2fa/disable`,
      { password },
      {
        headers: getAuthHeaders(),
      },
    );
    return response.data;
  },

  verify: async (code: string): Promise<TwoFactorVerifyResponse> => {
    const response = await axios.post(
      `${API_BASE_URL}/2fa/verify`,
      { code },
      {
        headers: getAuthHeaders(),
      },
    );
    return response.data;
  },

  getStatus: async (): Promise<TwoFactorStatus> => {
    const response = await axios.get(`${API_BASE_URL}/2fa/status`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  regenerateRecoveryCodes: async (password: string) => {
    const response = await axios.post(
      `${API_BASE_URL}/2fa/recovery-codes`,
      { password },
      {
        headers: getAuthHeaders(),
      },
    );
    return response.data;
  },
};

// Hooks
export const useGenerateTwoFactorSecret = () => {
  return useMutation({
    mutationFn: twoFactorApi.generateSecret,
  });
};

export const useEnableTwoFactor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: twoFactorApi.enable,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["two-factor-status"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
};

export const useDisableTwoFactor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: twoFactorApi.disable,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["two-factor-status"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
};

export const useVerifyTwoFactor = () => {
  return useMutation({
    mutationFn: twoFactorApi.verify,
  });
};

export const useTwoFactorStatus = () => {
  return useQuery({
    queryKey: ["two-factor-status"],
    queryFn: twoFactorApi.getStatus,
  });
};

export const useRegenerateRecoveryCodes = () => {
  return useMutation({
    mutationFn: twoFactorApi.regenerateRecoveryCodes,
  });
};
