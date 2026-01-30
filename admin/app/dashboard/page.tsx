'use client';

import { useEffect, useState } from 'react';
import { contentAPI, paymentAPI, authAPI } from '@/lib/api-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Film, Eye, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { DashboardStats } from '@/types';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // In a real app, you'd have a dedicated analytics endpoint
      // For now, we'll fetch basic stats from different services
      const [usersData, seriesData] = await Promise.all([
        authAPI.get<any>('/admin/stats/users').catch(() => ({ totalUsers: 0, activeUsers: 0, premiumUsers: 0 })),
        contentAPI.get<any>('/admin/stats/content').catch(() => ({ totalSeries: 0, totalEpisodes: 0, totalViews: 0 })),
      ]);

      setStats({
        totalUsers: usersData.totalUsers || 0,
        activeUsers: usersData.activeUsers || 0,
        premiumUsers: usersData.premiumUsers || 0,
        totalSeries: seriesData.totalSeries || 0,
        totalEpisodes: seriesData.totalEpisodes || 0,
        totalViews: seriesData.totalViews || 0,
        totalRevenue: 0,
        revenueChange: 0,
        usersChange: 0,
        viewsChange: 0,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      change: stats?.usersChange || 0,
      icon: Users,
      color: 'text-blue-600',
    },
    {
      title: 'Active Series',
      value: stats?.totalSeries || 0,
      change: 0,
      icon: Film,
      color: 'text-purple-600',
    },
    {
      title: 'Total Views',
      value: stats?.totalViews || 0,
      change: stats?.viewsChange || 0,
      icon: Eye,
      color: 'text-green-600',
    },
    {
      title: 'Revenue',
      value: `$${(stats?.totalRevenue || 0).toFixed(2)}`,
      change: stats?.revenueChange || 0,
      icon: DollarSign,
      color: 'text-yellow-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to the FUN admin dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          const isPositive = stat.change >= 0;
          const TrendIcon = isPositive ? TrendingUp : TrendingDown;
          
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    {stat.change !== 0 && (
                      <div className={`flex items-center text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        <TrendIcon className="mr-1 h-3 w-3" />
                        {Math.abs(stat.change)}% from last month
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Overview</CardTitle>
            <CardDescription>Breakdown of user base</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <>
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </>
            ) : (
              <>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Users</span>
                  <span className="font-medium">{stats?.totalUsers || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Active Users</span>
                  <span className="font-medium">{stats?.activeUsers || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Premium Users</span>
                  <span className="font-medium">{stats?.premiumUsers || 0}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content Overview</CardTitle>
            <CardDescription>Platform content statistics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <>
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </>
            ) : (
              <>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Series</span>
                  <span className="font-medium">{stats?.totalSeries || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Episodes</span>
                  <span className="font-medium">{stats?.totalEpisodes || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Views</span>
                  <span className="font-medium">{stats?.totalViews || 0}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest platform updates</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Recent activity will appear here
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
