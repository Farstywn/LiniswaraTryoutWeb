import type { TryoutQuestion } from "@/types";

interface QuestionBlueprint {
  topic: string;
  stimulus: string;
  statement_1: string;
  answer_1: boolean;
  statement_2: string;
  answer_2: boolean;
  statement_3: string;
  answer_3: boolean;
  explanation: string;
}

function makeQuestion(
  id: number,
  package_id: number,
  question_number: number,
  bp: QuestionBlueprint
): TryoutQuestion {
  return {
    id,
    package_id,
    question_number,
    ...bp,
  };
}

// ===== GENERATOR SOAL KONTEKSTUAL BERHITUNG & LITERASI SD/MI (KELAS 1-6) =====
function buildSdPerGradeQuestions(
  startId: number,
  packageId: number,
  gradeNum: 1 | 2 | 3 | 4 | 5 | 6,
  count: number
): TryoutQuestion[] {
  const result: TryoutQuestion[] = [];
  const names = ["Budi", "Siti", "Lani", "Edo", "Dira", "Farhan", "Nadia", "Raka", "Tari", "Gilang"];
  const items = ["buku tulis", "pensil warna", "kotak susu", "roti cokelat", "buah apel", "penggaris", "penghapus", "tas sekolah"];

  for (let i = 0; i < count; i++) {
    const qNum = i + 1;
    const id = startId + i;
    const nama = names[i % names.length];
    const barang = items[(i + gradeNum) % items.length];

    if (gradeNum === 1) {
      if (i % 3 === 0) {
        const a = 4 + (i % 6);
        const b = 2 + (i % 4);
        const tot = a + b;
        result.push(
          makeQuestion(id, packageId, qNum, {
            topic: "Penjumlahan Bilangan (Kelas 1)",
            stimulus: `${nama} memiliki ${a} buah ${barang} di atas meja. Ibu lalu membelikan ${b} buah ${barang} lagi untuk ${nama}.`,
            statement_1: `Jumlah seluruh ${barang} milik ${nama} sekarang adalah ${tot} buah.`,
            answer_1: true,
            statement_2: `Setelah diberi ibu, ${barang} ${nama} menjadi ${tot + 3} buah.`,
            answer_2: false,
            statement_3: `Banyaknya ${barang} tambahan dari ibu adalah ${b} buah.`,
            answer_3: true,
            explanation: `Penjumlahan ${a} + ${b} = ${tot} buah (Pernyataan 2 Salah).`,
          })
        );
      } else if (i % 3 === 1) {
        const total = 10 + (i % 5);
        const given = 3 + (i % 3);
        const sisa = total - given;
        result.push(
          makeQuestion(id, packageId, qNum, {
            topic: "Pengurangan Sederhana (Kelas 1)",
            stimulus: `Di keranjang kelas ada ${total} bola kasti. Pak Guru membagikan ${given} bola untuk latihan kelompok.`,
            statement_1: `Sisa bola kasti yang masih ada di keranjang berjumlah ${sisa} bola.`,
            answer_1: true,
            statement_2: `Bola di keranjang bertambah menjadi ${total + given} bola.`,
            answer_2: false,
            statement_3: `Sebanyak ${given} bola telah dibagikan oleh Pak Guru.`,
            answer_3: true,
            explanation: `Sisa bola di keranjang adalah ${total} - ${given} = ${sisa} bola (Pernyataan 2 Salah).`,
          })
        );
      } else {
        const jam = 6 + (i % 3);
        result.push(
          makeQuestion(id, packageId, qNum, {
            topic: "Kosakata & Kebiasaan Pagi (Kelas 1)",
            stimulus: `Setiap pagi pukul 0${jam}.00, ${nama} bangun tidur, merapikan bantal, lalu sarapan nasi dan telur sebelum berangkat ke SD Harapan.`,
            statement_1: `${nama} sarapan sebelum berangkat ke sekolah.`,
            answer_1: true,
            statement_2: `Kebiasaan tersebut dilakukan ${nama} pada pukul 12 malam.`,
            answer_2: false,
            statement_3: `${nama} ikut merapikan tempat tidurnya di pagi hari.`,
            answer_3: true,
            explanation: `Kegiatan merapikan bantal dan sarapan dilakukan pukul 0${jam}.00 pagi (Pernyataan 2 Salah).`,
          })
        );
      }
    } else if (gradeNum === 2) {
      if (i % 2 === 0) {
        const kotak = 3 + (i % 4);
        const isi = 4 + (i % 5);
        const total = kotak * isi;
        result.push(
          makeQuestion(id, packageId, qNum, {
            topic: "Perkalian Dasar & Uang (Kelas 2)",
            stimulus: `${nama} membeli ${kotak} bungkus permen jahe. Setiap bungkus berisi ${isi} butir permen yang sama banyak.`,
            statement_1: `Bentuk perkalian untuk menghitung total permen adalah ${kotak} × ${isi}.`,
            answer_1: true,
            statement_2: `Jumlah seluruh permen ${nama} adalah ${total} butir.`,
            answer_2: true,
            statement_3: `Jika hanya 1 bungkus dibuka, permennya berisi ${isi + 2} butir.`,
            answer_3: false,
            explanation: `Total permen = ${kotak} × ${isi} = ${total}; 1 bungkus berisi tepat ${isi} butir (Pernyataan 3 Salah).`,
          })
        );
      } else {
        const harga1 = (2 + (i % 3)) * 1000;
        const harga2 = (3 + (i % 2)) * 1000;
        const bayar = 10000;
        const kembali = bayar - (harga1 + harga2);
        result.push(
          makeQuestion(id, packageId, qNum, {
            topic: "Nilai Uang Rupiah (Kelas 2)",
            stimulus: `Di koperasi sekolah, harga 1 ${barang} Rp${harga1.toLocaleString("id-ID")} dan 1 buku gambar Rp${harga2.toLocaleString("id-ID")}. ${nama} membayar dengan 1 lembar uang Rp10.000.`,
            statement_1: `Total harga kedua barang belanjaan ${nama} adalah Rp${(harga1 + harga2).toLocaleString("id-ID")}.`,
            answer_1: true,
            statement_2: `Uang kembalian yang harus diterima ${nama} adalah Rp${kembali.toLocaleString("id-ID")}.`,
            answer_2: true,
            statement_3: `Uang Rp10.000 tidak cukup untuk membeli kedua barang tersebut.`,
            answer_3: false,
            explanation: `Total belanja Rp${(harga1 + harga2).toLocaleString("id-ID")} < Rp10.000 sehingga masih ada kembalian Rp${kembali.toLocaleString("id-ID")} (Pernyataan 3 Salah).`,
          })
        );
      }
    } else if (gradeNum === 3) {
      if (i % 2 === 0) {
        const meter = 2 + (i % 4);
        const cmPendek = 40 + (i % 3) * 10;
        const cmTotal = meter * 100;
        result.push(
          makeQuestion(id, packageId, qNum, {
            topic: "Satuan Panjang Meter & Sentimeter (Kelas 3)",
            stimulus: `Pita merah milik ${nama} panjangnya ${meter} meter. Sebagian pita sepanjang ${cmPendek} cm digunakan untuk menghias kado ulang tahun.`,
            statement_1: `Panjang awal pita merah sama dengan ${cmTotal} sentimeter (cm).`,
            answer_1: true,
            statement_2: `Sisa pita merah yang belum dipakai adalah ${cmTotal - cmPendek} cm.`,
            answer_2: true,
            statement_3: `Satu meter sama panjangnya dengan 10 sentimeter.`,
            answer_3: false,
            explanation: `1 meter = 100 cm sehingga ${meter} m = ${cmTotal} cm dan sisanya ${cmTotal - cmPendek} cm (Pernyataan 3 Salah).`,
          })
        );
      } else {
        const potong = 4 + (i % 4);
        result.push(
          makeQuestion(id, packageId, qNum, {
            topic: "Pecahan & Siklus Makhluk Hidup (Kelas 3)",
            stimulus: `Ibu memotong 1 loyang kue bolu menjadi ${potong} bagian sama besar untuk ${nama} dan adik. Di halaman rumah, mereka juga mengamati metamorfosis kupu-kupu dari ulat hingga menjadi kepompong.`,
            statement_1: `Setiap 1 potong kue bolu bernilai pecahan 1/${potong}.`,
            answer_1: true,
            statement_2: `Dalam siklus hidup kupu-kupu, ulat berubah menjadi kepompong sebelum menjadi kupu-kupu dewasa.`,
            answer_2: true,
            statement_3: `Semakin banyak potongan sama besar pada 1 kue utuh, ukuran tiap potongan semakin besar.`,
            answer_3: false,
            explanation: `Semakin banyak pembagian pada 1 kue utuh, ukuran tiap potongannya justru semakin kecil (Pernyataan 3 Salah).`,
          })
        );
      }
    } else if (gradeNum === 4) {
      if (i % 2 === 0) {
        const kelilingP = 12 + (i % 5) * 2;
        const kelilingL = 8 + (i % 4);
        const keliling = 2 * (kelilingP + kelilingL);
        const luas = kelilingP * kelilingL;
        result.push(
          makeQuestion(id, packageId, qNum, {
            topic: "Luas & Keliling Kebun Sekolah (Kelas 4)",
            stimulus: `Kebun apotek hidup SD Nusantara berbentuk persegi panjang berukuran panjang ${kelilingP} meter dan lebar ${kelilingL} meter.`,
            statement_1: `Keliling kebun sekolah tersebut adalah ${keliling} meter.`,
            answer_1: true,
            statement_2: `Luas kebun apotek hidup adalah ${luas} meter persegi (m²).`,
            answer_2: true,
            statement_3: `Kebun persegi panjang memiliki 4 sisi yang keempat-empatnya sama panjang seperti persegi.`,
            answer_3: false,
            explanation: `Keliling = 2×(${kelilingP}+${kelilingL}) = ${keliling} m; Luas = ${luas} m². Pada persegi panjang hanya sisi berhadapan yang sama panjang (Pernyataan 3 Salah).`,
          })
        );
      } else {
        result.push(
          makeQuestion(id, packageId, qNum, {
            topic: "IPAS: Bagian Tubuh Tumbuhan & Energi (Kelas 4)",
            stimulus: `Pada tanaman mangga di halaman sekolah, akar berfungsi menyerap air dan zat hara dari dalam tanah, sedangkan daun berklorofil mengolah makanan lewat fotosintesis dengan bantuan cahaya matahari.`,
            statement_1: `Akar tumbuhan bertugas menyerap air dan mineral dari tanah.`,
            answer_1: true,
            statement_2: `Daun hijau memerlukan cahaya matahari untuk melakukan fotosintesis.`,
            answer_2: true,
            statement_3: `Tumbuhan menghasilkan makanan hanya melalui bagian kelopak bunga di malam hari.`,
            answer_3: false,
            explanation: `Fotosintesis terjadi terutama pada daun yang berklorofil di siang hari (Pernyataan 3 Salah).`,
          })
        );
      }
    } else if (gradeNum === 5) {
      if (i % 2 === 0) {
        const vP = 40 + (i % 3) * 10;
        const vL = 20 + (i % 2) * 10;
        const vT = 30;
        const liter = (vP * vL * vT) / 1000;
        result.push(
          makeQuestion(id, packageId, qNum, {
            topic: "Volume Balok & Debit Air (Kelas 5)",
            stimulus: `Bak penampung air praktikum IPAS berbentuk balok dengan panjang ${vP} cm, lebar ${vL} cm, dan tinggi ${vT} cm.`,
            statement_1: `Volume penuh bak tersebut dalam satuan liter adalah ${liter} liter.`,
            answer_1: true,
            statement_2: `Jika bak baru terisi setengahnya, air di dalamnya bervolume ${liter / 2} liter.`,
            answer_2: true,
            statement_3: `Satu liter air sama dengan 100 sentimeter kubik (cm³).`,
            answer_3: false,
            explanation: `1 liter = 1.000 cm³. Jadi (${vP}×${vL}×${vT})/1000 = ${liter} liter (Pernyataan 3 Salah).`,
          })
        );
      } else {
        const harga = (6 + (i % 4)) * 10000;
        const diskon = 20;
        const pot = (harga * diskon) / 100;
        result.push(
          makeQuestion(id, packageId, qNum, {
            topic: "Persen, Pecahan & Rantai Makanan (Kelas 5)",
            stimulus: `Koperasi siswa menjual paket buku cerita seharga Rp${harga.toLocaleString("id-ID")} dengan potongan harga ${diskon}%. Selain itu, siswa belajar bahwa dalam ekosistem sawah padi dimakan tikus dan tikus dimakan ular.`,
            statement_1: `Potongan harga sebesar ${diskon}% setara dengan nilai pecahan 1/5 dari harga awal.`,
            answer_1: true,
            statement_2: `Harga paket buku setelah dipotong diskon menjadi Rp${(harga - pot).toLocaleString("id-ID")}.`,
            answer_2: true,
            statement_3: `Pada rantai makanan sawah tersebut, ular berperan sebagai produsen.`,
            answer_3: false,
            explanation: `Diskon 20% = 1/5 × Rp${harga.toLocaleString("id-ID")} = Rp${pot.toLocaleString("id-ID")}. Padi adalah produsen, ular adalah konsumen (Pernyataan 3 Salah).`,
          })
        );
      }
    } else {
      // Grade 6
      if (i % 2 === 0) {
        const kec = 50 + (i % 4) * 10;
        const jam = 2 + (i % 2);
        const jarak = kec * jam;
        result.push(
          makeQuestion(id, packageId, qNum, {
            topic: "AKM Numerasi: Kecepatan & Statistika (Kelas 6)",
            stimulus: `Rombongan studi wisata kelas 6 naik bus berkecepatan rata-rata ${kec} km/jam selama ${jam} jam nonstop menuju museum sains.`,
            statement_1: `Total jarak yang ditempuh rombongan selama ${jam} jam adalah ${jarak} km.`,
            answer_1: true,
            statement_2: `Jika kecepatan bus ditingkatkan, waktu tempuh untuk jarak yang sama akan lebih singkat.`,
            answer_2: true,
            statement_3: `Kecepatan rata-rata dihitung dengan mengalikan jarak dengan kuadrat waktu.`,
            answer_3: false,
            explanation: `Jarak = Kecepatan × Waktu = ${kec} × ${jam} = ${jarak} km; kecepatan = jarak / waktu (Pernyataan 3 Salah).`,
          })
        );
      } else {
        const nilaiA = 80;
        const nilaiB = 85 + (i % 2) * 5;
        const nilaiC = 90;
        const nilaiD = 85 + ((i + 1) % 2) * 5;
        const sum = nilaiA + nilaiB + nilaiC + nilaiD;
        const avg = sum / 4;
        result.push(
          makeQuestion(id, packageId, qNum, {
            topic: "Pengolahan Data & Tata Surya (Kelas 6)",
            stimulus: `Nilai latihan AKM ${nama} dalam 4 pekan berturut-turut adalah ${nilaiA}, ${nilaiB}, ${nilaiC}, dan ${nilaiD}. Pada kelas IPA, guru menjelaskan bumi mengelilingi matahari sebagai planet.`,
            statement_1: `Rata-rata nilai latihan AKM ${nama} dari 4 pekan tersebut adalah ${avg}.`,
            answer_1: true,
            statement_2: `Bumi dan Jupiter beredar mengelilingi Matahari sebagai pusat tata surya.`,
            answer_2: true,
            statement_3: `Matahari disebut satelit alami karena mengelilingi Bulan setiap hari.`,
            answer_3: false,
            explanation: `Rata-rata = (${sum})/4 = ${avg}. Matahari adalah bintang pusat tata surya, sedangkan Bulan satelit alami Bumi (Pernyataan 3 Salah).`,
          })
        );
      }
    }
  }
  return result;
}

// ===== GENERATOR SOAL SMP/MTs (KELAS 7-9) =====
function buildSmpQuestions(
  startId: number,
  packageId: number,
  variant: "k7" | "k8" | "k9" | "akbar",
  count: number
): TryoutQuestion[] {
  const result: TryoutQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const qNum = i + 1;
    const id = startId + i;
    const mod = i % 6;

    if (mod === 0) {
      const a = 3 + (i % 5);
      const b = 10 + (i % 7);
      const x = 4 + (i % 6);
      const rhs = a * x + b;
      result.push(
        makeQuestion(id, packageId, qNum, {
          topic: variant === "k9" ? "Sistem Persamaan & Fungsi (SMP)" : "Aljabar Linear Satu Variabel (SMP)",
          stimulus: `Sebuah toko koperasi memodelkan biaya pengemasan dalam persamaan linear ${a}x + ${b} = ${rhs}, dengan x menyatakan jumlah paket buku yang dipesan.`,
          statement_1: `Nilai x yang memenuhi persamaan tersebut adalah ${x} paket buku.`,
          answer_1: true,
          statement_2: `Nilai dari ${a}x harus sama dengan ${rhs - b}.`,
          answer_2: true,
          statement_3: `Jika x = 10, hasil dari ${a}x + ${b} tetap sama dengan ${rhs}.`,
          answer_3: false,
          explanation: `${a}x = ${rhs} - ${b} = ${rhs - b} => x = ${x}. Jika x = 10 nilainya ${a * 10 + b} (Pernyataan 3 Salah).`,
        })
      );
    } else if (mod === 1) {
      const base = 3 + (i % 4);
      const s1 = 3 * (1 + (i % 3));
      const s2 = 4 * (1 + (i % 3));
      const hip = 5 * (1 + (i % 3));
      const modal = (1 + (i % 4)) * 1000000;
      const bunga = (modal * (4 + base)) / 100;
      result.push(
        makeQuestion(id, packageId, qNum, {
          topic: variant === "k7" ? "Aritmetika Sosial & Tabungan (SMP)" : "Teorema Pythagoras & Geometri (SMP)",
          stimulus:
            variant === "k7"
              ? `Siswa SMP menabung uang Rp${modal.toLocaleString("id-ID")} di bank dengan bunga tunggal ${4 + base}% per tahun.`
              : `Sebuah tangga sepanjang ${hip} meter disandarkan miring pada dinding vertikal dengan jarak pangkal tangga ke tembok ${s1} meter.`,
          statement_1:
            variant === "k7"
              ? `Bunga tabungan yang diperoleh dalam 1 tahun penuh adalah Rp${bunga.toLocaleString("id-ID")}.`
              : `Tinggi ujung tangga pada dinding vertikal adalah ${s2} meter.`,
          answer_1: true,
          statement_2:
            variant === "k7"
              ? `Total saldo tabungan setelah 1 tahun menjadi Rp${(modal + bunga).toLocaleString("id-ID")}.`
              : `Sisi miring (hipotenusa) pada segitiga siku-siku tersebut panjangnya ${hip} meter.`,
          answer_2: true,
          statement_3:
            variant === "k7"
              ? `Bunga bank tunggal mengurangi pokok simpanan awal penabung.`
              : `Panjang sisi miring segitiga siku-siku lebih pendek dari alas ${s1} meter.`,
          answer_3: false,
          explanation:
            variant === "k7"
              ? `Bunga menambah saldo tabungan menjadi Rp${(modal + bunga).toLocaleString("id-ID")} (Pernyataan 3 Salah).`
              : `Tripel Pythagoras ${s1}-${s2}-${hip} menjadikan hipotenusa ${hip} meter sebagai sisi terpanjang (Pernyataan 3 Salah).`,
        })
      );
    } else if (mod === 2) {
      const total = 30 + (i % 3) * 5;
      const ipa = 18;
      const mat = 16;
      const both = 6 + (i % 3);
      const union = ipa + mat - both;
      const none = total - union;
      result.push(
        makeQuestion(id, packageId, qNum, {
          topic: "Himpunan & Diagram Venn Kelas (SMP)",
          stimulus: `Dari ${total} siswa di ruang kelas, sebanyak ${ipa} siswa ikut klub IPA, ${mat} siswa ikut klub Matematika, dan ${both} siswa mengikuti keduanya.`,
          statement_1: `Siswa yang hanya mengikuti klub IPA saja berjumlah ${ipa - both} anak.`,
          answer_1: true,
          statement_2: `Jumlah siswa yang tidak mengikuti klub IPA maupun Matematika ada ${none} anak.`,
          answer_2: true,
          statement_3: `Banyak siswa yang mengikuti kedua klub sekaligus lebih besar dari ${ipa} anak.`,
          answer_3: false,
          explanation: `Gabungan = ${ipa} + ${mat} - ${both} = ${union}; tidak ikut keduanya = ${total} - ${union} = ${none} (Pernyataan 3 Salah).`,
        })
      );
    } else if (mod === 3) {
      const temp1 = 20 + (i % 6);
      const temp2 = 100;
      result.push(
        makeQuestion(id, packageId, qNum, {
          topic: "IPA Terpadu: Kalor, Fotosintesis & Pencernaan (SMP)",
          stimulus: `Pada percobaan IPA SMP, air bermassa tetap dipanaskan dari suhu ${temp1}°C hingga mendidih pada 100°C. Siswa juga mencatat enzim ptialin di mulut mulai mencerna amilum menjadi maltosa.`,
          statement_1: `Kenaikan suhu air hingga mendidih pada percobaan ini sebesar ${temp2 - temp1}°C.`,
          answer_1: true,
          statement_2: `Enzim amilase (ptialin) di rongga mulut berperan memecah karbohidrat kompleks.`,
          answer_2: true,
          statement_3: `Proses pencernaan mekanis menggunakan gigi terjadi di dalam usus besar.`,
          answer_3: false,
          explanation: `Kenaikan suhu = ${temp2 - temp1}°C. Pencernaan mekanis gigi terjadi di rongga mulut, bukan usus besar (Pernyataan 3 Salah).`,
        })
      );
    } else if (mod === 4) {
      const benarSkor = 75 + (i % 10);
      const hadir = 85;
      result.push(
        makeQuestion(id, packageId, qNum, {
          topic: "Informatika & Bahasa Indonesia SMP",
          stimulus: `Program Python mini memeriksa kondisi: IF nilai >= 75 AND hadir >= 80 THEN status = "LULUS". Seorang siswa memperoleh nilai ${benarSkor} dengan kehadiran ${hadir}%. Dalam pelajaran Bahasa Indonesia, siswa menulis teks berita bermuatan 5W+1H.`,
          statement_1: `Berdasarkan aturan percabangan AND tersebut, siswa berstatus "LULUS".`,
          answer_1: true,
          statement_2: `Unsur 5W+1H pada berita memuat Apa, Siapa, Di mana, Kapan, Mengapa, dan Bagaimana.`,
          answer_2: true,
          statement_3: `Operator logika AND tetap bernilai benar walau salah satu syarat bernilai salah.`,
          answer_3: false,
          explanation: `Operator AND mewajibkan kedua syarat terpenuhi (${benarSkor}>=75 dan ${hadir}>=80) agar bernilai benar (Pernyataan 3 Salah).`,
        })
      );
    } else {
      const koin = (i % 2 === 0) ? 1 : 2;
      result.push(
        makeQuestion(id, packageId, qNum, {
          topic: "IPS: Ekspor-Impor & Peluang Statistika (SMP)",
          stimulus: `Pengrajin batik tulis Jawa Tengah mengekspor ${100 + i * 10} potong kain ke pasar Asia Tenggara untuk mendatangkan devisa negara. Di meja lain, siswa melempar sebuah dadu standar bermata 1 sampai 6 sebanyak ${koin} kali percobaan.`,
          statement_1: `Aktivitas menjual produk kerajinan ke luar negeri disebut kegiatan ekspor.`,
          answer_1: true,
          statement_2: `Peluang munculnya mata dadu bilangan ganjil {1, 3, 5} pada satu lemparan adalah 1/2.`,
          answer_2: true,
          statement_3: `Ekspor produk UMKM dalam negeri menyebabkan devisa negara menurun drastis.`,
          answer_3: false,
          explanation: `Ekspor justru mendatangkan devisa bagi negara; peluang mata ganjil 3/6 = 1/2 (Pernyataan 3 Salah).`,
        })
      );
    }
  }
  return result;
}

// ===== GENERATOR SOAL SMA/MA (MIPA, IPS & TPS) =====
function buildSmaQuestions(
  startId: number,
  packageId: number,
  track: "mipa" | "ips" | "akbar",
  gradeTag: string,
  count: number
): TryoutQuestion[] {
  const result: TryoutQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const qNum = i + 1;
    const id = startId + i;
    const isMipaTurn = track === "mipa" || (track === "akbar" && i % 2 === 0);

    if (isMipaTurn) {
      const mod = i % 4;
      if (mod === 0) {
        const a = 2 + (i % 4);
        const v0 = a * (4 + (i % 4)); // agar tMaks bilangan bulat!
        const tMaks = v0 / (2 * a);
        const hMaks = v0 * tMaks - a * tMaks * tMaks;
        result.push(
          makeQuestion(id, packageId, qNum, {
            topic: `Matematika MIPA (${gradeTag}): Turunan & Optimasi`,
            stimulus: `Ketinggian peluncuran roket uji dimodelkan fungsi h(t) = ${v0}t - ${a}t² (meter), dengan t dalam detik.`,
            statement_1: `Turunan pertama fungsi kecepatan sesaatnya adalah h'(t) = ${v0} - ${2 * a}t.`,
            answer_1: true,
            statement_2: `Ketinggian maksimum sebesar ${hMaks} meter dicapai tepat pada t = ${tMaks} detik.`,
            answer_2: true,
            statement_3: `Setelah t = ${tMaks + 1} detik, kecepatan vertikal roket masih bernilai positif naik.`,
            answer_3: false,
            explanation: `h'(t)=0 saat t=${tMaks}s menghasilkan hMaks=${hMaks}m. Setelah tMaks roket bergerak turun sehingga h'(t) < 0 (Pernyataan 3 Salah).`,
          })
        );
      } else if (mod === 1) {
        const massa = 2 + (i % 4);
        const perc = 3 + (i % 3);
        const gaya = massa * perc;
        const jarak = 5 + (i % 3);
        const usaha = gaya * jarak;
        result.push(
          makeQuestion(id, packageId, qNum, {
            topic: `Fisika (${gradeTag}): Hukum II Newton & Usaha`,
            stimulus: `Benda bermassa ${massa} kg di atas lantai licin didorong gaya horizontal konstan sebesar ${gaya} N sehingga berpindah sejauh ${jarak} meter dari keadaan diam.`,
            statement_1: `Percepatan yang dialami benda menurut Hukum II Newton adalah ${perc} m/s².`,
            answer_1: true,
            statement_2: `Usaha mekanik yang dilakukan gaya tersebut adalah ${usaha} Joule.`,
            answer_2: true,
            statement_3: `Massa benda tidak berpengaruh sama sekali terhadap percepatan gerak pada gaya tetap.`,
            answer_3: false,
            explanation: `a = F/m = ${gaya}/${massa} = ${perc} m/s² dan W = F·s = ${usaha} J; massa berbanding terbalik dengan percepatan (Pernyataan 3 Salah).`,
          })
        );
      } else if (mod === 2) {
        const phAsam = 1 + (i % 3);
        const phBasa = 10 + (i % 3);
        result.push(
          makeQuestion(id, packageId, qNum, {
            topic: `Kimia (${gradeTag}): pH Larutan & Laju Reaksi`,
            stimulus: `Uji laboratorium mengidentifikasi larutan X memiliki pH = ${phAsam}, air murni pH = 7, dan larutan Y memiliki pH = ${phBasa}. Katalis juga ditambahkan untuk mempercepat reaksi penguraian.`,
            statement_1: `Larutan X bersifat asam kuat sedangkan larutan Y bersifat basa.`,
            answer_1: true,
            statement_2: `Katalis mempercepat laju reaksi dengan menurunkan energi aktivasi reaksi.`,
            answer_2: true,
            statement_3: `Semakin kecil nilai pH (mendekati 1), sifat kebasaan larutan semakin kuat.`,
            answer_3: false,
            explanation: `pH < 7 menandakan sifat asam makin kuat saat pH mengecil; basa kuat berada di pH mendekati 14 (Pernyataan 3 Salah).`,
          })
        );
      } else {
        const awal = 25 * (1 + (i % 3));
        const jam = 3;
        const akhir = awal * 8;
        result.push(
          makeQuestion(id, packageId, qNum, {
            topic: `Biologi & Matematika (${gradeTag}): Genetika & Eksponensial`,
            stimulus: `Kultur bakteri membelah menjadi dua kali lipat setiap jam dari populasi awal ${awal} sel selama ${jam} jam. Dalam praktikum genetika Mendel, kacang ercis heterozigot (Bb × Bb) juga disilangkan.`,
            statement_1: `Setelah ${jam} jam, jumlah populasi bakteri mencapai ${akhir} sel.`,
            answer_1: true,
            statement_2: `Persilangan monohibrid dominan penuh Bb × Bb menghasilkan rasio fenotipe 3 : 1.`,
            answer_2: true,
            statement_3: `Pembelahan meiosis pada sel tubuh berfungsi mengganti sel kulit yang terluka.`,
            answer_3: false,
            explanation: `${awal} × 2³ = ${akhir}. Perbaikan sel tubuh dilakukan pembelahan mitosis, sedangkan meiosis membentuk sel gamet (Pernyataan 3 Salah).`,
          })
        );
      }
    } else {
      const mod = i % 4;
      if (mod === 0) {
        const hAwal = 50000;
        const hNaik = 10 + (i % 3) * 5;
        const qTurun = 2 + (i % 2);
        result.push(
          makeQuestion(id, packageId, qNum, {
            topic: `Ekonomi (${gradeTag}): Elastisitas & Kebijakan Moneter`,
            stimulus: `Ketika harga bahan pokok Rp${hAwal.toLocaleString("id-ID")} naik sebesar ${hNaik}%, permintaan masyarakat hanya turun ${qTurun}%. Di sisi makro, Bank Indonesia dapat menaikkan suku bunga acuan saat inflasi tinggi.`,
            statement_1: `Permintaan bahan pokok tersebut bersifat inelastis karena persentase perubahan jumlah diminta lebih kecil dari perubahan harga.`,
            answer_1: true,
            statement_2: `Pengaturan suku bunga acuan oleh Bank Sentral tergolong instrumen kebijakan moneter.`,
            answer_2: true,
            statement_3: `Kebijakan kenaikan pajak penghasilan ditetapkan langsung oleh bank komersial swasta.`,
            answer_3: false,
            explanation: `|E| = ${qTurun}/${hNaik} < 1 (inelastis). Pajak adalah instrumen kebijakan fiskal pemerintah bersama DPR, bukan bank swasta (Pernyataan 3 Salah).`,
          })
        );
      } else if (mod === 1) {
        result.push(
          makeQuestion(id, packageId, qNum, {
            topic: `Geografi (${gradeTag}): Sistem Informasi Geografis & Demografi`,
            stimulus: `Tim tata ruang memanfaatkan teknik tumpang susun (overlay) peta curah hujan, peta jenis tanah, dan peta kemiringan lereng untuk memetakan wilayah rawan longsor pada periode bonus demografi Indonesia 2025–2035.`,
            statement_1: `Analisis tumpang susun layer peta digital di SIG dikenal sebagai teknik overlay.`,
            answer_1: true,
            statement_2: `Bonus demografi ditandai tingginya proporsi penduduk usia produktif 15–64 tahun.`,
            answer_2: true,
            statement_3: `Data curah hujan tidak relevan digunakan dalam analisis kerawanan tanah longsor.`,
            answer_3: false,
            explanation: `Curah hujan merupakan faktor pemicu utama longsor dan bagian penting dalam layer overlay SIG (Pernyataan 3 Salah).`,
          })
        );
      } else if (mod === 2) {
        result.push(
          makeQuestion(id, packageId, qNum, {
            topic: `Sosiologi & Sejarah (${gradeTag}): Mobilitas & Metode Sejarah`,
            stimulus: `Seorang peneliti mencari dokumen arsip koran 1945 di perpustakaan (heuristik) serta menguji keaslian dokumen (verifikasi). Di sisi sosial, anak seorang buruh yang sukses menjadi dokter merupakan potret perubahan status sosial.`,
            statement_1: `Tahap pengumpulan sumber arsip dalam penelitian sejarah disebut heuristik.`,
            answer_1: true,
            statement_2: `Peningkatan strata sosial melalui pendidikan tinggi termasuk mobilitas vertikal naik.`,
            answer_2: true,
            statement_3: `Historiografi harus ditulis terlebih dahulu sebelum peneliti mengumpulkan sumber sejarah.`,
            answer_3: false,
            explanation: `Historiografi (penulisan sejarah) merupakan tahap akhir setelah heuristik, kritik sumber, dan interpretasi (Pernyataan 3 Salah).`,
          })
        );
      } else {
        result.push(
          makeQuestion(id, packageId, qNum, {
            topic: `Literasi Bahasa & Penalaran SNBT (${gradeTag})`,
            stimulus: `Premis 1: Seluruh peserta tryout yang aktif berlatih soal HOTS meningkat kemampuan analisanya. Premis 2: Raka adalah peserta aktif yang berlatih soal analisis bacaan setiap sore.`,
            statement_1: `Berdasarkan silogisme deduktif yang sah, kemampuan analisis Raka meningkat.`,
            answer_1: true,
            statement_2: `Penarikan simpulan logis harus berdasar fakta dan premis yang tersedia dalam teks.`,
            answer_2: true,
            statement_3: `Kalimat opini pribadi tanpa bukti statistik merupakan fakta objektif yang tak terbantahkan.`,
            answer_3: false,
            explanation: `Opini bersifat subjektif dan memerlukan data pendukung agar menjadi argumen kuat, berbeda dengan fakta objektif (Pernyataan 3 Salah).`,
          })
        );
      }
    }
  }
  return result;
}

// ===== GENERATOR SOAL SMK/MAK KEJURUAN (TEKNOLOGI, BISNIS, KIK & AKBAR 100 SOAL) =====
function buildSmkQuestions(
  startId: number,
  packageId: number,
  track: "tech" | "biz" | "akbar",
  count: number
): TryoutQuestion[] {
  const result: TryoutQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const qNum = i + 1;
    const id = startId + i;
    const isTech = track === "tech" || (track === "akbar" && i % 2 === 0);

    if (isTech) {
      const mod = i % 5;
      if (mod === 0) {
        const subnetOctet = 10 + (i % 20);
        result.push(
          makeQuestion(id, packageId, qNum, {
            topic: "TJKT: Pengalamatan IPv4 & VLAN Jaringan",
            stimulus: `Laboratorium jaringan SMK memakai blok IPv4 192.168.${subnetOctet}.0/24 dan memisahkan lalu lintas server ujian dengan Wi-Fi siswa melalui konfigurasi VLAN pada switch manageable.`,
            statement_1: `Prefiks /24 memiliki subnet mask 255.255.255.0 dan maksimal 254 host valid.`,
            answer_1: true,
            statement_2: `Segmentasi VLAN meningkatkan keamanan dengan memisahkan domain siaran jaringan.`,
            answer_2: true,
            statement_3: `Alamat 192.168.${subnetOctet}.255 dapat dipasang sebagai IP host di laptop siswa.`,
            answer_3: false,
            explanation: `.255 pada jaringan /24 adalah alamat Broadcast sehingga tidak dapat dipakai sebagai IP host (Pernyataan 3 Salah).`,
          })
        );
      } else if (mod === 1) {
        result.push(
          makeQuestion(id, packageId, qNum, {
            topic: "RPL: Basis Data Relasional & Keamanan Web",
            stimulus: `Tim RPL merancang tabel transaksi yang memiliki Foreign Key ke tabel pengguna, mengenkripsi kata sandi memakai hash + salt, serta memvalidasi query SQL lewat prepared statement.`,
            statement_1: `Prepared statement (parameterized query) efektif mencegah serangan SQL Injection.`,
            answer_1: true,
            statement_2: `Cookie bertanda HttpOnly membantu melindungi token sesi dari pencurian skrip XSS.`,
            answer_2: true,
            statement_3: `Primary Key pada sebuah tabel database boleh bernilai ganda pada dua baris berbeda.`,
            answer_3: false,
            explanation: `Primary Key harus unik pada setiap baris data agar relasi antar tabel konsisten (Pernyataan 3 Salah).`,
          })
        );
      } else if (mod === 2) {
        const vTotal = 5 + (i % 3) * 4; // 5V, 9V, 13V
        const vLed = 2;
        const vRes = vTotal - vLed;
        const arus = 0.02;
        const ohm = vRes / arus;
        result.push(
          makeQuestion(id, packageId, qNum, {
            topic: "Elektronika & IoT: Hukum Ohm & Rangkaian",
            stimulus: `Sebuah modul LED berarus aman 20 mA (0,02 A) dan tegangan kerja 2 V dipasang seri dengan resistor pada sumber DC ${vTotal} V.`,
            statement_1: `Besar tegangan jatuh yang harus ditahan resistor adalah ${vRes} Volt.`,
            answer_1: true,
            statement_2: `Nilai resistor yang tepat menurut Hukum Ohm R = V/I adalah ${ohm} Ohm.`,
            answer_2: true,
            statement_3: `Memasang LED langsung ke catu daya ${vTotal} V tanpa resistor tidak berisiko merusak LED.`,
            answer_3: false,
            explanation: `Tanpa resistor pembatas arus, arus berlebih akan langsung merusak/membakar LED (Pernyataan 3 Salah).`,
          })
        );
      } else if (mod === 3) {
        result.push(
          makeQuestion(id, packageId, qNum, {
            topic: "Teknik Otomotif: Sistem Injeksi EFI & K3 Bengkel",
            stimulus: `Mekanik memeriksa sepeda motor injeksi EFI di mana Engine Control Unit (ECU) menghitung durasi buka injector berdasarkan sensor oksigen dan suhu mesin, sambil menjaga sirkulasi exhaust bengkel tetap menyala.`,
            statement_1: `ECU mengolah sinyal sensor untuk menentukan takaran bahan bakar secara presisi.`,
            answer_1: true,
            statement_2: `Ventilasi atau exhaust bengkel mencegah mekanik menghirup gas karbon monoksida beracun.`,
            answer_2: true,
            statement_3: `Menghidupkan mesin di ruangan tertutup rapat tanpa ventilasi aman menurut standar K3.`,
            answer_3: false,
            explanation: `Asap knalpot mengandung CO beracun; bengkel wajib memiliki sirkulasi/exhaust K3 memadai (Pernyataan 3 Salah).`,
          })
        );
      } else {
        result.push(
          makeQuestion(id, packageId, qNum, {
            topic: "Koding AI & Kontrol Versi Git Industri",
            stimulus: `Pengembang muda memakai Git branch terpisah untuk fitur baru dan melatih model AI dengan dataset berlabel seimbang 50:50 sebelum meninjau ulang hasil prediksinya.`,
            statement_1: `Berkas '.gitignore' menjaga agar file sensitif '.env' tidak ikut terpublikasi ke GitHub.`,
            answer_1: true,
            statement_2: `Dataset berimbang membantu model AI meminimalkan bias terhadap salah satu kelas.`,
            answer_2: true,
            statement_3: `Semua keluaran kode dari asisten AI dijamin 100% bebas celah keamanan tanpa pengujian.`,
            answer_3: false,
            explanation: `Kode bantuan AI wajib melalui code review dan pengujian keamanan/fungsionalitas oleh programmer (Pernyataan 3 Salah).`,
          })
        );
      }
    } else {
      const mod = i % 5;
      if (mod === 0) {
        const biayaTetap = (1 + (i % 4)) * 400000;
        const hargaJual = 25000;
        const biayaVar = 15000;
        const margin = hargaJual - biayaVar;
        const bepUnit = biayaTetap / margin;
        result.push(
          makeQuestion(id, packageId, qNum, {
            topic: "KIK & Kewirausahaan: Menghitung Break Even Point (BEP)",
            stimulus: `Unit usaha siswa memproduksi tumbler custom dengan biaya tetap Rp${biayaTetap.toLocaleString("id-ID")}/bulan, biaya variabel Rp15.000/unit, dan harga jual Rp25.000/unit.`,
            statement_1: `Margin kontribusi per unit tumbler adalah Rp${margin.toLocaleString("id-ID")}.`,
            answer_1: true,
            statement_2: `Titik impas (BEP unit) tercapai saat penjualan mencapai ${bepUnit} unit.`,
            answer_2: true,
            statement_3: `Jika hanya terjual ${bepUnit - 10} unit dalam sebulan, usaha tersebut sudah memperoleh laba besar.`,
            answer_3: false,
            explanation: `BEP = ${biayaTetap} / ${margin} = ${bepUnit} unit. Penjualan di bawah BEP belum menutup seluruh biaya tetap (masih rugi) (Pernyataan 3 Salah).`,
          })
        );
      } else if (mod === 1) {
        const modal = (8 + (i % 5)) * 1000000;
        const beliAlat = 3000000;
        const kasAkhir = modal - beliAlat;
        result.push(
          makeQuestion(id, packageId, qNum, {
            topic: "Akuntansi Keuangan: Persamaan Dasar & Piutang",
            stimulus: `Perusahaan jasa siswa disetori kas modal Rp${modal.toLocaleString("id-ID")}, lalu membeli peralatan bengkel secara tunai seharga Rp3.000.000.`,
            statement_1: `Persamaan dasar akuntansi selalu memenuhi kaidah Aset = Liabilitas + Ekuitas.`,
            answer_1: true,
            statement_2: `Setelah pembelian alat tunai, saldo Kas menjadi Rp${kasAkhir.toLocaleString("id-ID")} dan Peralatan bertambah Rp3.000.000.`,
            answer_2: true,
            statement_3: `Syarat kredit 2/10, n/30 berarti pembeli didenda 2% jika membayar sebelum 10 hari.`,
            answer_3: false,
            explanation: `Syarat 2/10, n/30 adalah potongan diskon 2% bila dilunasi maksimal 10 hari, bukan denda (Pernyataan 3 Salah).`,
          })
        );
      } else if (mod === 2) {
        const biayaIklan = 400000;
        const roas = 4 + (i % 4);
        const omzet = biayaIklan * roas;
        result.push(
          makeQuestion(id, packageId, qNum, {
            topic: "Bisnis Digital: ROAS Iklan & Funnel AIDA",
            stimulus: `Tim pemasaran digital memasang iklan berbayar sebesar Rp400.000 dan mencatat konversi omzet penjualan langsung sebesar Rp${omzet.toLocaleString("id-ID")}.`,
            statement_1: `Return on Ad Spend (ROAS) kampanye iklan tersebut bernilai ${roas}x (${roas * 100}%).`,
            answer_1: true,
            statement_2: `Dalam corong AIDA, Call to Action (CTA) yang jelas mendorong tahap Action pembelian.`,
            answer_2: true,
            statement_3: `Menambah omzet penjualan dari Rp400.000 menjadi Rp${omzet.toLocaleString("id-ID")} menurunkan nilai ROAS di bawah 1x.`,
            answer_3: false,
            explanation: `ROAS = Omzet / Biaya Iklan = ${omzet} / 400.000 = ${roas}x (> 1x) (Pernyataan 3 Salah).`,
          })
        );
      } else if (mod === 3) {
        const malam = 2 + (i % 3);
        const tarif = 500000;
        const laundry = 75000;
        const total = malam * tarif + laundry;
        result.push(
          makeQuestion(id, packageId, qNum, {
            topic: "Perhotelan: Guest Folio & Housekeeping",
            stimulus: `Tamu menginap selama ${malam} malam dengan tarif Rp500.000/malam dan memakai jasa laundry Rp75.000 sebelum check-out. Room attendant membersihkan kamar dengan mengganti seprai bersih.`,
            statement_1: `Total biaya kamar dan laundry pada guest folio tamu sebesar Rp${total.toLocaleString("id-ID")}.`,
            answer_1: true,
            statement_2: `Setiap tamu baru wajib memperoleh seprai dan linen bersih sesuai standar sanitasi hotel.`,
            answer_2: true,
            statement_3: `Petugas housekeeping sebaiknya menyapu lantai terlebih dahulu lalu menepuk debu di lemari tinggi sesudahnya.`,
            answer_3: false,
            explanation: `Debu di bagian tinggi dibersihkan lebih dulu sebelum lantai disapu/vakum agar kotoran tidak jatuh kembali ke lantai bersih (Pernyataan 3 Salah).`,
          })
        );
      } else {
        const porsi = 40 + (i % 2) * 10;
        const foodCostPerUnit = 8000;
        const totalCost = porsi * foodCostPerUnit;
        result.push(
          makeQuestion(id, packageId, qNum, {
            topic: "Tata Boga & K3 Perkantoran: Food Costing & HACCP",
            stimulus: `Unit boga memproduksi ${porsi} kotak bento dengan total biaya bahan Rp${totalCost.toLocaleString("id-ID")} memakai talenan warna terpisah untuk daging mentah dan sayur matang.`,
            statement_1: `Biaya bahan baku (food cost) rata-rata per kotak bento adalah Rp8.000.`,
            answer_1: true,
            statement_2: `Pemisahan warna talenan mencegah kontaminasi silang bakteri berbahaya (prinsip HACCP).`,
            answer_2: true,
            statement_3: `Dalam K3 perkantoran, mengetik membungkuk tanpa peregangan selama 8 jam aman untuk tulang belakang.`,
            answer_3: false,
            explanation: `Food cost = ${totalCost}/${porsi} = Rp8.000. Postur kerja ergonomis & peregangan berkala penting untuk mencegah cedera tulang belakang (Pernyataan 3 Salah).`,
          })
        );
      }
    }
  }
  return result;
}

export function buildAllExtendedQuestions(existingQuestions1To40: TryoutQuestion[]): TryoutQuestion[] {
  const all: TryoutQuestion[] = [...existingQuestions1To40];
  let cursor = existingQuestions1To40.reduce((m, q) => Math.max(m, q.id), 0) + 1;

  // IDs 5..10: SD/MI Kelas 1, 2, 3, 4, 5, 6 (masing-masing 10 soal = 60 soal)
  for (let g = 1 as 1 | 2 | 3 | 4 | 5 | 6; g <= 6; g = (g + 1) as 1 | 2 | 3 | 4 | 5 | 6) {
    const pkgId = 4 + g; // 5..10
    const qs = buildSdPerGradeQuestions(cursor, pkgId, g, 10);
    all.push(...qs);
    cursor += qs.length;
  }

  // IDs 11..13: SMP/MTs Kelas 7, 8, 9 (masing-masing 10 soal = 30 soal)
  const smpDefs: Array<{ pkgId: number; variant: "k7" | "k8" | "k9" }> = [
    { pkgId: 11, variant: "k7" },
    { pkgId: 12, variant: "k8" },
    { pkgId: 13, variant: "k9" },
  ];
  for (const d of smpDefs) {
    const qs = buildSmpQuestions(cursor, d.pkgId, d.variant, 10);
    all.push(...qs);
    cursor += qs.length;
  }

  // IDs 14..19: SMA/MA Kelas 10/11/12 MIPA & IPS (masing-masing 10 soal = 60 soal)
  const smaDefs: Array<{ pkgId: number; track: "mipa" | "ips"; gradeTag: string }> = [
    { pkgId: 14, track: "mipa", gradeTag: "Kelas 10 MIPA" },
    { pkgId: 15, track: "ips", gradeTag: "Kelas 10 IPS" },
    { pkgId: 16, track: "mipa", gradeTag: "Kelas 11 MIPA" },
    { pkgId: 17, track: "ips", gradeTag: "Kelas 11 IPS" },
    { pkgId: 18, track: "mipa", gradeTag: "Kelas 12 TKA MIPA" },
    { pkgId: 19, track: "ips", gradeTag: "Kelas 12 TKA IPS" },
  ];
  for (const d of smaDefs) {
    const qs = buildSmaQuestions(cursor, d.pkgId, d.track, d.gradeTag, 10);
    all.push(...qs);
    cursor += qs.length;
  }

  // IDs 20..21: SMK/MAK Teknologi & Bisnis (masing-masing 10 soal = 20 soal)
  const smkTech = buildSmkQuestions(cursor, 20, "tech", 10);
  all.push(...smkTech);
  cursor += smkTech.length;
  const smkBiz = buildSmkQuestions(cursor, 21, "biz", 10);
  all.push(...smkBiz);
  cursor += smkBiz.length;

  // IDs 22..25: 4 PAKET BANK SOAL AKBAR PEMBELIAN BUKU CETAK (60 + 60 + 80 + 100 = 300 soal)
  // Paket 22: SD/MI 60 Soal (gabungan variasi Kelas 1..6 = 10 soal per kelas)
  for (let g = 1 as 1 | 2 | 3 | 4 | 5 | 6; g <= 6; g = (g + 1) as 1 | 2 | 3 | 4 | 5 | 6) {
    const rawQs = buildSdPerGradeQuestions(cursor, 22, g, 10);
    const renumbered = rawQs.map((q, idx) => ({
      ...q,
      question_number: (g - 1) * 10 + idx + 1,
    }));
    all.push(...renumbered);
    cursor += renumbered.length;
  }

  // Paket 23: SMP/MTs 60 Soal
  const akbarSmp = buildSmpQuestions(cursor, 23, "akbar", 60);
  all.push(...akbarSmp);
  cursor += akbarSmp.length;

  // Paket 24: SMA/MA 80 Soal
  const akbarSma = buildSmaQuestions(cursor, 24, "akbar", "Bank Soal Akbar SMA/MA", 80);
  all.push(...akbarSma);
  cursor += akbarSma.length;

  // Paket 25: SMK/MAK 100 Soal
  const akbarSmk = buildSmkQuestions(cursor, 25, "akbar", 100);
  all.push(...akbarSmk);

  return all;
}
