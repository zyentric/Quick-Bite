import { API_URL as ENV_API_URL } from '@env';

// Read from .env file directly!
export const API_URL = ENV_API_URL || 'http://10.0.2.2:5000/api';
