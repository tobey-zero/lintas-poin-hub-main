import heroNews from "@/assets/hero-news.jpg";
import politics from "@/assets/news-politics.jpg";
import finance from "@/assets/news-finance.jpg";
import sport from "@/assets/news-sport.jpg";
import tech from "@/assets/news-tech.jpg";
import auto from "@/assets/news-auto.jpg";
import hiburan from "@/assets/news-hiburan.jpg";
import food from "@/assets/news-food.jpg";

export type Category =
  | "news" | "finance" | "sport" | "sepakbola"
  | "otomotif" | "tekno" | "hiburan" | "lifestyle"
  | "travel" | "food" | "health";

export const CATEGORIES: { slug: Category; label: string }[] = [
  { slug: "news", label: "News" },
  { slug: "finance", label: "Finance" },
  { slug: "sport", label: "Sport" },
  { slug: "sepakbola", label: "Sepakbola" },
  { slug: "otomotif", label: "Otomotif" },
  { slug: "tekno", label: "Tekno" },
  { slug: "hiburan", label: "Hiburan" },
  { slug: "lifestyle", label: "Lifestyle" },
  { slug: "travel", label: "Travel" },
  { slug: "food", label: "Food" },
  { slug: "health", label: "Health" },
];

export type Article = {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  category: Category;
  author: string;
  publishedAt: string; // relative
  readTime: string;
  trending?: boolean;
};

export const ARTICLES: Article[] = [
  {
    id: "1",
    title: "Pemerintah Resmi Umumkan Kebijakan Ekonomi Baru untuk 2026",
    excerpt: "Paket kebijakan baru ini mencakup insentif pajak bagi UMKM dan stimulus untuk sektor manufaktur dalam negeri.",
    image: heroNews,
    category: "news",
    author: "Andi Pratama",
    publishedAt: "2 jam lalu",
    readTime: "4 min",
    trending: true,
  },
  {
    id: "2",
    title: "DPR Sahkan RUU Perlindungan Data Pribadi Tahap Akhir",
    excerpt: "Setelah pembahasan panjang, DPR akhirnya menyepakati seluruh pasal dalam RUU PDP terbaru.",
    image: politics,
    category: "news",
    author: "Sinta Wijaya",
    publishedAt: "3 jam lalu",
    readTime: "3 min",
  },
  {
    id: "3",
    title: "IHSG Tembus Level Tertinggi Sepanjang Sejarah",
    excerpt: "Indeks Harga Saham Gabungan ditutup menguat tajam didorong saham perbankan dan komoditas.",
    image: finance,
    category: "finance",
    author: "Reza Hakim",
    publishedAt: "1 jam lalu",
    readTime: "5 min",
    trending: true,
  },
  {
    id: "4",
    title: "Rupiah Menguat di Tengah Sentimen Positif Global",
    excerpt: "Mata uang Garuda diperdagangkan di level Rp15.250 per dolar AS, terkuat dalam tiga bulan terakhir.",
    image: finance,
    category: "finance",
    author: "Maya Sari",
    publishedAt: "4 jam lalu",
    readTime: "3 min",
  },
  {
    id: "5",
    title: "Timnas Indonesia Lolos ke Putaran Final Piala Asia",
    excerpt: "Kemenangan dramatis 2-1 atas lawan tangguh memastikan tiket ke putaran final.",
    image: sport,
    category: "sepakbola",
    author: "Bayu Saputra",
    publishedAt: "30 menit lalu",
    readTime: "4 min",
    trending: true,
  },
  {
    id: "6",
    title: "Atlet Bulutangkis Indonesia Sabet Emas di Kejuaraan Dunia",
    excerpt: "Prestasi membanggakan kembali ditorehkan oleh ganda putra andalan Indonesia.",
    image: sport,
    category: "sport",
    author: "Dimas Aryo",
    publishedAt: "5 jam lalu",
    readTime: "3 min",
  },
  {
    id: "7",
    title: "Mobil Listrik Lokal Resmi Diluncurkan dengan Harga Terjangkau",
    excerpt: "Produsen otomotif nasional merilis EV pertama dengan jangkauan hingga 400 km sekali pengisian.",
    image: auto,
    category: "otomotif",
    author: "Fajar Nugroho",
    publishedAt: "6 jam lalu",
    readTime: "5 min",
  },
  {
    id: "8",
    title: "Smartphone Flagship Terbaru Dibekali AI Generasi Baru",
    excerpt: "Teknologi pemrosesan gambar dan asisten cerdas onboard menjadi sorotan utama.",
    image: tech,
    category: "tekno",
    author: "Rini Astuti",
    publishedAt: "1 jam lalu",
    readTime: "4 min",
    trending: true,
  },
  {
    id: "9",
    title: "Konser Akbar Musisi Tanah Air Pecahkan Rekor Penonton",
    excerpt: "Lebih dari 50 ribu penonton hadir memadati stadion sepanjang malam.",
    image: hiburan,
    category: "hiburan",
    author: "Tania Putri",
    publishedAt: "8 jam lalu",
    readTime: "3 min",
  },
  {
    id: "10",
    title: "Tren Lifestyle Sehat: Slow Living Jadi Pilihan Generasi Muda",
    excerpt: "Gaya hidup yang lebih lambat dan mindful kini diadopsi banyak profesional muda.",
    image: food,
    category: "lifestyle",
    author: "Lulu Hasanah",
    publishedAt: "10 jam lalu",
    readTime: "4 min",
  },
  {
    id: "11",
    title: "Destinasi Wisata Tersembunyi di Indonesia Timur yang Wajib Dikunjungi",
    excerpt: "Eksplorasi pantai tersembunyi dan budaya lokal yang masih sangat autentik.",
    image: heroNews,
    category: "travel",
    author: "Yoga Pradana",
    publishedAt: "12 jam lalu",
    readTime: "6 min",
  },
  {
    id: "12",
    title: "Resep Kuliner Nusantara Modern yang Mendunia",
    excerpt: "Chef Indonesia berhasil mengangkat hidangan tradisional ke meja restoran kelas dunia.",
    image: food,
    category: "food",
    author: "Sari Devi",
    publishedAt: "1 hari lalu",
    readTime: "5 min",
  },
  {
    id: "13",
    title: "Studi Terbaru: Tidur Berkualitas Kunci Imunitas Tubuh",
    excerpt: "Para peneliti menemukan korelasi kuat antara durasi tidur dan sistem kekebalan.",
    image: tech,
    category: "health",
    author: "dr. Anita",
    publishedAt: "1 hari lalu",
    readTime: "4 min",
  },
  {
    id: "14",
    title: "Liga Champions: Drama Adu Penalti Antarkan Tim Underdog ke Final",
    excerpt: "Pertandingan menegangkan berakhir dengan kemenangan tipis lewat babak adu penalti.",
    image: sport,
    category: "sepakbola",
    author: "Bayu Saputra",
    publishedAt: "2 jam lalu",
    readTime: "4 min",
  },
];

export const TICKER_HEADLINES = [
  "BREAKING: IHSG cetak rekor tertinggi sepanjang masa",
  "Timnas Indonesia melaju ke final Piala Asia",
  "BMKG: Waspada cuaca ekstrem di sejumlah wilayah",
  "Harga BBM non-subsidi mengalami penyesuaian",
  "Pemerintah luncurkan program insentif UMKM 2026",
];

export function getArticlesByCategory(slug: Category) {
  return ARTICLES.filter((a) => a.category === slug);
}
export function getArticleById(id: string) {
  return ARTICLES.find((a) => a.id === id);
}
export function getCategoryLabel(slug: Category) {
  return CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;
}
