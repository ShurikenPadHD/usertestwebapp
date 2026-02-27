import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { FadeIn } from '@/components/ui/FadeIn'
import { Play, Users, Zap, Shield, ArrowRight, Star, CheckCircle2, HelpCircle } from 'lucide-react'

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-blue-500/30 relative overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md">
        <nav className="max-w-[1400px] mx-auto px-6 md:px-12 h-20 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)]">
              <span className="font-bold text-white text-xs">UT</span>
            </div>
            <span className="text-xl font-bold tracking-tight">UserTest</span>
          </div>
          
          <div className="hidden md:flex items-center gap-10 text-sm font-medium text-gray-300">
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="#process" className="hover:text-white transition-colors">Process</Link>
            <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/tester" className="hover:text-white transition-colors">For Testers</Link>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/tester/signin" className="text-sm font-medium text-gray-300 hover:text-white transition-colors hidden sm:block">
              Log in
            </Link>
            <Link href="/tester/signup">
              <Button variant="primary" size="sm" className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0 shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                Get Started
              </Button>
            </Link>
          </div>
        </nav>
      </header>
      
      {/* Hero Section - visible immediately on load, no fade */}
      <main className="relative z-10 max-w-[1000px] mx-auto px-6 pt-40 md:pt-48 pb-24 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-sm text-purple-300 mb-10 backdrop-blur-sm">
          <span className="flex h-2 w-2 rounded-full bg-purple-500 animate-pulse shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
          Introducing Authentic Usability Testing
        </div>
        
        {/* Headline */}
        <h1 className="text-6xl md:text-[80px] font-bold tracking-tight mb-8 leading-[1.1] text-white">
          See your app through <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-purple-600">
            fresh eyes.
          </span>
        </h1>
        
        {/* Sub-headline */}
        <p className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
          Stop guessing why users drop off. Get screen recordings of real people using your app with live voice narration. Discover UX issues before you ship.
        </p>
        
        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-24">
          <Link href="/dev/signup">
            <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-base bg-blue-600 hover:bg-blue-700 shadow-[0_0_40px_-10px_rgba(59,130,246,0.5)] border border-blue-500/50">
              Start Testing Now
            </Button>
          </Link>
          <Link href="/tester/signup">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto h-14 px-8 text-base bg-white/5 hover:bg-white/10 border-white/10">
              Become a Tester
            </Button>
          </Link>
        </div>

        {/* Dashboard Preview / Mockup */}
        <div className="relative mx-auto max-w-4xl group">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/20 to-purple-500/20 blur-3xl rounded-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-500" />
          <Card variant="glass" className="relative p-2 md:p-3 rounded-[24px] border-white/10 shadow-2xl">
            <div className="rounded-[16px] overflow-hidden bg-[#0a0a0a] border border-white/5 shadow-inner">
              <div className="h-12 bg-[#111] border-b border-white/5 flex items-center px-4 gap-4">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                  <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-4 py-1.5 rounded-md bg-white/5 text-xs text-gray-400 font-mono flex items-center gap-2">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    usertest.com/dashboard
                  </div>
                </div>
                <div className="w-12" />
              </div>
              
              <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 text-left bg-gradient-to-b from-[#111] to-[#0a0a0a]">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">Test Login Flow</h3>
                    <span className="px-2.5 py-1 rounded-md bg-yellow-500/10 text-yellow-500 text-xs font-medium border border-yellow-500/20">In Review</span>
                  </div>
                  <div className="aspect-video bg-[#0a0a0a] rounded-xl border border-white/10 relative overflow-hidden shadow-lg">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 z-20 flex items-center gap-4">
                      <button className="text-white hover:text-blue-400 transition">▶</button>
                      <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                        <div className="w-1/3 h-full bg-blue-500 rounded-full" />
                      </div>
                      <span className="text-xs font-mono text-gray-300">2:14 / 5:30</span>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <div className="w-14 h-14 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center backdrop-blur-md border border-blue-500/30 cursor-pointer hover:bg-blue-500/30 hover:scale-110 transition-all">
                        <Play className="w-6 h-6 ml-1" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full md:w-72 space-y-4">
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500" />
                      <div>
                        <div className="text-sm font-medium">Alex Tester</div>
                        <div className="text-xs text-gray-500">Verified User</div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-300 leading-relaxed italic">
                      "The login form was clear, but I struggled to find the password reset option on mobile."
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 backdrop-blur-sm text-center">
                      <div className="text-xs text-gray-500 mb-1">Payment</div>
                      <div className="text-lg font-semibold text-green-400">$25</div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 backdrop-blur-sm text-center flex flex-col justify-center">
                      <div className="text-xs text-gray-500 mb-1">Action</div>
                      <div className="text-green-500 font-medium cursor-pointer hover:text-green-400">Approve</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>

      {/* Trust Section */}
      <FadeIn delay={0}>
      <section className="py-16 border-t border-b border-white/5 bg-[#111111]/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-sm text-gray-500 uppercase tracking-widest font-medium mb-8">Over 50+ Product Teams Trust Us</p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Fake company placeholders */}
            <h3 className="text-2xl font-bold tracking-tighter">AcmeCorp</h3>
            <h3 className="text-2xl font-bold tracking-tighter">Globex</h3>
            <h3 className="text-2xl font-bold tracking-tighter">Soylent</h3>
            <h3 className="text-2xl font-bold tracking-tighter">Initech</h3>
            <h3 className="text-2xl font-bold tracking-tighter">Umbrella</h3>
          </div>
        </div>
      </section>
      </FadeIn>

      {/* Features / Benefits */}
      <section id="features" className="py-24 max-w-6xl mx-auto px-6 relative">
        <FadeIn delay={0}>
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-sm font-medium mb-4 border border-purple-500/20">Benefits</div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">The Key Benefits for Your Product</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">Discover how authentic user testing enhances conversion rates and drives product growth.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
          {[
            {
              icon: <Users className="w-6 h-6 text-blue-400" />,
              title: "Authentic Users",
              desc: "Get feedback from real people matching your exact target demographics, not professional QA testers."
            },
            {
              icon: <Play className="w-6 h-6 text-purple-400" />,
              title: "Rich Video Context",
              desc: "Don't just see clicks. Hear user frustration or delight in real-time as they navigate your platform."
            },
            {
              icon: <Zap className="w-6 h-6 text-yellow-400" />,
              title: "Lightning Fast",
              desc: "Launch a test and start receiving actionable video feedback in as little as 2 hours."
            },
            {
              icon: <Shield className="w-6 h-6 text-green-400" />,
              title: "Verified Quality",
              desc: "Every tester is vetted. You only pay for tests that meet your strict quality guidelines."
            }
          ].map((feat, i) => (
            <FadeIn key={i} delay={i * 80}>
            <Card variant="glass" className="p-8 border-white/5 bg-[#1a1a1a]/60 hover:bg-[#1a1a1a]/80 transition-colors flex flex-col h-full">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 border border-white/10 shrink-0">
                {feat.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{feat.title}</h3>
              <p className="text-gray-400 leading-relaxed">{feat.desc}</p>
            </Card>
            </FadeIn>
          ))}
        </div>
        </FadeIn>
      </section>

      {/* Process Section */}
      <section id="process" className="py-24 bg-[#111111]/50 border-t border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn delay={0}>
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-sm font-medium mb-4 border border-blue-500/20">Our Process</div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Our Simple, Smart Process</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">We streamline usability testing so you can focus on building.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "Step 1", title: "Create Task", desc: "Define your URL, target audience, and specific tasks." },
              { step: "Step 2", title: "Testers Engage", desc: "Matching testers record their screens and voiceover." },
              { step: "Step 3", title: "Review Insights", desc: "Watch the sessions and identify UX bottlenecks." },
              { step: "Step 4", title: "Improve UX", desc: "Implement fixes and watch your conversion rates soar." }
            ].map((p, i) => (
              <FadeIn key={i} delay={i * 100}>
              <div className="relative">
                <div className="text-blue-500 text-sm font-bold mb-2 tracking-wider">{p.step}</div>
                <h3 className="text-xl font-semibold mb-2">{p.title}</h3>
                <p className="text-gray-400 text-sm">{p.desc}</p>
                {i !== 3 && <ArrowRight className="hidden md:block absolute top-10 -right-6 text-white/10 w-8 h-8" />}
              </div>
              </FadeIn>
            ))}
          </div>
          </FadeIn>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 max-w-6xl mx-auto px-6">
        <FadeIn delay={0}>
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Why Businesses Love Us</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: "Sarah Jenkins", role: "Product Manager", quote: "UserTest transformed our checkout flow. We found a critical mobile bug that analytics couldn't explain." },
            { name: "David Chen", role: "Founder", quote: "Seeing real people interact with our MVP saved us months of building the wrong features. Priceless." },
            { name: "Elena Rostova", role: "UX Designer", quote: "The quality of the video feedback is incredible. It's like having a user testing lab in my browser." }
          ].map((t, i) => (
            <FadeIn key={i} delay={i * 80}>
            <Card variant="glass" className="p-8 border-white/5 bg-gradient-to-br from-[#1a1a1a]/80 to-[#0a0a0a]">
              <div className="flex text-yellow-500 mb-6">
                {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-current" />)}
              </div>
              <p className="text-gray-300 italic mb-6">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/30" />
                <div>
                  <div className="font-semibold text-sm">{t.name}</div>
                  <div className="text-xs text-gray-500">{t.role}</div>
                </div>
              </div>
            </Card>
            </FadeIn>
          ))}
        </div>
        </FadeIn>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-[#111111]/50 border-t border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn delay={0}>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">The Best Insights, at the Right Price</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Choose a plan that fits your testing frequency.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter */}
            <FadeIn delay={100}>
            <Card variant="glass" className="p-8 border-white/5 bg-[#0a0a0a]">
              <h3 className="text-xl font-semibold mb-2">Pay-As-You-Go</h3>
              <div className="mb-6"><span className="text-4xl font-bold">$30</span> <span className="text-gray-500">/ test</span></div>
              <p className="text-sm text-gray-400 mb-6">Perfect for startups doing occasional sanity checks.</p>
              <Button className="w-full mb-8 bg-white/5 hover:bg-white/10 text-white border border-white/10">Get Started</Button>
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-500" /> Basic demographics</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-500" /> 5-minute videos</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-500" /> Standard support</li>
              </ul>
            </Card>
            </FadeIn>

            {/* Pro */}
            <FadeIn delay={180}>
            <Card variant="glass" className="p-8 border-blue-500/30 bg-gradient-to-b from-blue-900/10 to-[#0a0a0a] relative transform md:-translate-y-4 shadow-[0_0_30px_rgba(59,130,246,0.15)]">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold tracking-wide">POPULAR</div>
              <h3 className="text-xl font-semibold mb-2">Professional</h3>
              <div className="mb-6"><span className="text-4xl font-bold">$499</span> <span className="text-gray-500">/ month</span></div>
              <p className="text-sm text-gray-400 mb-6">For product teams running continuous discovery.</p>
              <Button className="w-full mb-8 bg-blue-600 hover:bg-blue-700">Choose Professional</Button>
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-500" /> 20 tests included / month</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-500" /> Advanced targeting criteria</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-500" /> 15-minute videos</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-500" /> Priority review</li>
              </ul>
            </Card>
            </FadeIn>

            {/* Enterprise */}
            <FadeIn delay={260}>
            <Card variant="glass" className="p-8 border-white/5 bg-[#0a0a0a]">
              <h3 className="text-xl font-semibold mb-2">Enterprise</h3>
              <div className="mb-6"><span className="text-4xl font-bold">Custom</span></div>
              <p className="text-sm text-gray-400 mb-6">Unlimited scale for large organizations and agencies.</p>
              <Button className="w-full mb-8 bg-white/5 hover:bg-white/10 text-white border border-white/10">Contact Sales</Button>
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-500" /> Unlimited testing</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-500" /> Dedicated account manager</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-500" /> Custom integration hooks</li>
              </ul>
            </Card>
            </FadeIn>
          </div>
          </FadeIn>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-24 max-w-3xl mx-auto px-6">
        <FadeIn delay={0}>
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Got Questions?</h2>
        </div>
        <div className="space-y-4">
          {[
            { q: "How fast do I get results?", a: "Typically within 2-4 hours, depending on how specific your demographic requirements are." },
            { q: "Can I screen testers beforehand?", a: "Yes, on Pro and Enterprise plans you can add screener questions to ensure exact matches." },
            { q: "What if a video is low quality?", a: "We have a 100% satisfaction guarantee. If a tester doesn't follow instructions or the audio is bad, we replace it for free." }
          ].map((faq, i) => (
            <FadeIn key={i} delay={i * 60}>
            <div className="p-6 border border-white/5 rounded-2xl bg-[#1a1a1a]/30">
              <h4 className="flex items-center gap-3 font-semibold text-lg mb-2"><HelpCircle className="w-5 h-5 text-blue-500" /> {faq.q}</h4>
              <p className="text-gray-400 pl-8">{faq.a}</p>
            </div>
            </FadeIn>
          ))}
        </div>
        </FadeIn>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#0a0a0a] pt-16 pb-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="font-bold text-white text-[10px]">UT</span>
                </div>
                <span className="text-lg font-semibold tracking-tight">UserTest</span>
              </div>
              <p className="text-gray-400 text-sm max-w-sm mb-6">
                Automate smarter, optimize faster, and build products your users actually love.
              </p>
              <div className="flex gap-2 max-w-sm">
                <input type="email" placeholder="name@email.com" className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-lg px-4 text-sm focus:outline-none focus:border-blue-500" />
                <Button variant="primary" size="sm" className="bg-blue-600 hover:bg-blue-700">Subscribe</Button>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#features" className="hover:text-white transition">Features</Link></li>
                <li><Link href="#process" className="hover:text-white transition">Process</Link></li>
                <li><Link href="#pricing" className="hover:text-white transition">Pricing</Link></li>
                <li><Link href="/tester/signup" className="hover:text-white transition">Become a Tester</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Socials</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition">Twitter</a></li>
                <li><a href="#" className="hover:text-white transition">LinkedIn</a></li>
                <li><a href="#" className="hover:text-white transition">Instagram</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
            <div>© 2026 UserTest Inc. All rights reserved.</div>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white">Privacy Policy</a>
              <a href="#" className="hover:text-white">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
