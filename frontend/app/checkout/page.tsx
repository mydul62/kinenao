"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ShoppingBag,
  MapPin,
  Truck,
  CreditCard,
  CheckCircle,
  Plus,
  Loader2,
  Trash2,
} from "lucide-react";

export default function CheckoutPage() {
  const { cart, cartSubtotal, clearCart } = useCart();
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast.warning("Please log in to proceed with checkout");
      router.push("/login?redirect=/checkout");
    }
  }, [isAuthenticated, isLoading, router]);

  // Steps: 1: Cart, 2: Address, 3: Zone, 4: Payment Method, 5: Placed
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Address State
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newStreet, setNewStreet] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newArea, setNewArea] = useState("");
  const [newPostal, setNewPostal] = useState("");

  // Delivery Zone State
  const [deliveryZones, setDeliveryZones] = useState<any[]>([]);
  const [selectedZone, setSelectedZone] = useState<any>(null);

  // Coupon State
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);

  // Payment Method State
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<any>(null);

  // Created Order details
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  const [transactionId, setTransactionId] = useState("");
  const [senderNumber, setSenderNumber] = useState("");

  // Fetch initial address lists, delivery zones, and payment methods
  useEffect(() => {
    if (isAuthenticated) {
      api.get("/addresses").then((res) => {
        const addrList = res.data.data.addresses || [];
        setAddresses(addrList);
        const defaultAddr = addrList.find((a: any) => a.isDefault);
        if (defaultAddr) setSelectedAddress(defaultAddr.id);
      });

      api.get("/delivery-zones").then((res) => {
        setDeliveryZones(res.data.data.deliveryZones || res.data.data.zones || []);
      });

      api.get("/payment-methods").then((res) => {
        setPaymentMethods(res.data.data.paymentMethods || []);
      });
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Validate coupon code
  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    try {
      const { data } = await api.post("/coupons/validate", {
        code: couponCode,
        purchaseAmount: cartSubtotal,
      });
      setAppliedCoupon({
        id: data.data.couponId,
        code: data.data.code,
      });
      setCouponDiscount(data.data.discountAmount);
      toast.success("Coupon code applied successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Invalid or expired coupon");
    }
  };

  // Add a new shipping address
  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStreet || !newCity || !newArea || !newPostal) {
      toast.error("Please fill in all address fields");
      return;
    }

    try {
      const { data } = await api.post("/addresses", {
        street: newStreet,
        city: newCity,
        area: newArea,
        postalCode: newPostal,
        isDefault: addresses.length === 0,
      });
      const added = data.data.address;
      setAddresses([...addresses, added]);
      setSelectedAddress(added.id);
      setShowNewAddressForm(false);
      setNewStreet("");
      setNewCity("");
      setNewArea("");
      setNewPostal("");
      toast.success("Address added successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add address");
    }
  };

  // Place Order API Submission
  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error("Please select a shipping address");
      return;
    }
    if (!selectedZone) {
      toast.error("Please select a delivery zone");
      return;
    }
    if (!selectedPaymentMethod) {
      toast.error("Please select a payment method");
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        deliveryAddressId: selectedAddress,
        deliveryZoneId: selectedZone.id,
        couponCode: appliedCoupon?.code || undefined,
        items: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      };

      const { data } = await api.post("/orders", orderData);
      setCreatedOrder(data.data.order);
      clearCart();
      toast.success("Order placed successfully!");
      setStep(5); // Go to payment upload screen
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Order placement failed");
    } finally {
      setLoading(false);
    }
  };

  // Submit payment transaction id
  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const isCOD = selectedPaymentMethod?.accountType === "COD" || selectedPaymentMethod?.name?.toLowerCase().includes("cash");
    const txId = isCOD ? "CASH-ON-DELIVERY" : transactionId;
    const sNumber = isCOD ? "0000000000" : senderNumber;

    if (!isCOD && (!txId || !sNumber)) {
      toast.error("Transaction ID and sender phone number are required");
      return;
    }

    setLoading(true);
    try {
      await api.post(`/orders/${createdOrder.id}/submit-payment`, {
        paymentMethodId: selectedPaymentMethod.id,
        transactionId: txId,
        senderNumber: sNumber,
        paidAmount: createdOrder.grandTotal,
      });
      toast.success(isCOD ? "Order placed successfully!" : "Payment proof submitted successfully! Pending admin approval.");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Payment submission failed");
    } finally {
      setLoading(false);
    }
  };

  // Calculations
  const shippingCharge = selectedZone ? selectedZone.charge : 0;
  const grandTotal = cartSubtotal + shippingCharge - couponDiscount;

  if (cart.length === 0 && step < 5) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center py-16 text-center space-y-4">
          <ShoppingBag className="h-12 w-12 text-muted-foreground" />
          <h2 className="text-xl font-bold">Your cart is empty</h2>
          <p className="text-xs text-muted-foreground">Add products before proceeding to checkout.</p>
          <Button onClick={() => router.push("/shop")} className="rounded-xl cursor-pointer bg-primary">
            Browse Store
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted/20">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl space-y-6">
        {/* Step Wizard Header Navigation Indicator */}
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-2xl font-extrabold tracking-tight">Checkout Process</h2>
          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
            <span className={step >= 1 ? "text-primary" : ""}>1. Cart</span>
            <span>&rarr;</span>
            <span className={step >= 2 ? "text-primary" : ""}>2. Address</span>
            <span>&rarr;</span>
            <span className={step >= 3 ? "text-primary" : ""}>3. Zone</span>
            <span>&rarr;</span>
            <span className={step >= 4 ? "text-primary" : ""}>4. Payment</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Action Block depending on active step */}
          <div className="md:col-span-2 space-y-6">
            {step === 1 && (
              <Card className="rounded-3xl border shadow-sm p-4">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <ShoppingBag className="text-primary h-5 w-5" /> 1. Review Cart Items
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-4 border-b pb-4 items-center">
                      <img src={item.thumbnail || "/file.svg"} className="h-12 w-12 rounded object-cover border" />
                      <div className="flex-1">
                        <h4 className="font-bold text-sm line-clamp-1">{item.name}</h4>
                        <p className="text-xs text-muted-foreground">৳{item.discountPrice || item.price} x {item.quantity}</p>
                      </div>
                      <span className="font-bold text-sm">৳{(item.discountPrice || item.price) * item.quantity}</span>
                    </div>
                  ))}

                  <div className="flex gap-2 pt-2">
                    <Input
                      placeholder="Enter Coupon (e.g. SAVE10)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="text-xs h-9 focus:ring-1 focus:ring-primary focus:outline-none"
                    />
                    <Button onClick={handleApplyCoupon} className="h-9 bg-primary text-primary-foreground font-semibold px-4 cursor-pointer text-xs rounded-lg">
                      Apply
                    </Button>
                  </div>

                  <Button onClick={() => setStep(2)} className="w-full mt-4 bg-primary text-primary-foreground font-bold rounded-xl cursor-pointer">
                    Proceed to Address Selection
                  </Button>
                </CardContent>
              </Card>
            )}

            {step === 2 && (
              <Card className="rounded-3xl border shadow-sm p-4">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <MapPin className="text-primary h-5 w-5" /> 2. Shipping Address
                    </CardTitle>
                    <CardDescription className="text-xs">Select or add your destination address.</CardDescription>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setShowNewAddressForm(!showNewAddressForm)}
                    className="h-8 text-xs bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground cursor-pointer rounded-lg"
                  >
                    <Plus className="h-3 w-3 mr-1" /> New Address
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {showNewAddressForm && (
                    <form onSubmit={handleAddAddress} className="border p-4 rounded-2xl bg-muted/10 space-y-3">
                      <h4 className="font-bold text-xs">New Destination</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-[10px] font-bold">Street Road</Label>
                          <Input value={newStreet} onChange={(e) => setNewStreet(e.target.value)} placeholder="Road 5, Uttara" className="text-xs h-8" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] font-bold">City</Label>
                          <Input value={newCity} onChange={(e) => setNewCity(e.target.value)} placeholder="Dhaka" className="text-xs h-8" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] font-bold">Area</Label>
                          <Input value={newArea} onChange={(e) => setNewArea(e.target.value)} placeholder="Sector 3" className="text-xs h-8" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] font-bold">Postal Code</Label>
                          <Input value={newPostal} onChange={(e) => setNewPostal(e.target.value)} placeholder="1230" className="text-xs h-8" />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" size="sm" onClick={() => setShowNewAddressForm(false)} className="h-8 text-xs bg-muted text-muted-foreground">Cancel</Button>
                        <Button type="submit" size="sm" className="h-8 text-xs bg-primary text-primary-foreground">Save</Button>
                      </div>
                    </form>
                  )}

                  <div className="space-y-2">
                    {addresses.map((addr) => (
                      <label key={addr.id} className={`flex items-center gap-3 border p-4 rounded-xl cursor-pointer hover:bg-muted/10 transition-all ${selectedAddress === addr.id ? "border-primary bg-primary/5" : ""}`}>
                        <input
                          type="radio"
                          name="address"
                          checked={selectedAddress === addr.id}
                          onChange={() => setSelectedAddress(addr.id)}
                          className="text-primary focus:ring-primary h-4 w-4"
                        />
                        <div className="text-xs font-semibold">
                          <p>{addr.street}, {addr.area}</p>
                          <p className="text-muted-foreground">{addr.city} - {addr.postalCode}</p>
                        </div>
                      </label>
                    ))}
                    {addresses.length === 0 && (
                      <p className="text-xs text-muted-foreground">No addresses configured. Create one above.</p>
                    )}
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={() => setStep(1)} className="w-1/2 bg-muted hover:bg-muted/90 text-muted-foreground font-bold rounded-xl cursor-pointer">Back</Button>
                    <Button disabled={!selectedAddress} onClick={() => setStep(3)} className="w-1/2 bg-primary text-primary-foreground font-bold rounded-xl cursor-pointer">Next</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 3 && (
              <Card className="rounded-3xl border shadow-sm p-4">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Truck className="text-primary h-5 w-5" /> 3. Delivery Method & Zone
                  </CardTitle>
                  <CardDescription className="text-xs">Select your delivery zone (inside/outside city limits).</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    {deliveryZones.map((zone) => (
                      <label key={zone.id} className={`flex items-center justify-between border p-4 rounded-xl cursor-pointer hover:bg-muted/10 transition-all ${selectedZone?.id === zone.id ? "border-primary bg-primary/5" : ""}`}>
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="zone"
                            checked={selectedZone?.id === zone.id}
                            onChange={() => setSelectedZone(zone)}
                            className="text-primary focus:ring-primary h-4 w-4"
                          />
                          <div className="text-xs font-semibold">
                            <p className="font-bold">{zone.zoneName}</p>
                            <p className="text-muted-foreground">Est. time: {zone.estDeliveryTime}</p>
                          </div>
                        </div>
                        <span className="font-bold text-sm text-primary">৳{zone.charge}</span>
                      </label>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={() => setStep(2)} className="w-1/2 bg-muted hover:bg-muted/90 text-muted-foreground font-bold rounded-xl cursor-pointer">Back</Button>
                    <Button disabled={!selectedZone} onClick={() => setStep(4)} className="w-1/2 bg-primary text-primary-foreground font-bold rounded-xl cursor-pointer">Next</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 4 && (
              <Card className="rounded-3xl border shadow-sm p-4">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <CreditCard className="text-primary h-5 w-5" /> 4. Manual Payment Method
                  </CardTitle>
                  <CardDescription className="text-xs">Choose how you want to pay. We require manual verification.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {paymentMethods.map((pm) => (
                      <label key={pm.id} className={`flex flex-col border p-4 rounded-xl cursor-pointer hover:bg-muted/10 transition-all ${selectedPaymentMethod?.id === pm.id ? "border-primary bg-primary/5" : ""}`}>
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="paymentMethod"
                            checked={selectedPaymentMethod?.id === pm.id}
                            onChange={() => setSelectedPaymentMethod(pm)}
                            className="text-primary focus:ring-primary h-4 w-4"
                          />
                          <div className="text-xs font-bold">{pm.name}</div>
                        </div>
                        <div className="mt-3 text-[10px] text-muted-foreground leading-relaxed">
                          <p><strong>A/C Type:</strong> {pm.accountType}</p>
                          <p><strong>A/C No:</strong> {pm.accountNumber}</p>
                        </div>
                      </label>
                    ))}
                  </div>

                  {selectedPaymentMethod && (
                    <div className="p-4 border rounded-2xl bg-muted/10 text-xs leading-relaxed space-y-2">
                      <h4 className="font-bold text-primary">Instructions:</h4>
                      <p>{selectedPaymentMethod.instructions}</p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4">
                    <Button onClick={() => setStep(3)} className="w-1/2 bg-muted hover:bg-muted/90 text-muted-foreground font-bold rounded-xl cursor-pointer">Back</Button>
                    <Button
                      disabled={!selectedPaymentMethod || loading}
                      onClick={handlePlaceOrder}
                      className="w-1/2 bg-primary text-primary-foreground font-bold rounded-xl cursor-pointer"
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Place Order (৳" + grandTotal + ")"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 5 && (
              <Card className="rounded-3xl border shadow-sm p-5 text-center space-y-6">
                <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">Order Placed successfully!</CardTitle>
                  <CardDescription className="text-xs mt-1">
                    Your Order ID is: <strong>{createdOrder?.orderNumber}</strong>. Total Grand: <strong>৳{createdOrder?.grandTotal}</strong>
                  </CardDescription>
                </div>

                {(() => {
                  const isCOD = selectedPaymentMethod?.accountType === "COD" || selectedPaymentMethod?.name?.toLowerCase().includes("cash");
                  return (
                    <form onSubmit={handleSubmitPayment} className="max-w-md mx-auto border p-5 rounded-2xl bg-muted/15 text-left space-y-4">
                      <h4 className="font-bold text-xs uppercase tracking-wider border-b pb-2 text-primary">
                        {isCOD ? "Order Confirmation" : "Submit Manual Payment Proof"}
                      </h4>
                      {isCOD ? (
                        <div className="p-4 border rounded-xl bg-primary/5 border-primary/20 text-xs text-center space-y-2">
                          <p className="font-bold text-primary">No Prepayment Required</p>
                          <p className="text-muted-foreground">You selected Cash on Delivery. Simply click below to finalize and place your order.</p>
                        </div>
                      ) : (
                        <>
                          <div className="space-y-1.5">
                            <Label className="text-xs font-bold">Sender Mobile Number</Label>
                            <Input placeholder="017XXXXXXXX" value={senderNumber} onChange={(e) => setSenderNumber(e.target.value)} required className="text-xs h-9 focus:ring-1 focus:ring-primary" />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs font-bold">Transaction ID (TxnID)</Label>
                            <Input placeholder="AKJ876GFD" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} required className="text-xs h-9 focus:ring-1 focus:ring-primary" />
                          </div>
                        </>
                      )}
                      <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground font-bold h-10 rounded-xl cursor-pointer">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (isCOD ? "Confirm Order" : "Verify Payment Details")}
                      </Button>
                    </form>
                  );
                })()}
              </Card>
            )}
          </div>

          {/* Sidebar Invoice breakdown (except step 5) */}
          {step < 5 && (
            <div className="space-y-6">
              <Card className="rounded-3xl border shadow-sm p-4">
                <CardHeader>
                  <CardTitle className="text-base font-bold">Summary Details</CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold">৳{cartSubtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping Fee</span>
                    <span className="font-semibold">৳{shippingCharge}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-red-500 font-semibold">
                      <span>Discount</span>
                      <span>-৳{couponDiscount}</span>
                    </div>
                  )}
                  <hr />
                  <div className="flex justify-between text-sm font-bold text-primary">
                    <span>Grand Total</span>
                    <span>৳{grandTotal}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
