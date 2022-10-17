export interface IFrontMatter {
  title: string;
  author: string;
  excerpt: string;
  categories: string[];
  cover_image: string;
  date: string;
}

export interface IPost {
  frontmatter: IFrontMatter;
  slug: string;
}
