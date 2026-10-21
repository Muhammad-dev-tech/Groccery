'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/domain/cart/context';
import { placeOrderAction } from './actions';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import {
  MapPin,
  Phone,
  FileText,
  Store,
  ShieldCheck,
  Loader2,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, summary, isLoaded, clearCart } = useCart();

  const [deliveryAddress, setDeliveryAddress] = React.useState('');
  const [contactPhone, setContactPhone] = React.useState('');
  const [orderNotes, setOrderNotes] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isLoaded && items.length === 0) {
      router.push('/cart');
    }
  }, [isLoaded, items, router]);

  if (!isLoaded || items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="h-64 rounded-3xl bg-slate-50 animate-pulse border border-slate-200" />
      </div>
    );
  }

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const result = await placeOrderAction({
        deliveryAddress,
        contactPhone,
        orderNotes: orderNotes || undefined,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
      });

      if (!result.success || !result.customerOrderId) {
        setErrorMessage(result.error || 'Failed to place order. Please try again.');
        setLoading(false);
        return;
      }

      // Clear cart on success
      clearCart();
      router.push(`/checkout/success?orderId=${result.customerOrderId}`);
    } catch {
      setErrorMessage('An unexpected network or server error occurred.');
      setLoading(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <Link
          href="/cart"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Cart
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Multi-Vendor Checkout
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Provide your local delivery address. Your order will be seamlessly partitioned across{' '}
          <strong className="text-slate-800">{summary.vendorCount} independent store{summary.vendorCount === 1 ? '' : 's'}</strong>.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h4 className="font-bold text-sm text-red-900">Checkout Error</h4>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Delivery Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-200">
            <CardHeader className="border-none pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-600" />
                <span>Delivery Address & Contact</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div>
                <label htmlFor="address" className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Street Address & Unit/Apt *
                </label>
                <input
                  id="address"
                  type="text"
                  required
                  placeholder="e.g. 104 Green Grove Way, Apt 3B, Springfield, IL 62701"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-200 py-2.5 px-3.5 text-xs text-slate-800 placeholder-slate-400 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-xs font-semibold text-slate-700 mb-1">
                  Recipient Contact Phone *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="phone"
                    type="tel"
                    required
                    placeholder="+1 555-0101"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    disabled={loading}
                    className="w-full rounded-xl border border-slate-200 pl-9 pr-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Vendors may call or text regarding dispatch and delivery arrival.
                </p>
              </div>

              <div>
                <label htmlFor="notes" className="block text-xs font-semibold text-slate-700 mb-1">
                  Delivery Notes / Gate Code (Optional)
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <textarea
                    id="notes"
                    rows={2}
                    placeholder="e.g. Ring buzzer 4, leave on porch if not home"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    disabled={loading}
                    className="w-full rounded-xl border border-slate-200 pl-9 pr-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Partition Preview */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Partitioned Sub-Orders to Be Created ({summary.partitions.length})
            </h3>
            <div className="space-y-3">
              {summary.partitions.map((p) => (
                <div
                  key={p.vendorId}
                  className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-brand-600" />
                      <span className="font-bold text-sm text-slate-900">{p.vendorName}</span>
                      <span className="text-xs text-slate-400">({p.vendorCity})</span>
                    </div>
                    <span className="font-bold text-sm text-slate-900">
                      ${p.subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">
                    {p.items.map((it) => `${it.quantity}x ${it.name}`).join(' · ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Grand Total & Submit */}
        <div className="lg:col-span-1">
          <Card className="border-slate-200 sticky top-24 shadow-sm">
            <CardContent className="p-6 space-y-5">
              <h3 className="font-extrabold text-base text-slate-900 border-b border-slate-100 pb-3">
                Review & Confirm
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Total Items:</span>
                  <span className="font-semibold text-slate-800">{summary.totalItems}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Vendors Involved:</span>
                  <span className="font-semibold text-slate-800">{summary.vendorCount}</span>
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-slate-900">Grand Total:</span>
                  <span className="text-2xl font-black text-brand-600">
                    ${summary.totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={loading}
                className="w-full justify-center shadow-md text-sm font-bold"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Partitioning & Placing Order...
                  </>
                ) : (
                  <span>Place Multi-Vendor Order</span>
                )}
              </Button>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <div className="font-semibold flex items-center gap-1 text-slate-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Fair Pricing Guarantee</span>
                </div>
                <p>
                  Prices and stock are re-verified against live database records before order placement.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
