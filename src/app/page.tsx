import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/en'); // Redirect to the default locale
}