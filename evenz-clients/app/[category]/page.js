// app/[category]/page.js
import ComingSoonPage from '../../pages/ComingSoon';

export default function CategoryPage({ params }) {
  return <ComingSoonPage params={params} />;
}