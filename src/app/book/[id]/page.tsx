import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllBookChapters, getBookChapter, type BookSection, type BookSong, type BookChapter } from '@/lib/parseBook';
import '../book.css';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const chapters = getAllBookChapters();
  return chapters.map(c => ({ id: c.id }));
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const decoded = decodeURIComponent(id);
  return {
    title: `${decoded} | 韻辞典 書籍版`,
  };
}

export default async function BookChapterPage({ params }: Props) {
  const { id } = await params;
  const chapterId = decodeURIComponent(id);
  const chapter = getBookChapter(chapterId);
  if (!chapter) notFound();

  return (
    <div className="book-mode">
      <div className="book-mode-header">
        <h1>{chapter.title}</h1>
        <Link href="/book">← 章一覧</Link>
      </div>

      <div className="book-chapter">
        {/* Opening spread: the chapter overview */}
        <OverviewSpread chapter={chapter} />

        {/* One spread per sub-category */}
        {chapter.sections.map((section, i) => (
          <SectionSpread key={i} chapter={chapter} section={section} index={i} />
        ))}

        {chapter.sections.length === 0 && (
          <div className="book-no-sections">
            この章はまだ書籍版での見出し分割に対応していません。
            通常版を{' '}
            <Link href={`/chapters/${encodeURIComponent(chapter.id)}`}>こちら</Link>{' '}
            からご覧ください。
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   Opening spread: title + tag-line + chapter description
   ============================================================ */
function OverviewSpread({ chapter }: { chapter: BookChapter }) {
  return (
    <article className="book-spread book-spread--overview">
      <main className="book-pages">
        <div className="book-overview">
          <span className="book-overview-chapter-no">第 {chapter.number} 章</span>
          <h2 className="book-overview-title">{chapter.title}</h2>
          {chapter.subtitle && (
            <p className="book-overview-tagline">{chapter.subtitle}</p>
          )}
          {chapter.description && chapter.description !== chapter.subtitle && (
            <p className="book-overview-body">{chapter.description}</p>
          )}
        </div>
      </main>
      <aside className="book-band">
        <h1 className="book-band-title">{chapter.title.replace(/^[①-⑨]/, '')}</h1>
        {chapter.subtitle && (
          <p className="book-band-subtitle">{chapter.subtitle}</p>
        )}
      </aside>
    </article>
  );
}

/* ============================================================
   A single sub-category spread.
   - Yellow band on the right (chapter title)
   - Upper: explainer
   - Divider
   - Lower: example songs + analysis table
   ============================================================ */
function SectionSpread({
  chapter,
  section,
  index,
}: {
  chapter: BookChapter;
  section: BookSection;
  index: number;
}) {
  // Pick up to 4 songs for the example column.
  const featuredSongs = section.songs.slice(0, 4);
  const tableSong = featuredSongs.find(s => s.primaryExamples.length > 0);

  return (
    <article className="book-spread" data-section-index={index}>
      <main className="book-pages">
        <div className="book-section">
          <header className="book-explainer">
            <h3 className="book-explainer-title">【{section.position}】</h3>
            {section.caption && (
              <p className="book-explainer-caption">{section.caption}</p>
            )}
            <p className="book-explainer-body">
              {section.intro ??
                'この調音グループに属する子音で末尾を揃えた韻。子音そのものが違っていても、調音位置や調音法が共通しているため、響きが揃って聞こえる――同位置韻／同方法韻の代表的な現れ方です。'}
            </p>
          </header>

          <hr className="book-divider" />

          <section className="book-examples">
            <div className="book-examples-songs">
              {featuredSongs.map((song, i) => (
                <SongColumn key={i} song={song} />
              ))}
            </div>
            {tableSong && <ExampleTable song={tableSong} />}
          </section>
        </div>
      </main>

      <aside className="book-band">
        <h1 className="book-band-title">{chapter.title.replace(/^[①-⑨]/, '')}</h1>
        <p className="book-band-subtitle">
          {section.position}
          {section.caption && ` ／ ${section.caption}`}
        </p>
      </aside>
    </article>
  );
}

function SongColumn({ song }: { song: BookSong }) {
  const examples =
    song.primaryExamples.length > 0 ? song.primaryExamples : song.secondaryExamples;
  const lines = examples.slice(0, 4);

  return (
    <div className="book-song-block">
      <div className="book-song-lyrics">
        {lines.map((line, i) => (
          <p key={i} className="book-song-lyric">
            {renderRhymeLine(line.text)}
          </p>
        ))}
      </div>
      {song.rhymeGroup && <span className="book-song-meta">{song.rhymeGroup}</span>}
      <span className="book-song-credit">
        {song.artist}「{song.title}」{song.year && `(${song.year})`}
      </span>
    </div>
  );
}

/**
 * Highlight the final mora visually — mirrors the red character at the end of
 * each example in the Illustrator template.
 */
function renderRhymeLine(text: string) {
  if (!text) return null;
  const trimmed = text.trimEnd();
  if (!trimmed) return text;
  const lastChar = trimmed.slice(-1);
  const head = trimmed.slice(0, -1);
  return (
    <>
      {head}
      <mark className="book-rhyme">{lastChar}</mark>
    </>
  );
}

function ExampleTable({ song }: { song: BookSong }) {
  const rows = song.primaryExamples.slice(0, 5);
  if (rows.length === 0) return null;
  return (
    <div className="book-table-wrap">
      <table className="book-table" aria-label={`${song.artist} ${song.title} の末尾母音/子音`}>
        <thead>
          <tr>
            <th>歌詞</th>
            <th>末尾母音</th>
            <th>末尾子音</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              <td>{truncate(row.text, 16)}</td>
              <td className="col-vowels">{row.vowels}</td>
              <td className="col-consonant">{row.consonant}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="book-table-credit">
        {song.artist} -「{song.title}」
      </div>
    </div>
  );
}

function truncate(s: string, n: number): string {
  if (s.length <= n) return s;
  return s.slice(0, n - 1) + '…';
}
