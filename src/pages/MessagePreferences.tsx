
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "non-binary", label: "Non-binary" },
  { value: "other", label: "Other" },
];

const maritalStatusOptions = [
  { value: "single", label: "Single" },
  { value: "married", label: "Married" },
  { value: "divorced", label: "Divorced" },
  { value: "widowed", label: "Widowed" },
  { value: "complicated", label: "It's complicated" },
];

const MessagePreferences = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const formSchema = z.object({
    allow_messages: z.boolean().default(true),
    allow_gender: z.array(z.string()).optional(),
    allow_marital_status: z.array(z.string()).optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      allow_messages: true,
      allow_gender: [],
      allow_marital_status: [],
    },
  });

  // Fetch user's message preferences
  const { data: preferences, isLoading, refetch } = useQuery({
    queryKey: ["messagePreferences", user?.id],
    queryFn: async () => {
      if (!user) return null;

      // Check if preferences exist
      const { data, error } = await supabase
        .from("message_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching message preferences:", error);
        return null;
      }

      // If no preferences found, create default ones
      if (!data) {
        const { data: newPrefs, error: insertError } = await supabase
          .from("message_preferences")
          .insert({
            user_id: user.id,
            allow_messages: true,
          })
          .select("*")
          .single();

        if (insertError) {
          console.error("Error creating message preferences:", insertError);
          return null;
        }

        return newPrefs;
      }

      return data;
    },
    enabled: !!user,
  });

  // Set form values when preferences are loaded
  useEffect(() => {
    if (preferences) {
      form.reset({
        allow_messages: preferences.allow_messages,
        allow_gender: preferences.allow_gender || [],
        allow_marital_status: preferences.allow_marital_status || [],
      });
    }
  }, [preferences, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("message_preferences")
        .upsert({
          user_id: user.id,
          allow_messages: values.allow_messages,
          allow_gender: values.allow_gender?.length ? values.allow_gender : null,
          allow_marital_status: values.allow_marital_status?.length ? values.allow_marital_status : null,
        });

      if (error) throw error;

      toast({
        title: "Preferences Updated",
        description: "Your message preferences have been saved.",
      });

      refetch();
    } catch (error) {
      console.error("Error updating preferences:", error);
      toast({
        title: "Error",
        description: "Failed to update preferences. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Message Preferences</CardTitle>
            <CardDescription>
              Control who can send you messages and how you receive them.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <FormField
                    control={form.control}
                    name="allow_messages"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Allow Messages</FormLabel>
                          <FormDescription>
                            Turn this off to block all incoming messages.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <h3 className="font-medium">
                      Only allow messages from people who are:
                    </h3>

                    <FormField
                      control={form.control}
                      name="allow_gender"
                      render={() => (
                        <FormItem>
                          <div className="mb-2">
                            <FormLabel>Gender</FormLabel>
                            <FormDescription>
                              Only receive messages from users with these gender identities. If none are selected, messages from all genders are allowed.
                            </FormDescription>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {genderOptions.map((option) => (
                              <FormField
                                key={option.value}
                                control={form.control}
                                name="allow_gender"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={option.value}
                                      className="flex items-center space-x-2"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(option.value)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...field.value || [], option.value])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== option.value
                                                  )
                                                )
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="cursor-pointer">
                                        {option.label}
                                      </FormLabel>
                                    </FormItem>
                                  )
                                }}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="allow_marital_status"
                      render={() => (
                        <FormItem>
                          <div className="mb-2">
                            <FormLabel>Marital Status</FormLabel>
                            <FormDescription>
                              Only receive messages from users with these relationship statuses. If none are selected, messages from all statuses are allowed.
                            </FormDescription>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {maritalStatusOptions.map((option) => (
                              <FormField
                                key={option.value}
                                control={form.control}
                                name="allow_marital_status"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={option.value}
                                      className="flex items-center space-x-2"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(option.value)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...field.value || [], option.value])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== option.value
                                                  )
                                                )
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="cursor-pointer">
                                        {option.label}
                                      </FormLabel>
                                    </FormItem>
                                  )
                                }}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit">Save Preferences</Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default MessagePreferences;
