/**
 * Railway Storage Product Image Uploader
 * Admin component for uploading images to Railway Object Storage
 */

import { useState, useRef } from "react";
import { Upload, X, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import api from "@/lib/axios";

interface UploadedImage {
  id: number;
  image_url: string;
  image_order: number;
  is_thumbnail: boolean;
}

interface RailwayImageUploaderProps {
  productId: number;
  onImagesUploaded?: (images: UploadedImage[]) => void;
  adminToken: string;
}

export default function RailwayImageUploader({
  productId,
  onImagesUploaded,
  adminToken,
}: RailwayImageUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const maxFiles = 4;

    if (selectedFiles.length + files.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} images allowed`);
      return;
    }

    // Validate file types
    const validFiles = selectedFiles.filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image`);
        return false;
      }

      // Check file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 10MB)`);
        return false;
      }

      return true;
    });

    setFiles((prev) => [...prev, ...validFiles]);

    // Generate previews
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove a file from selection
  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Upload files to Railway Storage
  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error("Please select at least one image");
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("images", file);
      });

      const response = await api.post(
        `/images/upload/${productId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${adminToken}`,
          },
          onUploadProgress: (progressEvent: any) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percent);
          },
        }
      );

      if (response.data.status === "success") {
        toast.success(`${response.data.data.uploadedCount} image(s) uploaded`);

        if (onImagesUploaded) {
          onImagesUploaded(response.data.data.images);
        }

        // Reset
        setFiles([]);
        setPreviews([]);
        setProgress(0);
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to upload images"
      );
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-card rounded-lg border border-border">
      <h2 className="text-2xl font-bold mb-6">Upload Product Images</h2>

      {/* Drop Zone */}
      <div
        className="border-2 border-dashed border-border rounded-lg p-12 text-center mb-6 cursor-pointer hover:bg-muted/10 dark:hover:bg-gray-700 transition"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const droppedFiles = Array.from(e.dataTransfer.files);
          handleFileChange({
            target: { files: e.dataTransfer.files },
          } as any);
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="mx-auto h-12 w-12 text-muted-foreground/60 mb-4" />
        <p className="text-muted-foreground font-medium mb-2">
          Drag and drop images here, or click to select
        </p>
        <p className="text-sm text-muted-foreground/60">
          Maximum 4 images, 10MB each (JPG, PNG, GIF)
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* File Previews */}
      {previews.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-foreground mb-4">
            Selected Images ({previews.length}/4)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {previews.map((preview, index) => (
              <div
                key={index}
                className="relative aspect-square rounded-lg overflow-hidden bg-muted/10 dark:bg-muted/20"
              >
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => removeFile(index)}
                  className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="absolute bottom-1 right-1 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {uploading && progress > 0 && (
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Uploading to Railway...</span>
            <span className="text-sm font-medium">{progress}%</span>
          </div>
          <div className="w-full bg-muted/20 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Upload Button */}
      <div className="flex gap-3">
        <Button
          onClick={handleUpload}
          disabled={files.length === 0 || uploading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
        >
          {uploading ? (
            <>
              <span className="animate-spin mr-2">⟳</span>
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-5 w-5" />
              Upload to Railway ({files.length})
            </>
          )}
        </Button>

        {files.length > 0 && !uploading && (
          <Button
            onClick={() => {
              setFiles([]);
              setPreviews([]);
            }}
            variant="outline"
          >
            Clear
          </Button>
        )}
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Upload Information:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Images are uploaded to Railway Object Storage (S3)</li>
              <li>Public URLs are automatically generated</li>
              <li>URLs are stored in MySQL database</li>
              <li>Images appear in product carousel immediately</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
