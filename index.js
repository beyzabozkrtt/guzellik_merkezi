const express = require('express');
const app = express();
const mysql = require('mysql');
const cors = require('cors');
const path = require('path');
const session = require('express-session');

const port = 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true
}));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'beyza1420',
    database: 'babeBYZ_GuzellikMerkezi'
});

db.connect(err => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to database.');
});

app.post('/musteri', (req, res) => {
    const { ad, soyad, cinsiyet, email, telefon, sifre } = req.body;

    if (!ad || !soyad || !cinsiyet || !email || !telefon || !sifre) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    const sqlCheckEmail = 'SELECT COUNT(*) AS count FROM musteriler WHERE email = ?';
    db.query(sqlCheckEmail, [email], (err, result) => {
        if (err) {
            console.error('Error checking email:', err);
            return res.status(500).json({ error: 'Database error.' });
        }

        if (result[0].count > 0) {
            return res.status(400).json({ error: 'Email address already exists.' });
        }

        const sql = 'INSERT INTO musteriler (ad, soyad, cinsiyet, email, telefon, sifre) VALUES (?, ?, ?, ?, ?, ?)';
        db.query(sql, [ad, soyad, cinsiyet, email, telefon, sifre], (err, result) => {
            if (err) {
                console.error('Error inserting data:', err);
                return res.status(500).json({ error: 'Database error.' });
            }
            res.json({ message: 'Musteri kaydedildi!' });
        });
    });
});

app.post('/login', (req, res) => {
    const { email, sifre } = req.body;

    if (!email || !sifre) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    const sql = 'SELECT * FROM musteriler WHERE email = ? AND sifre = ?';
    db.query(sql, [email, sifre], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error.' });
        }

        if (results.length > 0) {
            // Kullanıcı girişi başarılı olduğunda session'a müşteri ID'sini kaydet
            req.session.musteri_id = results[0].musteriID;
            console.log('Login successful:', results[0].musteriID);
            return res.json({ message: 'Login successful.' + results[0].musteriID });
        } else {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }
    });
});

// Müşteri bilgilerini getirme endpoint'i
app.get('/musteri', (req, res) => {
    // Kullanıcı girişi yapılmış mı kontrolü
    //if (!req.session.musteriID) {
    //    return res.status(401).json({ error: 'Öncelikle giriş yapmalısınız.' + req.session.musteriID});
    //}

    const sql = 'SELECT * FROM musteriler WHERE musteriID = ?';
    db.query(sql, [req.session.musteriID], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error.' });
        }

        if (results.length > 0) {
            // Müşteri bilgilerini döndür
            return res.json(results[0]);
        } else {
            return res.status(404).json({ error: 'Müşteri bulunamadı.' });
        }
    });
});

// Randevu ekleme endpoint'i
app.post('/randevular', (req, res) => {
    const { hizmet_id, tarih, saat } = req.body;

    // Kullanıcı girişi yapılmış mı kontrolü
    //if (!req.session.musteriID) {
    //    return res.status(401).json({ error: 'Öncelikle giriş yapmalısınız.' + req.session.musteriID});
    //}

    // Tüm alanların dolu olup olmadığının kontrolü
    //if (!hizmet_id || !tarih || !saat) {
    //    return res.status(400).json({ error: 'Tüm alanlar gereklidir.' + hizmet_id + tarih + saat});
    //}

    const musteri_id = req.session.musteri_id;

    // Randevu ekleme işlemi
    const sql = 'INSERT INTO randevular (randevuID, musteriID, hizmetID, tarih, saat) VALUES (?, ?, ?, ?)';
    db.query(sql, [musteri_id, hizmet_id, tarih, saat], (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).json({ error: 'Database error.' });
        }
        res.json({ message: 'Randevu kaydedildi!' });
    });
});

// Hizmet listesi
const services = [
    { id: 1, name: 'Cilt Bakımı' },
    { id: 2, name: 'Ağda' },
    { id: 3, name: 'Masaj' },
    { id: 4, name: 'Mineral Banyosu' },
    { id: 5, name: 'Vucüt Bakımları' },
    { id: 6, name: 'Aroma Terapi' },
    { id: 7, name: 'Taş Spası' },
    { id: 8, name: 'Meditasyon' }
];

// /api/services endpoint'i
app.get('/api/services', (req, res) => {
    res.json(services);
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}); 