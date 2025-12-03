export interface FoodItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image?: string;
  restaurant?: string;
  restid?: number;
  item_ID?: number;
  avgRating?: number;      // 平均評分 (1-5)
  ratingCount?: number;    // 評分數量
}

export interface NewFoodData {
  name: string;
  description: string;
  price: string;
  image: string;
}