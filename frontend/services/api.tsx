import axios from 'axios';
                   

export const API_URL = 'http://172.20.10.2:5000/api';
export const baseURL = 'http://172.20.10.3:5000';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


const SPOONACULAR_URL = 'https://api.spoonacular.com/recipes/complexSearch';
const SPOONACULAR_DETAILS_URL = 'https://api.spoonacular.com/recipes/{id}/information';


const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY || 'f57cba535cdb427bae6873cffc117686';


// Register User

// Function to handle user signup
export const registerUser = async (email: string, fullName: string, username: string, password: string) => {
  try {
    const response = await api.post('/auth/register', {fullName, email, username, password});
    return response.data;
  } catch (error:any) {
    if (error.response) {
      // Backend returned a response with an error
      console.error('Server Error:', error.response.data);
    } else {
      // Other error (network issues, timeout, etc.)
      console.error('Error signing up:', error.message);
    }
    throw error;
  }
};

// Function to handle user login
export const loginUser = async (email: string, password: string) => {
  try {

    const response = await api.post('/auth/login', { email, password });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

// export const getFoodData = async (offset) => {
//   try {
//     const response = await axios.get(SPOONACULAR_URL, {
//       params: {
//         apiKey: SPOONACULAR_API_KEY,
//         number: 18, // Number of recipes to fetch
//         offset: offset,
//       },
//     });
//     return response.data;
//   } catch (error) {
//     console.error('Error fetching food data:', error);
//     throw error;
//   }
// };

// export const getFoodDetails = async (id) => {
//   try {
//     const response = await axios.get(SPOONACULAR_DETAILS_URL.replace('{id}', id), {
//       params: {
//         apiKey: SPOONACULAR_API_KEY,
//         includeNutrition: true,
//       },
//     });
//     return response.data;
//   } catch (error) {
//     console.error('Error fetching food details:', error);
//     throw error;
//   }
// };

// export const getSearchResults = async (search) => {
//   try {
//     const response = await axios.get(SPOONACULAR_URL, {
//       params: {
//         apiKey: SPOONACULAR_API_KEY,
//         query: search,
//         number: 10,
//       },
//     });
//     return response.data;
//   } catch (error) {
//     console.error('Error fetching food details:', error);
//     throw error;
//   }
// };

export const getRecommendedFoods = async (profile: {
  allergies: string[];
  conditions: string[];
}) => {
  const qs = new URLSearchParams();
  profile.allergies.forEach(a => qs.append('allergies', a));
  profile.conditions.forEach(c => qs.append('conditions', c));

  const res = await fetch(`${API_URL}/foods?${qs.toString()}`);
  return res.json(); // { results: Food[] }
};