import kuromoji from 'kuromoji';
import path from 'path';

let _promise: Promise<kuromoji.Tokenizer<kuromoji.IpadicFeatures>> | null = null;

function getTokenizer() {
  if (!_promise) {
    _promise = new Promise((resolve, reject) => {
      kuromoji
        .builder({ dicPath: path.join(process.cwd(), 'node_modules/kuromoji/dict') })
        .build((err, t) => (err ? reject(err) : resolve(t)));
    });
  }
  return _promise;
}

function kata2hira(s: string): string {
  return s.replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60));
}

export type FuriToken = {
  surface: string;
  reading: string | null; // hiragana reading; null = already kana or unknown
};

export async function tokenize(text: string): Promise<FuriToken[]> {
  const t = await getTokenizer();
  return t.tokenize(text).map(tok => {
    const s = tok.surface_form;
    // Already kana — no annotation needed
    if (/^[ぁ-ゖァ-ヶーっッ]+$/.test(s)) return { surface: s, reading: null };
    const r = tok.reading && tok.reading !== '*' ? kata2hira(tok.reading) : null;
    return { surface: s, reading: r === s ? null : r };
  });
}
