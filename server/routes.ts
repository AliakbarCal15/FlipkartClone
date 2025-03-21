import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { insertCartItemSchema, insertOrderItemSchema, insertOrderSchema, insertReviewSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Categories routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      const message = error instanceof Error ? error.message : "An error occurred";
      res.status(500).json({ message });
    }
  });

  // Products routes
  app.get("/api/products", async (req, res) => {
    try {
      const { limit, category } = req.query;
      const options: { limit?: number, category?: string } = {};
      
      if (limit) options.limit = parseInt(limit as string);
      if (category) options.category = category as string;
      
      const products = await storage.getProducts(options);
      res.json(products);
    } catch (error) {
      const message = error instanceof Error ? error.message : "An error occurred";
      res.status(500).json({ message });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      const message = error instanceof Error ? error.message : "An error occurred";
      res.status(500).json({ message });
    }
  });

  app.get("/api/products/category/:category", async (req, res) => {
    try {
      const category = req.params.category;
      const products = await storage.getProductsByCategory(category);
      res.json(products);
    } catch (error) {
      const message = error instanceof Error ? error.message : "An error occurred";
      res.status(500).json({ message });
    }
  });

  // Banners routes
  app.get("/api/banners", async (req, res) => {
    try {
      const banners = await storage.getBanners();
      res.json(banners);
    } catch (error) {
      const message = error instanceof Error ? error.message : "An error occurred";
      res.status(500).json({ message });
    }
  });

  // Cart routes
  app.get("/api/cart", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const userId = req.user.id;
      let cart = await storage.getCart(userId);
      
      // Create a new cart if user doesn't have one
      if (!cart) {
        cart = await storage.createCart({ userId });
      }
      
      const cartWithItems = await storage.getCartWithItems(userId);
      res.json(cartWithItems);
    } catch (error) {
      const message = error instanceof Error ? error.message : "An error occurred";
      res.status(500).json({ message });
    }
  });

  app.post("/api/cart/items", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const userId = req.user.id;
      let cart = await storage.getCart(userId);
      
      // Create a new cart if user doesn't have one
      if (!cart) {
        cart = await storage.createCart({ userId });
      }
      
      const cartItemData = insertCartItemSchema.parse({
        ...req.body,
        cartId: cart.id
      });
      
      const cartItem = await storage.addItemToCart(cartItemData);
      res.status(201).json(cartItem);
    } catch (error) {
      const message = error instanceof Error ? error.message : "An error occurred";
      res.status(500).json({ message });
    }
  });

  app.put("/api/cart/items/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const id = parseInt(req.params.id);
      const { quantity } = z.object({ quantity: z.number().min(1) }).parse(req.body);
      
      const updatedItem = await storage.updateCartItem(id, quantity);
      
      if (!updatedItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      res.json(updatedItem);
    } catch (error) {
      const message = error instanceof Error ? error.message : "An error occurred";
      res.status(500).json({ message });
    }
  });

  app.delete("/api/cart/items/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const id = parseInt(req.params.id);
      const success = await storage.removeCartItem(id);
      
      if (!success) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      const message = error instanceof Error ? error.message : "An error occurred";
      res.status(500).json({ message });
    }
  });

  // Order routes
  app.get("/api/orders", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const userId = req.user.id;
      const orders = await storage.getOrders(userId);
      res.json(orders);
    } catch (error) {
      const message = error instanceof Error ? error.message : "An error occurred";
      res.status(500).json({ message });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const id = parseInt(req.params.id);
      const order = await storage.getOrderWithItems(id);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Make sure user owns this order
      if (order.order.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.json(order);
    } catch (error) {
      const message = error instanceof Error ? error.message : "An error occurred";
      res.status(500).json({ message });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const userId = req.user.id;
      const orderData = insertOrderSchema.parse({
        ...req.body,
        userId
      });
      
      const order = await storage.createOrder(orderData);
      
      // Get cart items and convert to order items
      const cart = await storage.getCartWithItems(userId);
      
      if (cart && cart.items.length > 0) {
        // Add each cart item to order
        for (const item of cart.items) {
          const orderItemData = insertOrderItemSchema.parse({
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price
          });
          
          await storage.addOrderItem(orderItemData);
          
          // Remove item from cart
          await storage.removeCartItem(item.id);
        }
      }
      
      const orderWithItems = await storage.getOrderWithItems(order.id);
      res.status(201).json(orderWithItems);
    } catch (error) {
      const message = error instanceof Error ? error.message : "An error occurred";
      res.status(500).json({ message });
    }
  });

  // Reviews routes
  app.get("/api/products/:id/reviews", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const reviews = await storage.getProductReviews(productId);
      res.json(reviews);
    } catch (error) {
      const message = error instanceof Error ? error.message : "An error occurred";
      res.status(500).json({ message });
    }
  });

  app.post("/api/products/:id/reviews", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const productId = parseInt(req.params.id);
      const userId = req.user.id;
      
      const reviewData = insertReviewSchema.parse({
        ...req.body,
        productId,
        userId
      });
      
      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      const message = error instanceof Error ? error.message : "An error occurred";
      res.status(500).json({ message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
