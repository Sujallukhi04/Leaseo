"use client";

import { CustomerNavbar } from "@/components/customer/CustomerNavbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Mail, Phone, Clock, Send, MessageSquare } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ContactPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate form submission
        await new Promise(resolve => setTimeout(resolve, 1500));

        toast.success("Message sent successfully! We'll get back to you soon.");
        setIsSubmitting(false);
        (e.target as HTMLFormElement).reset();
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <CustomerNavbar />

            <main className="flex-1 py-12 md:py-20 px-6">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center mb-16 space-y-4">
                        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                            Get in Touch
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Have a question about a product, rental terms, or your order? We're here to help.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                        {/* Contact Information Section */}
                        <div className="space-y-8">
                            <Card className="border-none shadow-lg bg-card/50 backdrop-blur">
                                <CardHeader>
                                    <CardTitle className="text-2xl">Contact Information</CardTitle>
                                    <CardDescription>
                                        Reach out to us through any of these channels.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <ContactItem
                                        icon={<MapPin className="w-5 h-5" />}
                                        title="Our Office"
                                        content="Leaseo Rental Services, Ahmedabad, Gujarat, India"
                                    />
                                    <ContactItem
                                        icon={<Mail className="w-5 h-5" />}
                                        title="Email Us"
                                        content="support@leaseo.in"
                                        href="mailto:support@leaseo.in"
                                    />
                                    <ContactItem
                                        icon={<Phone className="w-5 h-5" />}
                                        title="Call Us"
                                        content="+91 98765 43210"
                                        href="tel:+919876543210"
                                    />
                                    <ContactItem
                                        icon={<Clock className="w-5 h-5" />}
                                        title="Support Hours"
                                        content="Monday–Saturday, 9:00 AM – 6:00 PM"
                                    />
                                </CardContent>
                            </Card>

                            {/* FAQ Snippet or Trust Signals */}
                            <div className="bg-primary/5 rounded-2xl p-8 border border-primary/10">
                                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                    <MessageSquare className="w-5 h-5 text-primary" />
                                    Did you know?
                                </h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    Most queries regarding returns and extensions can be handled instantly through your
                                    <span className="text-foreground font-medium"> Customer Dashboard</span>.
                                </p>
                            </div>
                        </div>

                        {/* Contact Form Section */}
                        <Card className="border shadow-xl">
                            <CardHeader>
                                <CardTitle className="text-2xl">Send us a Message</CardTitle>
                                <CardDescription>
                                    Fill out the form below and our team will get back to you within 24 hours.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Full Name</Label>
                                            <Input id="name" placeholder="John Doe" required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Phone Number</Label>
                                            <Input id="phone" type="tel" placeholder="+91 00000 00000" required />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input id="email" type="email" placeholder="john@example.com" required />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="message">Message</Label>
                                        <textarea
                                            id="message"
                                            placeholder="How can we help you?"
                                            required
                                            className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] min-h-[120px] resize-y"
                                        />
                                    </div>

                                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                                        {isSubmitting ? (
                                            "Sending..."
                                        ) : (
                                            <>
                                                Send Message
                                                <Send className="ml-2 w-4 h-4" />
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}

function ContactItem({ icon, title, content, href }: { icon: React.ReactNode, title: string, content: string, href?: string }) {
    return (
        <div className="flex items-start gap-4">
            <div className="bg-primary/10 p-2.5 rounded-full text-primary shrink-0 transition-colors hover:bg-primary/20">
                {icon}
            </div>
            <div>
                <p className="font-medium text-sm text-muted-foreground mb-0.5">{title}</p>
                {href ? (
                    <a href={href} className="text-foreground hover:text-primary transition-colors font-medium">
                        {content}
                    </a>
                ) : (
                    <p className="text-foreground font-medium">{content}</p>
                )}
            </div>
        </div>
    );
}
