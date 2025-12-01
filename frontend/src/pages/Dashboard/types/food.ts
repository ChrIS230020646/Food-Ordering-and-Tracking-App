export interface FoodItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image?: string;
  restaurant?: string;
  restid?: number;
  item_ID?: number;
}

export interface NewFoodData {
  name: string;
  description: string;
  price: string;
  image: string;
}