import { MenuItem } from "./types";

// Sample menu items data
export const getMenuItems = (): MenuItem[] => [
  {
    id: 1,
    name: "Grilled Salmon",
    nameAr: "سلمون مشوي",
    description:
      "Fresh Atlantic salmon with herbs and lemon, served with seasonal vegetables",
    descriptionAr:
      "سلمون أطلنطي طازج مع الأعشاب والليمون، يقدم مع الخضار الموسمية",
    price: 45,
    image:
      "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&h=600&fit=crop",
    category: "main",
  },
  {
    id: 2,
    name: "Beef Steak",
    nameAr: "ستيك لحم",
    description:
      "Premium beef steak cooked to perfection, served with mashed potatoes",
    descriptionAr: "ستيك لحم مميز مطبوخ بإتقان، يقدم مع البطاطس المهروسة",
    price: 55,
    image:
      "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&h=600&fit=crop",
    category: "main",
  },
  {
    id: 3,
    name: "Caesar Salad",
    nameAr: "سلطة قيصر",
    description: "Fresh romaine lettuce with caesar dressing and croutons",
    descriptionAr: "خس روماني طازج مع صلصة قيصر والخبز المحمص",
    price: 18,
    image:
      "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=800&h=600&fit=crop",
    category: "salad",
  },
  {
    id: 4,
    name: "Chocolate Cake",
    nameAr: "كيك الشوكولاتة",
    description: "Rich chocolate cake with cream frosting and berries",
    descriptionAr: "كيك شوكولاتة غني مع كريمة والتوت",
    price: 12,
    image:
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&h=600&fit=crop",
    category: "dessert",
  },
  {
    id: 5,
    name: "Pasta Carbonara",
    nameAr: "باستا كاربونارا",
    description: "Creamy pasta with bacon and parmesan cheese",
    descriptionAr: "باستا كريمية مع لحم مقدد وجبن بارميزان",
    price: 28,
    image:
      "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&h=600&fit=crop",
    category: "main",
  },
  {
    id: 6,
    name: "Fresh Juice",
    nameAr: "عصير طازج",
    description: "Freshly squeezed orange juice with ice",
    descriptionAr: "عصير برتقال طازج معصور مع الثلج",
    price: 8,
    image:
      "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800&h=600&fit=crop",
    category: "drinks",
  },
];
