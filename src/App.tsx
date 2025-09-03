import React, { useState } from 'react';
import { Upload, Image as ImageIcon, Brain, AlertCircle } from 'lucide-react';

interface PredictionResult {
  predicted_class: string;
  confidence?: number;
}

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setError('');
    setPrediction(null);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        handleFileSelect(file);
      } else {
        setError('Please select an image file');
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/predict`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setPrediction(result);
    } catch (err) {
      setError('Failed to classify image. Please try again.');
      console.error('Prediction error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Fashion MNIST Classifier
            </h1>
            <p className="text-gray-600">
              Upload an image of clothing to classify it using machine learning
            </p>
          </div>

          {/* Upload Area */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors duration-200 cursor-pointer"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => document.getElementById('fileInput')?.click()}
            >
              {previewUrl ? (
                <div className="space-y-4">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="mx-auto max-h-48 rounded-lg shadow-md"
                  />
                  <p className="text-sm text-gray-600">
                    {selectedFile?.name}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full">
                    <Upload className="w-8 h-8 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-700 mb-1">
                      Drop your image here, or click to browse
                    </p>
                    <p className="text-sm text-gray-500">
                      Supports JPG, PNG, GIF up to 10MB
                    </p>
                  </div>
                </div>
              )}
              
              <input
                id="fileInput"
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
              />
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                {error}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="text-center mb-6">
            <button
              onClick={handleSubmit}
              disabled={!selectedFile || loading}
              className={`px-8 py-3 rounded-lg font-semibold text-white transition-all duration-200 ${
                !selectedFile || loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              }`}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Classifying...
                </div>
              ) : (
                <div className="flex items-center">
                  <ImageIcon className="w-5 h-5 mr-2" />
                  Classify Image
                </div>
              )}
            </button>
          </div>

          {/* Results */}
          {prediction && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                Prediction Result
              </h3>
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                  <Brain className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {prediction.predicted_class}
                </p>
                {prediction.confidence && (
                  <p className="text-sm text-gray-600">
                    Confidence: {(prediction.confidence * 100).toFixed(1)}%
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Info */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>
              This classifier recognizes: T-shirt/top, Trouser, Pullover, Dress, Coat,
              Sandal, Shirt, Sneaker, Bag, and Ankle boot.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
