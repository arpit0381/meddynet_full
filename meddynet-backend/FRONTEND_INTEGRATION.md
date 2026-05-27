# MeddyNet Frontend Integration Guide

This guide is for the Next.js 16 User App, Admin Dashboard, Technician PWA, and Lab Partner Portal.
It details how to connect strictly to the `api.meddynet.com` (or `localhost:8000`) backend.

## 1. Environment Parsing
All 4 apps should load the API url from `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/v1
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

## 2. Authentication Flow (Axios / fetch)
Authentication relies on Supabase OTP mapped strictly to our JVM schema.

### Send OTP
```ts
const res = await axios.post('/auth/send-otp', { phone: '+919876543210' });
```

### Verify OTP
```ts
const res = await axios.post('/auth/verify-otp', { phone: '+919876543210', otp: '123456' });
const { access_token, refresh_token, user } = res.data;
// Store tokens locally (Secure cookies or LocalStorage based on app structure)
```

## 3. Connecting to the Real-Time WebSocket
Technician location tracking and Booking state pings occur over `ws://`

```tsx
import { useEffect, useRef } from 'react';

export function useMeddyNetSocket(clientType: 'user' | 'tech' | 'lab', clientId: string) {
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ws.current = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/ws/${clientType}/${clientId}`);
    
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Received real-time ping:', data);
    };

    return () => ws.current?.close();
  }, [clientType, clientId]);

  const sendLocationPing = (lat: number, lng: number) => {
    ws.current?.send(JSON.stringify({ type: 'LOCATION_UPDATE', lat, lng }));
  };

  return { sendLocationPing };
}
```

## 4. Payment Creation (Razorpay)
When the user checks out the cart via Next.js:

```ts
// 1. Backend creates order
const orderRes = await axios.post('/payments/create-order', { booking_id: 'uuid' }, { headers });
const { razorpay_order_id, amount } = orderRes.data;

// 2. Open Razorpay Checktout using Next.js Window
const options = {
    key: "YOUR_RAZORPAY_KEY", 
    amount: amount,
    currency: "INR",
    name: "MeddyNet",
    order_id: razorpay_order_id,
    handler: async function (response) {
        // 3. Verify Payment
        await axios.post('/payments/verify', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
        });
        alert('Payment Success!');
    }
};
const rzp = new (window as any).Razorpay(options);
rzp.open();
```

## 5. Security Context
Include the `Authorization` header standard across layouts. We recommend setting an Axios interceptor:
```ts
axios.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
```
