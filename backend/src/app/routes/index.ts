import { Router } from "express";
import authRoutes from "../../modules/auth/auth.routes";
import categoryRoutes from "../../modules/category/category.routes";
import brandRoutes from "../../modules/brand/brand.routes";
import productRoutes from "../../modules/product/product.routes";
import couponRoutes from "../../modules/coupon/coupon.routes";
import deliveryZoneRoutes from "../../modules/deliveryZone/deliveryZone.routes";
import paymentMethodRoutes from "../../modules/paymentMethod/paymentMethod.routes";
import fileUploadRoutes from "../../modules/fileUpload/fileUpload.routes";
import addressRoutes from "../../modules/address/address.routes";
import checkoutRoutes from "../../modules/checkout/checkout.routes";
import orderRoutes from "../../modules/order/order.routes";
import productReviewRoutes from "../../modules/productReview/productReview.routes";
import wishlistRoutes from "../../modules/wishlist/wishlist.routes";
import dashboardRoutes from "../../modules/dashboard/dashboard.routes";
import newsletterRoutes from "../../modules/newsletter/newsletter.routes";
import websiteSettingRoutes from "../../modules/websiteSetting/websiteSetting.routes";
import bannerRoutes from "../../modules/banner/banner.routes";
import faqRoutes from "../../modules/faq/faq.routes";
import testimonialRoutes from "../../modules/testimonial/testimonial.routes";
import inventoryRoutes from "../../modules/inventory/inventory.routes";
import notificationRoutes from "../../modules/notification/notification.routes";

const router = Router();

const moduleRoutes = [
  { path: "/auth", route: authRoutes },
  { path: "/categories", route: categoryRoutes },
  { path: "/brands", route: brandRoutes },
  { path: "/products", route: productRoutes },
  { path: "/coupons", route: couponRoutes },
  { path: "/delivery-zones", route: deliveryZoneRoutes },
  { path: "/payment-methods", route: paymentMethodRoutes },
  { path: "/upload", route: fileUploadRoutes },
  { path: "/addresses", route: addressRoutes },
  { path: "/checkout", route: checkoutRoutes },
  { path: "/orders", route: orderRoutes },
  { path: "/reviews", route: productReviewRoutes },
  { path: "/wishlist", route: wishlistRoutes },
  { path: "/dashboard", route: dashboardRoutes },
  { path: "/newsletter", route: newsletterRoutes },
  { path: "/settings", route: websiteSettingRoutes },
  { path: "/banners", route: bannerRoutes },
  { path: "/faqs", route: faqRoutes },
  { path: "/testimonials", route: testimonialRoutes },
  { path: "/inventory", route: inventoryRoutes },
  { path: "/notifications", route: notificationRoutes },
];

moduleRoutes.forEach((routeInfo) => {
  router.use(routeInfo.path, routeInfo.route);
});

export default router;
