import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Redirect, useLocation } from "wouter";
import { Loader2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const teamSchema = z.object({
  name: z.string().min(2, { message: "Team name must be at least 2 characters" }).max(100),
  description: z.string().max(500, { message: "Description cannot exceed 500 characters" }).optional(),
});

type TeamFormValues = z.infer<typeof teamSchema>;

export default function TeamCreate() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [success, setSuccess] = useState(false);
  const [teamId, setTeamId] = useState<number | null>(null);
  
  const form = useForm<TeamFormValues>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });
  
  const createTeamMutation = useMutation({
    mutationFn: async (values: TeamFormValues) => {
      const res = await apiRequest("POST", "/api/teams", values);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/teams'] });
      
      toast({
        title: "Team created successfully",
        description: `Your team "${data.name}" has been created.`,
      });
      
      setTeamId(data.id);
      setSuccess(true);
      
      // Redirect to the team page after a short delay
      setTimeout(() => {
        setLocation(`/teams/${data.id}`);
      }, 1500);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create team",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (values: TeamFormValues) => {
    createTeamMutation.mutate(values);
  };
  
  // Redirect if not logged in
  if (!user) {
    return <Redirect to="/auth" />;
  }
  
  return (
    <div className="container max-w-2xl mx-auto py-10 px-4 sm:px-6">
      <Button 
        variant="ghost" 
        className="mb-8 pl-0 flex items-center gap-2"
        onClick={() => window.history.back()}
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>
      
      <Card className="shadow-md">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold">Create a New Team</CardTitle>
          <CardDescription className="max-w-md mx-auto mt-2">
            Create a team to invite team members and analyze group personality dynamics
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 sm:px-10">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Marketing Team" className="py-6" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter a descriptive name for your team
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="A brief description of your team and its purpose" 
                        className="min-h-[150px] resize-none"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Provide additional context about the team
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-center mt-8 pt-4">
                <Button 
                  type="submit" 
                  className="min-w-[160px] py-6"
                  size="lg"
                  disabled={createTeamMutation.isPending}
                >
                  {createTeamMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Team"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}