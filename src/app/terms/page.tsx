import { CustomerNavbar } from "@/components/customer/CustomerNavbar";

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <CustomerNavbar />

            <main className="flex-1 py-12 md:py-20">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="mb-12 text-center">
                        <h1 className="text-4xl font-extrabold tracking-tight mb-4">Terms & Conditions</h1>
                        <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>

                    <div className="space-y-12 prose prose-invert max-w-none text-muted-foreground">
                        <div className="p-6 rounded-xl bg-muted/20 border border-primary/20">
                            <p className="text-foreground font-medium">
                                Welcome to Leaseo. By accessing or using our website and services, you agree to be bound by these Terms & Conditions. Please read them carefully.
                            </p>
                        </div>

                        <Section title="1. Rental Agreement">
                            <p>
                                The specific terms of your rental, including the duration, product details, and fees, will be provided at the time of checkout. By confirming an order, you enter into a binding rental agreement with Leaseo. You agree to return the product in the same condition as received, subject to normal wear and tear.
                            </p>
                        </Section>

                        <Section title="2. Ownership Policy">
                            <p>
                                All products rented via Leaseo remain the sole and exclusive property of Leaseo or its vendor partners. You, as the renter, obtain no rights of ownership. You are strictly prohibited from selling, subleasing, pawning, or otherwise disposing of the rented equipment.
                            </p>
                        </Section>

                        <Section title="3. Rental Duration">
                            <p>
                                The rental period begins on the date of delivery and ends on the date the product is picked up or returned. Extensions can be requested through your dashboard but are subject to availability and approval. Failure to return products on the due date will incur late fees.
                            </p>
                        </Section>

                        <Section title="4. Pricing and Payments">
                            <p>
                                Prices listed on the website are inclusive of applicable taxes unless stated otherwise.
                            </p>
                            <ul className="list-disc pl-5 space-y-2 mt-4">
                                <li>Rental fees must be paid in advance or as per the subscription cycle selected.</li>
                                <li>We accept major credit cards, debit cards, UPI, and net banking.</li>
                                <li>Failure to pay recurring rental fees may result in immediate termination of the rental agreement and repossession of the product.</li>
                            </ul>
                        </Section>

                        <Section title="5. Security Deposit">
                            <p>
                                A refundable security deposit may be required for certain high-value items. This deposit is interest-free and will be refunded within 7 business days of the product's return, provided the product passes our quality check for damages.
                            </p>
                        </Section>

                        <Section title="6. Product Usage and Responsibility">
                            <p>
                                You agree to use the product with reasonable care and for its intended purpose only. You are responsible for any loss, theft, or significant damage to the product during the rental period. In such cases, you will be liable to pay the repair costs or the full market value of the product.
                            </p>
                        </Section>

                        <Section title="7. Returns and Late Fees">
                            <p>
                                We offer free pickup for returns. Please schedule your return at least 48 hours before your rental end date.
                                <br />
                                <strong>Late Returns:</strong> If you fail to return the item on the scheduled date, a late fee equivalent to 2x the daily rental rate will be charged for each day of delay.
                            </p>
                        </Section>

                        <Section title="8. User Responsibility">
                            <p>
                                You certify that detailed personal information provided (ID proof, address) is accurate. Any attempt to provide false information or defraud Leaseo will result in legal action and blacklisting.
                            </p>
                        </Section>

                        <Section title="9. Limitation of Liability">
                            <p>
                                Leaseo shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products. Our maximum liability is limited to the rental fees paid by you for the specific order.
                            </p>
                        </Section>

                        <Section title="10. Updates to Terms">
                            <p>
                                Leaseo reserves the right to modify these terms at any time. Changes will be effective immediately upon posting to the website. Continued use of our services constitutes acceptance of the revised terms.
                            </p>
                        </Section>

                        <div className="pt-10 border-t items-center flex flex-col space-y-4">
                            <p className="text-sm">Questions regarding these terms?</p>
                            <button className="px-6 py-2 rounded-full border hover:bg-muted transition-colors text-sm font-medium">
                                Contact Legal Team
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">{title}</h2>
            <div className="leading-7">
                {children}
            </div>
        </section>
    );
}
