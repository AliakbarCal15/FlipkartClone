import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import MainLayout from "@/components/layouts/main-layout";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  User,
  ShoppingBag,
  Heart,
  MapPin,
  CreditCard,
  LogOut,
  Save,
  Edit,
  GiftIcon,
  ShieldCheck,
  Bell
} from "lucide-react";
import { Link, useLocation } from "wouter";

// Profile update form schema
const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const ProfilePage = () => {
  const [, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  
  if (!user) {
    navigate("/auth");
    return null;
  }
  
  // Setup form with user data
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      address: user.address || "",
      city: user.city || "",
      state: user.state || "",
      pincode: user.pincode || "",
    },
  });
  
  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      const res = await apiRequest("PUT", "/api/user", data);
      return await res.json();
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["/api/user"], updatedUser);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
      setIsEditing(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(data);
  };
  
  // Handle logout
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  return (
    <MainLayout>
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-2xl font-medium mb-6">My Account</h1>
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left sidebar with profile summary */}
          <div className="w-full lg:w-1/4">
            <div className="bg-white rounded-sm shadow-sm p-6 mb-4">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-[#f0f0f0] rounded-full flex items-center justify-center text-[#2874f0]">
                  <User className="h-8 w-8" />
                </div>
                <div className="ml-4">
                  <h2 className="font-medium">{user.name || user.username}</h2>
                  <p className="text-sm text-[#878787]">{user.email}</p>
                </div>
              </div>
              
              <nav>
                <ul className="space-y-3">
                  <li>
                    <Link href="/profile" className="flex items-center text-[#2874f0] font-medium">
                      <User className="h-5 w-5 mr-3" />
                      My Profile
                    </Link>
                  </li>
                  <li>
                    <Link href="/orders" className="flex items-center text-[#212121] hover:text-[#2874f0]">
                      <ShoppingBag className="h-5 w-5 mr-3" />
                      My Orders
                    </Link>
                  </li>
                  <li>
                    <Link href="/profile" className="flex items-center text-[#212121] hover:text-[#2874f0]">
                      <Heart className="h-5 w-5 mr-3" />
                      My Wishlist
                    </Link>
                  </li>
                  <li>
                    <Link href="/profile" className="flex items-center text-[#212121] hover:text-[#2874f0]">
                      <MapPin className="h-5 w-5 mr-3" />
                      Manage Addresses
                    </Link>
                  </li>
                  <li>
                    <Link href="/profile" className="flex items-center text-[#212121] hover:text-[#2874f0]">
                      <CreditCard className="h-5 w-5 mr-3" />
                      Payment Methods
                    </Link>
                  </li>
                  <li>
                    <button 
                      onClick={handleLogout}
                      className="flex items-center text-[#212121] hover:text-[#2874f0] w-full text-left"
                      disabled={logoutMutation.isPending}
                    >
                      <LogOut className="h-5 w-5 mr-3" />
                      {logoutMutation.isPending ? "Logging out..." : "Logout"}
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
            
            <div className="bg-white rounded-sm shadow-sm p-6">
              <h3 className="font-medium mb-4">Flipkart Plus</h3>
              <div className="flex items-center">
                <GiftIcon className="h-6 w-6 text-[#2874f0] mr-2" />
                <p className="text-sm">
                  Join Flipkart Plus and get exclusive benefits like free delivery, early access to sales and more.
                </p>
              </div>
            </div>
          </div>
          
          {/* Right content area */}
          <div className="w-full lg:w-3/4">
            <div className="bg-white rounded-sm shadow-sm overflow-hidden">
              <Tabs defaultValue="profile">
                <TabsList className="w-full rounded-none justify-start p-0 h-auto bg-[#f5f5f5] border-b">
                  <TabsTrigger 
                    value="profile" 
                    className="rounded-none py-4 px-6 data-[state=active]:text-[#2874f0] data-[state=active]:border-b-2 data-[state=active]:border-[#2874f0]"
                  >
                    Personal Information
                  </TabsTrigger>
                  <TabsTrigger 
                    value="preferences" 
                    className="rounded-none py-4 px-6 data-[state=active]:text-[#2874f0] data-[state=active]:border-b-2 data-[state=active]:border-[#2874f0]"
                  >
                    Preferences
                  </TabsTrigger>
                  <TabsTrigger 
                    value="security" 
                    className="rounded-none py-4 px-6 data-[state=active]:text-[#2874f0] data-[state=active]:border-b-2 data-[state=active]:border-[#2874f0]"
                  >
                    Security
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="profile" className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-medium">Personal Information</h2>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setIsEditing(!isEditing)}
                      className="flex items-center"
                    >
                      {isEditing ? (
                        <>
                          <Save className="h-4 w-4 mr-1" />
                          Cancel
                        </>
                      ) : (
                        <>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  disabled={!isEditing || updateProfileMutation.isPending}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  disabled={!isEditing || updateProfileMutation.isPending}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  disabled={!isEditing || updateProfileMutation.isPending}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="pt-4 border-t mt-6">
                        <h3 className="text-base font-medium mb-4">Address Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Address</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    disabled={!isEditing || updateProfileMutation.isPending}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>City</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    disabled={!isEditing || updateProfileMutation.isPending}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="state"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>State</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    disabled={!isEditing || updateProfileMutation.isPending}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="pincode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Pincode</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    disabled={!isEditing || updateProfileMutation.isPending}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                      
                      {isEditing && (
                        <div className="pt-4">
                          <Button 
                            type="submit" 
                            className="bg-[#2874f0]"
                            disabled={updateProfileMutation.isPending}
                          >
                            {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                          </Button>
                        </div>
                      )}
                    </form>
                  </Form>
                </TabsContent>
                
                <TabsContent value="preferences" className="p-6">
                  <h2 className="text-lg font-medium mb-6">Notification Preferences</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <input 
                        type="checkbox" 
                        id="email-notifications" 
                        className="mt-1"
                        defaultChecked
                      />
                      <div className="ml-3">
                        <label htmlFor="email-notifications" className="font-medium text-sm">Email Notifications</label>
                        <p className="text-xs text-[#878787]">Receive updates about your orders, offers, and more</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <input 
                        type="checkbox" 
                        id="sms-notifications" 
                        className="mt-1"
                        defaultChecked
                      />
                      <div className="ml-3">
                        <label htmlFor="sms-notifications" className="font-medium text-sm">SMS Notifications</label>
                        <p className="text-xs text-[#878787]">Get text messages for order updates and delivery status</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <input 
                        type="checkbox" 
                        id="promo-emails" 
                        className="mt-1"
                        defaultChecked
                      />
                      <div className="ml-3">
                        <label htmlFor="promo-emails" className="font-medium text-sm">Promotional Emails</label>
                        <p className="text-xs text-[#878787]">Receive emails about sales, discounts, and special offers</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8">
                    <Button className="bg-[#2874f0]">
                      <Bell className="h-4 w-4 mr-1" />
                      Save Preferences
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="security" className="p-6">
                  <h2 className="text-lg font-medium mb-6">Security Settings</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-base font-medium mb-2">Change Password</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm block mb-1">Current Password</label>
                          <Input type="password" placeholder="Enter current password" />
                        </div>
                        <div>
                          <label className="text-sm block mb-1">New Password</label>
                          <Input type="password" placeholder="Enter new password" />
                        </div>
                        <div>
                          <label className="text-sm block mb-1">Confirm New Password</label>
                          <Input type="password" placeholder="Confirm new password" />
                        </div>
                      </div>
                      <Button className="bg-[#2874f0] mt-4">Update Password</Button>
                    </div>
                    
                    <div className="pt-6 border-t">
                      <div className="flex items-start mb-4">
                        <ShieldCheck className="h-6 w-6 text-[#2874f0] mr-2 flex-shrink-0" />
                        <div>
                          <h3 className="text-base font-medium">Account Security</h3>
                          <p className="text-sm text-[#878787]">
                            Enable two-factor authentication for an extra layer of security on your account.
                          </p>
                        </div>
                      </div>
                      <Button variant="outline">Enable Two-Factor Authentication</Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;
