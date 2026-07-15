function cleanTitle(t: string) {
  return t
    .toLowerCase()
    .replace(/^the\s+/i, "")
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

console.log(cleanTitle("Devil Wears Prada 2") === cleanTitle("The Devil Wears Prada 2"))
