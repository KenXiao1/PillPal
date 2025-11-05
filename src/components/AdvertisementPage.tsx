import { Heart, Users, BookOpen, Pill, CheckCircle2, ArrowRight, Shield, BarChart3, Clock } from 'lucide-react';

interface AdvertisementPageProps {
  onGetStarted?: () => void;
}

export function AdvertisementPage({ onGetStarted }: AdvertisementPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Pill className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-blue-600">MediCare</span>
            </div>
            <button
              onClick={onGetStarted}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-green-50 opacity-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Never Miss a Dose Again
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Empower yourself or your loved ones to take control of medication management with intelligent reminders, family support, and evidence-based health education.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={onGetStarted}
                  className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  Start Your Journey <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-4 border-2 border-gray-300 text-gray-900 rounded-lg font-semibold hover:border-blue-600 hover:text-blue-600 transition-colors"
                >
                  Learn More
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-100 to-green-100 rounded-2xl p-8 shadow-2xl">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 bg-white rounded-lg p-4">
                    <Clock className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Smart Reminders</p>
                      <p className="text-sm text-gray-600">Never forget a medication</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-white rounded-lg p-4">
                    <Users className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Family Support</p>
                      <p className="text-sm text-gray-600">Keep loved ones informed</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-white rounded-lg p-4">
                    <BookOpen className="w-6 h-6 text-amber-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Health Education</p>
                      <p className="text-sm text-gray-600">Learn about your condition</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audience & Company Overview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Who We Serve</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Elderly Patients</h3>
                    <p className="text-gray-600">Managing multiple medications with chronic conditions like hypertension and diabetes</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Family Caregivers</h3>
                    <p className="text-gray-600">Adult children and family members supporting aging parents' health management</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Healthcare Providers</h3>
                    <p className="text-gray-600">Clinicians seeking better medication adherence outcomes for their patients</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                MediCare is dedicated to transforming medication management for elderly patients and their families. We believe that proper medication compliance, combined with accessible health education, can dramatically improve health outcomes and quality of life.
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded">
                <p className="text-lg font-semibold text-blue-900 mb-2">Our Values</p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center gap-2"><span className="w-2 h-2 bg-blue-600 rounded-full"></span>Compassion for vulnerable populations</li>
                  <li className="flex items-center gap-2"><span className="w-2 h-2 bg-blue-600 rounded-full"></span>Trust through privacy and security</li>
                  <li className="flex items-center gap-2"><span className="w-2 h-2 bg-blue-600 rounded-full"></span>Empowerment through education</li>
                  <li className="flex items-center gap-2"><span className="w-2 h-2 bg-blue-600 rounded-full"></span>Connection with loved ones</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Emotional Connection */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Heart className="w-16 h-16 mx-auto mb-6 opacity-90" />
          <h2 className="text-4xl font-bold mb-6">Health is Love</h2>
          <p className="text-xl opacity-95 max-w-3xl mx-auto leading-relaxed">
            When you take your medications as prescribed, you're not just managing a condition—you're investing in years with family, pursuing hobbies you love, and living independently. MediCare helps you show up for the people and moments that matter most.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="bg-white bg-opacity-10 rounded-xl p-6 backdrop-blur-sm">
              <p className="text-3xl font-bold mb-2">87%</p>
              <p className="opacity-90">of medication-related problems are preventable</p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-xl p-6 backdrop-blur-sm">
              <p className="text-3xl font-bold mb-2">4x</p>
              <p className="opacity-90">fewer hospital visits with better medication compliance</p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-xl p-6 backdrop-blur-sm">
              <p className="text-3xl font-bold mb-2">1.5M+</p>
              <p className="opacity-90">older adults face medication adherence challenges</p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features - Differentiation */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">What Makes Us Different</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8 border border-blue-200">
              <Shield className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Privacy First</h3>
              <p className="text-gray-700">Your health data is encrypted and only accessible to you and authorized family members. We never share or sell your information.</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-8 border border-green-200">
              <BarChart3 className="w-12 h-12 text-green-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Evidence-Based</h3>
              <p className="text-gray-700">Our health education content is reviewed by medical professionals and based on the latest clinical guidelines.</p>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-8 border border-amber-200">
              <Users className="w-12 h-12 text-amber-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Family Connected</h3>
              <p className="text-gray-700">Invite family caregivers to stay informed and receive alerts, creating a safety net around medication management.</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-8 border border-purple-200">
              <Pill className="w-12 h-12 text-purple-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Reminders</h3>
              <p className="text-gray-700">Customizable notifications adapt to your schedule. Set reminders for complex medication schedules without the overwhelm.</p>
            </div>
            <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl p-8 border border-rose-200">
              <BookOpen className="w-12 h-12 text-rose-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Health Academy</h3>
              <p className="text-gray-700">Learn about your condition, medication interactions, and lifestyle changes with expert-reviewed educational content.</p>
            </div>
            <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-8 border border-teal-200">
              <Heart className="w-12 h-12 text-teal-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Designed for Aging</h3>
              <p className="text-gray-700">Large text, simple navigation, and intuitive design make MediCare accessible for users of all tech comfort levels.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Slogan Section */}
      <section className="py-20 bg-gradient-to-r from-slate-900 to-slate-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl lg:text-6xl font-bold mb-8">
            "Take Control. Stay Connected. Live Fully."
          </h2>
          <p className="text-xl opacity-90 mb-8">
            MediCare empowers you to manage your health with confidence, surrounded by family support and expert guidance.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm text-left">
              <p className="font-semibold mb-1">For Patients</p>
              <p className="text-sm opacity-90">"MediCare gives me peace of mind"</p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm text-left">
              <p className="font-semibold mb-1">For Caregivers</p>
              <p className="text-sm opacity-90">"Now I know Mom is taking her meds"</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl p-12 text-white text-center">
            <h2 className="text-4xl font-bold mb-6">Ready to Take Control?</h2>
            <p className="text-xl opacity-95 mb-8 max-w-2xl mx-auto">
              Join thousands of patients and caregivers who trust MediCare with their medication management and health education.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onGetStarted}
                className="px-8 py-4 bg-white text-blue-600 rounded-lg font-bold hover:bg-gray-50 transition-colors"
              >
                Start Free Trial
              </button>
              <button className="px-8 py-4 border-2 border-white text-white rounded-lg font-bold hover:bg-white hover:bg-opacity-10 transition-colors">
                Schedule a Demo
              </button>
            </div>
            <p className="text-sm opacity-75 mt-6">No credit card required. Free access for 30 days.</p>
          </div>
        </div>
      </section>

      {/* Benefits Details */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">Key Benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">For Patients</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Personalized medication reminders tailored to your schedule</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Track medication adherence and understand patterns</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Access evidence-based health education materials</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Share health progress with trusted family members</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Improved health outcomes through better compliance</span>
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">For Caregivers</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Real-time alerts when doses are taken or missed</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">View your loved one's medication schedule</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Peace of mind knowing medications are managed</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Easy communication about health concerns</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Reduced stress about managing multiple patients</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Pill className="w-6 h-6 text-blue-400" />
                <span className="text-xl font-bold text-white">MediCare</span>
              </div>
              <p className="text-sm">Empowering medication management for healthier lives.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-blue-400 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">HIPAA</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2024 MediCare. All rights reserved. Improving health outcomes one medication at a time.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
