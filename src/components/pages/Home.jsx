import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Users, Briefcase, Star, TrendingUp, Shield, Zap } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import {
  pageVariants, staggerContainer, cardVariants,
  fadeUp, popIn, viewport
} from '../../lib/animations';

export function Home() {
  const stats = [
    { label: 'Students Registered', value: '50,000+', icon: Users },
    { label: 'Employers Onboarded', value: '2,500+',  icon: Briefcase },
    { label: 'Gigs Posted',          value: '15,000+', icon: TrendingUp },
    { label: 'Success Rate',         value: '94%',     icon: Star },
  ];

  const steps = [
    { number: '01', title: 'Sign Up',       description: 'Create your profile as a student or employer in minutes' },
    { number: '02', title: 'Apply or Post', description: 'Students apply to gigs, employers post opportunities' },
    { number: '03', title: 'Get Hired',     description: 'Connect, collaborate, and complete amazing projects' },
  ];

  const companies = ['Microsoft', 'Google', 'Apple', 'Amazon', 'Meta', 'Netflix', 'Spotify', 'Adobe'];

  const benefits = [
    { icon: Shield, title: 'Verified & Trusted',  description: 'All employers and students are verified for safety and reliability' },
    { icon: Zap,    title: 'Quick Matching',       description: 'AI-powered matching connects you with perfect opportunities instantly' },
    { icon: Star,   title: 'Quality Guaranteed',   description: 'Our rating system ensures high-quality work and fair compensation' },
  ];

  const reviews = [
    { name: 'Sarah Chen',     role: 'Computer Science Student', content: 'GigHive helped me land my first tech internship. The platform is so easy to use!', rating: 5, avatar: 'SC' },
    { name: 'Mike Rodriguez', role: 'Startup Founder',          content: 'Found amazing student talent for our marketing campaign. Highly recommend!',       rating: 5, avatar: 'MR' },
    { name: 'Emma Johnson',   role: 'Design Student',           content: 'Love the credit system and how it gamifies the whole experience. Great platform!',  rating: 5, avatar: 'EJ' },
  ];

  return (
    <motion.div
      className="space-y-20"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div className="space-y-8" variants={staggerContainer} initial="hidden" animate="visible">
              <motion.div className="space-y-4" variants={cardVariants}>
                <Badge variant="secondary" className="w-fit">🚀 The Future of Student Employment</Badge>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  Connect. Work. <br />
                  <span className="text-primary">Grow Together.</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-md">
                  The trusted platform where students find meaningful gig work and employers discover top talent.
                </p>
              </motion.div>
              <motion.div className="flex flex-col sm:flex-row gap-4" variants={cardVariants}>
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <Button size="lg" className="px-8">Get Started</Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <Button variant="outline" size="lg" className="px-8">Watch Demo</Button>
                </motion.div>
              </motion.div>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 40, scale: 0.97 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1], delay: 0.15 }}
            >
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1653669487404-09c3617c2b6c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaXZlcnNlJTIwc3R1ZGVudHMlMjB3b3JraW5nJTIwbGFwdG9wc3xlbnwxfHx8fDE3NTc2MDQ1NTV8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Students working together"
                className="rounded-2xl shadow-2xl w-full h-96 object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-muted py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="grid grid-cols-2 lg:grid-cols-4 gap-8" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={viewport}>
            {stats.map((stat, index) => (
              <motion.div key={index} variants={cardVariants}>
                <motion.div whileHover={{ y: -4, boxShadow: '0 16px 32px rgba(0,0,0,0.08)' }} transition={{ type: 'spring', stiffness: 300 }}>
                  <Card className="text-center">
                    <CardContent className="p-6 space-y-4">
                      <stat.icon className="w-8 h-8 mx-auto text-primary" />
                      <div className="space-y-1">
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <div className="text-sm text-muted-foreground">{stat.label}</div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div className="text-center space-y-4 mb-16" variants={fadeUp} initial="initial" whileInView="animate" viewport={viewport}>
          <h2 className="text-3xl md:text-4xl font-bold">How GigHive Works</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Getting started is simple. Follow these three easy steps to begin your journey.</p>
        </motion.div>
        <motion.div className="grid md:grid-cols-3 gap-8" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={viewport}>
          {steps.map((step, index) => (
            <motion.div key={index} variants={cardVariants} className="relative" whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 300 }}>
              <Card>
                <CardContent className="p-8 text-center space-y-4">
                  <motion.div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto text-lg font-bold" variants={popIn}>
                    {step.number}
                  </motion.div>
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </CardContent>
                {index < steps.length - 1 && <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-border" />}
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Companies ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div className="text-center space-y-8" variants={fadeUp} initial="initial" whileInView="animate" viewport={viewport}>
          <h2 className="text-2xl font-semibold">Trusted by Leading Companies</h2>
          <motion.div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-8 items-center" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={viewport}>
            {companies.map((company) => (
              <motion.div key={company} className="text-center" variants={cardVariants} whileHover={{ scale: 1.08 }} transition={{ type: 'spring', stiffness: 400 }}>
                <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto">
                  <span className="font-semibold text-muted-foreground text-sm">{company.slice(0, 3).toUpperCase()}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{company}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── Benefits ── */}
      <section className="bg-muted py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center space-y-4 mb-16" variants={fadeUp} initial="initial" whileInView="animate" viewport={viewport}>
            <h2 className="text-3xl md:text-4xl font-bold">Why Choose GigHive?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">We're not just another job board. We're your partner in building successful careers.</p>
          </motion.div>
          <motion.div className="grid md:grid-cols-3 gap-8" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={viewport}>
            {benefits.map((benefit, index) => (
              <motion.div key={index} variants={cardVariants}
                whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(0,0,0,0.10)' }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Card>
                  <CardContent className="p-8 text-center space-y-4">
                    <motion.div whileHover={{ rotate: [0, -8, 8, 0] }} transition={{ duration: 0.4 }}>
                      <benefit.icon className="w-12 h-12 mx-auto text-primary" />
                    </motion.div>
                    <h3 className="text-xl font-semibold">{benefit.title}</h3>
                    <p className="text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Reviews ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div className="text-center space-y-4 mb-16" variants={fadeUp} initial="initial" whileInView="animate" viewport={viewport}>
          <h2 className="text-3xl md:text-4xl font-bold">What Our Community Says</h2>
          <p className="text-xl text-muted-foreground">Real stories from students and employers who found success on GigHive.</p>
        </motion.div>
        <motion.div className="grid md:grid-cols-3 gap-8" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={viewport}>
          {reviews.map((review, index) => (
            <motion.div key={index} variants={cardVariants} whileHover={{ y: -4, boxShadow: '0 16px 36px rgba(0,0,0,0.08)' }} transition={{ type: 'spring', stiffness: 300 }}>
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center space-x-1">
                    {[...Array(review.rating)].map((_, i) => (
                      <motion.div key={i} initial={{ opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.08, type: 'spring', stiffness: 400 }} viewport={{ once: true }}
                      >
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-muted-foreground">"{review.content}"</p>
                  <div className="flex items-center space-x-3">
                    <motion.div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center" variants={popIn}>
                      <span className="text-sm font-semibold">{review.avatar}</span>
                    </motion.div>
                    <div>
                      <div className="font-semibold">{review.name}</div>
                      <div className="text-sm text-muted-foreground">{review.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── CTA ── */}
      <motion.section className="bg-primary text-white py-20" variants={fadeUp} initial="initial" whileInView="animate" viewport={viewport}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold">Ready to Start Your Journey?</h2>
          <p className="text-xl opacity-90">Join thousands of students and employers who are already building their future on GigHive.</p>
          <motion.div className="flex flex-col sm:flex-row gap-4 justify-center" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={viewport}>
            <motion.div variants={cardVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Button size="lg" variant="secondary" className="px-8">Join as Student</Button>
            </motion.div>
            <motion.div variants={cardVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Button size="lg" variant="outline" className="px-8">Join as Employer</Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>
    </motion.div>
  );
}