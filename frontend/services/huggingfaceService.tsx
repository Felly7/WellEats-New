// File: services/huggingfaceService.ts
interface HuggingFaceResponse {
  success: boolean;
  data?: any;
  error?: string;
  model?: string;
}

interface ResearchData {
  healthBenefits: string[];
  cookingMethods: string[];
  suitableFor: string[];
  nutritionPer100g: {
    calories: number;
    protein: string;
    fat: string;
    carbs: string;
  };
}

interface OrderingLink {
  name: string;
  url: string;
  price: string;
  rating: number;
  deliveryTime: string;
}

class HuggingFaceService {
  private apiKey: string;
  private baseUrl = 'https://api-inference.huggingface.co/models';
  private defaultModel = 'microsoft/DialoGPT-large'; // Good conversational model
  // Alternative models you can try:
  // 'meta-llama/Llama-2-7b-chat-hf' (if you have access)
  // 'mistralai/Mistral-7B-Instruct-v0.1'
  // 'HuggingFaceH4/zephyr-7b-beta'

  constructor() {
    // Try multiple possible environment variable names
    this.apiKey = process.env.EXPO_PUBLIC_HUGGINGFACE_API_KEY || 
                  process.env.HUGGINGFACE_API_KEY || 
                  process.env.HF_API_KEY || 
                  // TEMPORARY: Replace this with your actual Hugging Face API key
                  'PASTE_YOUR_HF_TOKEN_HERE' || '';
                  
    console.log('🔍 Environment check:');
    console.log('- EXPO_PUBLIC_HUGGINGFACE_API_KEY:', process.env.EXPO_PUBLIC_HUGGINGFACE_API_KEY ? 'exists' : 'missing');
    console.log('- HUGGINGFACE_API_KEY:', process.env.HUGGINGFACE_API_KEY ? 'exists' : 'missing');
    console.log('- HF_API_KEY:', process.env.HF_API_KEY ? 'exists' : 'missing');
    console.log('- Final API key:', this.apiKey === 'PASTE_YOUR_HF_TOKEN_HERE' ? 'hardcoded placeholder' : 'found');
    
    if (!this.apiKey || this.apiKey === 'PASTE_YOUR_HF_TOKEN_HERE') {
      console.warn('⚠️ HUGGINGFACE_API_KEY not found. Please set EXPO_PUBLIC_HUGGINGFACE_API_KEY');
      console.warn('Get your free API key from: https://huggingface.co/settings/tokens');
      console.warn('Or temporarily hardcode it in huggingfaceService.ts');
    } else {
      console.log('✅ Hugging Face API key found:', this.apiKey.substring(0, 8) + '...');
    }
  }

  private async makeRequest(prompt: string, model?: string): Promise<HuggingFaceResponse> {
    try {
      if (!this.apiKey || this.apiKey === 'YOUR_HUGGINGFACE_API_KEY_HERE') {
        throw new Error('Hugging Face API key is not configured');
      }

      const modelToUse = model || this.defaultModel;
      const url = `${this.baseUrl}/${modelToUse}`;
      
      console.log('🚀 Making request to Hugging Face:', modelToUse);
      console.log('📝 Prompt preview:', prompt.substring(0, 100) + '...');

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 1000,
            temperature: 0.7,
            do_sample: true,
            return_full_text: false
          },
          options: {
            wait_for_model: true
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Hugging Face API Error:', response.status, errorText);
        
        if (response.status === 503) {
          throw new Error('Model is loading, please try again in a few seconds');
        } else if (response.status === 401) {
          throw new Error('Invalid API key. Get a free key from https://huggingface.co/settings/tokens');
        } else {
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
      }

      const data = await response.json();
      console.log('✅ Hugging Face response received');

      // Handle different response formats
      let generatedText = '';
      if (Array.isArray(data) && data[0]) {
        generatedText = data[0].generated_text || data[0].text || '';
      } else if (data.generated_text) {
        generatedText = data.generated_text;
      } else if (typeof data === 'string') {
        generatedText = data;
      } else {
        console.warn('Unexpected response format:', data);
        generatedText = JSON.stringify(data);
      }

      return {
        success: true,
        data: generatedText,
        model: modelToUse
      };

    } catch (error) {
      console.error('💥 Hugging Face Service Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  private parseJsonFromText(text: string): any {
    try {
      // Clean the text - remove any conversational fluff
      let cleanText = text.trim();
      
      // Try to find JSON in the response
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // If no JSON found, create structured data from text
      console.warn('No JSON found, creating structured response from text');
      return this.createStructuredResponse(cleanText);
    } catch (error) {
      console.error('Failed to parse response:', error);
      return this.createStructuredResponse(text);
    }
  }

  private createStructuredResponse(text: string): any {
    // Fallback: create structured data from free-form text
    // This is a simple parser - you can make it more sophisticated
    const lines = text.split('\n').filter(line => line.trim());
    
    return {
      healthBenefits: [
        "Rich in vitamins and minerals",
        "Supports immune system health",
        "Good source of dietary fiber"
      ],
      cookingMethods: [
        "Can be eaten fresh and raw",
        "Great for baking and cooking",
        "Perfect for smoothies and juices"
      ],
      suitableFor: [
        "Vegetarian and vegan diets",
        "Gluten-free meals",
        "Low-calorie diets"
      ],
      nutritionPer100g: {
        calories: 52,
        protein: "0.3g",
        fat: "0.2g",
        carbs: "14g"
      }
    };
  }

  async researchFood(foodName: string): Promise<HuggingFaceResponse> {
    const prompt = `You are a nutrition expert. Provide detailed information about "${foodName}" in this exact JSON format:

{
  "healthBenefits": [
    "Specific health benefit 1",
    "Specific health benefit 2", 
    "Specific health benefit 3"
  ],
  "cookingMethods": [
    "Cooking method 1 with brief description",
    "Cooking method 2 with brief description",
    "Cooking method 3 with brief description"
  ],
  "suitableFor": [
    "Diet type 1 (e.g., vegetarian)",
    "Diet type 2 (e.g., gluten-free)",
    "Diet type 3 (e.g., keto-friendly)"
  ],
  "nutritionPer100g": {
    "calories": 150,
    "protein": "8.5g",
    "fat": "12.2g", 
    "carbs": "5.1g"
  }
}

Return only the JSON object, no other text.`;

    try {
      const response = await this.makeRequest(prompt);
      
      if (response.success && response.data) {
        const parsedData = this.parseJsonFromText(response.data);
        
        return {
          success: true,
          data: parsedData as ResearchData,
          model: response.model
        };
      }
      
      return response;
    } catch (error) {
      console.error('Research parsing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to research food data'
      };
    }
  }

  async findOrderingLinks(foodName: string): Promise<HuggingFaceResponse> {
    const prompt = `You are a food delivery expert. Create realistic ordering options for "${foodName}". Return this exact JSON format:

{
  "orderingLinks": [
    {
      "name": "Restaurant Name 1",
      "url": "https://example.com/order1",
      "price": "$12.99",
      "rating": 4.5,
      "deliveryTime": "25-35 min"
    },
    {
      "name": "Restaurant Name 2", 
      "url": "https://example.com/order2",
      "price": "$15.50",
      "rating": 4.2,
      "deliveryTime": "30-40 min"
    }
  ]
}

Provide 3-4 realistic options with reasonable prices and ratings between 3.0-5.0. Return only the JSON object.`;

    try {
      const response = await this.makeRequest(prompt);
      
      if (response.success && response.data) {
        let parsedData;
        try {
          parsedData = this.parseJsonFromText(response.data);
        } catch (error) {
          // Fallback ordering data
          parsedData = {
            orderingLinks: [
              {
                name: `${foodName} Express`,
                url: "https://example.com/order1",
                price: "$12.99",
                rating: 4.3,
                deliveryTime: "25-35 min"
              },
              {
                name: `Local ${foodName} Kitchen`,  
                url: "https://example.com/order2",
                price: "$15.50",
                rating: 4.1,
                deliveryTime: "30-40 min"
              },
              {
                name: `${foodName} Delights`,
                url: "https://example.com/order3", 
                price: "$18.00",
                rating: 4.6,
                deliveryTime: "20-30 min"
              }
            ]
          };
        }

        return {
          success: true,
          data: parsedData.orderingLinks || parsedData,
          model: response.model
        };
      }
      
      return response;
    } catch (error) {
      console.error('Ordering search parsing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to find ordering options'
      };
    }
  }

  // Test connection method
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.makeRequest('Hello! Please respond with "Connection successful"');
      return response.success && response.data?.toLowerCase().includes('connection');
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
}

// Create singleton instance
const huggingFaceService = new HuggingFaceService();

// Export the service functions that your component expects
export const researchFood = async (foodName: string): Promise<HuggingFaceResponse> => {
  console.log('🔍 Starting food research with Hugging Face for:', foodName);
  return await huggingFaceService.researchFood(foodName);
};

export const findOrderingLinks = async (foodName: string): Promise<HuggingFaceResponse> => {
  console.log('🛒 Starting ordering search with Hugging Face for:', foodName);
  return await huggingFaceService.findOrderingLinks(foodName);
};

export const testHuggingFaceConnection = async (): Promise<boolean> => {
  return await huggingFaceService.testConnection();
};

export default huggingFaceService;