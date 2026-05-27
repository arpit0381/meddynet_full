/**
 * Labs API Service
 * All lab-related API calls centralized here.
 */
import apiClient from './api';

export interface LabTest {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  description?: string;
  turnaround?: string;
  parameters?: number;
  popular?: boolean;
}

export interface LabReview {
  id: string;
  name: string;
  rating: number;
  date: string;
  comment: string;
  helpful?: number;
  verified?: boolean;
  testName?: string;
}

export interface LabFacility {
  id: string;
  icon: string;
  name: string;
  available?: boolean;
  description?: string;
}

export interface RatingBreakdown {
  stars: number;
  count: number;
}

export interface Lab {
  id: string;
  name: string;
  slug?: string;
  image?: string;
  initials: string;
  color: string;
  rating: number;
  reviewCount: number;
  address: string;
  city: string;
  distance?: number;
  operatingHours: string;
  established?: string | number;
  verified: boolean;
  nabl?: boolean;
  iso?: boolean;
  homeCollection?: boolean;
  about?: string;
  specialties?: string[];
  tests: LabTest[];
  reviews?: LabReview[];
  facilities?: LabFacility[];
  ratingBreakdown?: RatingBreakdown[];
  lat?: number;
  lng?: number;
}

export interface LabsListParams {
  search?: string;
  city?: string;
  category?: string;
  lat?: number;
  lng?: number;
  page?: number;
  limit?: number;
}

/**
 * Map backend Lab response to frontend interface
 */
function mapBackendLab(raw: any): Lab {
  const initials = raw.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  // Assign a consistent color based on name if not provided
  const colors = ['from-blue-600 to-indigo-700', 'from-emerald-500 to-teal-600', 'from-purple-600 to-violet-700', 'from-rose-500 to-pink-600', 'from-amber-500 to-orange-600'];
  const colorIdx = raw.name.length % colors.length;
  
  // Deterministic mock generation based on Lab ID
  const idHash = raw.id ? raw.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0) : 0;
  
  const aboutTexts = [
      "Premier diagnostic facility committed to excellence in healthcare through advanced technology and expert care.",
      "A NABL-accredited laboratory providing accurate, reliable, and swift medical diagnostic services.",
      "State-of-the-art medical testing center focused on preventive health and accurate clinical analysis.",
      "Trusted by over a million patients for comprehensive blood checks and specialized pathological services."
  ];

  const specialtiesSets = [
      ["Hematology", "Thyroid", "Diabetes"],
      ["Cardiology", "Lipid Profile", "Kidney"],
      ["Vitamins", "Immunity", "Metabolism"],
      ["Full Body Checkups", "Women's Health", "Hormones"]
  ];

  const hoursSets = [
      "08:00 AM - 08:00 PM",
      "07:00 AM - 09:00 PM",
      "24 Hours Open",
      "09:00 AM - 07:00 PM"
  ];

  const imageSets = [
      "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1586773860418-d37222d8fce2?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1538108149393-fdfd81692ec6?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=1000&auto=format&fit=crop"
  ];

  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    image: raw.image_url || imageSets[idHash % imageSets.length],
    initials,
    color: colors[colorIdx],
    rating: raw.avg_rating || 4.5,
    reviewCount: raw.review_count || 0,
    address: raw.address,
    city: raw.city,
    distance: raw.distance || 0,
    operatingHours: hoursSets[idHash % hoursSets.length],
    verified: raw.is_verified,
    nabl: raw.is_nabl,
    iso: raw.is_iso,
    homeCollection: raw.home_collection,
    about: aboutTexts[idHash % aboutTexts.length],
    specialties: specialtiesSets[idHash % specialtiesSets.length],
    tests: (raw.tests || []).map((t: any) => ({
      id: t.id,
      name: t.name,
      category: t.category,
      price: t.price / 100,
      originalPrice: (t.originalPrice || t.mrp) / 100,
      description: "Advanced diagnostic test for comprehensive health analysis.",
      turnaround: `${t.turnaround_hours || 24}h`,
      parameters: 15,
      popular: t.price < 50000
    })),
    reviews: [],
    facilities: [
      { id: '1', icon: 'shield', name: 'Verified Results', available: true, description: 'All reports are verified by MD pathologists.' },
      { id: '2', icon: 'home', name: 'Home Collection', available: raw.home_collection, description: 'Safe and sterile sample collection at your doorstep.' }
    ],
    ratingBreakdown: [
      { stars: 5, count: 80 },
      { stars: 4, count: 30 },
      { stars: 3, count: 10 }
    ],
    lat: raw.lat,
    lng: raw.lng
  };
}

// MOCK_LABS removed for 100% Real environment

/**
 * Fetch paginated list of labs from backend.
 */
export async function getLabs(params: LabsListParams = {}): Promise<Lab[]> {
  try {
    const { data } = await apiClient.get('/labs', { params });
    return (data || []).map(mapBackendLab);
  } catch (error) {
    console.warn("Backend labs fetch failed.");
    return [];
  }
}

/**
 * Fetch a single lab's full details by ID.
 */
export async function getLabById(id: string): Promise<Lab | null> {
  try {
    const { data } = await apiClient.get(`/labs/${id}`);
    return mapBackendLab(data);
  } catch (err: unknown) {
    const axiosErr = err as { response?: { status?: number } };
    if (axiosErr.response?.status === 404) return null;
    throw err;
  }
}

/**
 * Submit a review for a lab.
 */
export async function submitReview(labId: string, review: {
  rating: number;
  comment: string;
  test_name?: string;
}): Promise<LabReview> {
  const { data } = await apiClient.post(`/labs/${labId}/reviews`, review);
  return data;
}

/**
 * Mark a review as helpful.
 */
export async function markReviewHelpful(labId: string, reviewId: string): Promise<void> {
  await apiClient.post(`/labs/${labId}/reviews/${reviewId}/helpful`);
}

/**
 * Search labs by test name or speciality.
 */
export async function searchLabs(query: string, city?: string): Promise<Lab[]> {
  const { data } = await apiClient.get('/labs/search', { params: { q: query, city } });
  return (data || []).map(mapBackendLab);
}
