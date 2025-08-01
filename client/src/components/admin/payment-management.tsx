
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Payment {
  id: string;
  user_id: string;
  gateway: string;
  crypto_type?: string;
  transaction_id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  users: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface CryptoAddress {
  id: string;
  crypto_type: string;
  address: string;
  is_active: boolean;
}

export function PaymentManagement() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [cryptoAddresses, setCryptoAddresses] = useState<CryptoAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'payments' | 'crypto'>('payments');

  useEffect(() => {
    fetchPayments();
    fetchCryptoAddresses();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await fetch('/api/admin/payments');
      const data = await response.json();
      setPayments(data);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCryptoAddresses = async () => {
    try {
      const response = await fetch('/api/admin/crypto-addresses');
      const data = await response.json();
      setCryptoAddresses(data);
    } catch (error) {
      console.error('Error fetching crypto addresses:', error);
    }
  };

  const updatePaymentStatus = async (paymentId: string, status: string) => {
    try {
      await fetch(`/api/admin/payments/${paymentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      fetchPayments(); // Refresh the list
    } catch (error) {
      console.error('Error updating payment:', error);
    }
  };

  const updateCryptoAddress = async (cryptoType: string, address: string) => {
    try {
      await fetch(`/api/admin/crypto-addresses/${cryptoType}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address }),
      });
      fetchCryptoAddresses(); // Refresh the list
    } catch (error) {
      console.error('Error updating crypto address:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    const value = amount / 100; // Convert from cents
    return `${value.toFixed(2)} ${currency}`;
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div>
      <div className="flex gap-4 mb-6">
        <Button
          variant={selectedTab === 'payments' ? 'default' : 'outline'}
          onClick={() => setSelectedTab('payments')}
        >
          Payment History
        </Button>
        <Button
          variant={selectedTab === 'crypto' ? 'default' : 'outline'}
          onClick={() => setSelectedTab('crypto')}
        >
          Crypto Addresses
        </Button>
      </div>

      {selectedTab === 'payments' && (
        <div className="space-y-4">
          <div className="grid gap-4">
            {payments.map((payment) => (
              <Card key={payment.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {payment.users.first_name} {payment.users.last_name}
                        </span>
                        <Badge variant="outline">{payment.gateway}</Badge>
                        {payment.crypto_type && (
                          <Badge variant="outline">{payment.crypto_type.toUpperCase()}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{payment.users.email}</p>
                      <p className="text-sm text-gray-600">
                        {formatAmount(payment.amount, payment.currency)} - {payment.transaction_id}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(payment.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(payment.status)}>
                        {payment.status}
                      </Badge>
                      {payment.status === 'pending' && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            onClick={() => updatePaymentStatus(payment.id, 'confirmed')}
                            className="bg-green-500 hover:bg-green-600"
                          >
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updatePaymentStatus(payment.id, 'failed')}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {selectedTab === 'crypto' && (
        <div className="space-y-4">
          <div className="grid gap-4">
            {['btc', 'eth', 'usdt', 'matic'].map((cryptoType) => {
              const existing = cryptoAddresses.find(addr => addr.crypto_type === cryptoType);
              return (
                <Card key={cryptoType}>
                  <CardHeader>
                    <CardTitle className="text-lg capitalize">
                      {cryptoType === 'btc' ? 'Bitcoin' :
                       cryptoType === 'eth' ? 'Ethereum' :
                       cryptoType === 'usdt' ? 'Tether (USDT)' :
                       'Polygon (MATIC)'} Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Input
                        placeholder={`Enter ${cryptoType.toUpperCase()} address`}
                        defaultValue={existing?.address || ''}
                        className="font-mono text-sm"
                        id={`${cryptoType}-address`}
                      />
                      <Button
                        onClick={() => {
                          const input = document.getElementById(`${cryptoType}-address`) as HTMLInputElement;
                          if (input?.value) {
                            updateCryptoAddress(cryptoType, input.value);
                          }
                        }}
                      >
                        Update
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
