"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Download,
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface UploadResult {
  success: number;
  errors: number;
  details: string[];
}

export function BulkUploadModal({
  isOpen,
  onClose,
  onSuccess,
}: BulkUploadModalProps) {
  const [uploadType, setUploadType] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);

  const uploadTypes = [
    { value: "students", label: "Students" },
    { value: "teachers", label: "Teachers" },
    { value: "parents", label: "Parents" },
  ];

  const handleDownloadTemplate = async () => {
    if (!uploadType) {
      toast.error("Please select an upload type first");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/bulk-upload/template?type=${uploadType}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to download template");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `${uploadType}_template.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Template downloaded successfully");
    } catch (error) {
      console.error("Error downloading template:", error);
      toast.error("Failed to download template");
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (
        selectedFile.type !== "text/csv" &&
        !selectedFile.name.endsWith(".csv")
      ) {
        toast.error("Please select a CSV file");
        return;
      }
      setFile(selectedFile);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!uploadType || !file) {
      toast.error("Please select upload type and file");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const token = localStorage.getItem("token");

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/bulk-upload/${uploadType}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Upload failed");
      }

      setUploadResult(data.results);
      toast.success(
        `Upload completed! ${data.results.success} records processed successfully`,
      );

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setUploadType("");
    setFile(null);
    setUploadResult(null);
    setUploadProgress(0);
    setIsUploading(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Bulk Upload
          </DialogTitle>
          <DialogDescription>
            Upload multiple users at once using a CSV file. Download the
            template first to see the required format.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Upload Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="upload-type">Upload Type</Label>
            <Select value={uploadType} onValueChange={setUploadType}>
              <SelectTrigger>
                <SelectValue placeholder="Select what you want to upload" />
              </SelectTrigger>
              <SelectContent>
                {uploadTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Template Download */}
          {uploadType && (
            <div className="space-y-2">
              <Label>Download Template</Label>
              <Button
                variant="outline"
                onClick={handleDownloadTemplate}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Download {uploadType} Template
              </Button>
              <p className="text-sm text-muted-foreground">
                Download the CSV template to see the required format and fill in
                your data.
              </p>
            </div>
          )}

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file-upload">Upload CSV File</Label>
            <Input
              id="file-upload"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={!uploadType || isUploading}
            />
            {file && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </div>
            )}
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <Label>Upload Progress</Label>
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-sm text-muted-foreground">
                Uploading... {uploadProgress}%
              </p>
            </div>
          )}

          {/* Upload Results */}
          {uploadResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>{uploadResult.success}</strong> records uploaded
                    successfully
                  </AlertDescription>
                </Alert>

                {uploadResult.errors > 0 && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      <strong>{uploadResult.errors}</strong> records failed
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {uploadResult.details.length > 0 && (
                <div className="space-y-2">
                  <Label>Upload Details</Label>
                  <div className="max-h-40 overflow-y-auto border rounded-md p-3 bg-muted/50">
                    {uploadResult.details.map((detail, index) => (
                      <div
                        key={index}
                        className={`text-sm py-1 ${
                          detail.includes("successfully")
                            ? "text-green-700"
                            : "text-red-700"
                        }`}
                      >
                        {detail}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Instructions:</strong>
              <ul className="mt-2 space-y-1 text-sm">
                <li>1. Select the type of data you want to upload</li>
                <li>2. Download the CSV template for the correct format</li>
                <li>3. Fill in your data in the template</li>
                <li>4. Upload the completed CSV file</li>
                <li>5. Review the results and fix any errors if needed</li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isUploading}
          >
            {uploadResult ? "Close" : "Cancel"}
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!uploadType || !file || isUploading}
          >
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
