import Link from 'next/link'
import Spline from '@splinetool/react-spline/next'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowRight, BookOpen, Volume2, Lightbulb, Accessibility, Hand } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* ═══════════════════════════════════════
          SPLINE 3D BACKGROUND
          ═══════════════════════════════════════ */}
      <div className="fixed inset-0 z-0">
        <Spline
          scene="https://prod.spline.design/LY6ZPpaKX1xNtXyS/scene.splinecode"
          style={{ width: '100%', height: '100%' }}
        />
        {/* Cover block over watermark area (backup) */}
        <div
          className="absolute bottom-0 right-0 z-10"
          style={{
            width: '200px',
            height: '50px',
            background: 'linear-gradient(135deg, rgba(10,20,30,0.95), rgba(10,25,35,0.95))',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* ═══════════════════════════════════════
          PAGE CONTENT (above background)
          ═══════════════════════════════════════ */}
      <div className="relative z-[2]">
        {/* Navigation */}
        <nav className="flex items-center justify-between p-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center shadow-lg shadow-green-600/30">
              <Accessibility className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl text-white drop-shadow-lg">Synapto</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button
                variant="outline"
                className="border-white/20 bg-white/5 text-white backdrop-blur-sm hover:bg-white/10 hover:text-white"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button className="bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-600/30">
                Get Started
              </Button>
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="max-w-6xl mx-auto px-6 py-20 lg:py-32">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 backdrop-blur-sm mb-4">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs font-medium text-green-200">AI-Powered Inclusive Education</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold text-white text-balance leading-tight drop-shadow-lg">
                Education for{' '}
                <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  Everyone
                </span>
              </h1>
              <p className="text-lg lg:text-xl text-white/70 max-w-2xl mx-auto text-balance leading-relaxed">
                Synapto makes learning accessible to all. AI-powered Sign Language translation, audio descriptions, simplified text, and more.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-xl shadow-green-600/25 px-8 py-6 text-base"
                >
                  Try Demo <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 bg-white/5 text-white backdrop-blur-sm hover:bg-white/10 hover:text-white px-8 py-6 text-base"
                >
                  Sign Up for Free
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-bold text-white mb-12 text-center drop-shadow-lg">
            Accessibility Features
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Sign Language Avatar */}
            <Card
              className="p-6 border-white/10 hover:border-green-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-green-500/10"
              style={{
                background: 'rgba(10,20,15,0.6)',
                backdropFilter: 'blur(16px)',
              }}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-green-500/15 flex items-center justify-center flex-shrink-0 border border-green-500/20">
                  <Hand className="w-6 h-6 text-green-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2">3D Sign Language Avatar</h3>
                  <p className="text-white/50">Real-time ASL & ISL translation with a 3D digital interpreter — lip sync, facial expressions, and emotional AI.</p>
                </div>
              </div>
            </Card>

            {/* Audio Narratives */}
            <Card
              className="p-6 border-white/10 hover:border-emerald-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10"
              style={{
                background: 'rgba(10,20,15,0.6)',
                backdropFilter: 'blur(16px)',
              }}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-emerald-500/15 flex items-center justify-center flex-shrink-0 border border-emerald-500/20">
                  <Volume2 className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2">Audio Narratives</h3>
                  <p className="text-white/50">AI-generated audio descriptions for images, diagrams, and visual content for blind and low-vision users.</p>
                </div>
              </div>
            </Card>

            {/* Language Leveler */}
            <Card
              className="p-6 border-white/10 hover:border-teal-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-teal-500/10"
              style={{
                background: 'rgba(10,20,15,0.6)',
                backdropFilter: 'blur(16px)',
              }}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-teal-500/15 flex items-center justify-center flex-shrink-0 border border-teal-500/20">
                  <Lightbulb className="w-6 h-6 text-teal-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2">Language Leveler</h3>
                  <p className="text-white/50">Automatically simplifies complex academic text while preserving meaning for all reading levels.</p>
                </div>
              </div>
            </Card>

            {/* Focus Mode */}
            <Card
              className="p-6 border-white/10 hover:border-green-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-green-500/10"
              style={{
                background: 'rgba(10,20,15,0.6)',
                backdropFilter: 'blur(16px)',
              }}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-green-500/15 flex items-center justify-center flex-shrink-0 border border-green-500/20">
                  <BookOpen className="w-6 h-6 text-green-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2">Focus Mode</h3>
                  <p className="text-white/50">Distraction-free interface with customizable text size, contrast, and spacing for neurodivergent learners.</p>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-6xl mx-auto px-6 py-16">
          <div
            className="p-12 rounded-2xl border border-green-500/20"
            style={{
              background: 'linear-gradient(135deg, rgba(34,197,94,0.08), rgba(16,185,129,0.04))',
              backdropFilter: 'blur(16px)',
            }}
          >
            <div className="text-center space-y-6">
              <h2 className="text-3xl font-bold text-white">Ready to transform your learning?</h2>
              <p className="text-lg text-white/60">Join students and educators using Synapto to make education truly inclusive.</p>
              <Link href="/auth/sign-up">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-xl shadow-green-600/25"
                >
                  Create Free Account
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 mt-20 py-12">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center text-sm text-white/40">
              <p>Synapto - Making Education Accessible for Everyone</p>
              <p className="mt-2">Built for the 2026 Inclusive Tech Hackathon</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
