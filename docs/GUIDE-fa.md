<div dir="rtl">

# راهنمای کامل vyv (فارسی)

این راهنما همه‌چیز را از صفر پوشش می‌دهد: اجرا روی کامپیوتر خودتان، دیتابیس و ذخیرهٔ اطلاعات کاربران، فعال کردن ورود با Gmail و Facebook، انتشار روی Vercel، ساخت نصب‌کنندهٔ ویندوز، گواهی امضای کد (تا آنتی‌ویروس مزاحم نشود) و به‌روزرسانی خودکار.

---

## ۱. پیش‌نیازها

| ابزار | نسخه | لینک |
| --- | --- | --- |
| Node.js | ۲۲ یا بالاتر (LTS) | https://nodejs.org |
| Git | هر نسخهٔ جدید | https://git-scm.com |
| (اختیاری) VS Code | — | https://code.visualstudio.com |

بعد از نصب، در PowerShell بررسی کنید:

```powershell
node -v
git -v
```

---

## ۲. گرفتن پروژه و همگام‌سازی پوشهٔ `E:\IDE\vyv-player`

ما فقط روی یک شاخه کار می‌کنیم: **`main`**.

**اگر پوشه از قبل کلون گیت است:**

```powershell
cd E:\IDE\vyv-player
git fetch origin --prune
git checkout main
git reset --hard origin/main      # هشدار: تغییرات ذخیره‌نشدهٔ محلی را پاک می‌کند
git branch --format="%(refname:short)" | Where-Object { $_ -ne "main" } | ForEach-Object { git branch -D $_ }
```

**اگر پوشه گیت نیست یا خراب است:** اول یک نسخهٔ پشتیبان بگیرید، بعد:

```powershell
Rename-Item E:\IDE\vyv-player vyv-player-backup
git clone https://github.com/KamilooArtmand/vyv.git E:\IDE\vyv-player
```

---

## ۳. اجرا روی کامپیوتر خودتان

```powershell
cd E:\IDE\vyv-player
npm install
copy .env.example .env.local      # بعداً کلیدها را داخلش پر کنید
npm run dev                       # نسخهٔ وب: http://localhost:3000
```

**نسخهٔ دسکتاپ (پنجرهٔ بدون قاب):**

```powershell
npm run desktop                   # build + باز کردن برنامهٔ دسکتاپ
# یا برای توسعه با ریلود خودکار، در دو ترمینال جدا:
npm run dev
npm run desktop:dev
```

برنامه بدون هیچ کلیدی هم کار می‌کند: موزیک، رادیوهای زنده، پادکست، آرشیو و فیلم همه فعال‌اند. کلیدها فقط برای **ورود کاربر**، **همگام‌سازی کتابخانه** و **جست‌وجوی YouTube** لازم‌اند.

---

## ۴. محتوا: چند صد مورد واقعی، همیشه در دسترس

- فایل `public/catalog/snapshot.json` بیش از **۱۲۰۰ مورد واقعی و قابل پخش** دارد: حدود ۳۸۰ ایستگاه رادیویی (اول ایستگاه‌های کوردی)، ۳۹۰ آهنگ کامل، ۲۸۰ مورد از Internet Archive (ضبط‌های کوردی، کتاب صوتی LibriVox، فیلم) و ۱۷۰ پادکست.
- برنامه اول همین فهرست را فوراً نشان می‌دهد و بعد نتایج زنده را جایگزین می‌کند. اگر یک سرویس قطع باشد، برنامه خودکار از همین فهرست استفاده می‌کند. در تست، با قطع کامل همهٔ APIها باز هم ایستگاه‌های کوردی نمایش داده و پخش شدند.
- پخش پایدار: اگر یک استریم قطع شود، برنامه یک بار دوباره وصل می‌شود و اگر نشد، سراغ مورد بعدی می‌رود. رادیویی که ۱۲ ثانیه گیر کند، خودکار دوباره وصل می‌شود.
- **به‌روزرسانی روزانه:** workflow به نام `Refresh catalogue` هر روز این فهرست را از منابع متن‌باز تازه می‌کند و در `main` کامیت می‌کند. Vercel هم خودکار سایت را به‌روز می‌کند.
- اجرای دستی: `npm run catalog`

منابع: Radio Browser، Audius، Apple Podcasts، Internet Archive (بدون نیاز به کلید) و YouTube (با کلید).

---

## ۵. دیتابیس و نحوهٔ ذخیرهٔ اطلاعات هر کاربر

دیتابیس پروژه **Supabase** است (PostgreSQL مدیریت‌شده، پلن رایگان کافی است).

### ۵.۱ ساخت پروژه

1. در https://supabase.com ثبت‌نام کنید و **New project** بزنید (منطقهٔ نزدیک، مثلاً Frankfurt).
2. به **SQL Editor** بروید، محتوای فایل `supabase/migrations/20260927000000_init.sql` را کپی و **Run** کنید.
3. از **Project Settings → API** دو مقدار را بردارید و در `.env.local` بگذارید:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### ۵.۲ چه چیزی کجا ذخیره می‌شود

| جدول | محتوا |
| --- | --- |
| `auth.users` | هویت کاربر، فقط از Google یا Facebook. **هیچ رمز عبوری وجود ندارد.** |
| `profiles` | نام، هندل، بیو، عکس پروفایل، کاور |
| `libraries` | برای هر کاربر یک ردیف: لایک‌ها، بوکمارک‌ها، پلی‌لیست‌ها، تاریخچه، محل ادامهٔ پادکست و کتاب صوتی، آیتم‌های ذخیره‌شده از منابع زنده، تنظیمات (تم، EQ، سرعت) |

- **امنیت (Row Level Security):** هر کاربر فقط ردیف‌های خودش را می‌بیند و تغییر می‌دهد. کلید `anon` عمومی است و این طراحی عمدی و امن است.
- **اولین ورود:** یک trigger در دیتابیس، پروفایل را از اطلاعات Google/Facebook و یک کتابخانهٔ خالی خودکار می‌سازد.
- **همگام‌سازی:** بعد از ورود، کتابخانهٔ این دستگاه با دیتابیس ادغام می‌شود و از هیچ طرف چیزی از دست نمی‌رود. بعد هر تغییر در حدود ۱.۵ ثانیه ذخیره می‌شود و تغییرات دستگاه‌های دیگر همان کاربر لحظه‌ای (Realtime) می‌رسند. وضعیت همگام‌سازی در **Settings → Account → Cloud sync** دیده می‌شود.
- **بدون Supabase:** برنامه کار می‌کند ولی داده‌ها فقط روی همان دستگاه (localStorage) می‌مانند.

---

## ۶. فعال کردن ورود با Gmail و Facebook

با Supabase، کلیدهای Google و Facebook فقط در داشبورد Supabase وارد می‌شوند، نه در کد.

### ۶.۱ Google (Gmail)

1. https://console.cloud.google.com → یک پروژه بسازید.
2. **APIs & Services → OAuth consent screen**: نوع External، نام vyv، لوگو، ایمیل پشتیبانی. Scopeها: `email`، `profile`، `openid`.
3. **Credentials → Create credentials → OAuth client ID** → نوع **Web application**:
   - Authorized JavaScript origins: `http://localhost:3000` و آدرس سایت (مثلاً `https://vyv.vercel.app`)
   - Authorized redirect URIs: `https://xxxx.supabase.co/auth/v1/callback` (همان URL پروژهٔ Supabase)
4. Client ID و Client Secret را در **Supabase → Authentication → Providers → Google** وارد و فعال کنید.
5. برای انتشار عمومی، در Consent screen دکمهٔ **Publish app** را بزنید. تا آن موقع فقط Test userها می‌توانند وارد شوند.

### ۶.۲ Facebook

1. https://developers.facebook.com → **Create App** → نوع Consumer → محصول **Facebook Login**.
2. **Facebook Login → Settings → Valid OAuth Redirect URIs:** `https://xxxx.supabase.co/auth/v1/callback`
3. **App settings → Basic:** App ID و App Secret را بردارید. Privacy Policy URL را هم پر کنید (برای Live کردن لازم است).
4. در **Supabase → Authentication → Providers → Facebook** وارد و فعال کنید.
5. در بالای صفحه، App را از **Development** به **Live** ببرید.

### ۶.۳ آدرس‌های مجاز در Supabase

در **Authentication → URL Configuration**:

- Site URL: آدرس سایت اصلی (مثلاً `https://vyv.vercel.app`)
- Redirect URLs:
  - `http://localhost:3000`
  - `https://vyv.vercel.app`
  - `https://*.vercel.app` (برای پیش‌نمایش‌ها)
  - `http://127.0.0.1:47824/callback` (**برای نسخهٔ ویندوز**؛ ورود در مرورگر سیستم باز می‌شود و به برنامه برمی‌گردد)

همچنین در **Authentication → Sign In / Providers** گزینهٔ **Manual linking** را روشن کنید تا کاربر بتواند Google و Facebook را به یک حساب وصل کند.

### ۶.۴ بدون Supabase (فقط برای تست)

می‌توانید `VITE_GOOGLE_CLIENT_ID` و `VITE_FACEBOOK_APP_ID` را مستقیم در `.env.local` بگذارید. ورود کار می‌کند، ولی داده‌ها روی همان دستگاه می‌مانند.

---

## ۷. انتشار روی Vercel (نسخهٔ وب)

1. https://vercel.com → با GitHub وارد شوید → **Add New → Project** → مخزن `KamilooArtmand/vyv`.
2. Vercel تنظیمات را از `vercel.json` می‌خواند (Framework: Vite، خروجی: `dist`).
3. در **Settings → Environment Variables**، همان متغیرهای `.env.local` را اضافه کنید (`VITE_SUPABASE_URL`، `VITE_SUPABASE_ANON_KEY`، `VITE_YOUTUBE_API_KEY`).
4. **Deploy** بزنید. از این به بعد هر push به `main` خودکار منتشر می‌شود.
5. کاربرانی که سایت باز است، پس از هر انتشار جدید پیام «نسخهٔ جدید آماده است» را می‌بینند.

جایگزین‌ها: Netlify یا Cloudflare Pages با همان build کار می‌کنند (`netlify.toml` موجود است). Supabase فقط دیتابیس و احراز هویت است و میزبان سایت نیست.

**دامنهٔ اختصاصی:** Vercel → Settings → Domains. بعد آن دامنه را به Google (JavaScript origins)، Supabase (Redirect URLs) و Facebook اضافه کنید.

---

## ۸. ساخت نصب‌کنندهٔ ویندوز

### ۸.۱ روی کامپیوتر خودتان

```powershell
npm run dist:win
```

خروجی: `release\vyv-Setup-2.0.0.exe`

### ۸.۲ خودکار با GitHub (پیشنهادی)

```powershell
git tag v2.0.1
git push origin v2.0.1
```

workflow به نام **Release · Windows** روی سرور ویندوزی GitHub نصب‌کننده را می‌سازد، امضا می‌کند (اگر گواهی تنظیم شده باشد) و در **GitHub Releases** منتشر می‌کند. متغیرهای `VITE_*` را هم در **Settings → Secrets and variables → Actions** اضافه کنید.

### ۸.۳ به‌روزرسانی خودکار برنامهٔ نصب‌شده

برنامهٔ نصب‌شده هنگام اجرا و هر ۶ ساعت یک بار GitHub Releases را بررسی می‌کند، نسخهٔ جدید را در پس‌زمینه دانلود می‌کند و به کاربر دکمهٔ **Restart** نشان می‌دهد. کافی است نسخهٔ `version` در `package.json` را بالا ببرید و tag جدید push کنید.

### ۸.۴ Microsoft Store

```powershell
npm run dist:store
```

قبلش در `package.json`، مقدار `build.appx.publisher` را با Publisher ID حساب Partner Center جایگزین کنید. بستهٔ Store را خود مایکروسافت امضا می‌کند، پس **هیچ هشداری** در ویندوز نمایش داده نمی‌شود.

---

## ۹. گواهینامه‌ها: جلوگیری از هشدار آنتی‌ویروس و SmartScreen

ویندوز فایل‌های `.exe` امضانشده را مشکوک می‌داند (SmartScreen با پیام «Windows protected your PC»، و گاهی Defender). راه‌حل **امضای کد (Code Signing)** است:

| گزینه | هزینهٔ تقریبی | نتیجه | توضیح |
| --- | --- | --- | --- |
| **Microsoft Store (MSIX)** | ۱۹ دلار یک‌بار (حساب شخصی) | بدون هیچ هشداری | مایکروسافت خودش امضا می‌کند. بهترین گزینه برای کاربران عادی. |
| **Azure Artifact Signing** (نام قبلی: Trusted Signing) | حدود ۱۰ دلار در ماه | اعتماد سریع SmartScreen | سرویس خود مایکروسافت. نیاز به تأیید هویت شرکت یا فرد. workflow از آن پشتیبانی می‌کند. |
| گواهی **OV** (Sectigo، DigiCert، SSL.com) | ۲۰۰ تا ۵۰۰ دلار در سال | هشدار تا جمع شدن «اعتبار» | کلید باید روی توکن سخت‌افزاری یا سرویس ابری باشد (قانون جدید CA/B). |
| گواهی **EV** | ۳۰۰ تا ۷۰۰ دلار در سال | اعتبار بالا از ابتدا | از ۲۰۲۴ دیگر عبور فوری از SmartScreen را تضمین نمی‌کند، ولی همچنان معتبرترین است. |

**پیشنهاد ما:** برای کاربران عمومی، **Microsoft Store**. برای دانلود مستقیم از سایت، **Azure Artifact Signing**.

### تنظیم Azure Artifact Signing در GitHub

در **Settings → Secrets and variables → Actions** این secretها را بسازید:

```
AZURE_TENANT_ID
AZURE_CLIENT_ID
AZURE_CLIENT_SECRET
AZURE_SIGNING_ENDPOINT      (مثلاً https://weu.codesigning.azure.net)
AZURE_SIGNING_ACCOUNT
AZURE_CERT_PROFILE
```

### یا گواهی ‎.pfx

```
WIN_CSC_LINK           (محتوای base64 فایل .pfx)
WIN_CSC_KEY_PASSWORD
```

تبدیل به base64 در PowerShell:

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("cert.pfx")) | Set-Clipboard
```

### نکات دیگر برای جلوگیری از false positive

- فایل اجرایی را هرگز با UPX یا packerهای دیگر فشرده نکنید (پروژه نمی‌کند).
- همیشه با timestamp امضا کنید (در تنظیمات هست)، تا امضا پس از انقضای گواهی هم معتبر بماند.
- برنامه بدون دسترسی Administrator نصب می‌شود (`asInvoker` و نصب per-user) و این اعتماد آنتی‌ویروس‌ها را بیشتر می‌کند.
- اگر Defender اشتباهاً هشدار داد، فایل را در https://www.microsoft.com/wdsi/filesubmission به‌عنوان «Software developer» ارسال کنید. معمولاً ظرف ۲۴ تا ۴۸ ساعت رفع می‌شود.
- هر نسخهٔ امضاشده به‌مرور «اعتبار» SmartScreen جمع می‌کند. از تغییر مداوم نام ناشر (Publisher) پرهیز کنید.

---

## ۱۰. به‌روز ماندن کتابخانه‌ها و ابزارها

- **Dependabot** (`.github/dependabot.yml`) هر دوشنبه برای کتابخانه‌های npm (React، Vite، Electron، Supabase و...) و GitHub Actions، Pull Request به‌روزرسانی می‌سازد.
- **CI** (`.github/workflows/ci.yml`) هر PR را build می‌کند. اگر به‌روزرسانی چیزی را خراب کند، قبل از merge مشخص می‌شود.
- **کاتالوگ محتوا** هر روز خودکار تازه می‌شود (بخش ۴).
- **برنامهٔ ویندوز** خودش را به‌روز می‌کند (بخش ۸.۳) و **سایت** با هر push منتشر می‌شود (بخش ۷).

---

## ۱۱. خلاصهٔ دستورات

| دستور | کار |
| --- | --- |
| `npm run dev` | اجرای نسخهٔ وب برای توسعه |
| `npm run build` | build نسخهٔ وب (پوشهٔ `dist`) |
| `npm run desktop` | اجرای برنامهٔ دسکتاپ |
| `npm run desktop:dev` | دسکتاپ با ریلود خودکار (همراه با `npm run dev`) |
| `npm run dist:win` | ساخت نصب‌کنندهٔ ویندوز |
| `npm run dist:store` | ساخت بستهٔ Microsoft Store |
| `npm run catalog` | تازه کردن کاتالوگ محتوا |
| `git tag vX.Y.Z && git push origin vX.Y.Z` | انتشار نسخهٔ جدید ویندوز در GitHub Releases |

---

## ۱۲. عیب‌یابی

| مشکل | راه‌حل |
| --- | --- |
| دکمهٔ ورود برچسب «setup» دارد | متغیرهای Supabase (یا Google/Facebook) در `.env.local` یا Vercel تنظیم نشده‌اند. |
| خطای `redirect_uri_mismatch` از Google | آدرس callback در Google Console باید دقیقاً `https://xxxx.supabase.co/auth/v1/callback` باشد. |
| ورود در نسخهٔ ویندوز برنمی‌گردد | `http://127.0.0.1:47824/callback` را به Redirect URLs در Supabase اضافه کنید. |
| یک ایستگاه رادیو پخش نمی‌شود | برخی ایستگاه‌ها گاهی آفلاین‌اند. برنامه خودکار دوباره وصل می‌شود یا به ایستگاه بعدی می‌رود. |
| SmartScreen هشدار می‌دهد | بخش ۹: امضای کد یا انتشار در Microsoft Store. |
| `npm install` خطا می‌دهد | Node.js نسخهٔ ۲۲ یا بالاتر نصب کنید و پوشهٔ `node_modules` را پاک کنید. |

</div>
