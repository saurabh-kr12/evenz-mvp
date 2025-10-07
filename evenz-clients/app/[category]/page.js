import ComingSoonPage from '@/pages/ComingSoon';

// Helper to format the category name
const formatCategoryTitle = (category) => {
  if (!category) return 'New Service';
  return category.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
};

// ✅ FIXED VERSION — await params properly
export async function generateMetadata({ params }) {
  const { category } = await params; // ✅ correct way
  const formattedTitle = formatCategoryTitle(category);

  return {
    title: `${formattedTitle} in Patna - Coming Soon on Evenz.in`,
    description: `Evenz.in is expanding! We will soon be launching our service for the best professional ${formattedTitle.toLowerCase()} in Patna. Join our waitlist to get notified.`,
  };
}

// ✅ Component remains same
export default async function DynamicCategoryPage({ params }) {
  const { category } = await params; // ✅ required in Next.js 15 dynamic routes
  return <ComingSoonPage category={category} />;
}
