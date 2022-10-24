import Link from 'next/link';
import { IPost } from '../types';

export default function Post({ post }: { post: IPost }) {
  return (
    <div className="card">
      <div className="card-image">
        <img src={post.frontmatter.cover_image} alt="cover" />
      </div>
      <div className="post-date">Posted on {post.frontmatter.date}</div>
      <h3>{post.frontmatter.title}</h3>
      <span className="post-author">Posted by {post.frontmatter.author}</span>
      <p>{post.frontmatter.excerpt}</p>
      <Link href={`/blog/${post.slug}`}>
        <a className="btn">Read More</a>
      </Link>
    </div>
  );
}
