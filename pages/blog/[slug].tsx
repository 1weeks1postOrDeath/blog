import fs from 'fs';
import matter from 'gray-matter';
// import { marked } from 'marked';
import Link from 'next/link';
import path from 'path';
import { IFrontMatter } from '../../types';
import { marked } from '../../utils/libs/marked';

export default function PostPage({
  frontmatter: { title, date, cover_image, author },
  slug,
  content,
}: {
  frontmatter: IFrontMatter;
  slug: string;
  content: string;
}) {
  return (
    <>
      <Link href="/">
        <a className="btn btn-back">Go Back</a>
      </Link>
      <div className="card card-page">
        <h1 className="post-title">{title}</h1>
        <div className="post-date">Posted on {date}</div>
        <div className="post-author">Post by {author}</div>
        <img src={cover_image} alt="cover" />
        <div className="post-body">
          <div dangerouslySetInnerHTML={{ __html: marked(content) }}></div>
        </div>
      </div>
    </>
  );
}

export async function getStaticPaths() {
  const files = fs.readdirSync(path.join('posts'));

  const paths = files.map((filename) => ({
    params: {
      slug: filename.replace('.md', ''),
    },
  }));

  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({
  params: { slug },
}: {
  params: { slug: string };
}) {
  const markdownWithMeta = fs.readFileSync(
    path.join('posts', slug + '.md'),
    'utf-8'
  );

  const { data: frontmatter, content } = matter(markdownWithMeta);

  return {
    props: {
      frontmatter,
      slug,
      content,
    },
  };
}
