export const BAD_WORDS_RE = /幹|屎|尿|屁|糞|靠北|靠腰|雞掰|王八|你媽|妳媽|淫/g

export function containsBadWords(text: string): boolean {
  BAD_WORDS_RE.lastIndex = 0
  return BAD_WORDS_RE.test(text)
}
