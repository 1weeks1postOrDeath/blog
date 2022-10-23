/* eslint-disable @next/next/no-css-tags */
import fs from 'fs';
import matter from 'gray-matter';
import Head from 'next/head';
import path from 'path';
import Post from '../components/Post';
import { IPost } from '../types';
import { sortByDate } from '../utils';

export default function Home({ posts }: { posts: IPost[] }) {
  return (
    <div>
      <Head>
        <title>Dev Blog</title>
        <link
          rel="stylesheet"
          href="//cdnjs.cloudflare.com/ajax/libs/highlight.js/11.6.0/styles/default.min.css"
        />
      </Head>
      <div className="posts">
        {posts.map((post: any, index: number) => (
          <Post key={index} post={post} />
        ))}
      </div>
    </div>
  );
}

export async function getStaticProps() {
  // Get files from the posts dir
  const files = fs.readdirSync(path.join('posts'));

  // Get slug and frontmatter from posts
  const posts = files.map((filename) => {
    // Create slug
    const slug = filename.replace('.md', '');

    // Get frontmatter
    const markdownWithMeta = fs.readFileSync(
      path.join('posts', filename),
      'utf-8'
    );

    const { data: frontmatter } = matter(markdownWithMeta);

    return {
      slug,
      frontmatter,
    };
  });

  return {
    props: {
      posts: posts.sort(sortByDate),
    },
  };
}
