// Small, client-safe clinic facts shared by hydrated booking UI and SSR pages.
// Keep this module independent of the route/article registry.
// Source of record checked 2026-09-08: https://tune-clinic.co.kr/ (footer and
// location section). The user separately confirmed the move to the 4th floor.
export const CLINIC_ADDRESS =
  "4F, Apgujeong Securities Building, 14 Nonhyeon-ro 176-gil, Gangnam-gu, Seoul 06026, Republic of Korea";
export const CLINIC_ADDRESS_KO =
  "서울 강남구 논현로176길 14, 압구정증권빌딩 4층";
export const CLINIC_PHONE_PRIMARY = "+82-2-540-2011";
export const CLINIC_PHONE = "+82-2-540-2011 / +82-2-540-8011";
export const CLINIC_EMAIL = "tuneclinic@naver.com";
export const GOOGLE_MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=%EC%95%95%EA%B5%AC%EC%A0%95%ED%8A%A0%EC%9D%98%EC%9B%90%20%EC%84%9C%EC%9A%B8%20%EA%B0%95%EB%82%A8%EA%B5%AC%20%EB%85%BC%ED%98%84%EB%A1%9C176%EA%B8%B8%2014";
export const STATION = "Apgujeong Station (Line 3), Exit 2";
export const CLINIC_HOURS =
  "Mon-Thu 11:00-20:00 / Fri 11:00-21:00 / Sat 10:00-16:00 / Sun closed (KST)";
export const PHYSICIAN_DELIVERY =
  "Medical procedures are physician-performed. Skin-care sessions are esthetician-led within your care plan.";
