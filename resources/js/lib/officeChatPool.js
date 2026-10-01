export function generateOfficeDialogues(activeTasks = []) {
    if (!activeTasks || activeTasks.length === 0) {
        return [];
    }

    const taskCount = activeTasks.length;
    const lines = [];

    // Helper to get task by index with cycle
    const getTask = (idx) => activeTasks[idx % taskCount];

    // 50 realistic pairs (100 total speaking turns)
    const conversationPairs = [
        (t) => [
            { speaker: 'risty', text: `Dit, task "${t.title}" prioritas ${t.priority || 'medium'}, jangan sampai kelewat ya.` },
            { speaker: 'adit', text: `Aman Ris, logic security nya lagi gua perkuat di backend.` }
        ],
        (t) => [
            { speaker: 'adit', text: `Ris, tab coding di "${t.title}" udah selesai gua test barusan.` },
            { speaker: 'risty', text: `Mantap Dit! Gua periksa checklist nya di board ya.` }
        ],
        (t) => [
            { speaker: 'risty', text: `Untuk "${t.title}", ada catatan evaluasi dari penguji ga Dit?` },
            { speaker: 'adit', text: `Ada dikit, tapi udah gua bikinin mitigasi teknisnya.` }
        ],
        (t) => [
            { speaker: 'adit', text: `Ris, burp suite scan buat "${t.title}" hasilnya clean tanpa vuln.` },
            { speaker: 'risty', text: `Keren! Lampirin bukti audit nya di tab referensi ya.` }
        ],
        (t) => [
            { speaker: 'risty', text: `Dit, status "${t.title}" masih ${t.status || 'aktif'}, butuh bantuan review dokumen?` },
            { speaker: 'adit', text: `Boleh Ris, tolong cek bagian metodologi dan arsitektur ya.` }
        ],
        (t) => [
            { speaker: 'adit', text: `Ris, migrasi database buat modul "${t.title}" udah kelar di push.` },
            { speaker: 'risty', text: `Oke Dit, gua pantau deployment nya di cloud server.` }
        ],
        (t) => [
            { speaker: 'risty', text: `Dit, jangan lupa tambahin link Figma di task "${t.title}" ya.` },
            { speaker: 'adit', text: `Udah gua cantumin Ris di tab Design System.` }
        ],
        (t) => [
            { speaker: 'adit', text: `Ris, middleware otorisasi task "${t.title}" udah enforce RBAC ketat.` },
            { speaker: 'risty', text: `Sip, pastikan user tanpa hak akses kena 403 Forbidden ya.` }
        ],
        (t) => [
            { speaker: 'risty', text: `Dit, task "${t.title}" ini target kelar jam berapa kira kira?` },
            { speaker: 'adit', text: `Sebelum maghrib kelar Ris, tinggal running test case.` }
        ],
        (t) => [
            { speaker: 'adit', text: `Ris, token session untuk "${t.title}" udah pake cookie secure flag.` },
            { speaker: 'risty', text: `Bagus Dit, proteksi XSS sama session hijacking jadi aman.` }
        ],
        (t) => [
            { speaker: 'risty', text: `Dit, task "${t.title}" kategorinya ${t.category || 'Umum'}, bener kan ya?` },
            { speaker: 'adit', text: `Bener Ris, udah sesuai susunan bab laporan tugas akhir kita.` }
        ],
        (t) => [
            { speaker: 'adit', text: `Ris, PR branch buat task "${t.title}" udah gua open di GitHub.` },
            { speaker: 'risty', text: `Oke, gua approve sekarang biar langsung merger ke main.` }
        ],
        (t) => [
            { speaker: 'risty', text: `Dit, tab workstream di "${t.title}" lengkap banget itemnya.` },
            { speaker: 'adit', text: `Biar rapi Ris pas ditanya dosen pembimbing waktu bimbingan.` }
        ],
        (t) => [
            { speaker: 'adit', text: `Ris, response time API untuk "${t.title}" tembus di bawah 200ms.` },
            { speaker: 'risty', text: `Kenceng banget Dit, performa query database nya optimal.` }
        ],
        (t) => [
            { speaker: 'risty', text: `Dit, jangan lupa catat timestamp selesai pas "${t.title}" kelar.` },
            { speaker: 'adit', text: `Otomatis direkam sistem Ris pas status diubah jadi done.` }
        ],
        (t) => [
            { speaker: 'adit', text: `Ris, script validasi form di "${t.title}" udah anti SQL injection.` },
            { speaker: 'risty', text: `Mantap, sanitasi input emang wajib buat security architect.` }
        ],
        (t) => [
            { speaker: 'risty', text: `Dit, task "${t.title}" ada link ke Google Docs ga ya?` },
            { speaker: 'adit', text: `Ada di tab referensi Ris, bisa langsung dibuka sekali klik.` }
        ],
        (t) => [
            { speaker: 'adit', text: `Ris, styling tampilan di "${t.title}" udah support mode gelap.` },
            { speaker: 'risty', text: `Keren Dit, kontras warnanya enak banget dilihat di mata.` }
        ],
        (t) => [
            { speaker: 'risty', text: `Dit, task "${t.title}" prioritasnya tinggi, butuh co pilot ga?` },
            { speaker: 'adit', text: `Bisa handle kok Ris, tinggal rapikan unit test aja.` }
        ],
        (t) => [
            { speaker: 'adit', text: `Ris, konfigurasi CORS buat task "${t.title}" udah gua kunci.` },
            { speaker: 'risty', text: `Aman Dit, cuma origin domain resmi kita yang diizinkan.` }
        ],
        (t) => [
            { speaker: 'risty', text: `Dit, task "${t.title}" ini ada sangkut pautnya sama Bab 4 ya?` },
            { speaker: 'adit', text: `Iya Ris, hasil pengujian akurasinya bakal dimasukin ke situ.` }
        ],
        (t) => [
            { speaker: 'adit', text: `Ris, file asset yang diunggah di "${t.title}" udah di hash SHA256.` },
            { speaker: 'risty', text: `Integritas datanya jadi terjamin penuh ya Dit.` }
        ],
        (t) => [
            { speaker: 'risty', text: `Dit, notifikasi email buat task "${t.title}" udah aktif belum?` },
            { speaker: 'adit', text: `Udah pake event listener Laravel Ris, real time langsung masuk.` }
        ],
        (t) => [
            { speaker: 'adit', text: `Ris, tab UI/UX di "${t.title}" udah cocok sama prototype Figma?` },
            { speaker: 'risty', text: `Udah presisi banget Dit, layout grid sama spacing nya pas.` }
        ],
        (t) => [
            { speaker: 'risty', text: `Dit, deadline "${t.title}" makin dekat, fokus beresin ini dulu ya.` },
            { speaker: 'adit', text: `Siap Komandan, kopi udah ready buat ngebut pengerjaan.` }
        ],
        (t) => [
            { speaker: 'adit', text: `Ris, payload JSON buat "${t.title}" udah tervalidasi skemanya.` },
            { speaker: 'risty', text: `Bagus Dit, handle errornya juga kasih pesan yang user friendly.` }
        ],
        (t) => [
            { speaker: 'risty', text: `Dit, hasil scan dependensi npm di task "${t.title}" gimana?` },
            { speaker: 'adit', text: `Zero high vulnerabilities Ris, semua package up to date.` }
        ],
        (t) => [
            { speaker: 'adit', text: `Ris, rute URL buat "${t.title}" udah clean RESTful standar.` },
            { speaker: 'risty', text: `Sip, struktur endpoint nya jadi mudah dipahami pas testing.` }
        ],
        (t) => [
            { speaker: 'risty', text: `Dit, task "${t.title}" butuh tambahan diagram arsitektur ga?` },
            { speaker: 'adit', text: `Udah gua bikinin di Draw.io Ris, tinggal tempel di dokumen.` }
        ],
        (t) => [
            { speaker: 'adit', text: `Ris, fitur pagination di task "${t.title}" udah gua pasang.` },
            { speaker: 'risty', text: `Biar load data ribuan record tetep enteng ya Dit.` }
        ],
        (t) => [
            { speaker: 'risty', text: `Dit, kopi lu dingin tuh dari tadi anteng di depan monitor.` },
            { speaker: 'adit', text: `Haha iya Ris, lagi asyik trace bug authorization tadi.` }
        ],
        (t) => [
            { speaker: 'adit', text: `Ris, template Overleaf laporan kita udah kelar di compile.` },
            { speaker: 'risty', text: `Alhamdulillah, ga ada error font atau bibtex kan Dit?` }
        ],
        (t) => [
            { speaker: 'risty', text: `Server rack di belakang adem bener hari ini Dit.` },
            { speaker: 'adit', text: `Iya Ris, serverless function Vercel lagi stabil di 200 OK.` }
        ],
        (t) => [
            { speaker: 'adit', text: `Ris, password database udah gua hash bcrypt 12 rounds.` },
            { speaker: 'risty', text: `Top Dit, zero trust architecture emang ga boleh ada kompromi.` }
        ],
        (t) => [
            { speaker: 'risty', text: `Dit, minggu depan jadwal simulasi presentasi sidang kan?` },
            { speaker: 'adit', text: `Siap Ris, slide sama live demo workspace udah stand by.` }
        ],
        (t) => [
            { speaker: 'adit', text: `Ris, jurnal IEEE tentang RBAC web modern udah gua baca.` },
            { speaker: 'risty', text: `Bagus Dit, kutip teorinya buat penguat dasar teori di Bab 2.` }
        ],
        (t) => [
            { speaker: 'risty', text: `Dit, keyboard mechanical lu suaranya renyah banget hari ini.` },
            { speaker: 'adit', text: `Switch biru Ris, bikin semangat ngetik baris baris kode.` }
        ],
        (t) => [
            { speaker: 'adit', text: `Ris, link Google Drive bukti pengujian udah gua backup.` },
            { speaker: 'risty', text: `Sip Dit, data primer jangan sampe ilang sebelum sidang.` }
        ],
        (t) => [
            { speaker: 'risty', text: `Dit, UI workspace kita sekarang clean banget tanpa tombol numpuk.` },
            { speaker: 'adit', text: `Iya Ris, space nya jadi lega dan estetikanya terjaga.` }
        ],
        (t) => [
            { speaker: 'adit', text: `Ris, tab Applications tadi ngebantu banget buat buka docs.` },
            { speaker: 'risty', text: `Semua link eksternal tim jadi terpusat di satu dashboard ya.` }
        ],
        (t) => [
            { speaker: 'risty', text: `Dit, habis ini mau makan siang bareng apa pesen online?` },
            { speaker: 'adit', text: `Pesen online aja Ris biar bisa sambil mantau build pipeline.` }
        ],
        (t) => [
            { speaker: 'adit', text: `Ris, font konsol terminal gua ganti ke JetBrains Mono, mantap.` },
            { speaker: 'risty', text: `Pantesan ligatur kode sama simbol arrow nya keliatan rapi.` }
        ],
        (t) => [
            { speaker: 'risty', text: `Dit, jam dinding kantor muter cepet banget, udah sore aja.` },
            { speaker: 'adit', text: `Kalo lagi asyik riset keamanan emang waktu berasa terbang Ris.` }
        ],
        (t) => [
            { speaker: 'adit', text: `Ris, audit log akses admin udah gua simpen ke storage aman.` },
            { speaker: 'risty', text: `Bagus Dit, transparansi aktivitas tim kita jadi jelas.` }
        ],
        (t) => [
            { speaker: 'risty', text: `Dit, tanaman kaktus di meja lu seger banget dipandang.` },
            { speaker: 'adit', text: `Maskot penangkal radiasi layar komputer itu Ris haha.` }
        ],
        (t) => [
            { speaker: 'adit', text: `Ris, skenario stress test 1000 request concurrently lolos.` },
            { speaker: 'risty', text: `Hebat Dit! Backend Laravel nya tangguh banget nahan beban.` }
        ],
        (t) => [
            { speaker: 'risty', text: `Dit, diagram alur login kita udah sesuai standar OWASP kan?` },
            { speaker: 'adit', text: `Udah Ris, step by step autentikasi nya terverifikasi valid.` }
        ],
        (t) => [
            { speaker: 'adit', text: `Ris, icon pixel kita berdua mirip banget aslinya ya.` },
            { speaker: 'risty', text: `Iya Dit, lu pake jas item formal gua pake blazer ungu.` }
        ],
        (t) => [
            { speaker: 'risty', text: `Dit, jangan lupa commit git pake message yang deskriptif ya.` },
            { speaker: 'adit', text: `Selalu Ris, commit history kita rapi kayak dokumentasi NASA.` }
        ],
        (t) => [
            { speaker: 'adit', text: `Ris, target tugas akhir kita semester ini wisuda bareng ya!` },
            { speaker: 'risty', text: `Aamiin Dit, bismillah kita tuntaskan dengan predikat terbaik!` }
        ]
    ];

    // Build the full 100 turns
    conversationPairs.forEach((pairFn, index) => {
        const task = getTask(index);
        const pair = pairFn(task);
        lines.push(pair[0]);
        lines.push(pair[1]);
    });

    return lines;
}
