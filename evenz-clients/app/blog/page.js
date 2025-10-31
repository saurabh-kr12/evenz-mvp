import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import matter from 'gray-matter'; // Make sure to run `npm install gray-matter`

// This function runs on the server (or at build time)
const getPosts = () => {
    const postsDirectory = path.join(process.cwd(), '_posts');

    let filenames = [];
    try {
        filenames = fs.readdirSync(postsDirectory);
    } catch (error) {
        console.error("Could not read _posts directory:", error);
        return []; // Return empty if directory doesn't exist
    }

    const posts = filenames
        .filter(filename => filename.endsWith('.md'))
        .map((filename) => {
            const filePath = path.join(postsDirectory, filename);
            const fileContents = fs.readFileSync(filePath, 'utf8');

            // Use gray-matter to parse the post metadata section
            const { data } = matter(fileContents);

            // Generate the slug from the filename
            const slug = filename.replace(/\.md$/, '');

            return {
                slug,
                title: data.title || 'Untitled Post', // Get title from frontmatter
                description: data.description || 'No description available.', // Get description
            };
        });

    // You can sort posts here if you add a 'date' to your frontmatter
    // For now, we'll just return them as is
    return posts;
};

// The main page component
export default function BlogIndexPage() {
    const posts = getPosts();

    return (
        <div className="bg-white min-h-screen py-6 md:py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* Responsive Page Title */}
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-8 pb-4 border-b border-gray-200">
                    The Evenz.in Blog
                </h1>

                {posts.length > 0 ? (
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
                                    <p className="text-base sm:block hidden text-gray-600 mb-4">
                                        {post.description}
                                    </p>
                                    <span className="font-semibold text-indigo-600 group-hover:underline">
                                        Read post &rarr;
                                    </span>
                                </article>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-600">
                        We&apos;re busy writing our first articles. Check back soon!
                    </p>
                )}
            </div>
        </div>
    );
}

