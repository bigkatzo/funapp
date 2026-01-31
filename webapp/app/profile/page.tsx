'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { paymentAPI } from '@/lib/api-client';
import { Transaction } from '@/types';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Crown, Gift, LogOut, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // DEMO MODE: Skip auth check
  const isDemoMode = true;

  useEffect(() => {
    if (!isDemoMode && !isAuthenticated) {
      router.push('/login');
      return;
    }
    loadTransactions();
  }, [isAuthenticated, router]);

  const loadTransactions = async () => {
    try {
      setIsLoading(true);
      
      // DEMO MODE: Use mock transactions
      if (isDemoMode) {
        const mockTransactions: Transaction[] = [
          {
            _id: '1',
            type: 'credit_purchase',
            amount: 9.99,
            credits: 1000,
            currency: 'USD',
            status: 'completed',
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          },
          {
            _id: '2',
            type: 'credit_spend',
            amount: 0,
            credits: 50,
            currency: 'USD',
            status: 'completed',
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          },
          {
            _id: '3',
            type: 'subscription',
            amount: 9.99,
            currency: 'USD',
            status: 'completed',
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        ];
        setTransactions(mockTransactions);
        setIsLoading(false);
        return;
      }
      
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
  };

  const handleSubscribe = () => {
    toast.info('Subscription coming soon!');
  };

  // DEMO MODE: Use mock user
  const demoUser = {
    _id: 'demo-user',
    email: 'demo@fun.app',
    displayName: 'Demo User',
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
    credits: 850,
    isPremium: false,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
  };

  const displayUser = isDemoMode ? demoUser : user;

  if (!displayUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const creditPackages = [
    { amount: 100, price: 0.99 },
    { amount: 500, price: 4.99 },
    { amount: 1000, price: 9.99 },
    { amount: 2500, price: 19.99 },
  ];

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Black Header Bar */}
      <div className="bg-black text-white">
        <div className="p-4 flex items-center gap-3">
          <Avatar className="h-16 w-16">
            <AvatarImage src={displayUser.profileImage} />
            <AvatarFallback className="text-xl">
              {displayUser.displayName?.charAt(0) || displayUser.email.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold truncate">{displayUser.displayName || 'User'}</h1>
            <p className="text-sm text-white/70 truncate">{displayUser.email}</p>
            <div className="flex gap-2 mt-1">
              {displayUser.isPremium && (
                <Badge className="gap-1 h-5 text-xs">
                  <Crown className="h-3 w-3" />
                  Premium
                </Badge>
              )}
              <Badge variant="outline" className="gap-1 h-5 text-xs bg-white/10 border-white/20 text-white">
                <Gift className="h-3 w-3" />
                {displayUser.credits} Credits
              </Badge>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout} className="text-white hover:bg-white/10">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="credits" className="w-full">
        <TabsList className="w-full grid grid-cols-2 bg-gray-100 rounded-none h-12 p-0">
          <TabsTrigger 
            value="credits"
            className="rounded-none data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Credits & Premium
          </TabsTrigger>
          <TabsTrigger 
            value="history"
            className="rounded-none data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Transaction History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="credits" className="mt-0 space-y-0">
          {/* Credits Section */}
          <div className="p-4 border-b">
            <h2 className="text-lg font-bold mb-1">Buy Credits</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Purchase credits to unlock premium episodes
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {creditPackages.map((pkg) => (
                <button
                  key={pkg.amount}
                  onClick={handleBuyCredits}
                  className="border-2 rounded-lg p-4 text-center hover:border-purple-600 transition-colors"
                >
                  <div className="text-2xl font-bold">{pkg.amount}</div>
                  <div className="text-xs text-muted-foreground mb-2">Credits</div>
                  <div className="bg-black text-white rounded-full py-2 text-sm font-medium">
                    ${pkg.price}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Premium Section */}
          <div className="p-4">
            <h2 className="text-lg font-bold mb-1">Go Premium</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Unlock all content with a subscription
            </p>
            
            <div className="space-y-3 md:grid md:grid-cols-2 md:gap-3 md:space-y-0">
              {/* Monthly */}
              <button
                onClick={handleSubscribe}
                className="w-full border-2 rounded-lg p-4 text-left hover:border-purple-600 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-bold text-lg">Monthly</div>
                    <div className="text-2xl font-bold mt-1">$9.99</div>
                    <div className="text-sm text-muted-foreground">per month</div>
                  </div>
                  <Crown className="h-8 w-8 text-yellow-600" />
                </div>
              </button>
              
              {/* Annual */}
              <button
                onClick={handleSubscribe}
                className="w-full border-2 border-purple-600 rounded-lg p-4 text-left bg-purple-50 hover:bg-purple-100 transition-colors"
              >
                <Badge variant="secondary" className="mb-2">Save 17%</Badge>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-lg">Annual</div>
                    <div className="text-2xl font-bold mt-1">$99.99</div>
                    <div className="text-sm text-muted-foreground">per year</div>
                  </div>
                  <Crown className="h-8 w-8 text-purple-600" />
                </div>
              </button>
            </div>
            
            {/* Benefits */}
            <div className="mt-4 bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-sm mb-2">Premium Benefits</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>✓ Unlimited access to all episodes</li>
                <li>✓ No ads</li>
                <li>✓ Early access to new releases</li>
                <li>✓ HD quality streaming</li>
                <li>✓ Download for offline viewing</li>
              </ul>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-0">
          <div className="p-4">
            <h2 className="text-lg font-bold mb-1">Transaction History</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Your recent purchases and transactions
            </p>
            
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No transactions yet
              </div>
            ) : (
              <div className="divide-y">
                {transactions.map((tx) => (
                  <div key={tx._id} className="py-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-full bg-gray-100 mt-1">
                          <CreditCard className="h-4 w-4 text-gray-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-sm capitalize truncate">
                            {tx.type.replace('_', ' ')}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true })}
                          </div>
                          {tx.credits && (
                            <div className="text-xs text-purple-600 font-medium mt-0.5">
                              {tx.credits} credits
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-sm">${tx.amount.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
