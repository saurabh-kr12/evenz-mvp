import { notFound } from 'next/navigation';
import ComingSoonPage from '@/pages/ComingSoon';

// --- THE FIX: Define a clear list of valid categories ---
const VALID_CATEGORIES = ['photographers', 'decorators', 'djs'];

// Helper to format the category name for the title
const formatCategoryTitle = (category) => {
  if (!category) return 'New Service';
  return category.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
};

// This function tells Next.js which pages to build for this dynamic route.
// Any path not listed here will result in a 404 Not Found page.
export async function generateStaticParams() {
  return VALID_CATEGORIES.map((category) => ({
    category,
  }));
}

// This function generates the specific "Coming Soon" metadata for each valid category.
export async function generateMetadata({ params }) {
  const { category } = await params;

  // Safety check: If the category is not in our valid list, trigger a 404.
  if (!VALID_CATEGORIES.includes(category)) {
    notFound();
  }
  
  const formattedTitle = formatCategoryTitle(category);

  return {
    title: `${formattedTitle} in Patna - Coming Soon on Evenz.in`,
    description: `Evenz.in is expanding! We will soon be launching our service for the best professional ${formattedTitle.toLowerCase()} in Patna. Join our waitlist to get notified.`,
  };
}

// This component now checks for validity before rendering.
export default async function DynamicCategoryPage({ params }) {
  const { category } = await params;

  // Final safety check: If the category is not valid, show the 404 page.
  if (!VALID_CATEGORIES.includes(category)) {
    notFound();
  }
  
  return <ComingSoonPage category={category} />;
}

