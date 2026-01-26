import { Link } from '@tanstack/react-router'
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  Shield,
  Truck,
  RefreshCw,
  CreditCard,
  Heart,
  Sparkles,
  ChevronRight,
  Globe,
  MessageCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

const footerLinks = {
  shop: [
    { title: 'New Arrivals', href: '/new-arrivals' },
    { title: 'Trending Now', href: '/trending' },
    { title: 'Best Sellers', href: '/best-sellers' },
    { title: 'Sale & Offers', href: '/sale' },
    { title: 'Luxury Collection', href: '/luxury' },
  ],
  categories: [
    { title: "Men's Fashion", href: '/category/mens-fashion' },
    { title: "Women's Fashion", href: '/category/womens-fashion' },
    { title: 'Accessories', href: '/category/accessories' },
    { title: 'Footwear', href: '/category/footwear' },
    { title: 'Watches & Jewelry', href: '/category/jewelry' },
  ],
  company: [
    { title: 'About Us', href: '/about' },
    { title: 'Careers', href: '/careers' },
    { title: 'Press & Media', href: '/press' },
    { title: 'Sustainability', href: '/sustainability' },
    { title: 'Affiliate Program', href: '/affiliate' },
  ],
  support: [
    { title: 'Help Center', href: '/help' },
    { title: 'Shipping Policy', href: '/shipping' },
    { title: 'Returns & Exchanges', href: '/returns' },
    { title: 'Size Guide', href: '/size-guide' },
    { title: 'Contact Us', href: '/contact' },
  ],
}

const features = [
  {
    icon: Truck,
    title: 'Free Shipping',
    description: 'On orders over $50',
    color: 'from-mmp-accent to-mmp-secondary',
  },
  {
    icon: Shield,
    title: 'Secure Payment',
    description: '100% secure & encrypted',
    color: 'from-mmp-primary to-mmp-accent',
  },
  {
    icon: RefreshCw,
    title: 'Easy Returns',
    description: '30-day return policy',
    color: 'from-mmp-secondary to-mmp-accent',
  },
  {
    icon: CreditCard,
    title: 'Flexible Payment',
    description: 'Pay with ease',
    color: 'from-mmp-accent to-mmp-primary',
  },
]

const socialLinks = [
  {
    icon: Facebook,
    href: 'https://facebook.com/fashionket',
    label: 'Facebook',
  },
  { icon: Twitter, href: 'https://twitter.com/fashionket', label: 'Twitter' },
  {
    icon: Instagram,
    href: 'https://instagram.com/fashionket',
    label: 'Instagram',
  },
  { icon: Youtube, href: 'https://youtube.com/fashionket', label: 'YouTube' },
  {
    icon: Linkedin,
    href: 'https://linkedin.com/company/fashionket',
    label: 'LinkedIn',
  },
]

const contactInfo = [
  { icon: Phone, text: '+1 (555) 123-4567', href: 'tel:+15551234567' },
  {
    icon: Mail,
    text: 'support@fashionket.com',
    href: 'mailto:support@fashionket.com',
  },
  {
    icon: MapPin,
    text: '123 Fashion Ave, New York, NY 10001',
    href: 'https://maps.google.com',
  },
]

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-mmp-primary2 text-mmp-neutral">
      {/* Features Banner */}
      <div className="border-b border-mmp-primary/30">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-br from-mmp-primary/5 to-mmp-accent/5 hover:from-mmp-primary/10 hover:to-mmp-accent/10 transition-all"
                >
                  <div
                    className={`p-2 rounded-lg bg-gradient-to-r ${feature.color}`}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{feature.title}</h4>
                    <p className="text-xs text-mmp-neutral/60">
                      {feature.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-4">
            <Link to="/" className="inline-block mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-mmp-accent to-mmp-secondary">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-mmp-neutral via-mmp-secondary to-mmp-accent bg-clip-text text-transparent">
                    FashionKet
                  </h2>
                  <p className="text-xs text-mmp-neutral/60">
                    Redefining Fashion
                  </p>
                </div>
              </div>
            </Link>

            <p className="text-mmp-neutral/70 mb-6 max-w-md">
              Discover premium fashion curated for the modern lifestyle.
              Experience quality, style, and exclusive collections that elevate
              your wardrobe.
            </p>

            {/* Newsletter Subscription */}
            <div className="mb-8">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Mail className="h-4 w-4 text-mmp-secondary" />
                Subscribe to our newsletter
              </h4>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-mmp-primary/20 border-mmp-primary/30 focus:border-mmp-secondary text-mmp-neutral placeholder:text-mmp-neutral/50"
                />
                <Button className="bg-gradient-to-r from-mmp-accent to-mmp-secondary hover:opacity-90">
                  Subscribe
                </Button>
              </div>
              <p className="text-xs text-mmp-neutral/50 mt-2">
                Get exclusive offers, fashion tips, and early access to new
                collections.
              </p>
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {Object.entries(footerLinks).map(([category, links]) => (
                <div key={category}>
                  <h3 className="font-bold text-lg mb-4 capitalize text-mmp-secondary">
                    {category}
                  </h3>
                  <ul className="space-y-3">
                    {links.map((link) => (
                      <li key={link.title}>
                        <Link
                          to={link.href}
                          className="group flex items-center gap-2 text-mmp-neutral/70 hover:text-mmp-secondary transition-colors"
                        >
                          <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <span>{link.title}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Contact & Social Row */}
            <div className="mt-12 pt-8 border-t border-mmp-primary/30">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Contact Info */}
                <div>
                  <h4 className="font-semibold mb-4 text-mmp-secondary">
                    Contact Information
                  </h4>
                  <div className="space-y-3">
                    {contactInfo.map((info, index) => {
                      const Icon = info.icon
                      return (
                        <a
                          key={index}
                          href={info.href}
                          className="flex items-center gap-3 text-mmp-neutral/70 hover:text-mmp-secondary transition-colors group"
                          target={
                            info.href.startsWith('http') ? '_blank' : undefined
                          }
                          rel={
                            info.href.startsWith('http')
                              ? 'noopener noreferrer'
                              : undefined
                          }
                        >
                          <div className="p-2 rounded bg-mmp-primary/20 group-hover:bg-mmp-accent/20 transition-colors">
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="text-sm">{info.text}</span>
                        </a>
                      )
                    })}
                  </div>
                </div>

                {/* Social & App Links */}
                <div>
                  <h4 className="font-semibold mb-4 text-mmp-secondary">
                    Follow & Download
                  </h4>
                  <div className="space-y-6">
                    {/* Social Media */}
                    <div>
                      <div className="flex gap-3 mb-4">
                        {socialLinks.map((social) => {
                          const Icon = social.icon
                          return (
                            <a
                              key={social.label}
                              href={social.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg bg-mmp-primary/20 hover:bg-gradient-to-r hover:from-mmp-accent hover:to-mmp-secondary transition-all group"
                              aria-label={social.label}
                            >
                              <Icon className="h-5 w-5 text-mmp-neutral/70 group-hover:text-white transition-colors" />
                            </a>
                          )
                        })}
                      </div>
                    </div>

                    {/* Mobile Apps */}
                    {/* <div>
                      <p className="text-sm text-mmp-neutral/70 mb-3">
                        Get our mobile app
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {appLinks.map((app) => (
                          <a
                            key={app.platform}
                            href={app.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105 ${app.color}`}
                          >
                            {app.platform}
                          </a>
                        ))}
                      </div>
                    </div> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-mmp-primary/20 border-t border-mmp-primary/30">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-6">
              {/* Language Selector */}
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-mmp-neutral/60" />
                <select
                  className="bg-transparent text-sm text-mmp-neutral/70 focus:outline-none focus:ring-0"
                  aria-label="Select language"
                >
                  <option value="en">English (US)</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                </select>
              </div>

              {/* Live Chat */}
              <Button
                variant="ghost"
                size="sm"
                className="text-mmp-neutral/70 hover:text-mmp-secondary hover:bg-mmp-primary/20"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Live Chat
              </Button>
            </div>

            <div className="flex items-center gap-6">
              <Link
                to="/privacy"
                className="text-sm text-mmp-neutral/70 hover:text-mmp-secondary transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="text-sm text-mmp-neutral/70 hover:text-mmp-secondary transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                to="/cookies"
                className="text-sm text-mmp-neutral/70 hover:text-mmp-secondary transition-colors"
              >
                Cookie Policy
              </Link>
              <Badge className="bg-mmp-primary/30 text-mmp-neutral/60">
                <Shield className="h-3 w-3 mr-1" />
                SSL Secured
              </Badge>
            </div>
          </div>

          <Separator className="my-6 bg-mmp-primary/30" />

          {/* Copyright & Powered By */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <div className="text-mmp-neutral/60">
              © {currentYear} FashionKet. All rights reserved.
            </div>

            <div className="flex items-center gap-4">
              {/* Payment Methods */}
              <div className="flex items-center gap-2">
                <span className="text-mmp-neutral/60 pr-2">Payments Platform: </span>
                <div className="w-8 h-5 bg-mmp-primary/20 rounded flex items-center justify-center">
                  <span className="text-xs font-bold text-mmp-neutral/50">
                    {' '}
                    PayStack
                  </span>
                </div>
              </div>

              {/* Ultimate IntelliForge Badge */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-mmp-primary/10 to-mmp-accent/10 border border-mmp-primary/30">
                <Heart className="h-3 w-3 text-mmp-accent" />
                <span className="text-xs text-mmp-neutral/70">
                  Powered by
                  <span className="font-semibold text-mmp-secondary ml-1">
                    Ultimate IntelliForge
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Legal Disclaimer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-mmp-neutral/50 max-w-3xl mx-auto">
              FashionKet is a premium fashion retailer. All products are subject
              to availability. Prices and offers are subject to change without
              notice. *Free shipping applies to orders over $50 before tax and
              shipping.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
