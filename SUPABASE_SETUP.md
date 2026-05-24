# Supabase Siparis Zemini

Bu kurulumda site statik kalir; siparis talepleri Supabase tablosuna yazilir. Guvenlik icin anon kullanicilar sadece yeni kayit ekleyebilir. Siparisleri okumak ve durum guncellemek icin ilk etapta Supabase Dashboard kullanilmalidir.

## 1. Supabase projesi

1. Supabase'de yeni proje olusturun.
2. `SQL Editor` alaninda `supabase-schema.sql` dosyasindaki SQL'i calistirin.
3. `Project Settings > API` alanindan `Project URL` ve `anon public` anahtarini alin.
4. `supabase-config.js` dosyasina bu bilgileri yazin.

## 2. Guvenlik

- `service_role` anahtarini asla GitHub'a veya frontend dosyalarina koymayin.
- `anon public` anahtari frontend icin kullanilabilir; asil koruma RLS politikalaridir.
- Varsayilan SQL, anon kullaniciya sadece `insert` izni verir.

## 3. Admin takip

Ilk etapta siparisleri Supabase Dashboard'daki `orders` tablosundan takip edin.

`admin.html` temel panel zeminidir. Gercek admin panelinin musteri verilerini guvenli okuyabilmesi icin bir sonraki adimda Supabase Auth ve admin yetkilendirme politikasi eklenmelidir.
