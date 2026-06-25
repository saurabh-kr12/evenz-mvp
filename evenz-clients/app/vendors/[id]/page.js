import CatererProfileView from '@/pages/VendorProfile'; // Make sure this is the correct path

export async function generateMetadata(props) {
  try {
    const params = await props.params;
    const catererId = params.id;

    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/caterers-details/${catererId}/view-profile`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch caterer data. HTTP Status: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success || !data.data?.vendorInfo) {
      return {
        title: 'Caterer Not Found | Evenz.in',
        description: 'The caterer you are looking for could not be found on Evenz.in.',
      };
    }

    const caterer = data.data.vendorInfo;
    const cuisines = Array.isArray(data.data.menu?.cuisines) ? data.data.menu.cuisines : [];

    const businessName = caterer?.businessName || 'Caterer Profile';
    const city = caterer?.address?.city ? ` in ${caterer.address.city}` : '';
    const cuisineText = cuisines.length > 0 ? ` Specializing in ${cuisines.join(', ')}.` : '';

    return {
      title: `${businessName} - Catering${city} | Evenz.in`,
      description: `Book ${businessName} for your next event in Patna.${cuisineText} View packages, check availability, and get a free quote on Evenz.in.`,
    };
  } catch (error) {
    console.error('Error generating metadata for vendor profile:', error);
    return {
      title: 'Caterer Profile | Evenz.in',
      description: 'View caterer details, check availability, and book for your next event on Evenz.in.',
    };
  }
}

export default function VendorProfilePage() {
  return <CatererProfileView />;
}