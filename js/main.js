/**
 * Selenay Çeyiz — Ana etkileşim dosyası
 * Ürün listesi, filtre, sepet ve form işlemleri burada tanımlıdır.
 * Harici önbellek veya başka dosyadan veri çekme yok; tüm veri bu dosyada.
 */

(function () {
  "use strict";

  /* --------------------------------------------------------------------------
     Ürün kataloğu: her ürün bağımsız nesne, paylaşımlı referans yok
     -------------------------------------------------------------------------- */
  var URUNLER = [
    {
      id: "nevresim-01",
      ad: "Pudra Nevresim Takımı",
      aciklama: "Çift kişilik, %100 pamuk saten",
      fiyat: 1890,
      kategori: "yatak",
      kategoriEtiket: "Yatak Odası",
      emoji: "🛏"
    },
    {
      id: "yatak-ortusu-01",
      ad: "Krem Yatak Örtüsü",
      aciklama: "Nakış detaylı, king size",
      fiyat: 1250,
      kategori: "yatak",
      kategoriEtiket: "Yatak Odası",
      emoji: "✨"
    },
    {
      id: "havlu-01",
      ad: "Altın Kenarlı Havlu Seti",
      aciklama: "6 parça, yüksek emicilik",
      fiyat: 980,
      kategori: "banyo",
      kategoriEtiket: "Banyo",
      emoji: "🛁"
    },
    {
      id: "bornoz-01",
      ad: "İpek Dokulu Bornoz",
      aciklama: "Unisex, pastel bej",
      fiyat: 720,
      kategori: "banyo",
      kategoriEtiket: "Banyo",
      emoji: "🤍"
    },
    {
      id: "masa-ortusu-01",
      ad: "Keten Masa Örtüsü",
      aciklama: "Doğal keten, 140x200 cm",
      fiyat: 450,
      kategori: "mutfak",
      kategoriEtiket: "Mutfak",
      emoji: "🍽"
    },
    {
      id: "pecete-01",
      ad: "Dantel Peçete Seti",
      aciklama: "12 adet, el işi görünüm",
      fiyat: 320,
      kategori: "mutfak",
      kategoriEtiket: "Mutfak",
      emoji: "🌸"
    },
    {
      id: "runner-01",
      ad: "Salon Runner",
      aciklama: "Pamuklu, 40x180 cm",
      fiyat: 280,
      kategori: "salon",
      kategoriEtiket: "Salon",
      emoji: "🛋"
    },
    {
      id: "yastik-01",
      ad: "Dekoratif Yastık Çifti",
      aciklama: "Kadife kılıf, altın fermuar",
      fiyat: 390,
      kategori: "salon",
      kategoriEtiket: "Salon",
      emoji: "💫"
    }
  ];

  /* Sepet durumu: yalnızca bu modül içinde tutulur */
  var sepet = [];

  /* DOM referansları — sayfa yüklendikten sonra atanır */
  var elUrunListesi;
  var elSepetAdet;
  var elSepetIcerik;
  var elSepetToplam;
  var elSepetPanel;
  var elSepetOverlay;
  var elFormBildirim;
  var aktifFiltre = "tumu";

  /**
   * Fiyatı Türk Lirası formatında döndürür
   * @param {number} tutar
   * @returns {string}
   */
  function fiyatFormatla(tutar) {
    return tutar.toLocaleString("tr-TR") + " ₺";
  }

  /**
   * Ürün kartı HTML'i oluşturur (tek ürün için)
   * @param {object} urun
   * @returns {string}
   */
  function urunKartiHtml(urun) {
    return (
      '<article class="product-card" role="listitem" data-kategori="' +
      urun.kategori +
      '">' +
      '<div class="product-image" aria-hidden="true">' +
      urun.emoji +
      "</div>" +
      '<div class="product-body">' +
      '<p class="product-category">' +
      urun.kategoriEtiket +
      "</p>" +
      "<h3>" +
      urun.ad +
      "</h3>" +
      '<p class="product-desc">' +
      urun.aciklama +
      "</p>" +
      '<div class="product-footer">' +
      '<span class="product-price">' +
      fiyatFormatla(urun.fiyat) +
      "</span>" +
      '<button type="button" class="product-add" data-id="' +
      urun.id +
      '">Sepete Ekle</button>' +
      "</div></div></article>"
    );
  }

  /**
   * Aktif filtreye göre ürün listesini yeniden çizer
   */
  function urunleriGoster() {
    var filtrelenmis = URUNLER.filter(function (u) {
      return aktifFiltre === "tumu" || u.kategori === aktifFiltre;
    });

    if (filtrelenmis.length === 0) {
      elUrunListesi.innerHTML =
        '<p class="cart-empty">Bu kategoride ürün bulunamadı.</p>';
      return;
    }

    elUrunListesi.innerHTML = filtrelenmis.map(urunKartiHtml).join("");
  }

  /**
   * Sepet özetini günceller (adet, liste, toplam)
   */
  function sepetiGuncelle() {
    var toplamAdet = sepet.reduce(function (acc, item) {
      return acc + item.adet;
    }, 0);

    var toplamTutar = sepet.reduce(function (acc, item) {
      return acc + item.fiyat * item.adet;
    }, 0);

    elSepetAdet.textContent = toplamAdet;
    elSepetAdet.setAttribute("data-sifir", toplamAdet === 0 ? "true" : "false");
    elSepetToplam.textContent = fiyatFormatla(toplamTutar);

    if (sepet.length === 0) {
      elSepetIcerik.innerHTML =
        '<li class="cart-empty">Sepetiniz boş. Ürün ekleyerek başlayın.</li>';
      return;
    }

    elSepetIcerik.innerHTML = sepet
      .map(function (item) {
        return (
          '<li class="cart-item">' +
          '<span class="cart-item-emoji" aria-hidden="true">' +
          item.emoji +
          "</span>" +
          '<div class="cart-item-info">' +
          "<h4>" +
          item.ad +
          "</h4>" +
          "<p>" +
          item.adet +
          " × " +
          fiyatFormatla(item.fiyat) +
          "</p>" +
          "</div>" +
          '<button type="button" class="cart-item-remove" data-id="' +
          item.id +
          '">Kaldır</button>' +
          "</li>"
        );
      })
      .join("");
  }

  /**
   * Sepete ürün ekler veya adedi artırır
   * @param {string} urunId
   */
  function sepeteEkle(urunId) {
    var urun = URUNLER.find(function (u) {
      return u.id === urunId;
    });
    if (!urun) return;

    var mevcut = sepet.find(function (s) {
      return s.id === urunId;
    });

    if (mevcut) {
      mevcut.adet += 1;
    } else {
      sepet.push({
        id: urun.id,
        ad: urun.ad,
        fiyat: urun.fiyat,
        emoji: urun.emoji,
        adet: 1
      });
    }

    sepetiGuncelle();
    sepetPanelAc();
  }

  /**
   * Sepetten ürün çıkarır
   * @param {string} urunId
   */
  function sepettenCikar(urunId) {
    sepet = sepet.filter(function (s) {
      return s.id !== urunId;
    });
    sepetiGuncelle();
  }

  /** Sepet yan panelini açar */
  function sepetPanelAc() {
    elSepetPanel.classList.add("open");
    elSepetPanel.setAttribute("aria-hidden", "false");
    elSepetOverlay.classList.add("visible");
    elSepetOverlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  /** Sepet yan panelini kapatır */
  function sepetPanelKapat() {
    elSepetPanel.classList.remove("open");
    elSepetPanel.setAttribute("aria-hidden", "true");
    elSepetOverlay.classList.remove("visible");
    elSepetOverlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  /**
   * Mobil menü aç/kapa
   * @param {boolean} acik
   */
  function menuToggle(acik) {
    var nav = document.getElementById("anaMenu");
    var btn = document.getElementById("menuAc");
    if (acik) {
      nav.classList.add("open");
      btn.setAttribute("aria-expanded", "true");
    } else {
      nav.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
    }
  }

  /**
   * Sayfa kaydırıldığında header gölgesi
   */
  function scrollHeader() {
    var header = document.querySelector(".site-header");
    if (window.scrollY > 20) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  }

  /**
   * Tüm olay dinleyicilerini bağlar
   */
  function olaylariBagla() {
    /* Ürün listesi: sepete ekle (olay delegasyonu) */
    elUrunListesi.addEventListener("click", function (e) {
      var btn = e.target.closest(".product-add");
      if (btn && btn.dataset.id) {
        sepeteEkle(btn.dataset.id);
      }
    });

    /* Kategori filtreleri */
    document.querySelectorAll(".filter-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        document.querySelectorAll(".filter-btn").forEach(function (b) {
          b.classList.remove("active");
        });
        btn.classList.add("active");
        aktifFiltre = btn.dataset.filter;
        urunleriGoster();
      });
    });

    /* Sepet paneli kontrolleri */
    document.getElementById("sepetAc").addEventListener("click", sepetPanelAc);
    document.getElementById("sepetKapat").addEventListener("click", sepetPanelKapat);
    elSepetOverlay.addEventListener("click", sepetPanelKapat);

    elSepetIcerik.addEventListener("click", function (e) {
      var removeBtn = e.target.closest(".cart-item-remove");
      if (removeBtn && removeBtn.dataset.id) {
        sepettenCikar(removeBtn.dataset.id);
      }
    });

    document.getElementById("siparisVer").addEventListener("click", function () {
      if (sepet.length === 0) {
        alert("Sepetiniz boş. Lütfen önce ürün ekleyin.");
        return;
      }
      alert(
        "Teşekkürler! Siparişiniz alındı.\nToplam: " +
          document.getElementById("sepetToplam").textContent +
          "\n\n(Bu demo sitedir; gerçek ödeme entegrasyonu yoktur.)"
      );
      sepet = [];
      sepetiGuncelle();
      sepetPanelKapat();
    });

    /* Mobil menü */
    document.getElementById("menuAc").addEventListener("click", function () {
      var nav = document.getElementById("anaMenu");
      menuToggle(!nav.classList.contains("open"));
    });

    document.querySelectorAll(".main-nav a").forEach(function (link) {
      link.addEventListener("click", function () {
        menuToggle(false);
      });
    });

    /* İletişim formu — yalnızca ön yüz doğrulama */
    document.getElementById("iletisimForm").addEventListener("submit", function (e) {
      e.preventDefault();
      var ad = document.getElementById("ad").value.trim();
      var eposta = document.getElementById("eposta").value.trim();
      var mesaj = document.getElementById("mesaj").value.trim();

      if (!ad || !eposta || !mesaj) {
        elFormBildirim.textContent = "Lütfen tüm alanları doldurun.";
        elFormBildirim.classList.remove("success");
        return;
      }

      elFormBildirim.textContent =
        "Mesajınız alındı. En kısa sürede size dönüş yapacağız.";
      elFormBildirim.classList.add("success");
      e.target.reset();
    });

    window.addEventListener("scroll", scrollHeader);
    scrollHeader();
  }

  /**
   * Uygulama başlangıcı
   */
  function baslat() {
    elUrunListesi = document.getElementById("urunListesi");
    elSepetAdet = document.getElementById("sepetAdet");
    elSepetIcerik = document.getElementById("sepetIcerik");
    elSepetToplam = document.getElementById("sepetToplam");
    elSepetPanel = document.getElementById("sepetPanel");
    elSepetOverlay = document.getElementById("sepetOverlay");
    elFormBildirim = document.getElementById("formBildirim");

    urunleriGoster();
    sepetiGuncelle();
    olaylariBagla();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", baslat);
  } else {
    baslat();
  }
})();
