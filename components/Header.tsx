import Link from 'next/link';

export default function Header() {
  return (
    <header>
      <div className="header-container">
        <Link href="/" passHref>
          <h2>OA Dev Blog</h2>
        </Link>
      </div>
    </header>
  );
}
