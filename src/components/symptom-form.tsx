'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { LoaderCircle } from 'lucide-react';

const formSchema = z.object({
  symptoms: z.string().min(10, {
    message: 'অনুগ্রহ করে আপনার লক্ষণগুলি কমপক্ষে ১০টি অক্ষরে বর্ণনা করুন।',
  }),
});

type SymptomFormValues = z.infer<typeof formSchema>;

interface SymptomFormProps {
    onSubmit: (values: SymptomFormValues) => void;
    isLoading: boolean;
}

export function SymptomForm({ onSubmit, isLoading }: SymptomFormProps) {
    const form = useForm<SymptomFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
          symptoms: '',
        },
      });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
                control={form.control}
                name="symptoms"
                render={({ field }) => (
                <FormItem>
                    <FormLabel className="text-lg font-semibold text-foreground">আপনার লক্ষণ বর্ণনা করুন</FormLabel>
                    <FormControl>
                    <Textarea
                        placeholder="এখানে রোগীর সমস্ত লক্ষণ বিস্তারিতভাবে লিখুন। যেমন: মাথার ডানদিকে ব্যথা, একা থাকতে ভয়, ঠাণ্ডা বাতাসে আরাম, মিষ্টি খেতে প্রবল ইচ্ছা ইত্যাদি..."
                        className="min-h-[120px] text-base bg-background"
                        {...field}
                    />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <Button type="submit" className="w-full md:w-auto" size="lg" disabled={isLoading}>
                {isLoading ? (
                <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    বিশ্লেষণ করা হচ্ছে...
                </>
                ) : (
                'সাজেশন পান'
                )}
            </Button>
            </form>
      </Form>
    );
}
