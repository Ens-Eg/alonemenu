# SaaS Menu - Frontend Application

مشروع واجهة المستخدم لنظام إدارة القوائم SaaS، مبني باستخدام Next.js 16 مع دعم متعدد اللغات (العربية والإنجليزية).

## 🚀 المميزات

- ⚡ Next.js 16 مع App Router
- 🌐 دعم متعدد اللغات (العربية/الإنجليزية) باستخدام next-intl
- 🎨 Tailwind CSS 4 للتصميم
- 📱 تصميم متجاوب بالكامل
- 🔐 نظام مصادقة متكامل
- 📊 لوحات تحكم تفاعلية
- 🎯 TypeScript لضمان الجودة
- 🔄 React Query للإدارة الحالة والكاش
- 📦 Docker جاهز للإنتاج

## 📋 المتطلبات

- Node.js 18+ 
- npm أو yarn أو pnpm
- اتصال بالـ Backend API

## 🛠️ التثبيت المحلي

### 1. تثبيت المتطلبات

```bash
npm install
```

### 2. إعداد المتغيرات البيئية

قم بإنشاء ملف `.env.local` في المجلد الرئيسي:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
NEXT_PUBLIC_UPLOAD_URL=http://localhost:5000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_DEFAULT_LOCALE=ar
NEXT_PUBLIC_SUPPORTED_LOCALES=ar,en
NODE_ENV=development
```

### 3. تشغيل التطبيق

```bash
# وضع التطوير
npm run dev

# بناء المشروع
npm run build

# تشغيل النسخة المبنية
npm start
```

## 🐳 النشر على Coolify

### الخطوة 1: إعداد المشروع على Coolify

1. افتح لوحة تحكم Coolify
2. أنشئ مشروع جديد (New Project)
3. اختر "GitHub/GitLab Repository"
4. اختر المستودع الخاص بك

### الخطوة 2: إعداد المتغيرات البيئية

أضف المتغيرات التالية في Coolify:

```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
NEXT_PUBLIC_API_BASE_URL=https://your-backend-domain.com/api
NEXT_PUBLIC_UPLOAD_URL=https://your-backend-domain.com
NEXT_PUBLIC_APP_URL=https://your-frontend-domain.com
NEXT_PUBLIC_APP_NAME=SaaS Menu
NEXT_PUBLIC_DEFAULT_LOCALE=ar
NEXT_PUBLIC_SUPPORTED_LOCALES=ar,en
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
PORT=3000
```

### الخطوة 3: إعدادات Docker

Coolify سيستخدم ملف `Dockerfile` الموجود تلقائياً. تأكد من:

- ✅ Build Context: `./front-app`
- ✅ Dockerfile Path: `./Dockerfile`
- ✅ Port: `3000`
- ✅ Health Check Path: `/`

### الخطوة 4: النشر

1. اضغط على "Deploy" في Coolify
2. انتظر حتى يكتمل البناء
3. سيكون التطبيق متاحاً على الدومين المخصص

## 📁 هيكل المشروع

```
front-app/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── [locale]/    # صفحات متعددة اللغات
│   │   └── layout.tsx   # التخطيط الرئيسي
│   ├── components/       # مكونات React
│   │   ├── Dashboard/   # مكونات لوحة التحكم
│   │   ├── Layout/      # مكونات التخطيط
│   │   ├── Templates/   # قوالب القوائم
│   │   └── ...
│   ├── contexts/        # React Contexts
│   ├── hooks/           # Custom Hooks
│   ├── lib/             # دوال مساعدة
│   ├── i18n/            # إعدادات الترجمة
│   └── middleware.ts    # Next.js Middleware
├── messages/            # ملفات الترجمة
│   ├── ar.json         # الترجمة العربية
│   └── en.json         # الترجمة الإنجليزية
├── public/             # ملفات ثابتة
├── Dockerfile          # ملف Docker
├── .dockerignore       # استثناءات Docker
├── .coolify            # إعدادات Coolify
├── next.config.ts      # إعدادات Next.js
├── tailwind.config.js  # إعدادات Tailwind
└── package.json        # المتطلبات

```

## 🔧 الإعدادات الهامة

### Next.js Config

تم تكوين المشروع بـ:
- `output: 'standalone'` للبناء المُحسّن
- `images.unoptimized: true` للتوافق مع Coolify
- CORS headers للتواصل مع Backend
- دعم متعدد النطاقات (Multi-domain)

### Docker

- Multi-stage build للحجم الأمثل
- Health checks تلقائية
- تشغيل كمستخدم غير جذر (non-root) للأمان
- استخدام Alpine Linux للحجم الأصغر

## 🔒 الأمان

- ✅ جميع المتغيرات الحساسة في `.env`
- ✅ CORS محدود للدومينات المسموحة
- ✅ تشغيل Docker كمستخدم غير جذر
- ✅ TypeScript لضمان نوع البيانات
- ✅ Zod validation للمدخلات

## 📊 المراقبة والصحة

### Health Check Endpoint

التطبيق يستجيب على الجذر `/` للتحقق من الصحة:

```bash
curl http://localhost:3000
```

### Docker Health Check

```bash
docker ps  # تحقق من حالة الـ Container
```

## 🐛 استكشاف الأخطاء

### المشكلة: فشل البناء

```bash
# تأكد من النسخة الصحيحة لـ Node.js
node --version  # يجب أن تكون 18+

# حذف node_modules والإعادة
rm -rf node_modules package-lock.json
npm install
```

### المشكلة: خطأ في الاتصال بالـ API

- تحقق من `NEXT_PUBLIC_API_URL` في المتغيرات البيئية
- تأكد من تشغيل Backend
- تحقق من إعدادات CORS في Backend

### المشكلة: الصور لا تظهر

- تأكد من `NEXT_PUBLIC_UPLOAD_URL` صحيح
- تحقق من إعدادات CORS في Backend
- تأكد من أن `images.unoptimized: true` في next.config.ts

## 🔄 التحديثات

لتحديث التطبيق على Coolify:

1. ادفع التغييرات إلى Git
2. Coolify سيقوم بالنشر تلقائياً (إذا كان AUTO_DEPLOY مفعّل)
3. أو اضغط "Redeploy" يدوياً من لوحة Coolify

## 📝 Scripts المتاحة

```bash
npm run dev        # تشغيل وضع التطوير
npm run build      # بناء المشروع للإنتاج
npm start          # تشغيل النسخة المبنية
npm run lint       # فحص الأكواد
```

## 🌍 اللغات المدعومة

- 🇸🇦 العربية (ar) - اللغة الافتراضية
- 🇬🇧 الإنجليزية (en)

## 📦 التقنيات المستخدمة

- **Framework**: Next.js 16
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **State Management**: React Query (TanStack Query)
- **Internationalization**: next-intl
- **Forms**: React Hook Form + Zod
- **Charts**: ApexCharts
- **Icons**: Remixicon, Material Symbols
- **Calendar**: FullCalendar
- **Notifications**: React Hot Toast

## 📞 الدعم

للمساعدة والدعم، يرجى فتح issue في المستودع أو التواصل مع فريق التطوير.

## 📄 الترخيص

هذا المشروع محمي بحقوق الملكية. جميع الحقوق محفوظة.

---

تم التنظيف والتجهيز للـ Production على Coolify ✨
