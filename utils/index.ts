import { IPost } from '../types';

export const sortByDate = (a: IPost, b: IPost): number => {
  return (
    new Date(b.frontmatter.date).getTime() -
    new Date(a.frontmatter.date).getTime()
  );
};
