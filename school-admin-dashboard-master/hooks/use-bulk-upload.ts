import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// Types
interface BulkUploadResult {
  success: number;
  errors: number;
  details: string[];
}

interface BulkUploadResponse {
  message: string;
  results: BulkUploadResult;
}

// API functions
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
  };
};

const bulkUploadApi = {
  downloadTemplate: async (type: "students" | "teachers" | "parents") => {
    const response = await axios.get(
      `${API_BASE_URL}/bulk-upload/template?type=${type}`,
      {
        headers: getAuthHeaders(),
        responseType: "blob",
      },
    );

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${type}_template.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return response.data;
  },

  uploadStudents: async (file: File): Promise<BulkUploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(
      `${API_BASE_URL}/bulk-upload/students`,
      formData,
      {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  },

  uploadTeachers: async (file: File): Promise<BulkUploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(
      `${API_BASE_URL}/bulk-upload/teachers`,
      formData,
      {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  },

  uploadParents: async (file: File): Promise<BulkUploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(
      `${API_BASE_URL}/bulk-upload/parents`,
      formData,
      {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  },
};

// Hooks
export const useDownloadTemplate = () => {
  return useMutation({
    mutationFn: bulkUploadApi.downloadTemplate,
  });
};

export const useUploadStudents = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkUploadApi.uploadStudents,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
};

export const useUploadTeachers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkUploadApi.uploadTeachers,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
    },
  });
};

export const useUploadParents = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkUploadApi.uploadParents,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parents"] });
    },
  });
};
