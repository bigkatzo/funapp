'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { paymentAPI } from '@/lib/api-client';
import { Transaction } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Crown, Gift, LogOut, CreditCard, History } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, logout, refreshUser } = useAuthStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadTransactions();
  }, [isAuthenticated, router]);

  const loadTransactions = async () => {
    try {
      setIsLoading(true);
      const response = await paymentAPI.get<{ transactions: Transaction[] }>('/transactions/history');
      setTransactions(response.transactions);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
    toast.success('Logged out successfully');
  };

  const handleBuyCredits = () => {
    toast.info('Credits purchase coming soon!');
    // In production, integrate Stripe checkout
  };

  const handleSubscribe = () => {
    toast.info('Subscription coming soon!');
    // In production, integrate Stripe subscriptions
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="h-96 w-full max-w-2xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.profileImage} />
                <AvatarFallback className="text-2xl">
                  {user.displayName?.charAt(0) || user.email.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-2xl font-bold">{user.displayName || 'User'}</h1>
                <p className="text-muted-foreground">{user.email}</p>
                <div className="flex gap-2 mt-2">
                  {user.isPremium && (
                    <Badge className="gap-1">
                      <Crown className="h-3 w-3" />
                      Premium
                    </Badge>
                  )}
                  <Badge variant="outline" className="gap-1">
                    <Gift className="h-3 w-3" />
                    {user.credits} Credits
                  </Badge>
                </div>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="credits" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="credits">Credits & Premium</TabsTrigger>
            <TabsTrigger value="history">Transaction History</TabsTrigger>
          </TabsList>

          <TabsContent value="credits" className="space-y-4">
            {/* Credits */}
            <Card>
              <CardHeader>
                <CardTitle>Buy Credits</CardTitle>
                <CardDescription>Purchase credits to unlock premium episodes</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                {[
                  { amount: 100, price: 0.99 },
                  { amount: 500, price: 4.99 },
                  { amount: 1000, price: 9.99 },
                  { amount: 2500, price: 19.99 },
                ].map((pkg) => (
                  <Card key={pkg.amount} className="border-2">
                    <CardContent className="pt-6 text-center">
                      <div className="text-3xl font-bold">{pkg.amount}</div>
                      <div className="text-sm text-muted-foreground mb-4">Credits</div>
                      <Button onClick={handleBuyCredits} className="w-full">
                        ${pkg.price}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>

            {/* Premium Subscription */}
            <Card>
              <CardHeader>
                <CardTitle>Go Premium</CardTitle>
                <CardDescription>Unlock all content with a subscription</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Card className="border-2">
                    <CardContent className="pt-6 text-center">
                      <Crown className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                      <div className="text-xl font-bold">Monthly</div>
                      <div className="text-2xl font-bold mt-2">$9.99</div>
                      <div className="text-sm text-muted-foreground mb-4">per month</div>
                      <Button onClick={handleSubscribe} className="w-full">
                        Subscribe
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-purple-600">
                    <CardContent className="pt-6 text-center">
                      <Crown className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                      <div className="text-xl font-bold">Annual</div>
                      <div className="text-2xl font-bold mt-2">$99.99</div>
                      <div className="text-sm text-muted-foreground mb-4">per year</div>
                      <Badge variant="secondary" className="mb-2">Save 17%</Badge>
                      <Button onClick={handleSubscribe} className="w-full">
                        Subscribe
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Premium Benefits:</h4>
                  <ul className="space-y-1 text-sm">
                    <li>✓ Unlimited access to all episodes</li>
                    <li>✓ No ads</li>
                    <li>✓ Early access to new releases</li>
                    <li>✓ HD quality streaming</li>
                    <li>✓ Download for offline viewing</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>Your recent purchases and transactions</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No transactions yet
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transactions.map((tx) => (
                      <div
                        key={tx._id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-purple-100">
                            <CreditCard className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <div className="font-medium capitalize">
                              {tx.type.replace('_', ' ')}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true })}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">${tx.amount.toFixed(2)}</div>
                          {tx.credits && (
                            <div className="text-sm text-muted-foreground">
                              {tx.credits} credits
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
