import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { ExternalLink, Linkedin, Mail, MessageSquare, Play, ArrowUpRight, CheckCircle2, AlertCircle } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import SplitType from 'split-type';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.8 }
};

const CustomCursor = () => {
  const mainCursor = useRef<HTMLDivElement>(null);
  const follower = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      if (mainCursor.current && follower.current) {
        gsap.to(mainCursor.current, {
          x: clientX,
          y: clientY,
          duration: 0.1,
          ease: "power2.out"
        });
        gsap.to(follower.current, {
          x: clientX,
          y: clientY,
          duration: 0.3,
          ease: "power2.out"
        });
      }
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a') || target.closest('button') || target.closest('.interactive')) {
        document.body.classList.add('cursor-hover');
      } else {
        document.body.classList.remove('cursor-hover');
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseover', onMouseOver);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', onMouseOver);
    };
  }, []);

  return (
    <>
      <div ref={mainCursor} className="custom-cursor" />
      <div ref={follower} className="cursor-follower" />
    </>
  );
};

const Preloader = () => {
  const preloaderRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // Initial state
      gsap.set(".preloader-text span", { y: "110%" });

      // 1. Counter & Bar animation (Longer, with steps for a "random" feel)
      const obj = { value: 0 };
      tl.to(obj, {
        value: 100,
        duration: 3.5,
        ease: "power2.inOut",
        onUpdate: () => {
          if (counterRef.current) {
            counterRef.current.innerText = Math.floor(obj.value).toString().padStart(3, '0');
          }
          if (barRef.current) {
            barRef.current.style.width = `${obj.value}%`;
          }
        }
      });

      // 2. Letter reveal (staggered during the count)
      tl.to(".preloader-text span", {
        y: "0%",
        duration: 1,
        stagger: 0.1,
        ease: "power4.out"
      }, "-=2.5");

      // 3. Final exit
      tl.to(".preloader-content, .preloader-counter, .preloader-bar", {
        opacity: 0,
        y: -20,
        duration: 0.5,
        ease: "power2.in"
      }, "+=0.2");

      tl.to(panelRef.current, {
        yPercent: -100,
        duration: 1.2,
        ease: "power4.inOut"
      });

      tl.set(preloaderRef.current, { display: "none" });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div ref={preloaderRef} className="preloader">
      <div ref={panelRef} className="preloader-panel" />
      <div className="preloader-content">
        <div className="preloader-text">
          {"METEORIC".split("").map((char, i) => (
            <span key={i}>{char}</span>
          ))}
        </div>
      </div>
      <div ref={counterRef} className="preloader-counter">000</div>
      <div ref={barRef} className="preloader-bar" />
    </div>
  );
};

const SectionHeading = ({ children }: { children: React.ReactNode }) => (
  <motion.h2 
    className="paren-label label" 
    style={{ marginBottom: '2rem', color: 'var(--text-primary)' }}
    {...fadeInUp}
  >
    {children}
  </motion.h2>
);

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus('idle');

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: process.env.NEXT_PUBLIC_WEB3FORMS_KEY || 'YOUR_WEB3FORMS_ACCESS_KEY',
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          message: formData.message,
          subject: 'New Inquiry from Meteoric Portfolio',
        }),
      });

      const result = await response.json();
      if (result.success) {
        setStatus('success');
        setFormData({ firstName: '', lastName: '', email: '', message: '' });
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      console.error('Submission error:', err);
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    // Advanced GSAP animations
    const ctx = gsap.context(() => {
      gsap.from(".hero-text span", {
        y: 100,
        opacity: 0,
        stagger: 0.1,
        duration: 1.5,
        ease: "power4.out",
        delay: 5 
      });
      // General Section Reveal (Staggered Fade/Up)
      const revealGroups = gsap.utils.toArray('.reveal-group');
      revealGroups.forEach((group: any) => {
        gsap.from(group.children, {
          scrollTrigger: {
            trigger: group,
            start: "top 85%",
          },
          y: 50,
          opacity: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out"
        });
      });

      // Parallax Images
      const parallaxImgs = gsap.utils.toArray('.parallax-img');
      parallaxImgs.forEach((img: any) => {
        gsap.to(img, {
          scrollTrigger: {
            trigger: img.parentElement,
            start: "top bottom",
            end: "bottom top",
            scrub: true
          },
          y: 50,
          scale: 1.05,
          ease: "none"
        });
      });

      // Philosophy Scrub Text Reveal
      const philosophySplit = new SplitType('.scrub-text', { types: 'words' });
      gsap.from(philosophySplit.words, {
        scrollTrigger: {
          trigger: '.scrub-text',
          start: 'top 80%',
          end: 'bottom 40%',
          scrub: 1,
        },
        opacity: 0.1,
        stagger: 0.05,
        ease: 'none'
      });

    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <main className="container" ref={containerRef}>
      <Preloader />
      <CustomCursor />
      
      {/* Navigation */}
      <header className="sticky-nav" style={{ position: 'fixed', top: 0, left: 0, width: '100%', padding: '1.5rem 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="label" style={{ fontWeight: 900, color: 'var(--text-primary)' }}>(METEORIC)</span>
          <div style={{ display: 'flex', gap: '3rem' }}>
            <a href="#capabilities" className="label interactive">(Capabilities)</a>
            <a href="#works" className="label interactive">(Works)</a>
            <a href="#contact" className="label interactive">(Contact Us)</a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="section" style={{ paddingTop: '12rem' }}>
        <motion.h1 
          className="hero-text"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2 }}
        >
          <motion.span whileHover={{ scale: 1.05, skewX: -5, color: 'var(--accent)' }} transition={{ type: 'spring', stiffness: 300, damping: 10 }} style={{ display: 'inline-block', cursor: 'default' }}>Elevating</motion.span>{' '}
          <motion.span whileHover={{ scale: 1.05, skewX: -5, color: 'var(--accent)' }} transition={{ type: 'spring', stiffness: 300, damping: 10 }} style={{ display: 'inline-block', cursor: 'default' }}>digital</motion.span><br />
          <motion.span whileHover={{ scale: 1.05, skewX: -5, color: 'var(--accent)' }} transition={{ type: 'spring', stiffness: 300, damping: 10 }} style={{ display: 'inline-block', cursor: 'default' }}>architecture</motion.span>{' '}
          <motion.span whileHover={{ scale: 1.05, skewX: -5, color: 'var(--accent)' }} transition={{ type: 'spring', stiffness: 300, damping: 10 }} style={{ display: 'inline-block', cursor: 'default' }}>for</motion.span>{' '}
          <motion.span whileHover={{ scale: 1.05, skewX: -5, color: 'var(--accent)' }} transition={{ type: 'spring', stiffness: 300, damping: 10 }} style={{ display: 'inline-block', cursor: 'default' }}>the</motion.span><br />
          <motion.span whileHover={{ scale: 1.05, skewX: -5, color: 'var(--accent)' }} transition={{ type: 'spring', stiffness: 300, damping: 10 }} style={{ display: 'inline-block', cursor: 'default' }}>modern</motion.span>{' '}
          <motion.span whileHover={{ scale: 1.05, skewX: -5, color: '#1D56CD' }} transition={{ type: 'spring', stiffness: 300, damping: 10 }} style={{ display: 'inline-block', color: 'var(--text-secondary)', cursor: 'default' }}>enterprise.</motion.span>
        </motion.h1>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2.5 }}
        >
          <p className="sub-text" style={{ marginBottom: '3rem' }}>
            Meteoric is a premier digital agency directed by Tanishq Dubey. 
            We specialize in Business Growth Technology, high-performance web development, 
            and AI automation.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            {['Business Growth Technology Setup', 'Website Development', 'AI Automation', 'Video creation & editing', 'Google Ads', 'SEO Optimization'].map((tag) => (
              <span key={tag} className="label interactive" style={{ border: '1px solid rgba(0,0,0,0.1)', padding: '0.4rem 1rem', borderRadius: '100px', transition: 'all 0.3s ease' }}>
                {tag}
              </span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Infinite Marquee Section */}
      <div className="marquee-container">
        <div className="marquee-content">
          {[...Array(6)].map((_, i) => (
            <span key={i} className="marquee-text">
              Providing services that keep your process organized and free from chaos. • 
            </span>
          ))}
        </div>
      </div>

      {/* Capabilities Section */}
      <section id="capabilities" className="section">
        <SectionHeading>Capabilities</SectionHeading>
        <div className="sub-text reveal-text" style={{ maxWidth: '1200px', fontSize: '2.5rem', color: 'var(--text-primary)', fontWeight: 500, lineHeight: 1.3 }}>
          Meteoric delivers enterprise-grade solutions where engineering precision meets modern growth technology. We build scalable digital systems that effortlessly integrate advanced programming architecture with intelligent business automation. From AI-powered infrastructure to conversion-optimized web experiences, every solution is designed to strengthen your online visibility and drive long-term sustainable growth.
        </div>
      </section>

      {/* Work Section - Zonatello */}
      <section id="works" className="section" style={{ paddingTop: '2rem' }}>
        <SectionHeading>Works</SectionHeading>
        <motion.div {...fadeInUp}>
          <div className="works-header">
            <h3 className="works-title" style={{ color: 'var(--accent)' }}>
              Zonatello — <span style={{ color: 'var(--text-secondary)' }}>2026</span>
            </h3>
            <span className="label" style={{ background: 'var(--text-primary)', color: 'var(--bg-color)', padding: '0.5rem 1rem', borderRadius: '4px' }}>Digital Transformation</span>
          </div>

          {/* Video Auto-play */}
          <div style={{ 
            aspectRatio: '16/9', 
            background: '#0a0a0a', 
            borderRadius: '20px', 
            overflow: 'hidden',
            marginBottom: '4rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)'
          }}>
            <video 
              autoPlay
              muted 
              loop 
              playsInline 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            >
              <source src="/images/Zonatello.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

          <div className="responsive-grid">
            <div>
              <p className="label" style={{ marginBottom: '2rem', color: 'var(--accent)' }}>THE BRIEF</p>
              <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                In March 2026, Meteoric spearheaded the digital overhaul for Zonatello, 
                a high-end Neapolitan pizzeria. The project was designed to transition 
                their artisanal physical craft into a dominant digital asset.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
              <div>
                <p className="label" style={{ marginBottom: '1.5rem' }}>FEATURES</p>
                <ul className="sub-text reveal-group" style={{ fontSize: '1rem', listStyle: 'none', padding: 0 }}>
                  <li style={{ marginBottom: '0.5rem' }}>→ Storytelling UI</li>
                  <li style={{ marginBottom: '0.5rem' }}>→ AI Menu System</li>
                  <li style={{ marginBottom: '0.5rem' }}>→ Local SEO Max</li>
                </ul>
              </div>
              <div>
                <p className="label" style={{ marginBottom: '1.5rem' }}>VALUE</p>
                <p style={{ fontSize: '1rem', opacity: 0.7 }}>
                  Established market authority and increased digital engagement by 300%.
                </p>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '4rem' }}>
            <a 
              href="https://zonatello.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="label interactive"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: 700 }}
            >
              LAUNCH PROJECT <ArrowUpRight size={24} />
            </a>
          </div>
        </motion.div>

        {/* Work Section - AI Career Coach */}
        <motion.div {...fadeInUp} style={{ marginTop: '8rem' }}>
          <div className="works-header">
            <h3 className="works-title">
              AI Career Coach — <span style={{ color: 'var(--text-secondary)' }}>2026</span>
            </h3>
            <span className="label" style={{ background: 'var(--text-primary)', color: 'var(--bg-color)', padding: '0.5rem 1rem', borderRadius: '4px' }}>AI Automation</span>
          </div>

          <div style={{ 
            aspectRatio: '16/9', 
            background: '#0a0a0a', 
            borderRadius: '20px', 
            overflow: 'hidden',
            marginBottom: '4rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)'
          }}>
            <video 
              autoPlay
              muted 
              loop 
              playsInline 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            >
              <source src="/images/AI Career Coach.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

          <div className="responsive-grid">
            <div>
              <p className="label" style={{ marginBottom: '2rem', color: 'var(--accent)' }}>THE BRIEF</p>
              <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                An intelligent AI-powered platform designed to provide personalized career coaching, resume analysis, and interview preparation for modern professionals.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
              <div>
                <p className="label" style={{ marginBottom: '1.5rem' }}>FEATURES</p>
                <ul className="sub-text reveal-group" style={{ fontSize: '1rem', listStyle: 'none', padding: 0 }}>
                  <li style={{ marginBottom: '0.5rem' }}>→ AI Resume Analysis</li>
                  <li style={{ marginBottom: '0.5rem' }}>→ Career Path Mapping</li>
                  <li style={{ marginBottom: '0.5rem' }}>→ Mock Interviews</li>
                </ul>
              </div>
              <div>
                <p className="label" style={{ marginBottom: '1.5rem' }}>VALUE</p>
                <p style={{ fontSize: '1rem', opacity: 0.7 }}>
                  Accelerated career growth and improved interview success rates by 200%.
                </p>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '4rem' }}>
            <a 
              href="https://vertex-ai-one.vercel.app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="label interactive"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: 700 }}
            >
              LAUNCH PROJECT <ArrowUpRight size={24} />
            </a>
          </div>
        </motion.div>

        {/* Work Section - Smart Bookmarks */}
        <motion.div {...fadeInUp} style={{ marginTop: '8rem' }}>
          <div className="works-header">
            <h3 className="works-title">
              Smart Bookmarks — <span style={{ color: 'var(--text-secondary)' }}>2026</span>
            </h3>
            <span className="label" style={{ background: 'var(--text-primary)', color: 'var(--bg-color)', padding: '0.5rem 1rem', borderRadius: '4px' }}>Web Development</span>
          </div>

          <div style={{ 
            aspectRatio: '16/9', 
            background: '#0a0a0a', 
            borderRadius: '20px', 
            overflow: 'hidden',
            marginBottom: '4rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)'
          }}>
            <video 
              autoPlay
              muted 
              loop 
              playsInline 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            >
              <source src="/images/Smart Bookmarks.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

          <div className="responsive-grid">
            <div>
              <p className="label" style={{ marginBottom: '2rem', color: 'var(--accent)' }}>THE BRIEF</p>
              <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                A visually stunning, modern bookmarking application designed with an organic aesthetic. It allows users to smartly organize, categorize, and access their favorite web resources.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
              <div>
                <p className="label" style={{ marginBottom: '1.5rem' }}>FEATURES</p>
                <ul className="sub-text reveal-group" style={{ fontSize: '1rem', listStyle: 'none', padding: 0 }}>
                  <li style={{ marginBottom: '0.5rem' }}>→ Organic Modern UI</li>
                  <li style={{ marginBottom: '0.5rem' }}>→ Smart Categorization</li>
                  <li style={{ marginBottom: '0.5rem' }}>→ Fast Search Integration</li>
                </ul>
              </div>
              <div>
                <p className="label" style={{ marginBottom: '1.5rem' }}>VALUE</p>
                <p style={{ fontSize: '1rem', opacity: 0.7 }}>
                  Streamlined digital organization and enhanced daily workflow efficiency.
                </p>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '4rem' }}>
            <a 
              href="https://smart-bookmarks-main-three.vercel.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="label interactive"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: 700 }}
            >
              LAUNCH PROJECT <ArrowUpRight size={24} />
            </a>
          </div>
        </motion.div>
      </section>


      {/* Philosophy Section */}
      <section className="section" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center' }}>
        <h3 className="hero-text scrub-text" style={{ fontSize: 'clamp(3rem, 7vw, 6rem)', letterSpacing: '-0.04em', lineHeight: 1.1, maxWidth: '1400px' }}>
          "Delivering precision-engineered growth through digital excellence."
        </h3>
      </section>

      {/* Contact Section */}
      <section id="contact" className="section">
        <motion.h1 
          className="hero-text" 
          style={{ marginBottom: '6rem', letterSpacing: '-0.04em' }}
          {...fadeInUp}
        >
          Let's <span style={{ color: 'var(--accent)' }}>Connect</span>
        </motion.h1>

        <div className="contact-layout">
          <div>
            <div style={{ marginBottom: '4rem' }}>
              <p className="label" style={{ marginBottom: '1.5rem', color: 'var(--accent)' }}>Email & Inquiries</p>
              <a href="mailto:meteoric.works@gmail.com" className="sub-text interactive" style={{ fontSize: '1.4rem', textDecoration: 'none', fontWeight: 600 }}>
                meteoric.works@gmail.com
              </a>
            </div>
            
            <div style={{ marginBottom: '4rem' }}>
              <p className="label" style={{ marginBottom: '1.5rem', color: 'var(--accent)' }}>Phone</p>
              <a href="tel:+919109794933" className="sub-text interactive" style={{ fontSize: '1.4rem', textDecoration: 'none', fontWeight: 600 }}>
                +91 9109794933
              </a>
            </div>

            <div>
              <p className="label" style={{ marginBottom: '1.5rem', color: 'var(--accent)' }}>Location</p>
              <p className="sub-text" style={{ fontSize: '1.4rem', fontWeight: 600 }}>
                Indore, India
              </p>
            </div>
          </div>

          <div className="contact-card-container">
            <div 
              className="contact-card"
              style={{
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(20px)',
                borderRadius: '32px',
                padding: '4rem',
                boxShadow: '0 40px 100px -20px rgba(0, 0, 0, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.5)'
              }}
            >
              <AnimatePresence mode="wait">
                {status === 'success' ? (
                  <motion.div 
                    key="success"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    style={{ textAlign: 'center', padding: '2rem 0' }}
                  >
                    <CheckCircle2 size={64} color="var(--accent)" style={{ marginBottom: '1.5rem', marginInline: 'auto' }} />
                    <h3 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Message Received!</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                      Thank you for reaching out. We've received your inquiry and will get back to you shortly.
                    </p>
                    <button 
                      onClick={() => setStatus('idle')}
                      className="label interactive"
                      style={{ marginTop: '2rem', background: 'transparent', border: '1px solid var(--text-primary)', padding: '0.8rem 2rem', borderRadius: '100px' }}
                    >
                      Send Another Message
                    </button>
                  </motion.div>
                ) : (
                  <motion.form 
                    key="form"
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                      <div className="form-group">
                        <label className="form-label">First Name</label>
                        <input 
                          type="text" 
                          name="firstName"
                          className="input-field interactive" 
                          placeholder="John" 
                          value={formData.firstName}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Last Name</label>
                        <input 
                          type="text" 
                          name="lastName"
                          className="input-field interactive" 
                          placeholder="Doe" 
                          value={formData.lastName}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Email (required)</label>
                      <input 
                        type="email" 
                        name="email"
                        className="input-field interactive" 
                        required 
                        placeholder="john@example.com" 
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Message (required)</label>
                      <textarea 
                        name="message"
                        className="input-field interactive" 
                        rows={4} 
                        required 
                        placeholder="Tell us about your project..." 
                        style={{ resize: 'none' }} 
                        value={formData.message}
                        onChange={handleInputChange}
                      />
                    </div>

                    {status === 'error' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#dc2626', marginBottom: '2rem', fontSize: '0.9rem' }}>
                        <AlertCircle size={16} />
                        <span>Something went wrong. Please try again or email us directly.</span>
                      </div>
                    )}

                    <div style={{ marginTop: '2rem' }}>
                      <button 
                        type="submit" 
                        className="submit-btn interactive" 
                        disabled={isSubmitting}
                        style={{ 
                          background: 'var(--text-primary)', 
                          width: '100%', 
                          borderRadius: '12px',
                          opacity: isSubmitting ? 0.7 : 1,
                          cursor: isSubmitting ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {isSubmitting ? 'Sending...' : 'Submit Inquiry'}
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '8rem 2rem 4rem', background: 'var(--footer-bg)', color: 'var(--footer-text)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '4rem', marginBottom: '6rem' }}>
          <div>
            <span className="label" style={{ fontSize: '1.5rem', marginBottom: '2rem', display: 'block', color: 'var(--footer-text)', fontWeight: 900 }}>(METEORIC)</span>
            <p className="sub-text" style={{ fontSize: '1.1rem', maxWidth: '300px', color: 'var(--footer-text)', opacity: 0.8 }}>
              Strategic digital architecture and AI automation for the modern enterprise.
            </p>
          </div>
          <div>
            <p className="label" style={{ marginBottom: '1.5rem', color: 'var(--footer-text)' }}>Connect</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <a href="#" className="label interactive" style={{ opacity: 0.8, color: 'var(--footer-text)' }}>(LinkedIn)</a>
              <a href="#" className="label interactive" style={{ opacity: 0.8, color: 'var(--footer-text)' }}>(Instagram)</a>
              <a href="#" className="label interactive" style={{ opacity: 0.8, color: 'var(--footer-text)' }}>(GitHub)</a>
            </div>
          </div>
          <div>
            <p className="label" style={{ marginBottom: '1.5rem', color: 'var(--footer-text)' }}>Contact</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <a href="mailto:meteoric.works@gmail.com" className="label interactive" style={{ opacity: 0.8, color: 'var(--footer-text)' }}>meteoric.works@gmail.com</a>
              <a href="tel:+919109794933" className="label interactive" style={{ opacity: 0.8, color: 'var(--footer-text)' }}>+91 9109794933</a>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(254,248,242,0.2)', paddingTop: '4rem' }}>
          <span className="label" style={{ color: 'var(--footer-text)' }}>&copy; 2026 METEORIC DIGITAL AGENCY</span>
          <a href="#" className="label interactive" onClick={(e) => { e.preventDefault(); window.scrollTo({top: 0, behavior: 'smooth'}); }} style={{ color: 'var(--footer-text)' }}>BACK TO TOP ↑</a>
        </div>
      </footer>
    </main>
  );
}
