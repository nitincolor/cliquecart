import {
  getDashboardChartData,
  getDashboardOrdersStatus,
  getRecentOrders,
} from "@/get-api-data/dashboard";
import DashboardArea from "../_components/DashboardArea";
import RecentOrders from "../_components/RecentOrders";

export default async function DashboardPage() {
  const dashboardData = getDashboardOrdersStatus();
  const chartData = getDashboardChartData();
  const ordersData = getRecentOrders();

  const [dashboardStates, dashboardChartData, recentOrdersData] =
    await Promise.all([dashboardData, chartData, ordersData]);

  return (
    <>
      <DashboardArea
        chartData={dashboardChartData}
        dashboardStates={dashboardStates}
      />
      <RecentOrders orders={recentOrdersData} />
    </>
  );
}
