export interface Expense {
  id?: number;
  title: string;
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
}

export interface SummaryCategory {
  category: string;
  total: number;
}

export interface SummaryMonth {
  month: string;
  total: number;
}

export interface Budget {
  id?: number;
  month: string;  // YYYY-MM
  amount: number;
}