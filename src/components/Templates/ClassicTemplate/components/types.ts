export interface MenuItem {
  id: number;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  price: number;
  image: string;
  category: string;
}

export interface AdSpaceProps {
  position: "left" | "right";
}

export interface FoodItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: MenuItem | null;
}
