import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirect handled by middleware
  redirect('/dashboard');
}
