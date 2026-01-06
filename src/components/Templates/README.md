# Menu Templates System

نظام ديناميكي لإدارة قوالب المنيو. يمكنك إضافة قوالب جديدة بسهولة.

## إضافة قالب جديد

لإضافة قالب جديد، اتبع الخطوات التالية:

### 1. إنشاء ملف القالب

أنشئ ملف جديد في مجلد `defaultTemplate`، مثلاً `Template4.tsx`:

```tsx
"use client";

import React from "react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { TemplateProps } from "./types";

export default function Template4({
  menuData,
  slug,
  selectedCategory,
  onCategoryChange,
  onShowRatingModal,
}: TemplateProps) {
  const locale = useLocale();
  const t = useTranslations("PublicMenu");

  // قم بتنفيذ تصميم القالب هنا
  // استخدم menuData, selectedCategory, onCategoryChange, onShowRatingModal

  return <div>{/* تصميم القالب */}</div>;
}
```

### 2. إضافة القالب إلى الـ Registry

افتح ملف `registry.ts` وأضف القالب الجديد:

```typescript
import Template4 from "./Template4";

export const templates: TemplateInfo[] = [
  // ... القوالب الموجودة
  {
    id: "template4",
    name: "Template 4",
    nameAr: "القالب الرابع",
    component: Template4,
    description: "Template description",
    descriptionAr: "وصف القالب",
  },
];
```

### 3. تحديث الـ Backend Validation (اختياري)

إذا أردت التحقق من صحة القالب في الـ backend، افتح `back-end/src/routes/menu.routes.ts` وأضف القيمة الجديدة:

```typescript
body('theme').optional().isIn(['default', 'template2', 'template3', 'template4']),
```

### 4. الانتهاء! ✅

القالب الجديد سيظهر تلقائياً في:

- صفحة الإعدادات (dropdown selection)
- صفحة المنيو العامة (عند اختيار القالب)

## Interface

كل قالب يجب أن يتبع `TemplateProps` interface:

```typescript
interface TemplateProps {
  menuData: MenuData;
  slug: string;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onShowRatingModal: () => void;
}
```

## Helper Functions

الـ registry يوفر عدة helper functions:

- `getTemplateById(id: string)` - الحصول على قالب معين
- `getDefaultTemplate()` - الحصول على القالب الافتراضي
- `getAllTemplateIds()` - الحصول على جميع معرفات القوالب
- `templateExists(id: string)` - التحقق من وجود قالب

## مثال كامل

راجع `DefaultTemplate.tsx`, `Template2.tsx`, أو `Template3.tsx` لأمثلة كاملة على كيفية إنشاء قالب.
