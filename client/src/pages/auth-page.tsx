import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Redirect } from "wouter";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";

const loginSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

const registerSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  fullName: z.string().min(2, {
    message: "Full name must be at least 2 characters.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  confirmPassword: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const forgotUsernameSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;
type ForgotUsernameFormValues = z.infer<typeof forgotUsernameSchema>;

export default function AuthPage() {
  const { user, isLoading, loginMutation, registerMutation } = useAuth();
  const [showForgotUsername, setShowForgotUsername] = useState(false);
  const [forgotUsernameSuccess, setForgotUsernameSuccess] = useState(false);
  const [resetMessage, setResetMessage] = useState("");
  const [isRecovering, setIsRecovering] = useState(false);
  
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const forgotUsernameForm = useForm<ForgotUsernameFormValues>({
    resolver: zodResolver(forgotUsernameSchema),
    defaultValues: {
      email: "",
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      fullName: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onLoginSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values);
  };

  const onRegisterSubmit = (values: RegisterFormValues) => {
    const { confirmPassword, ...userData } = values;
    registerMutation.mutate(userData);
  };
  
  const onForgotUsernameSubmit = async (values: ForgotUsernameFormValues) => {
    try {
      setIsRecovering(true);
      
      // Make an API call to the forgot-username endpoint
      await apiRequest("POST", "/api/forgot-username", { email: values.email });
      
      setForgotUsernameSuccess(true);
      setResetMessage(`If an account exists with the email ${values.email}, we've sent the username to that address.`);
      forgotUsernameForm.reset();
    } catch (error) {
      console.error("Error requesting username recovery:", error);
      setResetMessage("There was an error processing your request. Please try again.");
      setForgotUsernameSuccess(false);
    } finally {
      setIsRecovering(false);
    }
  };

  // Redirect if already logged in
  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <>
      <div className="flex min-h-screen">
        {/* Form section */}
        <div className="flex flex-col items-center justify-center w-full md:w-1/2 p-8">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold mb-2">Insights Discovery</h1>
              <p className="text-muted-foreground">Sign in or create an account to access your color profile reports.</p>
            </div>

            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <Card>
                  <CardHeader>
                    <CardTitle>Login</CardTitle>
                    <CardDescription>
                      Enter your credentials to access your account.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                        <FormField
                          control={loginForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input placeholder="johndoe" {...field} />
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
                                <Input type="password" placeholder="••••••••" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="submit"
                          className="w-full"
                          disabled={loginMutation.isPending}
                        >
                          {loginMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Logging in...
                            </>
                          ) : (
                            "Login"
                          )}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                  <CardFooter className="flex justify-center">
                    <Button variant="link" className="px-0" onClick={() => setShowForgotUsername(true)}>
                      Forgot your username?
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="register">
                <Card>
                  <CardHeader>
                    <CardTitle>Create an account</CardTitle>
                    <CardDescription>
                      Enter your information to create a new account.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...registerForm}>
                      <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                        <FormField
                          control={registerForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input placeholder="johndoe" {...field} />
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
                                <Input type="email" placeholder="john@example.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="John Doe" {...field} />
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
                                <Input type="password" placeholder="••••••••" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="submit"
                          className="w-full"
                          disabled={registerMutation.isPending}
                        >
                          {registerMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creating account...
                            </>
                          ) : (
                            "Create Account"
                          )}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Hero section */}
        <div className="hidden md:flex flex-col items-center justify-center w-1/2 p-8 bg-gradient-to-br from-primary/80 to-primary text-white">
          <div className="max-w-md text-center">
            <h2 className="text-4xl font-bold mb-4">Discover Your Color Profile</h2>
            <p className="mb-8 text-lg">
              Unlock insights about your personality and work style with our color profile assessment, 
              based on the Insights Discovery methodology.
            </p>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                <div className="w-12 h-12 rounded-full bg-red-500 mb-2 mx-auto"></div>
                <h3 className="font-semibold mb-1">Fiery Red</h3>
                <p className="text-sm">Bold, assertive, and results-focused</p>
              </div>
              <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                <div className="w-12 h-12 rounded-full bg-yellow-400 mb-2 mx-auto"></div>
                <h3 className="font-semibold mb-1">Sunshine Yellow</h3>
                <p className="text-sm">Sociable, dynamic, and persuasive</p>
              </div>
              <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                <div className="w-12 h-12 rounded-full bg-green-500 mb-2 mx-auto"></div>
                <h3 className="font-semibold mb-1">Earth Green</h3>
                <p className="text-sm">Caring, patient, and relaxed</p>
              </div>
              <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                <div className="w-12 h-12 rounded-full bg-blue-500 mb-2 mx-auto"></div>
                <h3 className="font-semibold mb-1">Cool Blue</h3>
                <p className="text-sm">Analytical, precise, and deliberate</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Username Dialog */}
      <Dialog open={showForgotUsername} onOpenChange={setShowForgotUsername}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Recover Your Username</DialogTitle>
            <DialogDescription>
              Enter the email address associated with your account and we'll send your username to that address.
            </DialogDescription>
          </DialogHeader>
          
          {forgotUsernameSuccess ? (
            <Alert className="mt-4 bg-green-50">
              <AlertTitle>Username Recovery Email Sent</AlertTitle>
              <AlertDescription>{resetMessage}</AlertDescription>
            </Alert>
          ) : (
            <Form {...forgotUsernameForm}>
              <form onSubmit={forgotUsernameForm.handleSubmit(onForgotUsernameSubmit)} className="space-y-4 py-4">
                <FormField
                  control={forgotUsernameForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="you@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter className="mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForgotUsername(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isRecovering}>
                    {isRecovering ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send Recovery Email"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}