const API_BASE_URL = 'http://localhost:8000/api/v1';

export const fetchPackages = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/packages`);
    const json = await response.json();
    if (json.status === 'success') {
      return json.data;
    }
    throw new Error(json.error || 'Failed to fetch packages');
  } catch (error) {
    console.error('API Error:', error);
    return [];
  }
};

export const fetchPackageBySlug = async (slug) => {
  try {
    const response = await fetch(`${API_BASE_URL}/packages/${slug}`);
    const json = await response.json();
    if (json.status === 'success') {
      return json.data;
    }
    throw new Error(json.error || 'Package not found');
  } catch (error) {
    console.error('API Error:', error);
    return null;
  }
};
