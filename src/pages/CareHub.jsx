
import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Users, BrainCircuit, Shield, Smartphone, AlertTriangle, CheckCircle, ExternalLink, ShieldCheck } from 'lucide-react';
import LocalResourceFinder from "@/components/resources/LocalResourceFinder";
import { motion } from "framer-motion";

const ServiceCard = ({ to, icon, title, description, callToAction, gradient }) => {
  const Icon = icon;
  return (
    <Link to={to}>
      <motion.div
        whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
        className="h-full"
      >
        <Card className="group bg-white/60 backdrop-blur-sm border-0 shadow-lg hover:bg-white/80 transition-all duration-300 cursor-pointer h-full">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 ${gradient} rounded-2xl flex items-center justify-center shadow-lg`}>
                <Icon className="w-8 h-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-gray-800">{title}</CardTitle>
                <p className="text-gray-600 text-sm">{description}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-blue-600 font-semibold group-hover:text-blue-700 transition-colors">
              {callToAction} <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
};

const ResourceLink = ({ href, title, description, isSpecial = false }) => (
  <a 
    href={href} 
    target="_blank" 
    rel="noopener noreferrer" 
    className={`flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group ${isSpecial ? "border-2 border-orange-200 bg-orange-50/50" : ""}`}
  >
    <div>
      <strong className="text-gray-800 flex items-center gap-2">
        {title}
        {isSpecial && <Badge className="bg-orange-500 text-white text-xs">Mandatory Option</Badge>}
      </strong>
      <p className="text-xs text-gray-600">{description}</p>
    </div>
    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
  </a>
);

export default function CareHub() {
  return (
    <div className="min-h-screen p-4 sm:p-6 bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-100">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-sm rounded-full border border-blue-200 mb-4">
            <Shield className="w-5 h-5 text-blue-700" />
            <span className="text-sm font-medium text-blue-800">Helper33 Care & Tools Hub</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 mb-2">Your Support Ecosystem</h1>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Find trusted services, discover helpful tools, and access essential community resources—all in one place.
          </p>
        </div>

        <Tabs defaultValue="services" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-white/60 backdrop-blur-sm p-1 rounded-xl shadow-inner">
            <TabsTrigger value="services">Find Services & Tools</TabsTrigger>
            <TabsTrigger value="resources">Community Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="services" className="space-y-12">
            {/* Main Navigation Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <ServiceCard
                to={createPageUrl('FindCare')}
                icon={Users}
                title="Home Services"
                description="Trusted help for home & family"
                callToAction="Find Providers"
                gradient="bg-gradient-to-br from-sky-500 to-blue-500"
              />
              <ServiceCard
                to={createPageUrl('FindConsultants')}
                icon={BrainCircuit}
                title="AI & Business"
                description="Custom strategies for success"
                callToAction="Find Consultants"
                gradient="bg-gradient-to-br from-indigo-500 to-purple-500"
              />
              <ServiceCard
                to={createPageUrl('AppSearch')}
                icon={Smartphone}
                title="App Discovery"
                description="Verified tools for any task"
                callToAction="Find Tools"
                gradient="bg-gradient-to-br from-cyan-500 to-teal-500"
              />
            </div>
            
            {/* Join Section */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <div className="p-8 grid md:grid-cols-2 gap-8 items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Join Our Network of Professionals</h2>
                        <p className="text-gray-600">Are you a caregiver or an expert consultant? Partner with us to connect with families and businesses seeking your skills.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-end">
                        <Button asChild size="lg" variant="outline" className="bg-white/80 hover:bg-white">
                            <Link to={createPageUrl('BecomeACaregiver')}>
                                <Users className="w-4 h-4 mr-2" />
                                Become a Provider
                            </Link>
                        </Button>
                        <Button asChild size="lg" variant="outline" className="bg-white/80 hover:bg-white">
                             <Link to={createPageUrl('BecomeAConsultant')}>
                                <BrainCircuit className="w-4 h-4 mr-2" />
                                Become a Consultant
                            </Link>
                        </Button>
                    </div>
                </div>
            </Card>
          </TabsContent>

          <TabsContent value="resources" className="space-y-8">
            {/* Local Resource Finder */}
            <LocalResourceFinder />

            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-blue-600" />
                  Protecting Yourself During Grief
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert className="bg-amber-100 border-amber-200 text-amber-900">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <AlertDescription>
                    <strong>Heads Up:</strong> Grieving individuals are often targeted by unethical professionals. Always seek second opinions on major decisions and never sign anything under pressure.
                  </AlertDescription>
                </Alert>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-800 text-lg flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      Red Flags to Watch For
                    </h3>
                    <ul className="space-y-3 text-gray-700">
                      {[
                        "Pressure to sign immediately",
                        "Requests for large upfront payments",
                        "Unwillingness to provide references",
                        "Vague explanations of fees",
                        "Discouraging second opinions",
                        "Excessive or unexpected legal fees"
                      ].map((flag, i) => (
                        <li key={i} className="flex items-start gap-3 p-2 bg-red-50/50 rounded-lg">
                          <AlertTriangle className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
                          <span>{flag}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-800 text-lg flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      Empowering Questions to Ask
                    </h3>
                    <ul className="space-y-3 text-gray-700">
                      {[
                        "Can you provide a detailed fee breakdown?",
                        "What is your experience with cases like mine?",
                        "Can you provide verifiable client references?",
                        "What is the typical timeline for this process?",
                        "Are you fully licensed and insured?",
                        "Do you offer a written fee agreement?"
                      ].map((question, i) => (
                        <li key={i} className="flex items-start gap-3 p-2 bg-green-50/50 rounded-lg">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                          <span>{question}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-700">
                    <CheckCircle className="w-5 h-5" />
                    Reporting Resources
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  <ResourceLink href="https://www.google.com/search?q=State+Bar+Association+report+lawyer" title="State Bar Associations" description="Report unethical lawyer conduct" />
                  <ResourceLink href="https://www.google.com/search?q=Fee+Arbitration+Board+lawyers" title="Fee Arbitration Board" description="Dispute excessive lawyer fees - required first step" isSpecial={true} />
                  <ResourceLink href="https://www.google.com/search?q=Federal+Trade+Commission+Consumer+Protection" title="Consumer Protection Agencies" description="File complaints about fraudulent practices" />
                  <ResourceLink href="https://www.bbb.org/" title="Better Business Bureau" description="Report business misconduct" />
                  <ResourceLink href="https://www.google.com/search?q=State+Funeral+Regulatory+Board" title="Funeral Regulatory Boards" description="Report funeral home violations" />
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-700">
                    <ShieldCheck className="w-5 h-5" />
                    Support Resources
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  <ResourceLink href="https://www.google.com/search?q=Legal+Aid+Society+near+me" title="Legal Aid Societies" description="Free or low-cost legal assistance" />
                  <ResourceLink href="https://www.google.com/search?q=grief+counseling+near+me" title="Grief Counseling" description="Professional support during difficult times" />
                  <ResourceLink href="https://www.google.com/search?q=elder+abuse+hotline" title="Elder Abuse Hotlines" description="Protection for vulnerable adults" />
                  <ResourceLink href="https://www.google.com/search?q=non-profit+financial+counseling" title="Financial Counseling" description="Help with estate and financial decisions" />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
