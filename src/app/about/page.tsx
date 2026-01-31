import { CustomerNavbar } from "@/components/customer/CustomerNavbar";
import { CheckCircle2, Clock, ShieldCheck, Headphones, Wallet, Target } from "lucide-react";
import Image from "next/image";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <CustomerNavbar />

            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative py-20 overflow-hidden bg-muted/20">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                    <div className="container mx-auto px-6 relative z-10 text-center">
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                            Reimagining Ownership
                        </h1>
                        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10">
                            Leaseo is India's premier rental marketplace. access premium products without the burden of buying.
                        </p>
                    </div>
                </section>

                {/* Mission Section */}
                <section className="py-20">
                    <div className="container mx-auto px-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                            <div className="space-y-6">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                                    <Target className="w-4 h-4" />
                                    <span>Our Mission</span>
                                </div>
                                <h2 className="text-3xl md:text-4xl font-bold">Making Quality Accessible</h2>
                                <p className="text-lg text-muted-foreground leading-relaxed">
                                    At Leaseo, we believe that everyone deserves access to high-quality lifestyle products without the heavy price tag of ownership.
                                    Whether it's the latest tech, furniture for your new home, or appliances for everyday needs, we bridge the gap between desire and affordability.
                                </p>
                                <p className="text-lg text-muted-foreground leading-relaxed">
                                    Born in India, for India, we understand the dynamic needs of modern living. We allow you to rent what you need, for as long as you need, with zero hassle.
                                </p>
                            </div>
                            <div className="relative h-[400px] w-full rounded-3xl overflow-hidden bg-muted/50 border border-muted flex items-center justify-center">
                                {/* Ideally an image here, using a placeholder for now or abstract design */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-gray-900 via-gray-800 to-black opacity-90" />
                                <div className="relative z-10 text-center p-8">
                                    <h3 className="text-2xl font-bold text-white mb-2">3000+</h3>
                                    <p className="text-gray-400">Happy Customers</p>
                                    <div className="h-px w-20 bg-primary/50 mx-auto my-6" />
                                    <h3 className="text-2xl font-bold text-white mb-2">15+</h3>
                                    <p className="text-gray-400">Cities Covered</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Grid */}
                <section className="py-20 bg-muted/20">
                    <div className="container mx-auto px-6">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <h2 className="text-3xl font-bold mb-4">Why Choose Leaseo?</h2>
                            <p className="text-muted-foreground">We've built a rental experience that prioritizes your convenience and trust.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <FeatureCard
                                icon={<Clock className="w-8 h-8 text-primary" />}
                                title="Flexible Durations"
                                description="Rent for a day, a month, or a year. Extend or return anytime with our flexible plans tailored to your timeline."
                            />
                            <FeatureCard
                                icon={<Wallet className="w-8 h-8 text-primary" />}
                                title="Affordable Pricing"
                                description="Enjoy premium products at a fraction of their retail cost. Transparent pricing with no hidden charges."
                            />
                            <FeatureCard
                                icon={<ShieldCheck className="w-8 h-8 text-primary" />}
                                title="Secure Payments"
                                description="Bank-grade security for all transactions. Refundable security deposits are processed instantly upon return."
                            />
                            <FeatureCard
                                icon={<CheckCircle2 className="w-8 h-8 text-primary" />}
                                title="Quality Assured"
                                description="Every product goes through a rigorous 40-point quality check before it reaches your doorstep."
                            />
                            <FeatureCard
                                icon={<Headphones className="w-8 h-8 text-primary" />}
                                title="24/7 Support"
                                description="Our dedicated customer success team is always available to help you with queries, returns, or maintenance."
                            />
                            <FeatureCard
                                icon={<Target className="w-8 h-8 text-primary" />}
                                title="Doorstep Delivery"
                                description="Free delivery and installation at your preferred time. We handle the heavy lifting so you don't have to."
                            />
                        </div>
                    </div>
                </section>
            </main>

            <footer className="border-t py-12 bg-muted/10">
                <div className="container mx-auto px-6 text-center text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} Leaseo Technologies Pvt Ltd. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
    return (
        <div className="p-8 rounded-2xl bg-card border hover:border-primary/50 transition-colors shadow-sm hover:shadow-md">
            <div className="mb-6 p-3 bg-primary/5 w-fit rounded-xl">
                {icon}
            </div>
            <h3 className="text-xl font-semibold mb-3">{title}</h3>
            <p className="text-muted-foreground leading-relaxed">
                {description}
            </p>
        </div>
    );
}
