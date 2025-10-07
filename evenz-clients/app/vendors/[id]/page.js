import CatererProfileView from '@/pages/VendorProfile'; // Make sure this is the correct path to your component

// This function tells Next.js how to generate the metadata dynamically
export async function generateMetadata(props) {
  try {
    // --- THE FIX IS HERE ---
    // In newer Next.js versions, for dynamic routes, you must await the params object
    // before you can safely access its properties like .id
    const params = await props.params;
    const catererId = params.id;
    // --- END OF FIX ---

    // Fetch the specific caterer's data from your backend
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/caterers-details/${catererId}/view-profile`);

    if (!response.ok) {
        // This handles network errors (e.g., backend is down)
        throw new Error('Failed to fetch caterer data from the server.');
    }
    
    const data = await response.json();

    if (!data.success || !data.data?.vendorInfo) {
      return {
        title: 'Caterer Not Found | Evenz.in',
        description: 'The caterer you are looking for could not be found on Evenz.in.',
      };
    }

    const caterer = data.data.vendorInfo;
    const cuisines = data.data.menu?.cuisines || [];

    return {
      title: `${caterer.businessName} - Catering in ${caterer.address.city} | Evenz.in`,
      description: `Book ${caterer.businessName} for your next event in Patna. Specializing in ${cuisines.join(', ')}. View packages, check availability, and get a free quote on Evenz.in.`,
    };
  } catch (error) {
    console.error('Error generating metadata for vendor profile:', error);
    // Return a generic title if there's any error to prevent the build from failing
    return {
      title: 'Error | Evenz.in',
      description: 'There was an error loading the caterer details.',
    };
  }
}

// Your page component remains the same
export default function VendorProfilePage() {
    return <CatererProfileView />;
}
