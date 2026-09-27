// Mock data for the WyaparIQ platform
// This provides realistic sample data for all dashboard visualizations

export const dashboardKPIs = {
  totalVisitors: 12847,
  visitorsChange: 12.5,
  totalSales: 847520,
  salesChange: 8.3,
  topBranch: 'Mumbai - Andheri',
  topBranchSales: 234500,
  avgOrderValue: 1850,
  avgOrderChange: 3.2,
  inventoryAlerts: 23,
  staffAlerts: 5,
  conversionRate: 34.2,
  conversionChange: 2.1,
}

export const visitorTrendData = [
  { time: '6 AM', visitors: 120, sales: 15000 },
  { time: '7 AM', visitors: 250, sales: 32000 },
  { time: '8 AM', visitors: 480, sales: 58000 },
  { time: '9 AM', visitors: 720, sales: 89000 },
  { time: '10 AM', visitors: 980, sales: 125000 },
  { time: '11 AM', visitors: 1250, sales: 156000 },
  { time: '12 PM', visitors: 1450, sales: 178000 },
  { time: '1 PM', visitors: 1380, sales: 165000 },
  { time: '2 PM', visitors: 1100, sales: 142000 },
  { time: '3 PM', visitors: 1300, sales: 158000 },
  { time: '4 PM', visitors: 1500, sales: 185000 },
  { time: '5 PM', visitors: 1650, sales: 210000 },
  { time: '6 PM', visitors: 1800, sales: 235000 },
  { time: '7 PM', visitors: 1950, sales: 256000 },
  { time: '8 PM', visitors: 1700, sales: 220000 },
  { time: '9 PM', visitors: 1200, sales: 148000 },
  { time: '10 PM', visitors: 650, sales: 78000 },
]

export const branchPerformanceData = [
  { name: 'Mumbai - Andheri', sales: 234500, visitors: 3200, staff: 45, rating: 4.5 },
  { name: 'Delhi - CP', sales: 198000, visitors: 2800, staff: 38, rating: 4.3 },
  { name: 'Bangalore - MG Road', sales: 187000, visitors: 2650, staff: 42, rating: 4.6 },
  { name: 'Chennai - T Nagar', sales: 156000, visitors: 2100, staff: 35, rating: 4.2 },
  { name: 'Hyderabad - Banjara', sales: 145000, visitors: 1950, staff: 32, rating: 4.4 },
  { name: 'Pune - FC Road', sales: 132000, visitors: 1800, staff: 28, rating: 4.1 },
  { name: 'Kolkata - Park St', sales: 118000, visitors: 1600, staff: 25, rating: 4.0 },
  { name: 'Jaipur - MI Road', sales: 95000, visitors: 1300, staff: 22, rating: 3.9 },
]

export const productCategoryData = [
  { name: 'Electronics', value: 35, color: '#6366f1' },
  { name: 'Fashion', value: 25, color: '#a855f7' },
  { name: 'Groceries', value: 20, color: '#10b981' },
  { name: 'Home & Living', value: 10, color: '#f59e0b' },
  { name: 'Beauty', value: 7, color: '#ec4899' },
  { name: 'Others', value: 3, color: '#64748b' },
]

export const weeklyGrowthData = [
  { week: 'Week 1', revenue: 580000, target: 600000, lastYear: 520000 },
  { week: 'Week 2', revenue: 620000, target: 610000, lastYear: 540000 },
  { week: 'Week 3', revenue: 710000, target: 640000, lastYear: 580000 },
  { week: 'Week 4', revenue: 680000, target: 660000, lastYear: 600000 },
  { week: 'Week 5', revenue: 750000, target: 700000, lastYear: 620000 },
  { week: 'Week 6', revenue: 820000, target: 720000, lastYear: 650000 },
  { week: 'Week 7', revenue: 790000, target: 750000, lastYear: 680000 },
  { week: 'Week 8', revenue: 870000, target: 780000, lastYear: 710000 },
]

export const topProducts = [
  { name: 'iPhone 15 Pro', category: 'Electronics', sales: 4520, revenue: 5424000, trend: 15.2 },
  { name: 'Samsung Galaxy S24', category: 'Electronics', sales: 3890, revenue: 3112000, trend: 12.8 },
  { name: 'Levi\'s 501 Jeans', category: 'Fashion', sales: 3200, revenue: 960000, trend: 8.5 },
  { name: 'Nike Air Max', category: 'Fashion', sales: 2850, revenue: 1425000, trend: 22.3 },
  { name: 'Organic Ghee 1L', category: 'Groceries', sales: 2600, revenue: 780000, trend: -3.2 },
  { name: 'Ray-Ban Aviator', category: 'Eyewear', sales: 2100, revenue: 1050000, trend: 18.7 },
  { name: 'MacBook Air M3', category: 'Electronics', sales: 1800, revenue: 18000000, trend: 25.1 },
  { name: 'Titan Watch Classic', category: 'Accessories', sales: 1500, revenue: 750000, trend: 5.6 },
]

export const inventoryData = [
  { product: 'iPhone 15 Pro', branch: 'Mumbai', stock: 45, minStock: 20, status: 'healthy' },
  { product: 'Samsung Galaxy S24', branch: 'Delhi', stock: 12, minStock: 15, status: 'low' },
  { product: 'Levi\'s 501 Jeans', branch: 'Bangalore', stock: 8, minStock: 25, status: 'critical' },
  { product: 'Nike Air Max', branch: 'Chennai', stock: 32, minStock: 20, status: 'healthy' },
  { product: 'Organic Ghee', branch: 'Pune', stock: 5, minStock: 30, status: 'critical' },
  { product: 'Ray-Ban Aviator', branch: 'Hyderabad', stock: 18, minStock: 10, status: 'healthy' },
  { product: 'MacBook Air M3', branch: 'Mumbai', stock: 10, minStock: 8, status: 'healthy' },
  { product: 'Titan Watch', branch: 'Kolkata', stock: 15, minStock: 12, status: 'healthy' },
]

export const crowdData = {
  hourlyData: [
    { hour: '6AM', mon: 45, tue: 52, wed: 48, thu: 55, fri: 62, sat: 120, sum: 95 },
    { hour: '7AM', mon: 80, tue: 85, wed: 78, thu: 90, fri: 95, sat: 150, sum: 130 },
    { hour: '8AM', mon: 150, tue: 160, wed: 145, thu: 155, fri: 170, sat: 250, sum: 200 },
    { hour: '9AM', mon: 220, tue: 230, wed: 210, thu: 225, fri: 240, sat: 350, sum: 280 },
    { hour: '10AM', mon: 300, tue: 310, wed: 290, thu: 305, fri: 320, sat: 450, sum: 380 },
    { hour: '11AM', mon: 380, tue: 390, wed: 370, thu: 385, fri: 400, sat: 520, sum: 450 },
    { hour: '12PM', mon: 420, tue: 430, wed: 410, thu: 425, fri: 450, sat: 580, sum: 500 },
    { hour: '1PM', mon: 380, tue: 390, wed: 375, thu: 385, fri: 410, sat: 530, sum: 460 },
    { hour: '2PM', mon: 340, tue: 350, wed: 330, thu: 345, fri: 360, sat: 480, sum: 420 },
    { hour: '3PM', mon: 360, tue: 370, wed: 350, thu: 365, fri: 380, sat: 500, sum: 440 },
    { hour: '4PM', mon: 400, tue: 410, wed: 390, thu: 405, fri: 420, sat: 550, sum: 480 },
    { hour: '5PM', mon: 450, tue: 460, wed: 440, thu: 455, fri: 480, sat: 600, sum: 520 },
    { hour: '6PM', mon: 500, tue: 510, wed: 490, thu: 505, fri: 530, sat: 650, sum: 560 },
    { hour: '7PM', mon: 480, tue: 490, wed: 470, thu: 485, fri: 510, sat: 620, sum: 540 },
    { hour: '8PM', mon: 380, tue: 390, wed: 370, thu: 385, fri: 400, sat: 520, sum: 450 },
    { hour: '9PM', mon: 250, tue: 260, wed: 240, thu: 255, fri: 280, sat: 400, sum: 350 },
    { hour: '10PM', mon: 120, tue: 130, wed: 110, thu: 125, fri: 150, sat: 250, sum: 200 },
  ],
  peakHours: ['12 PM', '5 PM - 7 PM'],
  busiestDay: 'Saturday',
  avgDailyVisitors: 1250,
}

export const staffData = [
  { branch: 'Mumbai - Andheri', currentStaff: 45, recommended: 48, customersPerHour: 120, ratio: '2.7:1', efficiency: 92 },
  { branch: 'Delhi - CP', currentStaff: 38, recommended: 42, customersPerHour: 105, ratio: '2.8:1', efficiency: 88 },
  { branch: 'Bangalore - MG Road', currentStaff: 42, recommended: 40, customersPerHour: 98, ratio: '2.3:1', efficiency: 95 },
  { branch: 'Chennai - T Nagar', currentStaff: 35, recommended: 38, customersPerHour: 88, ratio: '2.5:1', efficiency: 90 },
  { branch: 'Hyderabad - Banjara', currentStaff: 32, recommended: 35, customersPerHour: 82, ratio: '2.6:1', efficiency: 87 },
  { branch: 'Pune - FC Road', currentStaff: 28, recommended: 30, customersPerHour: 72, ratio: '2.6:1', efficiency: 89 },
]

export const festivalData = [
  { festival: 'Diwali', month: 'Oct-Nov', salesMultiplier: 3.2, topCategory: 'Electronics', predictedGrowth: 28 },
  { festival: 'Eid al-Fitr', month: 'Apr', salesMultiplier: 2.1, topCategory: 'Fashion', predictedGrowth: 18 },
  { festival: 'Christmas', month: 'Dec', salesMultiplier: 2.8, topCategory: 'Gifts', predictedGrowth: 22 },
  { festival: 'Holi', month: 'Mar', salesMultiplier: 1.8, topCategory: 'FMCG', predictedGrowth: 15 },
  { festival: 'Navratri', month: 'Oct', salesMultiplier: 2.4, topCategory: 'Fashion', predictedGrowth: 20 },
  { festival: 'Raksha Bandhan', month: 'Aug', salesMultiplier: 1.6, topCategory: 'Gifts', predictedGrowth: 12 },
]

export const festivalTrendData = [
  { year: '2022', diwali: 2800000, eid: 1200000, christmas: 1800000, holi: 900000 },
  { year: '2023', diwali: 3500000, eid: 1500000, christmas: 2200000, holi: 1100000 },
  { year: '2024', diwali: 4200000, eid: 1800000, christmas: 2700000, holi: 1350000 },
  { year: '2025', diwali: 5100000, eid: 2100000, christmas: 3200000, holi: 1600000 },
  { year: '2026 (P)', diwali: 6200000, eid: 2500000, christmas: 3800000, holi: 1900000 },
]

export const competitorData = [
  { product: 'iPhone 15 Pro', ourPrice: 134900, amazon: 131900, flipkart: 132500, recommendation: 'Match Amazon pricing' },
  { product: 'Samsung Galaxy S24', ourPrice: 79999, amazon: 74999, flipkart: 76999, recommendation: 'Reduce by ₹3,000' },
  { product: 'Sony WH-1000XM5', ourPrice: 29990, amazon: 24990, flipkart: 26990, recommendation: 'Bundle with case for value' },
  { product: 'Nike Air Max 90', ourPrice: 12995, amazon: 11495, flipkart: 12295, recommendation: 'Offer loyalty discount' },
  { product: 'Levi\'s 501', ourPrice: 3499, amazon: 2999, flipkart: 3199, recommendation: 'In-store exclusive color' },
]

export const customerJourneyData = {
  paths: [
    { from: 'Entrance', to: 'Electronics', value: 450 },
    { from: 'Entrance', to: 'Fashion', value: 380 },
    { from: 'Entrance', to: 'Groceries', value: 320 },
    { from: 'Entrance', to: 'Home & Living', value: 150 },
    { from: 'Electronics', to: 'Accessories', value: 280 },
    { from: 'Electronics', to: 'Billing', value: 170 },
    { from: 'Fashion', to: 'Accessories', value: 220 },
    { from: 'Fashion', to: 'Beauty', value: 100 },
    { from: 'Fashion', to: 'Billing', value: 60 },
    { from: 'Groceries', to: 'FMCG', value: 200 },
    { from: 'Groceries', to: 'Billing', value: 120 },
    { from: 'Accessories', to: 'Billing', value: 420 },
    { from: 'Beauty', to: 'Billing', value: 80 },
    { from: 'FMCG', to: 'Billing', value: 180 },
    { from: 'Home & Living', to: 'Billing', value: 130 },
  ],
}

export const productRelationships = [
  { source: 'Laptop', target: 'Mouse', strength: 0.85, sourceCategory: 'Electronics', targetCategory: 'Electronics', coPurchaseCount: 756, avgBasketValue: 52400, liftScore: 3.8 },
  { source: 'Laptop', target: 'Laptop Bag', strength: 0.72, sourceCategory: 'Electronics', targetCategory: 'Electronics', coPurchaseCount: 612, avgBasketValue: 48200, liftScore: 2.9 },
  { source: 'Laptop', target: 'USB Hub', strength: 0.58, sourceCategory: 'Electronics', targetCategory: 'Electronics', coPurchaseCount: 389, avgBasketValue: 44800, liftScore: 2.1 },
  { source: 'Phone', target: 'Phone Case', strength: 0.92, sourceCategory: 'Electronics', targetCategory: 'Electronics', coPurchaseCount: 892, avgBasketValue: 18500, liftScore: 4.2 },
  { source: 'Phone', target: 'Screen Guard', strength: 0.88, sourceCategory: 'Electronics', targetCategory: 'Electronics', coPurchaseCount: 834, avgBasketValue: 16200, liftScore: 4.0 },
  { source: 'Phone', target: 'Earbuds', strength: 0.65, sourceCategory: 'Electronics', targetCategory: 'Electronics', coPurchaseCount: 478, avgBasketValue: 21800, liftScore: 2.5 },
  { source: 'Shirt', target: 'Belt', strength: 0.78, sourceCategory: 'Fashion', targetCategory: 'Fashion', coPurchaseCount: 634, avgBasketValue: 3200, liftScore: 3.1 },
  { source: 'Shirt', target: 'Trousers', strength: 0.82, sourceCategory: 'Fashion', targetCategory: 'Fashion', coPurchaseCount: 721, avgBasketValue: 4500, liftScore: 3.4 },
  { source: 'Jeans', target: 'T-Shirt', strength: 0.75, sourceCategory: 'Fashion', targetCategory: 'Fashion', coPurchaseCount: 598, avgBasketValue: 3800, liftScore: 2.9 },
  { source: 'Bread', target: 'Butter', strength: 0.90, sourceCategory: 'Grocery', targetCategory: 'Grocery', coPurchaseCount: 1245, avgBasketValue: 320, liftScore: 3.6 },
  { source: 'Bread', target: 'Jam', strength: 0.68, sourceCategory: 'Grocery', targetCategory: 'Grocery', coPurchaseCount: 512, avgBasketValue: 380, liftScore: 2.4 },
  { source: 'Milk', target: 'Cereal', strength: 0.72, sourceCategory: 'Grocery', targetCategory: 'Grocery', coPurchaseCount: 423, avgBasketValue: 450, liftScore: 2.8 },
  { source: 'Shampoo', target: 'Conditioner', strength: 0.88, sourceCategory: 'Beauty', targetCategory: 'Beauty', coPurchaseCount: 678, avgBasketValue: 890, liftScore: 4.0 },
  { source: 'Face Wash', target: 'Moisturizer', strength: 0.76, sourceCategory: 'Beauty', targetCategory: 'Beauty', coPurchaseCount: 534, avgBasketValue: 1200, liftScore: 3.2 },
  { source: 'Frame', target: 'Lens', strength: 0.95, sourceCategory: 'Eyewear', targetCategory: 'Eyewear', coPurchaseCount: 541, avgBasketValue: 8500, liftScore: 5.1 },
  { source: 'Frame', target: 'Case', strength: 0.70, sourceCategory: 'Eyewear', targetCategory: 'Eyewear', coPurchaseCount: 412, avgBasketValue: 6200, liftScore: 2.6 },
  { source: 'Sunglasses', target: 'Cleaning Kit', strength: 0.62, sourceCategory: 'Eyewear', targetCategory: 'Eyewear', coPurchaseCount: 356, avgBasketValue: 4800, liftScore: 2.2 },
]

export const businessHealthData = {
  overallScore: 84,
  factors: [
    { name: 'Sales Growth', score: 88, weight: 30, trend: 'up' },
    { name: 'Customer Traffic', score: 82, weight: 25, trend: 'up' },
    { name: 'Inventory Efficiency', score: 76, weight: 20, trend: 'down' },
    { name: 'Staff Productivity', score: 90, weight: 15, trend: 'up' },
    { name: 'Customer Satisfaction', score: 85, weight: 10, trend: 'stable' },
  ],
  suggestions: [
    'Increase inventory for high-demand products in Mumbai and Delhi branches',
    'Optimize staff scheduling during peak hours (5 PM - 7 PM)',
    'Launch targeted promotions for underperforming categories',
    'Expand online presence to complement in-store sales',
    'Implement loyalty program to improve customer retention',
  ],
}

export const storeHeatmapData = {
  zones: [
    { id: 'entrance', name: 'Entrance', x: 10, y: 80, width: 80, height: 15, traffic: 95, color: '#ef4444' },
    { id: 'electronics', name: 'Electronics', x: 10, y: 10, width: 35, height: 30, traffic: 88, color: '#f97316' },
    { id: 'fashion', name: 'Fashion', x: 55, y: 10, width: 35, height: 30, traffic: 82, color: '#f59e0b' },
    { id: 'groceries', name: 'Groceries', x: 10, y: 45, width: 25, height: 30, traffic: 75, color: '#eab308' },
    { id: 'home', name: 'Home & Living', x: 40, y: 45, width: 20, height: 30, traffic: 45, color: '#22c55e' },
    { id: 'beauty', name: 'Beauty', x: 65, y: 45, width: 25, height: 30, traffic: 60, color: '#84cc16' },
    { id: 'billing', name: 'Billing', x: 75, y: 80, width: 15, height: 15, traffic: 90, color: '#ef4444' },
  ],
  recommendations: [
    'Move promotional displays near Electronics section (highest traffic after entrance)',
    'Relocate slow-moving Home & Living items closer to Fashion section',
    'Add impulse purchase displays near Billing area',
    'Create cross-sell zones between Electronics and Accessories',
  ],
}

export const monthlyRevenueData = [
  { month: 'Jan', revenue: 4500000, expenses: 3200000, profit: 1300000 },
  { month: 'Feb', revenue: 4200000, expenses: 3100000, profit: 1100000 },
  { month: 'Mar', revenue: 4800000, expenses: 3300000, profit: 1500000 },
  { month: 'Apr', revenue: 5100000, expenses: 3400000, profit: 1700000 },
  { month: 'May', revenue: 4700000, expenses: 3250000, profit: 1450000 },
  { month: 'Jun', revenue: 4900000, expenses: 3350000, profit: 1550000 },
  { month: 'Jul', revenue: 5300000, expenses: 3500000, profit: 1800000 },
  { month: 'Aug', revenue: 5600000, expenses: 3600000, profit: 2000000 },
  { month: 'Sep', revenue: 5200000, expenses: 3450000, profit: 1750000 },
  { month: 'Oct', revenue: 7200000, expenses: 4200000, profit: 3000000 },
  { month: 'Nov', revenue: 8500000, expenses: 4800000, profit: 3700000 },
  { month: 'Dec', revenue: 7800000, expenses: 4500000, profit: 3300000 },
]

export const branchLocations = [
  { city: 'Mumbai', lat: 19.076, lng: 72.8777, branches: 5, performance: 92 },
  { city: 'Delhi', lat: 28.7041, lng: 77.1025, branches: 4, performance: 88 },
  { city: 'Bangalore', lat: 12.9716, lng: 77.5946, branches: 3, performance: 90 },
  { city: 'Chennai', lat: 13.0827, lng: 80.2707, branches: 3, performance: 85 },
  { city: 'Hyderabad', lat: 17.385, lng: 78.4867, branches: 2, performance: 87 },
  { city: 'Pune', lat: 18.5204, lng: 73.8567, branches: 2, performance: 83 },
  { city: 'Kolkata', lat: 22.5726, lng: 88.3639, branches: 2, performance: 80 },
  { city: 'Jaipur', lat: 26.9124, lng: 75.7873, branches: 1, performance: 78 },
]

export const expansionRecommendations = [
  { city: 'Ahmedabad', score: 92, population: '8.6M', demand: 'High', competition: 'Medium', reason: 'Growing retail market with high consumer spending' },
  { city: 'Lucknow', score: 87, population: '3.9M', demand: 'High', competition: 'Low', reason: 'Underserved market with rising disposable income' },
  { city: 'Chandigarh', score: 85, population: '1.2M', demand: 'Medium', competition: 'Low', reason: 'High per-capita income with limited organized retail' },
  { city: 'Kochi', score: 82, population: '2.1M', demand: 'Medium', competition: 'Medium', reason: 'Tourist destination with year-round demand' },
  { city: 'Indore', score: 80, population: '3.2M', demand: 'High', competition: 'Low', reason: 'Fastest growing city with young demographic' },
]
