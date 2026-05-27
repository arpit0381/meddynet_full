/**
 * Bookings API Service
 */
import apiClient from './api';

export type BookingType = 'home_collection' | 'lab_visit';
export type BookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export interface BookingTestItem {
  test_id: string;
  quantity?: number;
}

export interface CreateBookingPayload {
  lab_id: string;
  test_ids: string[];
  type: BookingType;
  scheduled_at: string; // ISO datetime string
  address?: string;     // Required for home collection
  lat?: number;
  lng?: number;
  patient_name: string;
  patient_phone: string;
  patient_age?: number;
  patient_gender?: string;
  promo_code?: string;
  notes?: string;
}

export interface Booking {
  id: string;
  lab_id: string;
  user_id: string;
  type: BookingType;
  status: BookingStatus;
  scheduled_at: string;
  address?: string;
  patient_name: string;
  patient_phone: string;
  total_amount: number;
  promo_code?: string;
  discount_amount: number;
  razorpay_order_id?: string; // transient for checkout
  amount?: number;            // transient for checkout
  created_at: string;
  updated_at: string;
}

export interface RazorpayOrder {
  id: string;           // Razorpay order ID
  amount: number;       // in paise
  currency: string;
  booking_id: string;
}

/**
 * Create a new booking and return the booking object.
 */
export async function createBooking(payload: CreateBookingPayload): Promise<Booking> {
  const { data } = await apiClient.post('/bookings', payload);
  return data;
}

/**
 * Create a Razorpay order for the given booking.
 */
export async function createPaymentOrder(bookingId: string): Promise<RazorpayOrder> {
  const { data } = await apiClient.post('/payments/create-order', { booking_id: bookingId });
  return data;
}

/**
 * Verify and confirm payment after Razorpay checkout.
 */
export async function verifyPayment(params: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}): Promise<{ success: boolean }> {
  const { data } = await apiClient.post('/payments/verify', params);
  return data;
}

/**
 * Get all bookings for the logged-in user.
 */
export async function getUserBookings(): Promise<Booking[]> {
  const { data } = await apiClient.get('/bookings/me');
  return data;
}

/**
 * Get a single booking's detail.
 */
export async function getBookingById(id: string): Promise<Booking> {
  const { data } = await apiClient.get(`/bookings/${id}`);
  return data;
}

/**
 * Cancel a booking.
 */
export async function cancelBooking(id: string): Promise<Booking> {
  const { data } = await apiClient.patch(`/bookings/${id}/cancel`);
  return data;
}
