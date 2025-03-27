import { 
  users, User, InsertUser,
  products, Product, InsertProduct,
  categories, Category, InsertCategory,
  carts, Cart, InsertCart,
  cartItems, CartItem, InsertCartItem,
  orders, Order, InsertOrder,
  orderItems, OrderItem, InsertOrderItem,
  banners, Banner, InsertBanner,
  reviews, Review, InsertReview
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  deleteUser(id: number): Promise<boolean>;
  getAllUsers(): Promise<User[]>;
  getUserCount(): Promise<number>;
  
  // Product methods
  getProduct(id: number): Promise<Product | undefined>;
  getProducts(options?: { limit?: number, category?: string }): Promise<Product[]>;
  getProductsByCategory(category: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  deleteProduct(id: number): Promise<boolean>;
  getProductCount(): Promise<number>;
  
  // Category methods
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Cart methods
  getCart(userId: number): Promise<Cart | undefined>;
  createCart(cart: InsertCart): Promise<Cart>;
  getCartItems(cartId: number): Promise<CartItem[]>;
  getCartWithItems(userId: number): Promise<{ cart: Cart, items: (CartItem & { product: Product })[] } | undefined>;
  addItemToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem | undefined>;
  removeCartItem(id: number): Promise<boolean>;
  
  // Order methods
  getOrders(userId: number): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  addOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  getOrderWithItems(orderId: number): Promise<{ order: Order, items: (OrderItem & { product: Product })[] } | undefined>;
  getAllOrders(): Promise<Order[]>;
  getOrderCount(): Promise<number>;
  getTotalRevenue(): Promise<number>;
  getOrderStats(): Promise<{ date: string, count: number, revenue: number }[]>;
  
  // Banner methods
  getBanners(): Promise<Banner[]>;
  createBanner(banner: InsertBanner): Promise<Banner>;
  
  // Review methods
  getProductReviews(productId: number): Promise<(Review & { user: User })[]>;
  createReview(review: InsertReview): Promise<Review>;
  
  // Session store
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private usersMap: Map<number, User>;
  private productsMap: Map<number, Product>;
  private categoriesMap: Map<number, Category>;
  private cartsMap: Map<number, Cart>;
  private cartItemsMap: Map<number, CartItem>;
  private ordersMap: Map<number, Order>;
  private orderItemsMap: Map<number, OrderItem>;
  private bannersMap: Map<number, Banner>;
  private reviewsMap: Map<number, Review>;
  
  private userIdCounter: number;
  private productIdCounter: number;
  private categoryIdCounter: number;
  private cartIdCounter: number;
  private cartItemIdCounter: number;
  private orderIdCounter: number;
  private orderItemIdCounter: number;
  private bannerIdCounter: number;
  private reviewIdCounter: number;
  
  sessionStore: session.Store;

  constructor() {
    this.usersMap = new Map();
    this.productsMap = new Map();
    this.categoriesMap = new Map();
    this.cartsMap = new Map();
    this.cartItemsMap = new Map();
    this.ordersMap = new Map();
    this.orderItemsMap = new Map();
    this.bannersMap = new Map();
    this.reviewsMap = new Map();
    
    this.userIdCounter = 1;
    this.productIdCounter = 1;
    this.categoryIdCounter = 1;
    this.cartIdCounter = 1;
    this.cartItemIdCounter = 1;
    this.orderIdCounter = 1;
    this.orderItemIdCounter = 1;
    this.bannerIdCounter = 1;
    this.reviewIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    // Initialize with default data
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Create admin user
    this.createUser({
      username: "admin",
      password: "$2b$10$T9vDN1QHdGzm7IZ5tWYn3uZ60RxC4KVk4queR2GdD3esaA7NVOFqu", // password123
      name: "Admin",
      email: "admin@example.com",
      isAdmin: true
    });
    
    // Add categories
    const categories = [
      { name: "Grocery", image: "https://rukminim1.flixcart.com/flap/128/128/image/29327f40e9c4d26b.png" },
      { name: "Mobiles", image: "https://rukminim1.flixcart.com/flap/128/128/image/22fddf3c7da4c4f4.png" },
      { name: "Fashion", image: "https://rukminim1.flixcart.com/flap/128/128/image/c12afc017e6f24cb.png" },
      { name: "Electronics", image: "https://rukminim1.flixcart.com/flap/128/128/image/69c6589653afdb9a.png" },
      { name: "Home", image: "https://rukminim1.flixcart.com/flap/128/128/image/ab7e2b022a4587dd.jpg" },
      { name: "Appliances", image: "https://rukminim1.flixcart.com/flap/128/128/image/0ff199d1bd27eb98.png" },
      { name: "Travel", image: "https://rukminim1.flixcart.com/flap/128/128/image/71050627a56b4693.png" },
      { name: "Top Offers", image: "https://rukminim1.flixcart.com/flap/128/128/image/f15c02bfeb02d15d.png" },
      { name: "Beauty", image: "https://rukminim1.flixcart.com/flap/128/128/image/dff3f7adcf3a90c6.png" }
    ];
    
    categories.forEach(cat => {
      this.createCategory({
        name: cat.name,
        image: cat.image
      });
    });
    
    // Add banners
    const banners = [
      { image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=1200&h=300&fit=crop", link: "/electronics", active: true },
      { image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&h=300&fit=crop", link: "/fashion", active: true },
      { image: "https://images.unsplash.com/photo-1607083206870-f8b9affcd026?w=1200&h=300&fit=crop", link: "/offers", active: true },
      { image: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=1200&h=300&fit=crop", link: "/home", active: true }
    ];
    
    banners.forEach(banner => {
      this.createBanner(banner);
    });
    
    // Sample products for Electronics
    const electronicsProducts = [
      {
        title: "Wireless Earbuds",
        description: "High quality wireless earbuds with noise cancellation",
        price: 1499,
        discountPercentage: 25,
        rating: 4.5,
        stock: 100,
        brand: "boAt",
        category: "Electronics",
        thumbnail: "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=400&h=400&fit=crop",
        images: ["https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=400&h=400&fit=crop", 
                "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=400&h=400&fit=crop"]
      },
      {
        title: "Gaming Mouse",
        description: "Ergonomic gaming mouse with customizable RGB lights",
        price: 1999,
        discountPercentage: 40,
        rating: 4.7,
        stock: 50,
        brand: "Logitech",
        category: "Electronics",
        thumbnail: "https://images.unsplash.com/photo-1605773527852-c546a8584ea3?w=400&h=400&fit=crop",
        images: ["https://images.unsplash.com/photo-1605773527852-c546a8584ea3?w=400&h=400&fit=crop", 
                "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=400&h=400&fit=crop"]
      },
      {
        title: "Bluetooth Speakers",
        description: "Portable Bluetooth speaker with 20 hours battery life",
        price: 2499,
        discountPercentage: 70,
        rating: 4.3,
        stock: 75,
        brand: "JBL",
        category: "Electronics",
        thumbnail: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop",
        images: ["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop",
                "https://images.unsplash.com/photo-1589003077984-894e133dabab?w=400&h=400&fit=crop"]
      },
      {
        title: "4K Smart TV",
        description: "55-inch 4K Ultra HD Smart LED TV with HDR",
        price: 45999,
        discountPercentage: 15,
        rating: 4.6,
        stock: 30,
        brand: "Samsung",
        category: "Electronics",
        thumbnail: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop",
        images: ["https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop",
                "https://images.unsplash.com/photo-1601944177325-f8867652837f?w=400&h=400&fit=crop"]
      },
      {
        title: "Trimmer",
        description: "Rechargeable trimmer with multiple attachments",
        price: 1299,
        discountPercentage: 35,
        rating: 4.2,
        stock: 120,
        brand: "Philips",
        category: "Electronics",
        thumbnail: "https://images.unsplash.com/photo-1585914643208-46d2eaec3030?w=400&h=400&fit=crop",
        images: ["https://images.unsplash.com/photo-1585914643208-46d2eaec3030?w=400&h=400&fit=crop",
                "https://images.unsplash.com/photo-1589782431097-ffc26baa6fc9?w=400&h=400&fit=crop"]
      },
      {
        title: "Gaming Laptop",
        description: "15.6-inch gaming laptop with dedicated GPU",
        price: 76990,
        discountPercentage: 10,
        rating: 4.8,
        stock: 25,
        brand: "Asus",
        category: "Electronics",
        thumbnail: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400&h=400&fit=crop",
        images: ["https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400&h=400&fit=crop",
                "https://images.unsplash.com/photo-1511385348-a52b4a160dc2?w=400&h=400&fit=crop"]
      }
    ];
    
    // Sample products for Fashion
    const fashionProducts = [
      {
        title: "Casual Shirts",
        description: "100% cotton casual shirts for men",
        price: 799,
        discountPercentage: 50,
        rating: 4.1,
        stock: 200,
        brand: "Allen Solly",
        category: "Fashion",
        thumbnail: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop",
        images: ["https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop",
                "https://images.unsplash.com/photo-1598032895397-b9472444bf93?w=400&h=400&fit=crop"]
      },
      {
        title: "Women's Tops",
        description: "Stylish tops for women in various colors",
        price: 599,
        discountPercentage: 50,
        rating: 4.4,
        stock: 150,
        brand: "H&M",
        category: "Fashion",
        thumbnail: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=400&h=400&fit=crop",
        images: ["https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=400&h=400&fit=crop",
                "https://images.unsplash.com/photo-1619603364904-c0498317e145?w=400&h=400&fit=crop"]
      },
      {
        title: "Running Shoes",
        description: "Lightweight running shoes with cushioned insoles",
        price: 2999,
        discountPercentage: 60,
        rating: 4.6,
        stock: 80,
        brand: "Nike",
        category: "Fashion",
        thumbnail: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
        images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
                "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=400&h=400&fit=crop"]
      },
      {
        title: "Watches",
        description: "Stainless steel analog watches for men",
        price: 2499,
        discountPercentage: 30,
        rating: 4.5,
        stock: 60,
        brand: "Fossil",
        category: "Fashion",
        thumbnail: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=400&h=400&fit=crop",
        images: ["https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=400&h=400&fit=crop",
                "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=400&h=400&fit=crop"]
      },
      {
        title: "Denim Jeans",
        description: "Slim-fit denim jeans for men",
        price: 1499,
        discountPercentage: 45,
        rating: 4.3,
        stock: 100,
        brand: "Levi's",
        category: "Fashion",
        thumbnail: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop",
        images: ["https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop",
                "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=400&fit=crop"]
      },
      {
        title: "Sunglasses",
        description: "UV protected sunglasses with polarized lenses",
        price: 1299,
        discountPercentage: 25,
        rating: 4.2,
        stock: 70,
        brand: "Ray-Ban",
        category: "Fashion",
        thumbnail: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop",
        images: ["https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop",
                "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&h=400&fit=crop"]
      }
    ];
    
    // Sample products for Home
    const homeProducts = [
      {
        title: "Mixer Grinders",
        description: "750W mixer grinder with 3 jars",
        price: 2499,
        discountPercentage: 40,
        rating: 4.3,
        stock: 50,
        brand: "Prestige",
        category: "Home",
        thumbnail: "https://images.unsplash.com/photo-1626806787461-102c1a75f344?w=400&h=400&fit=crop",
        images: ["https://images.unsplash.com/photo-1626806787461-102c1a75f344?w=400&h=400&fit=crop",
                "https://images.unsplash.com/photo-1577460551100-d3f8103db5f1?w=400&h=400&fit=crop"]
      },
      {
        title: "Cotton Bedsheets",
        description: "King size 100% cotton bedsheets with 2 pillow covers",
        price: 1299,
        discountPercentage: 50,
        rating: 4.5,
        stock: 100,
        brand: "Bombay Dyeing",
        category: "Home",
        thumbnail: "https://images.unsplash.com/photo-1629949009714-fd4df7ae10f8?w=400&h=400&fit=crop",
        images: ["https://images.unsplash.com/photo-1629949009714-fd4df7ae10f8?w=400&h=400&fit=crop",
                "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400&h=400&fit=crop"]
      },
      {
        title: "Steel Water Bottles",
        description: "Insulated stainless steel water bottle, 750ml",
        price: 899,
        discountPercentage: 60,
        rating: 4.2,
        stock: 150,
        brand: "Milton",
        category: "Home",
        thumbnail: "https://images.unsplash.com/photo-1589365278144-c9e705f843ba?w=400&h=400&fit=crop",
        images: ["https://images.unsplash.com/photo-1589365278144-c9e705f843ba?w=400&h=400&fit=crop",
                "https://images.unsplash.com/photo-1610824352934-c10d87b700cc?w=400&h=400&fit=crop"]
      },
      {
        title: "Induction Cooktops",
        description: "1800W induction cooktop with auto shut-off",
        price: 2999,
        discountPercentage: 35,
        rating: 4.4,
        stock: 40,
        brand: "Prestige",
        category: "Home",
        thumbnail: "https://images.unsplash.com/photo-1596223575327-89789efe0469?w=400&h=400&fit=crop",
        images: ["https://images.unsplash.com/photo-1596223575327-89789efe0469?w=400&h=400&fit=crop",
                "https://images.unsplash.com/photo-1495433324511-bf8e92934d90?w=400&h=400&fit=crop"]
      },
      {
        title: "Cookware Sets",
        description: "5-piece non-stick cookware set",
        price: 2499,
        discountPercentage: 45,
        rating: 4.6,
        stock: 30,
        brand: "Hawkins",
        category: "Home",
        thumbnail: "https://images.unsplash.com/photo-1584283626938-86939326ae65?w=400&h=400&fit=crop",
        images: ["https://images.unsplash.com/photo-1584283626938-86939326ae65?w=400&h=400&fit=crop",
                "https://images.unsplash.com/photo-1590794056486-986bf7f3473f?w=400&h=400&fit=crop"]
      },
      {
        title: "Air Fryers",
        description: "Digital air fryer with 4.5L capacity",
        price: 4999,
        discountPercentage: 25,
        rating: 4.7,
        stock: 20,
        brand: "Philips",
        category: "Home",
        thumbnail: "https://images.unsplash.com/photo-1648649893252-296c7123646b?w=400&h=400&fit=crop",
        images: ["https://images.unsplash.com/photo-1648649893252-296c7123646b?w=400&h=400&fit=crop",
                "https://images.unsplash.com/photo-1600367163359-d51d40bcb5f8?w=400&h=400&fit=crop"]
      }
    ];
    
    // Add all products
    [...electronicsProducts, ...fashionProducts, ...homeProducts].forEach(product => {
      this.createProduct(product);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.usersMap.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    
    // Ensure all fields have proper values to satisfy type requirements
    const user: User = { 
      id, 
      createdAt: now,
      username: insertUser.username,
      password: insertUser.password,
      name: insertUser.name,
      email: insertUser.email,
      phone: insertUser.phone || null,
      address: insertUser.address || null,
      city: insertUser.city || null,
      state: insertUser.state || null,
      pincode: insertUser.pincode || null,
      isAdmin: insertUser.isAdmin ?? false
    };
    
    this.usersMap.set(id, user);
    return user;
  }

  // Add user management methods for admin
  async deleteUser(id: number): Promise<boolean> {
    if (!this.usersMap.has(id)) {
      return false;
    }
    this.usersMap.delete(id);
    return true;
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.usersMap.values());
  }
  
  async getUserCount(): Promise<number> {
    return this.usersMap.size;
  }
  
  // Product methods
  async getProduct(id: number): Promise<Product | undefined> {
    return this.productsMap.get(id);
  }

  async getProducts(options?: { limit?: number; category?: string }): Promise<Product[]> {
    let products = Array.from(this.productsMap.values());
    
    if (options?.category) {
      products = products.filter(p => p.category === options.category);
    }
    
    if (options?.limit) {
      products = products.slice(0, options.limit);
    }
    
    return products;
  }
  
  async getProductCount(): Promise<number> {
    return this.productsMap.size;
  }
  
  async deleteProduct(id: number): Promise<boolean> {
    if (!this.productsMap.has(id)) {
      return false;
    }
    this.productsMap.delete(id);
    return true;
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return Array.from(this.productsMap.values()).filter(
      (product) => product.category === category
    );
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.productIdCounter++;
    const now = new Date();
    const product: Product = { 
      ...insertProduct, 
      id, 
      createdAt: now,
      discountPercentage: insertProduct.discountPercentage ?? null,
      rating: insertProduct.rating ?? null
    };
    this.productsMap.set(id, product);
    return product;
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categoriesMap.values());
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.categoryIdCounter++;
    const now = new Date();
    const category: Category = { ...insertCategory, id, createdAt: now };
    this.categoriesMap.set(id, category);
    return category;
  }

  // Cart methods
  async getCart(userId: number): Promise<Cart | undefined> {
    return Array.from(this.cartsMap.values()).find(
      (cart) => cart.userId === userId
    );
  }

  async createCart(insertCart: InsertCart): Promise<Cart> {
    const id = this.cartIdCounter++;
    const now = new Date();
    const cart: Cart = { ...insertCart, id, createdAt: now };
    this.cartsMap.set(id, cart);
    return cart;
  }

  async getCartItems(cartId: number): Promise<CartItem[]> {
    return Array.from(this.cartItemsMap.values()).filter(
      (item) => item.cartId === cartId
    );
  }

  async getCartWithItems(userId: number): Promise<{ cart: Cart; items: (CartItem & { product: Product })[] } | undefined> {
    const cart = await this.getCart(userId);
    if (!cart) return undefined;
    
    const cartItems = await this.getCartItems(cart.id);
    const items = cartItems.map(item => {
      const product = this.productsMap.get(item.productId);
      if (!product) throw new Error(`Product not found: ${item.productId}`);
      return { ...item, product };
    });
    
    return { cart, items };
  }

  async addItemToCart(insertCartItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists
    const existingItem = Array.from(this.cartItemsMap.values()).find(
      (item) => item.cartId === insertCartItem.cartId && item.productId === insertCartItem.productId
    );
    
    if (existingItem) {
      // Update quantity - use default of 1 if quantity is undefined
      return await this.updateCartItem(existingItem.id, existingItem.quantity + (insertCartItem.quantity || 1)) as CartItem;
    }
    
    // Create new item
    const id = this.cartItemIdCounter++;
    const now = new Date();
    const cartItem: CartItem = { 
      ...insertCartItem, 
      id, 
      createdAt: now,
      quantity: insertCartItem.quantity || 1 // Use default of 1 if quantity is undefined
    };
    this.cartItemsMap.set(id, cartItem);
    return cartItem;
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    const cartItem = this.cartItemsMap.get(id);
    if (!cartItem) return undefined;
    
    const updatedItem: CartItem = { ...cartItem, quantity };
    this.cartItemsMap.set(id, updatedItem);
    return updatedItem;
  }

  async removeCartItem(id: number): Promise<boolean> {
    return this.cartItemsMap.delete(id);
  }

  // Order methods
  async getOrders(userId: number): Promise<Order[]> {
    return Array.from(this.ordersMap.values()).filter(
      (order) => order.userId === userId
    );
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.ordersMap.get(id);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.orderIdCounter++;
    const now = new Date();
    const order: Order = { 
      ...insertOrder, 
      id, 
      createdAt: now,
      status: insertOrder.status || 'pending' // Default status
    };
    this.ordersMap.set(id, order);
    return order;
  }

  async addOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const id = this.orderItemIdCounter++;
    const now = new Date();
    const orderItem: OrderItem = { ...insertOrderItem, id, createdAt: now };
    this.orderItemsMap.set(id, orderItem);
    return orderItem;
  }

  async getOrderWithItems(orderId: number): Promise<{ order: Order; items: (OrderItem & { product: Product })[] } | undefined> {
    const order = await this.getOrder(orderId);
    if (!order) return undefined;
    
    const orderItems = Array.from(this.orderItemsMap.values()).filter(
      (item) => item.orderId === orderId
    );
    
    const items = orderItems.map(item => {
      const product = this.productsMap.get(item.productId);
      if (!product) throw new Error(`Product not found: ${item.productId}`);
      return { ...item, product };
    });
    
    return { order, items };
  }
  
  // Admin order methods
  async getAllOrders(): Promise<Order[]> {
    return Array.from(this.ordersMap.values());
  }
  
  async getOrderCount(): Promise<number> {
    return this.ordersMap.size;
  }
  
  async getTotalRevenue(): Promise<number> {
    const orders = Array.from(this.ordersMap.values());
    return orders.reduce((total, order) => total + order.totalAmount, 0);
  }
  
  async getOrderStats(): Promise<{ date: string, count: number, revenue: number }[]> {
    const orders = Array.from(this.ordersMap.values());
    
    // Group orders by date
    const ordersByDate = orders.reduce((acc, order) => {
      const date = new Date(order.createdAt).toISOString().split('T')[0]; // YYYY-MM-DD
      
      if (!acc[date]) {
        acc[date] = {
          date,
          count: 0,
          revenue: 0
        };
      }
      
      acc[date].count += 1;
      acc[date].revenue += order.totalAmount;
      
      return acc;
    }, {} as Record<string, { date: string, count: number, revenue: number }>);
    
    // Get last 7 days
    const result = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      result.push(ordersByDate[dateString] || { date: dateString, count: 0, revenue: 0 });
    }
    
    // Sort by date ascending
    return result.sort((a, b) => a.date.localeCompare(b.date));
  }

  // Banner methods
  async getBanners(): Promise<Banner[]> {
    return Array.from(this.bannersMap.values()).filter(banner => banner.active);
  }

  async createBanner(insertBanner: InsertBanner): Promise<Banner> {
    const id = this.bannerIdCounter++;
    const now = new Date();
    const banner: Banner = { 
      ...insertBanner, 
      id, 
      createdAt: now,
      active: insertBanner.active ?? true // Default to active if not specified
    };
    this.bannersMap.set(id, banner);
    return banner;
  }

  // Review methods
  async getProductReviews(productId: number): Promise<(Review & { user: User })[]> {
    const reviews = Array.from(this.reviewsMap.values()).filter(
      (review) => review.productId === productId
    );
    
    return reviews.map(review => {
      const user = this.usersMap.get(review.userId);
      if (!user) throw new Error(`User not found: ${review.userId}`);
      return { ...review, user };
    });
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = this.reviewIdCounter++;
    const now = new Date();
    const review: Review = { 
      ...insertReview, 
      id, 
      createdAt: now,
      comment: insertReview.comment ?? null // Default to null if comment is not provided
    };
    this.reviewsMap.set(id, review);
    
    // Update product rating
    const product = this.productsMap.get(insertReview.productId);
    if (product) {
      const reviews = await this.getProductReviews(product.id);
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const avgRating = totalRating / reviews.length;
      
      this.productsMap.set(product.id, {
        ...product,
        rating: parseFloat(avgRating.toFixed(1))
      });
    }
    
    return review;
  }
}

export const storage = new MemStorage();
