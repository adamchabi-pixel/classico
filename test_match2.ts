function cleanTitle(title: string): string {
  if (!title) return "";
  let t = title.toLowerCase();
  // Remove parenthesized or bracketed years e.g. (2014), [2017]
  t = t.replace(/\(\d{4}\)/g, " ");
  t = t.replace(/\[\d{4}\]/g, " ");
  // Remove freestanding 4-digit years at the end of title, e.g. "John Wick 2014"
  t = t.replace(/\b(19|20)\d{2}\b/g, " ");
  
  return t
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9]/g, " ")     // replace punctuation with space
    .replace(/\s+/g, " ")           // collapse spaces
    .trim()
    .replace(/^(the|a|an|le|la|les|l)\s+/i, "");
}
console.log(cleanTitle("The Devil Wears Prada 2") === cleanTitle("Devil Wears Prada 2"));
