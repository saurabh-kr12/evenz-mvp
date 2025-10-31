import fs from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';

import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw'; // For rendering HTML (like the image div)
import matter from 'gray-matter'; // For parsing frontmatter (title, description)

const postsDirectory = path.join(process.cwd(), '_posts');

// Helper function to get post content AND frontmatter
function getPostBySlug(slug) {
    const fullPath = path.join(postsDirectory, `${slug}.md`);

    try {
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        // Use gray-matter to parse the post metadata and content
        const { data, content } = matter(fileContents);

        return {
            slug,
            frontmatter: data,
            content,
        };
    } catch (error) {
        console.error(`Error reading post ${slug}:`, error);
        return null; // Indicate post not found
    }
}

// Function to generate Metadata dynamically for SEO
export async function generateMetadata({ params }) {
    const awaitedParams = await params; // Fix for Next.js build error
    const post = getPostBySlug(awaitedParams.slug);

    if (!post) {
        return {
            title: 'Post Not Found | Evenz.in Blog',
        };
    }

    return {
        title: `${post.frontmatter.title} | Evenz.in Blog`,
        description: post.frontmatter.description,
    };
}

// The Page component
export default async function BlogPostPage({ params }) {
    const awaitedParams = await params; // Fix for Next.js build error
    const post = getPostBySlug(awaitedParams.slug);

    if (!post) {
        notFound(); // Trigger the 404 page if post doesn't exist
    }

    return (
        <div className="bg-white py-8 sm:py-10 md:py-12 px-4 sm:px-6 lg:px-8">
            <article className="prose prose-indigo lg:prose-xl mx-auto prose-img:rounded-lg prose-img:m-0 prose-p:m-0">
                <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                    {post.content}
                </ReactMarkdown>
            </article>
        </div>
    );
}

// Generate static paths at build time
export async function generateStaticParams() {
    try {
        const filenames = fs.readdirSync(postsDirectory);

        return filenames
            .filter(filename => filename.endsWith('.md'))
            .map((filename) => ({
                slug: filename.replace(/\.md$/, ''),
            }));
    } catch (error) {
        console.error("Could not read _posts directory for generateStaticParams:", error);
        return []; 
    }
}

