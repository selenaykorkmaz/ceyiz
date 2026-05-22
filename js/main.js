/**
 * Selenay Takı — Ana etkileşim dosyası
 * Ürün vitrini, kategori filtresi ve iletişim formu burada tanımlıdır.
 * Sepet yok; yalnızca ürün sergileme amaçlıdır.
 * Harici önbellek veya başka dosyadan veri çekme yok; tüm veri bu dosyada.
 */

(function () {
  "use strict";

  /* --------------------------------------------------------------------------
     Takı kataloğu: kolye, küpe, yüzük, bileklik — her ürün bağımsız nesne
     -------------------------------------------------------------------------- */
  var URUNLER = [
    {
      id: "kolye-01",
      ad: "Altın İnce Zincir Kolye",
      aciklama: "45 cm, 14 ayar altın kaplama",
      fiyat: 2850,
      kategori: "kolye",
      kategoriEtiket: "Kolye",
      emoji: "📿"
    },
    {
      id: "kolye-02",
      ad: "Çok Katmanlı Gümüş Kolye",
      aciklama: "925 ayar gümüş, 3 katmanlı",
      fiyat: 1980,
      kategori: "kolye",
      kategoriEtiket: "Kolye",
      emoji: "✨"
    },
    {
      id: "kupe-01",
      ad: "İnci Küpe Seti",
      aciklama: "Doğal inci, altın kaplama klips",
      fiyat: 1680,
      kategori: "kupe",
      kategoriEtiket: "Küpe",
      emoji: "💎"
    },
    {
      id: "kupe-02",
      ad: "Minimal Halka Küpe",
      aciklama: "12 mm, hipoalerjenik çelik",
      fiyat: 890,
      kategori: "kupe",
      kategoriEtiket: "Küpe",
      emoji: "⭕"
    },
    {
      id: "yuzuk-01",
      ad: "Tektaş Zirkon Yüzük",
      aciklama: "925 gümüş, ayarlanabilir ölçü",
      fiyat: 3200,
      kategori: "yuzuk",
      kategoriEtiket: "Yüzük",
      emoji: "💍"
    },
    {
      id: "yuzuk-02",
      ad: "Nişan Yüzüğü",
      aciklama: "14 ayar altın, taşlı tasarım",
      fiyat: 4500,
      kategori: "yuzuk",
      kategoriEtiket: "Yüzük",
      emoji: "💫"
    },
    {
      id: "bileklik-01",
      ad: "Minimal Altın Bileklik",
      aciklama: "İnce zincir, 18 cm ayarlanabilir",
      fiyat: 2450,
      kategori: "bileklik",
      kategoriEtiket: "Bileklik",
      emoji: "✨"
    },
    {
      id: "bileklik-02",
      ad: "Charm Bileklik",
      aciklama: "925 gümüş, 5 charm detaylı",
      fiyat: 1250,
      kategori: "bileklik",
      kategoriEtiket: "Bileklik",
      emoji: "🔗"
    }
  ];

  /* DOM referansları — sayfa yüklendikten sonra atanır */
  var elUrunListesi;
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
   * Vitrin ürün kartı HTML'i oluşturur (sepet butonu yok)
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
        '<p class="empty-message">Bu kategoride ürün bulunamadı.</p>';
      return;
    }

    elUrunListesi.innerHTML = filtrelenmis.map(urunKartiHtml).join("");
  }

  /* Hero slayder durumu */
  var heroAktifIndeks = 0;
  var heroZamanlayici = null;
  var HERO_SLAYT_SURE = 5500;

  /**
   * Belirtilen slayda geçer; slayt ve nokta göstergelerini günceller
   * @param {number} indeks
   */
  function heroSlaytaGit(indeks) {
    var slaytlar = document.querySelectorAll(".hero-slide");
    var noktalar = document.querySelectorAll(".hero-dot");
    if (!slaytlar.length) return;

    heroAktifIndeks = (indeks + slaytlar.length) % slaytlar.length;

    slaytlar.forEach(function (slide, i) {
      slide.classList.toggle("is-active", i === heroAktifIndeks);
    });

    noktalar.forEach(function (dot, i) {
      var aktif = i === heroAktifIndeks;
      dot.classList.toggle("is-active", aktif);
      dot.setAttribute("aria-selected", aktif ? "true" : "false");
    });
  }

  function heroSonrakiSlayt() {
    heroSlaytaGit(heroAktifIndeks + 1);
  }

  function heroOncekiSlayt() {
    heroSlaytaGit(heroAktifIndeks - 1);
  }

  function heroOtomatikDurdur() {
    if (heroZamanlayici) {
      clearInterval(heroZamanlayici);
      heroZamanlayici = null;
    }
  }

  function heroOtomatikBaslat() {
    heroOtomatikDurdur();
    heroZamanlayici = setInterval(heroSonrakiSlayt, HERO_SLAYT_SURE);
  }

  /**
   * Ana sayfa altın/gümüş arka plan slayderini başlatır
   */
  function heroSlayderBaslat() {
    var slider = document.getElementById("heroSlider");
    if (!slider || slider.querySelectorAll(".hero-slide").length < 2) return;

    var onceki = document.getElementById("heroOnceki");
    var sonraki = document.getElementById("heroSonraki");

    if (onceki) {
      onceki.addEventListener("click", function () {
        heroOncekiSlayt();
        heroOtomatikBaslat();
      });
    }

    if (sonraki) {
      sonraki.addEventListener("click", function () {
        heroSonrakiSlayt();
        heroOtomatikBaslat();
      });
    }

    document.querySelectorAll(".hero-dot").forEach(function (dot) {
      dot.addEventListener("click", function () {
        var hedef = parseInt(dot.getAttribute("data-slide"), 10);
        if (!isNaN(hedef)) {
          heroSlaytaGit(hedef);
          heroOtomatikBaslat();
        }
      });
    });

    slider.addEventListener("mouseenter", heroOtomatikDurdur);
    slider.addEventListener("mouseleave", heroOtomatikBaslat);

    heroOtomatikBaslat();
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
    /* Kategori filtreleri: kolye, küpe, yüzük, bileklik */
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
    elFormBildirim = document.getElementById("formBildirim");

    urunleriGoster();
    heroSlayderBaslat();
    olaylariBagla();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", baslat);
  } else {
    baslat();
  }
})();
