import { redirect } from 'next/navigation';

// Settings page — redirects to profile for now
export default function SettingsPage() {
  redirect('/profile');
}
