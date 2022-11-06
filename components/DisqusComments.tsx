import { DiscussionEmbed } from 'disqus-react';
import { IFrontMatter } from '../types';

interface IDisqusCommentsProps {
  frontmatter: IFrontMatter;
  slug: string;
}

const DisqusComments: React.FC<IDisqusCommentsProps> = ({
  frontmatter,
  slug,
}) => {
  const { title, author } = frontmatter;
  const disqusShortname = 'oneweeks-onepost-or-death';
  const disqusConfig = {
    url: `https://oneweeks-onepost-or-death.vercel.app/${slug}`,
    identifier: slug + author, // Single post id
    title: title, // Single post title
  };
  return (
    <div>
      <DiscussionEmbed shortname={disqusShortname} config={disqusConfig} />
    </div>
  );
};
export default DisqusComments;
