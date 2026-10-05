// Uygulama bilgisayarda localhost'ta çalışır. Tarayıcıda açık başka bir sitenin bu
// sunucuya istek atıp (CSRF) API anahtarını değiştirmesini ya da kredi harcatmasını
// önlemek için yalnızca aynı kökenden gelen tarayıcı isteklerini kabul ediyoruz.
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true; // tarayıcı dışı (curl vb.) veya aynı kökenli GET
  try {
    return new URL(origin).host === request.headers.get("host");
  } catch {
    return false;
  }
}
