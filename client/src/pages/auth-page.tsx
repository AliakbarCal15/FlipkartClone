import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { loginSchema } from "@shared/schema";
import MainLayout from "@/components/layouts/main-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Registration form schema extending the insert user schema
const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
});

type RegisterData = z.infer<typeof registerSchema>;

const AuthPage = () => {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, navigate] = useLocation();
  
  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);
  
  // Login form
  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  
  // Register form
  const registerForm = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      name: "",
      email: "",
      phone: "",
    },
  });
  
  // Submit login form
  const onLoginSubmit = (values: LoginData) => {
    loginMutation.mutate(values);
  };
  
  // Submit register form
  const onRegisterSubmit = (values: RegisterData) => {
    registerMutation.mutate(values);
  };
  
  return (
    <MainLayout hideCategories>
      <div className="min-h-screen bg-[#f1f3f6] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-6xl bg-white shadow-md rounded-sm overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Left panel with forms */}
            <div className="w-full md:w-1/2 p-6">
              <Tabs defaultValue="login">
                <TabsList className="grid w-full grid-cols-2 bg-[#f1f3f6] rounded-none">
                  <TabsTrigger value="login" className="rounded-none data-[state=active]:bg-white data-[state=active]:text-[#2874f0]">
                    Login
                  </TabsTrigger>
                  <TabsTrigger value="register" className="rounded-none data-[state=active]:bg-white data-[state=active]:text-[#2874f0]">
                    Register
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="login" className="mt-6">
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Enter your password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="pt-2">
                        <Button 
                          type="submit" 
                          className="w-full bg-[#fb641b] hover:bg-[#fb641b]/90 text-white"
                          disabled={loginMutation.isPending}
                        >
                          {loginMutation.isPending ? "Logging in..." : "Login"}
                        </Button>
                      </div>
                      
                      <p className="text-center text-sm text-gray-600">
                        By continuing, you agree to Flipkart's Terms of Use and Privacy Policy.
                      </p>
                    </form>
                  </Form>
                </TabsContent>
                
                <TabsContent value="register" className="mt-6">
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Choose a username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="Enter your email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your phone number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Create a password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="pt-2">
                        <Button 
                          type="submit" 
                          className="w-full bg-[#fb641b] hover:bg-[#fb641b]/90 text-white"
                          disabled={registerMutation.isPending}
                        >
                          {registerMutation.isPending ? "Creating Account..." : "Register"}
                        </Button>
                      </div>
                      
                      <p className="text-center text-sm text-gray-600">
                        By continuing, you agree to Flipkart's Terms of Use and Privacy Policy.
                      </p>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Right panel with info */}
            <div className="hidden md:block w-1/2 bg-[#2874f0] p-10 text-white">
              <h2 className="text-2xl font-medium mb-4">Welcome to Flipkart</h2>
              <p className="text-lg mb-8">India's leading online shopping platform</p>
              
              <ul className="space-y-6">
                <li className="flex items-start">
                  <span className="mr-2 mt-1 text-xl">•</span>
                  <div>
                    <h3 className="font-medium mb-1">Secure Shopping</h3>
                    <p className="text-sm opacity-80">Your data is protected with industry-standard encryption</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-1 text-xl">•</span>
                  <div>
                    <h3 className="font-medium mb-1">24x7 Customer Support</h3>
                    <p className="text-sm opacity-80">Our support team is available around the clock</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-1 text-xl">•</span>
                  <div>
                    <h3 className="font-medium mb-1">Fast Delivery</h3>
                    <p className="text-sm opacity-80">Get your products delivered quickly with our logistics network</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-1 text-xl">•</span>
                  <div>
                    <h3 className="font-medium mb-1">Easy Returns</h3>
                    <p className="text-sm opacity-80">10-day easy return policy on most products</p>
                  </div>
                </li>
              </ul>
              
              <img 
                src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/login_img_c4a81e.png" 
                alt="Flipkart Shopping" 
                className="mt-10 max-w-xs mx-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AuthPage;
