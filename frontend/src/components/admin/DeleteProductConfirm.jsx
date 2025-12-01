import React, { useState } from "react";
import { productService } from "../../services/api";
import { Trash2, AlertTriangle, Loader } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Alert, AlertTitle, AlertDescription } from "../ui";

export default function DeleteProductConfirm({ product, onDeleted, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!product) return <p className="text-gray-600">Select a product to delete from the list.</p>;

  const handleDelete = async () => {
    setError(null);
    try {
      setLoading(true);
      await productService.remove(product.id);
      onDeleted && onDeleted(product.id);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-slate-50 p-6">
      <Card className="border-2 border-red-300 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2 text-white">
            <AlertTriangle className="h-5 w-5" />
            Delete Product
          </CardTitle>
          <CardDescription className="text-red-100">
            This action cannot be undone
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          {error && (
            <Alert className="mb-6 bg-red-50 border-red-200">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-800">Error</AlertTitle>
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <Alert className="mb-6 bg-yellow-50 border-yellow-200">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertTitle className="text-yellow-800">Warning</AlertTitle>
            <AlertDescription className="text-yellow-700">
              You are about to permanently delete <strong>{product.name}</strong>. This action cannot be undone.
            </AlertDescription>
          </Alert>

          <div className="flex gap-3">
            <Button
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {loading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Permanently Delete
                </>
              )}
            </Button>
            <Button
              onClick={onCancel}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
