import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Vote, Shield, BarChart3, Users, CheckCircle2, Clock, ArrowRight, Zap } from "lucide-react";
import heroImage from "@/assets/voting-hero.jpg";

const Index = () => {
  const features = [
    {
      icon: <Vote className="w-6 h-6" />,
      title: "Secure Voting",
      description: "Advanced security measures ensure every vote is protected and authentic"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Real-time Results",
      description: "Watch results update live as votes are cast with beautiful visualizations"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Multi-participant",
      description: "Support for unlimited participants with role-based access control"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Instant Setup",
      description: "Create polls and elections in minutes with our intuitive interface"
    }
  ];

  const stats = [
    { value: "10K+", label: "Votes Cast", icon: <Vote className="w-5 h-5" /> },
    { value: "500+", label: "Active Polls", icon: <BarChart3 className="w-5 h-5" /> },
    { value: "99.9%", label: "Uptime", icon: <Shield className="w-5 h-5" /> },
    { value: "50+", label: "Organizations", icon: <Users className="w-5 h-5" /> }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                <Vote className="w-6 h-6 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold">VotePro</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="hero">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 lg:py-32 gradient-card">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-primary-light text-primary border-primary/20">
                  Trusted by 50+ Organizations
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                  Modern
                  <span className="text-primary"> Voting </span>
                  Made Simple
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Create secure polls, conduct transparent elections, and visualize results in real-time. 
                  The most trusted online voting platform for organizations worldwide.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/dashboard">
                  <Button variant="hero" size="lg" className="gap-3 text-lg px-8">
                    Start Voting Now
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="text-lg px-8">
                  <Shield className="w-5 h-5 mr-2" />
                  Learn About Security
                </Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center space-y-2">
                    <div className="text-2xl font-bold text-primary">{stat.value}</div>
                    <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                      {stat.icon}
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-large">
                <img 
                  src={heroImage} 
                  alt="Modern voting interface showing secure ballot casting"
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-success text-success-foreground rounded-full p-3 shadow-medium">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-warning text-warning-foreground rounded-full p-3 shadow-medium">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold">Why Choose VotePro?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built for the modern world with enterprise-grade security and intuitive design
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="gradient-card shadow-medium hover:shadow-large transition-all duration-300 border-0">
                <CardHeader className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center mx-auto text-primary">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-primary-foreground">
              Ready to Transform Your Voting Process?
            </h2>
            <p className="text-xl text-primary-foreground/80">
              Join thousands of organizations using VotePro for secure, transparent voting. 
              Get started in minutes with our intuitive platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/dashboard">
                <Button variant="secondary" size="lg" className="text-lg px-8 gap-3">
                  <Vote className="w-5 h-5" />
                  Create Your First Poll
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="text-lg px-8 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
                Schedule Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Vote className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-secondary-foreground">VotePro</span>
            </div>
            
            <div className="text-center text-secondary-foreground/60">
              <p>&copy; 2024 VotePro. Empowering democratic decision-making.</p>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="text-secondary-foreground/60 hover:text-secondary-foreground">
                Privacy
              </Button>
              <Button variant="ghost" size="sm" className="text-secondary-foreground/60 hover:text-secondary-foreground">
                Terms
              </Button>
              <Button variant="ghost" size="sm" className="text-secondary-foreground/60 hover:text-secondary-foreground">
                Support
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;