// Complete Bible structure: 66 books with chapter counts
const bibleData = {
  name: "Bible",
  children: [
    // OLD TESTAMENT
    {
      name: "Genesis",
      children: Array.from({length: 50}, (_, i) => ({name: String(i + 1)}))
    },
    {
      name: "Exodus",
      children: Array.from({length: 40}, (_, i) => ({name: String(i + 1)}))
    },
    {
      name: "Leviticus",
      children: Array.from({length: 27}, (_, i) => ({name: String(i + 1)}))
    },
    {
      name: "Numbers",
      children: Array.from({length: 36}, (_, i) => ({name: String(i + 1)}))
    },
    {
      name: "Deuteronomy",
      children: Array.from({length: 34}, (_, i) => ({name: String(i + 1)}))
    },
    {
      name: "Joshua",
      children: Array.from({length: 24}, (_, i) => ({name: String(i + 1)}))
    },
    {
      name: "Judges",
      children: Array.from({length: 21}, (_, i) => ({name: String(i + 1)}))
    },
    {
      name: "Ruth",
      children: Array.from({length: 4}, (_, i) => ({name: String(i + 1)}))
    },
    {
      name: "1 Samuel",
      children: Array.from({length: 31}, (_, i) => ({name: String(i + 1)}))
    },
    {
      name: "2 Samuel",
      children: Array.from({length: 24}, (_, i) => ({name: String(i + 1)}))
    },
    {
      name: "1 Kings",
      children: Array.from({length: 22}, (_, i) => ({name: String(i + 1)}))
    },
    {
      name: "2 Kings",
      children: Array.from({length: 25}, (_, i) => ({name: String(i + 1)}))
    },
    {
      name: "1 Chronicles",
      children: Array.from({length: 29}, (_, i) => ({name: String(i + 1)}))
    },
    {
      name: "2 Chronicles",
      children: Array.from({length: 36}, (_, i) => ({name: String(i + 1)}))
    },
    {
      name: "Ezra",
      children: Array.from({length: 10}, (_, i) => ({name: String(i + 1)}))
    },
    {
      name: "Nehemiah",
      children: Array.from({length: 13}, (_, i) => ({name: String(i + 1)}))
    },
    {
      name: "Esther",
      children: Array.from({length: 10}, (_, i) => ({name: String(i + 1)}))
    },
    {
      name: "Job",
      children: Array.from({length: 42}, (_, i) => ({name: String(i + 1)}))
    },
    {
      name: "Psalms",
      children: Array.from({length: 150}, (_, i) => ({name: String(i + 1)}))
    },
    {
      name: "Proverbs",
      children: Array.from({length: 31}, (_, i) => ({name: String(i + 1)}))
    },
    {
      name: "Ecclesiastes",
      children: Array.from({length: 12}, (_, i) => ({name: String(i + 1)}))
    },
    {
      name: "Song of Solomon",
      children: Array.from({length: 8}, (_, i) => ({name: String(i + 1)}))
    },
    {
      name: "Isaiah",
      children: Array.from({length: 66}, (_, i) => ({name: String(i + 1)}))
    },
    {
      name: "Jeremiah",
      children: Array.from({length: 52}, (_, i) => ({name: String(i + 1)}))
    },
    {
      name: "Lamentations",
      children: Array.from({length: 5}, (_, i) => ({name: String(i + 1)}))
    },
    {
      name: "Ezekiel",
      children: Array.from({length: 48}, (_, i) => ({name: String(i + 1)}))
    },
    {
      name: "Daniel",
      children: Array.from({length: 12}, (_, i) => ({name: String(i + 1)}))
    },
    {
      name: "Hosea",
      children: Array.from({length: 14}, (_, i) => ({name: String(i + 1)}))
    },
    {
      name: "Joel",
      children: Array.from({length: 3}, (_, i) => ({name: String(i + 1)}))
    },
    {
      name: "Amos",
      children: Array.from({length: 9}, (_, i) => ({name: String(i + 1)}))
    },
    {
      name: "Obadiah",
      children: Array.from({length: 1}, (_, i) => ({name: String(i + 1)}))
    },
    {
      name: "Jonah",
      children: Array.from({length: 4}, (_, i) => ({name: String(i + 1)}))
    },
    {
      name: "Micah",
      children: Array.from({length: 7}, (_, i) => ({name: String(i + 1)}))
    },
    {
      name: "Nahum",
      children: Array.from({length: 3}, (_, i) => ({name: String(i + 1)}))
    },
    {
      name: "Habakkuk",
      children: Array.from({length: 3}, (_, i) => ({name: String(i + 1)}))
    },
    {
      name: "Zephaniah",
      children: Array.from({length: 3}, (_, i) => ({name: String(i + 1)}))
    },
    {
      name: "Haggai",
      children: Array.from({length: 2}, (_, i) => ({name: String(i + 1)}))
    },
    {
      name: "Zechariah",
      children: Array.from({length: 14}, (_, i) => ({name: String(i + 1)}))
    },
    {
      name: "Malachi",
      children: Array.from({length: 4}, (_, i) => ({name: String(i + 1)}))
    },
    
    // NEW TESTAMENT
    {
      name: "Matthew",
      children: Array.from({length: 28}, (_, i) => ({name: String(i + 1)}))
    },
    {
      name: "Mark",
      children: Array.from({length: 16}, (_, i) => ({name: String(i + 1)}))
    },
    {
      name: "Luke",
      children: Array.from({length: 24}, (_, i) => ({name: String(i + 1)}))
    },
    {
      name: "John",
      children: Array.from({length: 21}, (_, i) => ({name: String(i + 1)}))
    },
    {
      name: "Acts",
      children: Array.from({length: 28}, (_, i) => ({name: String(i + 1)}))
    },
    {
      name: "Romans",
      children: Array.from({length: 16}, (_, i) => ({name: String(i + 1)}))
    },
    {
      name: "1 Corinthians",
      children: Array.from({length: 16}, (_, i) => ({name: String(i + 1)}))
    },
    {
      name: "2 Corinthians",
      children: Array.from({length: 13}, (_, i) => ({name: String(i + 1)}))
    },
    {
      name: "Galatians",
      children: Array.from({length: 6}, (_, i) => ({name: String(i + 1)}))
    },
    {
      name: "Ephesians",
      children: Array.from({length: 6}, (_, i) => ({name: String(i + 1)}))
    },
    {
      name: "Philippians",
      children: Array.from({length: 4}, (_, i) => ({name: String(i + 1)}))
    },
    {
      name: "Colossians",
      children: Array.from({length: 4}, (_, i) => ({name: String(i + 1)}))
    },
    {
      name: "1 Thessalonians",
      children: Array.from({length: 5}, (_, i) => ({name: String(i + 1)}))
    },
    {
      name: "2 Thessalonians",
      children: Array.from({length: 3}, (_, i) => ({name: String(i + 1)}))
    },
    {
      name: "1 Timothy",
      children: Array.from({length: 6}, (_, i) => ({name: String(i + 1)}))
    },
    {
      name: "2 Timothy",
      children: Array.from({length: 4}, (_, i) => ({name: String(i + 1)}))
    },
    {
      name: "Titus",
      children: Array.from({length: 3}, (_, i) => ({name: String(i + 1)}))
    },
    {
      name: "Philemon",
      children: Array.from({length: 1}, (_, i) => ({name: String(i + 1)}))
    },
    {
      name: "Hebrews",
      children: Array.from({length: 13}, (_, i) => ({name: String(i + 1)}))
    },
    {
      name: "James",
      children: Array.from({length: 5}, (_, i) => ({name: String(i + 1)}))
    },
    {
      name: "1 Peter",
      children: Array.from({length: 5}, (_, i) => ({name: String(i + 1)}))
    },
    {
      name: "2 Peter",
      children: Array.from({length: 3}, (_, i) => ({name: String(i + 1)}))
    },
    {
      name: "1 John",
      children: Array.from({length: 5}, (_, i) => ({name: String(i + 1)}))
    },
    {
      name: "2 John",
      children: Array.from({length: 1}, (_, i) => ({name: String(i + 1)}))
    },
    {
      name: "3 John",
      children: Array.from({length: 1}, (_, i) => ({name: String(i + 1)}))
    },
    {
      name: "Jude",
      children: Array.from({length: 1}, (_, i) => ({name: String(i + 1)}))
    },
    {
      name: "Revelation",
      children: Array.from({length: 22}, (_, i) => ({name: String(i + 1)}))
    }
  ]
};
