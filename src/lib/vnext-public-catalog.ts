export interface PriceItem {
  title: string;
  price: string;
  from: boolean;
  detail: string;
  qualifier?: string;
  href?: string;
}

// Small client-safe catalog. Keep guide/article bodies and the broad route
// registry out of booking, doctor and visit hydration graphs.
export const FEATURED_PROGRAMS: PriceItem[] = [
  {
    title: "Tune Journey Glow",
    price: "KRW 490,000",
    from: false,
    href: "/programs#glow",
    detail: "Rejuran Healer injection · 2cc + LDM ultrasound · 1 session",
  },
  {
    title: "Tune Journey Lift",
    price: "KRW 1,490,000",
    from: false,
    href: "/programs#lift",
    detail:
      "Ultherapy Prime · 300 shots + Rejuran Healer injection · 2cc + LDM ultrasound · 1 session",
  },
  {
    title: "Tune Journey Complete",
    price: "KRW 3,290,000",
    from: false,
    href: "/programs#complete",
    detail:
      "Ultherapy Prime · 300 shots + Thermage · 600 shots + Rejuran Healer injection · 2cc + LDM ultrasound · 1 session",
  },
  {
    title: "The First Pigment laser Omakase",
    price: "KRW 330,000",
    from: false,
    href: "/programs#pigment-reset",
    detail:
      "Enlighten Pico toning + Clarity Pro + targeted pigment laser + free physician consultation.",
  },
  {
    title: "The Restoration with PRP",
    price: "KRW 1,200,000",
    from: true,
    href: "/programs#restoration",
    detail:
      "MCT protocol: blood draw and injection prepared from your own blood, plus physician-sequenced Ultherapy and Thermage. Physician assessment required.",
  },
  {
    title: "The Body Filler Omakase",
    price: "KRW 2,040,000",
    from: true,
    href: "/programs#body-filler",
    detail:
      "Shoulder filler injection · 30cc starting scope. Hip treatment and larger volumes are quoted after in-person assessment.",
  },
];

export const GLOW_ADD_ON = {
  title: "Enlighten laser",
  price: "KRW 150,000",
  total: "KRW 640,000",
};

export const PROGRAM_PRICING_TERMS = [
  "Tune Journey prices exclude VAT, which is charged separately.",
  `Glow: optional ${GLOW_ADD_ON.title} +${GLOW_ADD_ON.price}; total ${GLOW_ADD_ON.total} before VAT. Optional and subject to physician assessment; never added automatically.`,
];

export interface BookingTreatmentCatalogItem {
  value: string;
  title: string;
  href: string;
}

export const BOOKING_TREATMENT_CATALOG: readonly BookingTreatmentCatalogItem[] =
  [
    {
      value: "skin-regenerative:lapothera-tune-eyecell-consultation",
      title: "Tune Eye Cell",
      href: "/treatments/lapothera-tune-eyecell",
    },
    {
      value: "iv-skin-tech:acne-care-consultation",
      title: "Tune Acne Care Package",
      href: "/treatments/acne-care",
    },
    {
      value: "lifting:tenthermalifting-consultation",
      title: "TenTherma Lifting",
      href: "/treatments/tenthermalifting",
    },
    {
      value: "body-fat:inmode-body-consultation",
      title: "InMode for the Body",
      href: "/treatments/inmode-body",
    },
    {
      value: "lifting:ultherapy-us-version-consultation",
      title: "Ultherapy",
      href: "/treatments/ultherapy-us-version",
    },
    {
      value: "lifting:thermage-consultation",
      title: "Thermage",
      href: "/treatments/thermage",
    },
    {
      value: "lifting:thread-lifting-consultation",
      title: "Thread Lifting",
      href: "/treatments/thread-lifting",
    },
    {
      value: "lifting:shurink-consultation",
      title: "Tune Shurink Lifting",
      href: "/treatments/shurink",
    },
    {
      value: "skin-regenerative:rejuran-consultation",
      title: "Rejuran",
      href: "/treatments/rejuran",
    },
    {
      value: "skin-regenerative:juvelook-consultation",
      title: "Juvelook",
      href: "/treatments/juvelook",
    },
    {
      value: "botox:botox-consultation",
      title: "Tune Botox",
      href: "/treatments/botox",
    },
    {
      value: "lifting:potenza-consultation",
      title: "Potenza",
      href: "/treatments/potenza",
    },
    {
      value: "skin-regenerative:radiesse-consultation",
      title: "Radiesse",
      href: "/treatments/radiesse",
    },
    {
      value: "filler:lip-filler-consultation",
      title: "Tune Lip Filler",
      href: "/treatments/lip-filler",
    },
    {
      value: "lifting:onda-lifting-consultation",
      title: "Onda Lifting",
      href: "/treatments/onda-lifting",
    },
    {
      value: "lifting:inmode-consultation",
      title: "Tune InMode",
      href: "/treatments/inmode",
    },
    {
      value: "filler:ear-filler-consultation",
      title: "Tune Ear Filler",
      href: "/treatments/ear-filler",
    },
    {
      value: "filler:chin-filler-consultation",
      title: "Tune Chin Filler",
      href: "/treatments/chin-filler",
    },
    {
      value: "skin-regenerative:tune-rituo-consultation",
      title: "Tune Re2O",
      href: "/treatments/tune-rituo",
    },
    {
      value: "lifting:tuneliner-face-consultation",
      title: "Tuneliner Face",
      href: "/treatments/tuneliner-face",
    },
    {
      value: "lifting:oligio-consultation",
      title: "Oligio Thermal RF Lifting",
      href: "/treatments/oligio",
    },
    {
      value: "pigment-acne-scar:acne-scar-consultation",
      title: "Acne Scar Revision",
      href: "/treatments/acne-scar",
    },
    {
      value: "lifting:alltite-consultation",
      title: "Tune Alltite",
      href: "/treatments/alltite",
    },
    {
      value: "lifting:cheek-hollow-lifting-consultation",
      title: "Cheek Hollow Lifting",
      href: "/treatments/cheek-hollow-lifting",
    },
    {
      value: "lifting:coolsoniq-consultation",
      title: "Tune CoolSoniq",
      href: "/treatments/coolsoniq",
    },
    {
      value: "pigment-acne-scar:enlighten-consultation",
      title: "Tune Enlighten",
      href: "/treatments/enlighten",
    },
    {
      value: "body-fat:fat-dissolving-injection-consultation",
      title: "Fat-Dissolving Injection",
      href: "/treatments/fat-dissolving-injection",
    },
    {
      value: "iv-skin-tech:iv-therapy-consultation",
      title: "IV Therapy & Drips",
      href: "/treatments/iv-therapy",
    },
    {
      value: "iv-skin-tech:laser-hair-removal-consultation",
      title: "Laser Hair Removal",
      href: "/treatments/laser-hair-removal",
    },
    {
      value: "filler:neck-wrinkle-filler-consultation",
      title: "Neck Wrinkle Filler",
      href: "/treatments/neck-wrinkle-filler",
    },
    {
      value: "skin-regenerative:pdrn-salmon-injection-consultation",
      title: "PDRN Salmon Injection",
      href: "/treatments/pdrn-salmon-injection",
    },
    {
      value: "iv-skin-tech:skin-care-consultation",
      title: "Skin Care & Management",
      href: "/treatments/skin-care",
    },
  ];
