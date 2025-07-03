'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { FileText, LoaderCircle, Mic, Wand2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { punctuateText } from '@/ai/flows/punctuate-text';

const formSchema = z.object({
  symptoms: z.string().min(10, {
    message: 'অনুগ্রহ করে লক্ষণগুলি কমপক্ষে ১০টি অক্ষরে বর্ণনা করুন।',
  }),
});

export type SymptomFormValues = z.infer<typeof formSchema>;

interface SymptomFormProps {
  onSubmit: (values: SymptomFormValues) => void;
  isLoading: boolean;
}

// Extend the Window interface to include webkitSpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

export function SymptomForm({ onSubmit, isLoading }: SymptomFormProps) {
  const form = useForm<SymptomFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      symptoms: '',
    },
  });

  const [isListening, setIsListening] = useState(false);
  const [isRearranging, setIsRearranging] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const textBeforeListening = useRef('');

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Browser does not support SpeechRecognition.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'bn-BD'; // Bengali (Bangladesh)

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const separator = textBeforeListening.current.length > 0 ? ' ' : '';
      form.setValue(
        'symptoms',
        textBeforeListening.current +
          separator +
          finalTranscript +
          interimTranscript
      );
    };

    recognitionRef.current = recognition;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.code === 'Space' && !isListening) {
        e.preventDefault();
        startListening();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.code === 'Space' && isListening) {
        e.preventDefault();
        stopListening();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      textBeforeListening.current = form.getValues('symptoms');
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const handleRearrange = async () => {
    const currentSymptoms = form.getValues('symptoms');
    if (!currentSymptoms || currentSymptoms.trim().length < 10) {
      return;
    }

    setIsRearranging(true);
    try {
      const result = await punctuateText({ text: currentSymptoms });
      if (result && result.punctuatedText) {
        form.setValue('symptoms', result.punctuatedText);
      }
    } catch (e) {
      console.error('Error punctuating text:', e);
    } finally {
      setIsRearranging(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <FileText className="w-5 h-5 md:w-6 md:h-6 text-primary" />
        <h2 className="text-lg md:text-2xl font-bold text-foreground">
          রোগীর তথ্যাবলী
        </h2>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="symptoms"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block mb-2 font-semibold text-gray-600">
                  রোগীর লক্ষণসমূহ
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="এখানে রোগীর মানসিক, শারীরিক, এবং পূর্বের ইতিহাস সহ সকল লক্ষণ বিস্তারিতভাবে লিখুন..."
                    className="min-h-[250px] text-sm md:text-base bg-gray-50 border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    {...field}
                  />
                </FormControl>
                <p className="text-xs text-muted-foreground mt-2">
                  টিপস: ভয়েস টাইপিংয়ের জন্য মাইক আইকন (`Ctrl + Space`) ব্যবহার করুন। লেখা শেষে দাড়ি-কমা যোগ করতে ম্যাজিক ওয়ান্ড আইকনে ক্লিক করুন।
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex items-center justify-between gap-2 md:gap-4">
            <Button
              type="submit"
              className="w-full text-base md:text-lg font-bold py-3 h-auto bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || isRearranging}
            >
              {isLoading ? (
                <>
                  <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
                  বিশ্লেষণ করা হচ্ছে...
                </>
              ) : (
                'বিশ্লেষণ করুন'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-auto aspect-square p-2 shrink-0"
              onClick={handleRearrange}
              disabled={isLoading || isRearranging}
              title="বাক্য সাজান"
            >
              {isRearranging ? (
                <LoaderCircle className="w-5 h-5 md:w-6 md:h-6 animate-spin" />
              ) : (
                <Wand2 className="w-5 h-5 md:w-6 md:h-6" />
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className={`h-auto aspect-square p-2 shrink-0 transition-colors ${
                isListening
                  ? 'bg-red-500/20 border-red-500 text-red-500 hover:bg-red-500/30'
                  : ''
              }`}
              onMouseDown={startListening}
              onMouseUp={stopListening}
              onTouchStart={startListening}
              onTouchEnd={stopListening}
              disabled={!recognitionRef.current || isLoading || isRearranging}
              title="ভয়েস টাইপিং (Ctrl + Space)"
            >
              <Mic
                className={`w-5 h-5 md:w-6 md:h-6 ${
                  isListening ? 'animate-pulse' : ''
                }`}
              />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
