/*
  # Fashion MNIST Image Classifier API

  This edge function receives an uploaded image and returns a fashion item classification.
  
  Note: This is a mock implementation since Python ML libraries (joblib, scikit-learn, PIL, numpy) 
  are not available in the Supabase edge function environment.
  
  The Python implementation would look like this:
  
  ```python
  import joblib
  import numpy as np
  from PIL import Image
  import io

  model = joblib.load('random_forest_fashion_mnist.pkl')

  class_names = [
    'T-shirt/top', 'Trouser', 'Pullover', 'Dress', 'Coat',
    'Sandal', 'Shirt', 'Sneaker', 'Bag', 'Ankle boot'
  ]

  def predict_image(image_bytes):
    img = Image.open(io.BytesIO(image_bytes)).convert('L')
    img = img.resize((28, 28))
    img_array = np.array(img) / 255.0
    img_flat = img_array.flatten().reshape(1, -1)
    pred = model.predict(img_flat)
    return class_names[pred[0]]
  ```
*/

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const classNames = [
  'T-shirt/top', 'Trouser', 'Pullover', 'Dress', 'Coat',
  'Sandal', 'Shirt', 'Sneaker', 'Bag', 'Ankle boot'
];

// Mock prediction function since we can't use Python ML libraries
function mockPrediction(imageBuffer: ArrayBuffer): { predicted_class: string; confidence: number } {
  // In a real implementation, this would:
  // 1. Convert the image to grayscale
  // 2. Resize to 28x28 pixels
  // 3. Normalize pixel values to 0-1
  // 4. Flatten to 1D array
  // 5. Pass through the trained Random Forest model
  
  // For demo purposes, we'll return a random prediction
  const randomIndex = Math.floor(Math.random() * classNames.length);
  const confidence = 0.7 + Math.random() * 0.3; // Random confidence between 70-100%
  
  return {
    predicted_class: classNames[randomIndex],
    confidence: confidence
  };
}

// Simulate image preprocessing (in a real app, this would use proper image processing)
async function preprocessImage(imageBuffer: ArrayBuffer): Promise<Float32Array> {
  // Mock preprocessing - in reality this would:
  // 1. Decode the image using a proper image library
  // 2. Convert to grayscale
  // 3. Resize to 28x28
  // 4. Normalize pixel values
  // 5. Flatten to 784-length array
  
  return new Float32Array(784).fill(0.5); // Mock normalized pixel array
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse the form data to get the uploaded image
    const formData = await req.formData();
    const imageFile = formData.get("image") as File;

    if (!imageFile) {
      return new Response(
        JSON.stringify({ error: "No image file provided" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check file type
    if (!imageFile.type.startsWith("image/")) {
      return new Response(
        JSON.stringify({ error: "Invalid file type. Please upload an image." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get image buffer
    const imageBuffer = await imageFile.arrayBuffer();
    
    // Preprocess the image (mock implementation)
    const preprocessedImage = await preprocessImage(imageBuffer);
    
    // Get prediction (mock implementation)
    const prediction = mockPrediction(imageBuffer);
    
    console.log(`Predicted: ${prediction.predicted_class} (${(prediction.confidence * 100).toFixed(1)}%)`);

    return new Response(
      JSON.stringify(prediction),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Prediction error:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
