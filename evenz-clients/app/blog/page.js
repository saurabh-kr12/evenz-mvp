import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { notFound } from 'next/navigation';

// Function to get all post summaries
async function getAllPosts() {
    const postsDirectory = path.join(process.cwd(), '_posts');
    
    try {
        const filenames = fs.readdirSync(postsDirectory);

        const posts = filenames
            .filter(filename => filename.endsWith('.md'))
            .map(filename => {
                const slug = filename.replace(/\.md$/, '');
                const fullPath = path.join(postsDirectory, filename);
                const fileContents = fs.readFileSync(fullPath, 'utf8');

                // Extract title (assumes first line is # Title)
                const titleMatch = fileContents.match(/^# (.*)/m);
                const title = titleMatch ? titleMatch[1].trim() : 'Untitled Post';

                // Extract description (first paragraph after title)
                const descriptionMatch = fileContents.match(/^# .*\n+(\s*\n)*(.*)/m);
                let description = 'Click to read this post...';
                if (descriptionMatch && descriptionMatch[2]) {
                    description = descriptionMatch[2].split('\n')[0].substring(0, 160);
                    if (description.length === 160) description += '...';
                }

                return { slug, title, description };
            });
        
        // Sort posts (e.g., alphabetically, or by date if you add it to frontmatter later)
        return posts.sort((a, b) => a.title.localeCompare(b.title));

    } catch (error) {
        console.error("Error reading blog posts:", error);
        return []; // Return empty array on error
    }
}

// SEO Metadata for the main blog page
export const metadata = {
  title: 'The Evenz.in Blog | Patna Event Planning Tips',
  description: 'Advice, guides, and insights for planning the perfect event in Patna. Find tips on caterers, budgeting, and more from the Evenz.in team.',
}

// The page component
export default async function BlogIndexPage() {
    const posts = await getAllPosts();

    if (!posts || posts.length === 0) {
        return (
            <div className="bg-white py-12 px-4 text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Our Blog is Coming Soon</h1>
                <p className="text-lg text-gray-600">We&apos;re busy writing our first articles. Check back shortly!</p>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen py-6 md:py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-8 pb-4 border-b border-gray-200">
                    The Evenz.in Blog
                </h1>
                
                <div className="space-y-10">
                    {posts.map((post) => (
                        <Link 
                            key={post.slug}
                            href={`/blog/${post.slug}`}
                            className="block group"
                        >
                            <article className="p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100">
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                                    {post.title}
                                </h2>
                                <p className="text-base text-gray-600 mb-4">
                                    {post.description}
                                </p>
                                <span className="font-semibold text-indigo-600 group-hover:underline">
                                    Read post &rarr;
                                </span>
                            </article>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
