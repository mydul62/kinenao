export interface GuestInfo {
  fullName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  orderNotes?: string;
}

export type CheckoutMode = "GUEST" | "LOGIN" | "REGISTER";

export interface OrderItemPayload {
  productId: string;
  quantity: number;
}

export interface OrderPayload {
  id?: string;
  userId?: string | null;
  guestInfo?: GuestInfo | null;
  deliveryAddressId?: string | null;
  deliveryZoneId: string;
  couponCode?: string;
  customerNote?: string;
  items: OrderItemPayload[];
  subtotal?: number;
  shippingCost?: number;
  discount?: number;
  total?: number;
  orderStatus?: string;
}
