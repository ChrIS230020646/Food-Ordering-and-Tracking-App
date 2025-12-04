export interface FoodItem {
  id: number;
  name: string;
  description: string;
  price: number;
  icon?: string;
  restaurant?: string;
  restid?: number;
  item_ID?: number;
  avgRating?: number;      
  ratingCount?: number;    
}

export interface NewFoodData {
  name: string;
  description: string;
  price: string;
  icon: string;
}