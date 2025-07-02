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
    message: 'Please describe your symptoms in at least 10 characters.',
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
                    <FormLabel className="text-lg font-semibold text-foreground">Describe your symptoms</FormLabel>
                    <FormControl>
                    <Textarea
                        placeholder="e.g., 'I have a throbbing headache on the right side of my head, sensitive to light and sound...'"
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
                    Analyzing...
                </>
                ) : (
                'Get Suggestions'
                )}
            </Button>
            </form>
      </Form>
    );
}
