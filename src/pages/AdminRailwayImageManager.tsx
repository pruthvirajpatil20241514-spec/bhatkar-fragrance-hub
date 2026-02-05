/**
 * Admin Product Image Manager
 * Full image management dashboard for Railway Storage
 */

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Trash2, Upload, AlertCircle } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import RailwayImageUploader from "@/components/products/RailwayImageUploader";
import api from "@/lib/axios";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";

interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  image_format: string;
  alt_text: string;
  image_order: number;
  is_thumbnail: boolean;
}

interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  images: ProductImage[];
}

export default function AdminRailwayImageManager() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);

  // Fetch product and images
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/products/${id}/with-images`);
        setProduct(response.data.data);
        setImages(response.data.data.images || []);
      } catch (error: any) {
        toast.error(
          error.response?.data?.message || "Failed to load product"
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  // Handle image upload completion
  const handleImagesUploaded = (uploadedImages: ProductImage[]) => {
    setImages((prev) => [...prev, ...uploadedImages]);
  };

  // Delete image
  const handleDeleteImage = async (imageId: number) => {
    if (!window.confirm("Delete this image?")) return;

    try {
      setDeleting(imageId);
      await api.delete(`/images/${id}/${imageId}`);
      setImages((prev) => prev.filter((img) => img.id !== imageId));
      toast.success("Image deleted successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete image");
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container py-12 px-4">
          <Skeleton className="h-12 w-1/2 mb-8" />
          <div className="grid lg:grid-cols-2 gap-12">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container py-12 px-4 text-center">
          <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
        </div>
      </Layout>
    );
  }

  const sortedImages = [...images].sort(
    (a, b) => (a.image_order || 0) - (b.image_order || 0)
  );

  return (
    <Layout>
      <div className="container py-12 px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">{product.name}</h1>
          <p className="text-gray-600">
            {product.brand} • ${product.price}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {images.length} / 4 images uploaded
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Current Images */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Current Images</h2>

            {images.length === 0 ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-blue-600 mb-4" />
                <h3 className="font-semibold text-blue-900 mb-2">
                  No images yet
                </h3>
                <p className="text-sm text-blue-800">
                  Upload images to display this product in your store
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedImages.map((image, index) => (
                  <div
                    key={image.id}
                    className="group relative bg-gray-100 rounded-lg overflow-hidden border border-gray-200 hover:border-orange-300 transition"
                  >
                    {/* Image */}
                    <img
                      src={image.image_url}
                      alt={image.alt_text}
                      className="w-full aspect-square object-cover"
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition flex items-center justify-center">
                      <button
                        onClick={() => handleDeleteImage(image.id)}
                        disabled={deleting === image.id}
                        className="opacity-0 group-hover:opacity-100 transition bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        {deleting === image.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>

                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex gap-2">
                      {image.is_thumbnail && (
                        <div className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-semibold">
                          ★ Main
                        </div>
                      )}
                      <div className="bg-gray-900 text-white px-2 py-1 rounded text-xs font-semibold">
                        #{image.image_order}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 text-white text-xs">
                      <p className="font-medium">{image.image_format}</p>
                      <p className="text-gray-300">{image.alt_text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Image Stats */}
            {images.length > 0 && (
              <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex gap-2">
                  <div className="text-2xl">✅</div>
                  <div>
                    <p className="font-semibold text-green-900">All Set!</p>
                    <p className="text-sm text-green-800">
                      {images.length} image(s) uploaded to Railway Storage
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Upload Section */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Upload Images</h2>

            {images.length >= 4 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-yellow-600 mb-4" />
                <h3 className="font-semibold text-yellow-900 mb-2">
                  Maximum Reached
                </h3>
                <p className="text-sm text-yellow-800 mb-4">
                  This product already has 4 images (maximum allowed)
                </p>
                <Button
                  onClick={() => {
                    const toDelete = sortedImages[sortedImages.length - 1];
                    handleDeleteImage(toDelete.id);
                  }}
                  variant="outline"
                  className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
                >
                  Delete one to add more
                </Button>
              </div>
            ) : (
              <div>
                <RailwayImageUploader
                  productId={product.id}
                  onImagesUploaded={handleImagesUploaded}
                  adminToken={token || ""}
                />

                {/* Upload Info */}
                <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-3">
                    How it works:
                  </h3>
                  <ol className="text-sm text-blue-800 space-y-2">
                    <li>1. Select 1-{4 - images.length} images from your computer</li>
                    <li>2. Images upload to Railway Object Storage</li>
                    <li>3. Public URLs are generated automatically</li>
                    <li>4. URLs are stored in MySQL database</li>
                    <li>5. Images appear in carousel immediately</li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-12 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Storage Details:</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600 font-medium">Storage Service</p>
              <p className="text-lg font-semibold text-gray-900">
                Railway Object Storage
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Images Uploaded</p>
              <p className="text-lg font-semibold text-gray-900">
                {images.length} / 4
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">URL Type</p>
              <p className="text-lg font-semibold text-gray-900">Public</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
