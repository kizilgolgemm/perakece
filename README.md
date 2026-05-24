# Pera Kece Web Sitesi

Pera Kece / Pera Felt Studio icin hazirlanmis statik web sitesi.

## Dosya Yapisi

- `index.html`: Ana sayfa
- `sanat.html`: Sanat icerikleri sayfasi
- `urun.html`: Urun detay sayfasi
- `styles.css`: Tum tasarim stilleri
- `script.js`: Menu, animasyon ve kucuk etkilesimler
- `products.js`: Urun verisi, fiyat bicimlendirme ve local urun kaydi
- `commerce.js`: Siparis formu ve Supabase/local kayit katmani
- `admin.html`: Siparis takip ve urun yonetimi paneli zemini
- `admin.js`: Admin girisi, demo/local siparis listeleme ve urun giris akisi
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

## Urun Yonetimi

`admin.html` icinde kullanici adi/parola ile acilan urun giris alani vardir. Fotograf, fiyat, indirimli fiyat ve aciklama girilebilir. Statik GitHub Pages yapisinda bu kayitlar tarayicinin localStorage alanina yazilir; ayni tarayicida ana sayfa ve `urun.html` detay sayfasinda gorunur.

Urunlerin tum ziyaretciler tarafindan kalici gorunmesi icin sonraki adimda Supabase Auth, `products` tablosu ve Supabase Storage baglanmalidir.
