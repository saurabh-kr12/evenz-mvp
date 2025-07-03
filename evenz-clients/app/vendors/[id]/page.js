import CatererProfileView from '../../../pages/VendorProfile';

export default function VendorProfile({ params }) {
  return <CatererProfileView params={params} />;
}

// Optional: Add metadata
// export async function generateMetadata({ params }) {
//   return {
//     title: `Vendor Profile - ${params.id}`,
//   };
// }