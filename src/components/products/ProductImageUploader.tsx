import { useState, useRef } from "react";
import { Upload, X, Check, Loader } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";

interface ImageFile {
  file: File;
  preview: string;
  id: string;
}

interface ProductImageUploaderProps {
  productId: number;
  onImagesUploaded?: (images: any[]) => void;
  adminToken?: string;
}

export default function ProductImageUploader({
  productId,
  onImagesUploaded,
  adminToken
}: ProductImageUploaderProps) {
  const [selectedImages, setSelectedImages] = useState<ImageFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newImages: ImageFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image`);
        continue;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 10MB)`);
        continue;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        newImages.push({
          file,
          preview: e.target?.result as string,
          id: `${Date.now()}-${i}`
        });

        // If we've read all files, update state
        if (newImages.length === Array.from(files).filter(f => f.type.startsWith("image/")).length) {
          const totalImages = selectedImages.length + newImages.length;
          if (totalImages > 4) {
            toast.error("Maximum 4 images allowed per product");
            setSelectedImages(selectedImages.slice(0, 4));
          } else {
            setSelectedImages([...selectedImages, ...newImages].slice(0, 4));
          }
        }
      };
      reader.readAsDataURL(file);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (id: string) => {
    setSelectedImages(selectedImages.filter(img => img.id !== id));
  };

  const handleUpload = async () => {
    if (selectedImages.length === 0) {
      toast.error("Please select at least one image");
      return;
    }

    setUploading(true);
    const formData = new FormData();

    // Add all selected files
    selectedImages.forEach((img, index) => {
      formData.append("images", img.file);
    });

    try {
      // Set auth header if token provided
      const headers: any = {};
      if (adminToken) {
        headers.Authorization = `Bearer ${adminToken}`;
      }

      const response = await api.post(
        `/images/upload/${productId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            ...headers
          },
          onUploadProgress: (progressEvent: any) => {
            const loaded = progressEvent.loaded;
            const total = progressEvent.total;
            const progress = Math.round((loaded / total) * 100);
            setUploadProgress({ overall: progress });
          }
        }
      );

      toast.success(`Successfully uploaded ${response.data.data.length} images!`);
      setSelectedImages([]);

      // Callback to notify parent component
      if (onImagesUploaded) {
        onImagesUploaded(response.data.data);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to upload images";
      toast.error(errorMessage);
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Upload Area */}
      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-orange-500 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />

        <Upload className="h-12 w-12 text-muted-foreground/60 mx-auto mb-2" />
        <p className="text-muted-foreground font-medium">Click to select images or drag and drop</p>
        <p className="text-sm text-muted-foreground/60">PNG, JPG, GIF up to 10MB each. Max 4 images.</p>
      </div>

      {/* Image Previews */}
      {selectedImages.length > 0 && (
        <div>
          <h3 className="font-semibold text-foreground mb-3">
            Selected Images ({selectedImages.length}/4)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {selectedImages.map((img) => (
              <div key={img.id} className="relative group">
                <img
                  src={img.preview}
                  alt="preview"
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  onClick={() => removeImage(img.id)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  disabled={uploading}
                >
                  <X className="h-4 w-4" />
                </button>
                {uploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                    <Loader className="h-6 w-6 text-white animate-spin" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploading && uploadProgress.overall !== undefined && (
        <div className="w-full bg-muted/20 rounded-full h-2">
          <div
            className="bg-orange-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress.overall}%` }}
          />
        </div>
      )}

      {/* Action Buttons */}
      {selectedImages.length > 0 && (
        <div className="flex gap-2">
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-muted/40 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
          >
            {uploading ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Check className="h-5 w-5" />
                Upload Images
              </>
            )}
          </button>
          <button
            onClick={() => setSelectedImages([])}
            disabled={uploading}
            className="bg-muted/20 hover:bg-muted/30 disabled:bg-muted/40 text-foreground py-2 px-4 rounded-lg font-medium transition-colors"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
