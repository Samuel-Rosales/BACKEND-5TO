export type DoctorFinanceQuery = {
  from?: string;
  to?: string;
};

export type DoctorFinanceMonthlyData = {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
  doctorEarnings: number;
};

export type DoctorFinanceRevenueSource = {
  source: string;
  amount: number;
};

export type DoctorFinanceTransaction = {
  id: number;
  description: string;
  category: string;
  type: "income" | "expense";
  amount: number;
  date: string;
};

export type DoctorFinanceResponse = {
  message: string;
  data: {
    meta: {
      from: string;
      to: string;
    };
    stats: {
      totalRevenue: number;
      totalExpenses: number;
      netProfit: number;
      doctorEarnings: number;
      doctorCommission: number;
    };
    monthlyData: DoctorFinanceMonthlyData[];
    revenueSources: DoctorFinanceRevenueSource[];
    recentTransactions: DoctorFinanceTransaction[];
  };
};
