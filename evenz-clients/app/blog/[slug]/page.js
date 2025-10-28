import fs from 'fs';
import path from 'path';
import ReactMarkdown from 'react-markdown';
import { notFound } from 'next/navigation';

// Helper function to get post content (runs on the server)
function getPostBySlug(slug) {
    const postsDirectory = path.join(process.cwd(), '_posts');
    const fullPath = path.join(postsDirectory, `${slug}.md`);

    try {
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        // Simple extraction of title for metadata (assumes first line is # Title)
        const titleMatch = fileContents.match(/^# (.*)/);
        const title = titleMatch ? titleMatch[1] : 'Evenz.in Blog';
        // Simple extraction of description (first paragraph after title)
        const descriptionMatch = fileContents.match(/^# .*\n\n(.*)/);
        const description = descriptionMatch ? descriptionMatch[1].substring(0, 155) + '...' : 'Insights from Evenz.in';

        return { content: fileContents, title, description };
    } catch (error) {
        console.error(`Error reading post ${slug}:`, error);
        return null; // Indicate post not found
    }
}

// Function to generate Metadata dynamically for SEO
export async function generateMetadata({ params }) {
    // Await params before accessing its properties
    const { slug } = await params;
    const post = getPostBySlug(slug);

    if (!post) {
        return {
            title: 'Post Not Found | Evenz.in Blog',
        };
    }

    return {
        title: `${post.title} | Evenz.in Blog`,
        description: post.description,
    };
}

// The Page component
export default async function BlogPostPage({ params }) {
    // Await params before accessing its properties
    const { slug } = await params;
    const post = getPostBySlug(slug);

    if (!post) {
        notFound(); // Trigger the 404 page if post doesn't exist
    }

    return (
        <div className="bg-white py-8 sm:py-10 md:py-12 px-4 sm:px-6 lg:px-8">
            <article className="prose prose-indigo lg:prose-xl mx-auto">
                 <ReactMarkdown>{post.content}</ReactMarkdown>
            </article>
        </div>
    );
}

// (Optional but recommended) Generate static paths at build time
export async function generateStaticParams() {
    const postsDirectory = path.join(process.cwd(), '_posts');
    const filenames = fs.readdirSync(postsDirectory);

    return filenames.map((filename) => ({
        slug: filename.replace(/\.md$/, ''),
    }));
}