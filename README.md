# Pera Kece Web Sitesi

Pera Kece / Pera Felt Studio icin hazirlanmis statik web sitesi.

## Dosya Yapisi

- `index.html`: Ana sayfa
- `sanat.html`: Sanat icerikleri sayfasi
- `styles.css`: Tum tasarim stilleri
- `script.js`: Menu, animasyon ve kucuk etkilesimler
- `commerce.js`: Siparis formu ve Supabase/local kayit katmani
- `admin.html`: Siparis takip paneli zemini
- `admin.js`: Demo/local siparis listeleme ve Supabase okuma zemini
- `supabase-config.js`: Supabase URL ve anon public key ayarlari
- `supabase-schema.sql`: Supabase tablo ve RLS kurulum SQL'i
- `SUPABASE_SETUP.md`: Supabase kurulum adimlari
- `assets/`: Site gorselleri ve logo dosyalari
- `CNAME`: GitHub Pages ozel alan adi ayari

## GitHub Pages Yayinlama

1. Bu klasordeki dosyalari GitHub deposunun ana dizinine yukleyin.
2. GitHub'da `Settings > Pages` alanina girin.
3. `Build and deployment` bolumunde kaynak olarak `Deploy from a branch` secin.
4. Branch olarak `main`, klasor olarak `/root` secin.
5. Ozel alan adi kullanilacaksa `perakece.com.tr` alan adini Pages ayarlarina ekleyin.

Ana sayfa dosyasinin adi mutlaka `index.html` olmalidir.

## Siparis Altyapisi

Siparis formu Supabase bilgileri girilene kadar local/demo kayit olusturur. Gercek kayit icin:

1. Supabase'de proje acin.
2. `supabase-schema.sql` dosyasindaki SQL'i calistirin.
3. `supabase-config.js` dosyasina Project URL ve anon public key girin.
4. Dosyalari tekrar GitHub'a yukleyin.

`service_role` anahtarini kesinlikle frontend dosyalarina eklemeyin.
