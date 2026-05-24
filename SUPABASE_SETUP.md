# Supabase Siparis ve Urun Zemini

Bu kurulumda site statik kalir; siparis talepleri Supabase tablosuna yazilir. Urun yonetimi icin de `products` tablosu hazirdir. Guvenlik icin anon kullanicilar siparislerde sadece yeni kayit ekleyebilir, urunlerde ise sadece aktif urunleri okuyabilir.

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

`admin.html` temel panel zeminidir. Statik sitede urun ekleme su an tarayici/localStorage uzerinden calisir. Urunlerin herkes tarafindan kalici gorunmesi icin sonraki adimda Supabase Auth, `products` tablosu ve Supabase Storage baglanmalidir.

## 4. Urun gorselleri

Kalici urun fotografi icin Supabase Storage'da `product-images` adli bir bucket acin. Admin panelin gercek yayin akisi icin fotograf bu bucket'a yuklenir, URL de `products.image_url` alanina yazilir.
