'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { LoaderCircle, FileText } from 'lucide-react';

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
        <div>
            <div className="flex items-center gap-3 mb-6">
                <FileText className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">রোগীর তথ্যাবলী</h2>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="symptoms"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel className="block mb-2 font-semibold text-gray-600">রোগীর সমস্ত লক্ষণ (শারীরিক, মানসিক, সাধারণ এবং হ্রাস/বৃদ্ধি সহ)</FormLabel>
                        <FormControl>
                        <Textarea
                            placeholder="এখানে রোগীর সমস্ত লক্ষণ বিস্তারিতভাবে লিখুন। যেমন: মাথার ডানদিকে ব্যথা, একা থাকতে ভয়, ঠাণ্ডা বাতাসে আরাম, মিষ্টি খেতে প্রবল ইচ্ছা ইত্যাদি..."
                            className="min-h-[280px] text-base bg-gray-50 border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                            {...field}
                        />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <Button type="submit" className="w-full text-lg font-bold py-3 h-auto bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed" disabled={isLoading}>
                    {isLoading ? (
                    <>
                        <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
                        বিশ্লেষণ করা হচ্ছে...
                    </>
                    ) : (
                    'বিশ্লেষণ করুন'
                    )}
                </Button>
                </form>
            </Form>
        </div>
    );
}
